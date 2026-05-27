import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { EmployeeLoginDto } from './dto/employee-login.dto';

@Injectable()
export class PublicAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // ── Employee Login ───────────────────────────────────────

  async employeeLogin(slug: string, dto: EmployeeLoginDto) {
    const documentId = dto.documentId.trim();

    // 1. Campaign must exist, not deleted, and be ACTIVE
    const campaign = await this.prisma.campaign.findUnique({
      where: { slug: slug.trim().toLowerCase() },
    });

    if (!campaign || campaign.deletedAt) {
      throw new NotFoundException('La campaña no existe o no está disponible.');
    }

    if (campaign.status !== 'ACTIVE') {
      throw new ForbiddenException('Esta campaña no está disponible actualmente.');
    }

    // 2. Find employee by documentId + campaignId
    const employee = await this.prisma.employee.findUnique({
      where: {
        campaignId_documentId: {
          campaignId: campaign.id,
          documentId,
        },
      },
    });

    // Generic error — do not leak whether employee exists
    if (!employee || employee.deletedAt) {
      throw new NotFoundException(
        'No fue posible validar la información. Si el problema persiste, contacta a soporte.',
      );
    }

    // 3. Blocked employees cannot proceed
    if (employee.status === 'BLOCKED') {
      throw new ForbiddenException(
        'Tu cuenta ha sido bloqueada. Contacta a soporte.',
      );
    }

    // 4. Already confirmed — return special response with token
    if (employee.status === 'CONFIRMED') {
      const accessToken = this.issueToken(employee, campaign);

      return {
        alreadyConfirmed: true,
        accessToken,
        employee: {
          id: employee.id,
          fullName: employee.fullName,
          documentId: employee.documentId,
          status: employee.status,
        },
        campaign: {
          id: campaign.id,
          name: campaign.name,
          slug: campaign.slug,
          logoText: campaign.logoText || 'REGALOS',
          primaryColor: campaign.primaryColor || '#2563eb',
        },
      };
    }

    // 5. Must have at least one non-deleted beneficiary
    const beneficiaryCount = await this.prisma.beneficiary.count({
      where: { employeeId: employee.id, deletedAt: null },
    });

    if (beneficiaryCount === 0) {
      throw new ForbiddenException(
        'No se encontraron beneficiarios asociados a tu cuenta.',
      );
    }

    // 6. PENDING → IN_PROGRESS
    if (employee.status === 'PENDING') {
      await this.prisma.employee.update({
        where: { id: employee.id },
        data: { status: 'IN_PROGRESS' },
      });
    }

    // 7. Issue public employee JWT
    const accessToken = this.issueToken(employee, campaign);

    return {
      accessToken,
      employee: {
        id: employee.id,
        fullName: employee.fullName,
        documentId: employee.documentId,
        status: employee.status === 'PENDING' ? 'IN_PROGRESS' : employee.status,
      },
      campaign: {
        id: campaign.id,
        name: campaign.name,
        slug: campaign.slug,
        logoText: campaign.logoText || 'REGALOS',
        primaryColor: campaign.primaryColor || '#2563eb',
      },
    };
  }

  private issueToken(employee: { id: number; documentId: string }, campaign: { id: number }) {
    const payload = {
      sub: employee.id,
      employeeId: employee.id,
      campaignId: campaign.id,
      documentId: employee.documentId,
      type: 'employee',
    };

    const secret = process.env.PUBLIC_JWT_SECRET || process.env.JWT_SECRET;
    const expiresIn = process.env.PUBLIC_JWT_EXPIRES_IN || '4h';

    return this.jwtService.sign(payload, {
      secret,
      expiresIn,
    } as any);
  }

  // ── Session /me ──────────────────────────────────────────

  async getSession(user: {
    employeeId: number;
    campaignId: number;
    documentId: string;
  }) {
    const [employee, campaign] = await Promise.all([
      this.prisma.employee.findUnique({
        where: { id: user.employeeId },
      }),
      this.prisma.campaign.findUnique({
        where: { id: user.campaignId },
      }),
    ]);

    if (
      !employee ||
      employee.deletedAt ||
      employee.status === 'BLOCKED'
    ) {
      throw new UnauthorizedException('Sesión inválida o expirada.');
    }

    if (!campaign || campaign.deletedAt) {
      throw new UnauthorizedException('La campaña ya no está disponible.');
    }

    return {
      employee: {
        id: employee.id,
        fullName: employee.fullName,
        documentId: employee.documentId,
        status: employee.status,
      },
      campaign: {
        id: campaign.id,
        name: campaign.name,
        slug: campaign.slug,
        logoText: campaign.logoText || 'REGALOS',
        primaryColor: campaign.primaryColor || '#2563eb',
        status: campaign.status,
      },
    };
  }
}
