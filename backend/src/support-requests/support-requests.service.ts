import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupportRequestDto } from './dto/create-support-request.dto';
import { UpdateSupportRequestDto } from './dto/update-support-request.dto';
import { SupportRequestQueryDto } from './dto/support-request-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SupportRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  private supportRequestInclude = {
    campaign: { select: { id: true, name: true, slug: true } },
    employee: { select: { id: true, fullName: true, documentId: true } },
    resolvedBy: { select: { id: true, name: true, email: true } },
    history: {
      orderBy: { changedAt: 'asc' as const },
      include: {
        changedBy: { select: { id: true, name: true, email: true } },
      },
    },
  };

  private async findEmployee(
    documentId: string | undefined | null,
    campaignId: number | undefined,
  ): Promise<{ employeeId: number | null; verifiedEmployee: boolean }> {
    if (!documentId || !campaignId) {
      return { employeeId: null, verifiedEmployee: false };
    }

    const employee = await this.prisma.employee.findUnique({
      where: {
        campaignId_documentId: {
          campaignId,
          documentId: documentId.trim(),
        },
      },
    });

    if (employee && !employee.deletedAt) {
      return { employeeId: employee.id, verifiedEmployee: true };
    }

    return { employeeId: null, verifiedEmployee: false };
  }

  // ── Public: create ───────────────────────────────────────
  // TODO: Add server-side rate limiting for public support requests before production.

  async create(dto: CreateSupportRequestDto) {
    const documentId = dto.documentId?.trim() || null;

    // Validate campaign if provided
    if (dto.campaignId) {
      const campaign = await this.prisma.campaign.findUnique({
        where: { id: dto.campaignId },
      });
      if (!campaign || campaign.deletedAt) {
        throw new NotFoundException('La campaña no existe.');
      }
    }

    // Auto-detect employee
    const { employeeId, verifiedEmployee } = await this.findEmployee(
      documentId,
      dto.campaignId,
    );

    const created = await this.prisma.supportRequest.create({
      data: {
        campaignId: dto.campaignId || null,
        employeeId,
        documentId,
        type: dto.type,
        message: dto.message.trim(),
        status: 'OPEN',
        verifiedEmployee,
      },
    });

    // Public response: generic acknowledgement only. Returning the persisted
    // record (employee relation, verifiedEmployee) would let unauthenticated
    // callers enumerate which documents exist in a campaign.
    return { ok: true, id: created.id };
  }

  // ── Admin: list ──────────────────────────────────────────

  async findAll(query: SupportRequestQueryDto, user?: { role: string; companyId?: number }) {
    const {
      search,
      campaignId,
      status,
      type,
      verifiedEmployee,
      fromDate,
      toDate,
    } = query;

    const where: Prisma.SupportRequestWhereInput = {};

    if (campaignId !== undefined) {
      where.campaignId = campaignId;
    }
    if (status) {
      where.status = status;
    }
    if (type) {
      where.type = type;
    }
    if (verifiedEmployee !== undefined) {
      where.verifiedEmployee = verifiedEmployee === 'true';
    }
    if (fromDate) {
      where.createdAt = { ...(where.createdAt as any), gte: new Date(fromDate) };
    }
    if (toDate) {
      where.createdAt = { ...(where.createdAt as any), lte: new Date(toDate) };
    }

    if (search) {
      where.OR = [
        { documentId: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
        { employee: { fullName: { contains: search, mode: 'insensitive' } } },
        { employee: { documentId: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Apply company scoping for COMPANY_VIEWER
    if (user?.role === 'COMPANY_VIEWER') {
      if (!user.companyId) {
        throw new ForbiddenException('No tienes compañía asignada.');
      }
      // Only show requests with campaignId matching user's company
      // Hide requests with null campaignId (conservative behavior)
      where.campaign = { companyId: user.companyId };
    }

    return this.prisma.supportRequest.findMany({
      where,
      include: this.supportRequestInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  // ── Admin: get by id ─────────────────────────────────────

  async findOne(id: number, user?: { role: string; companyId?: number }) {
    const request = await this.prisma.supportRequest.findUnique({
      where: { id },
      include: {
        ...this.supportRequestInclude,
        campaign: { select: { id: true, name: true, slug: true, companyId: true } },
      },
    });

    if (!request) {
      throw new NotFoundException('Solicitud de soporte no encontrada.');
    }

    // Apply company scoping for COMPANY_VIEWER
    if (user?.role === 'COMPANY_VIEWER') {
      if (!user.companyId) {
        throw new ForbiddenException('No tienes compañía asignada.');
      }
      // Hide requests with null campaignId or different company
      if (!request.campaign || request.campaign.companyId !== user.companyId) {
        throw new ForbiddenException('No tienes acceso a esta solicitud de soporte.');
      }
    }

    return request;
  }

  // ── Admin: update ────────────────────────────────────────

  async update(id: number, dto: UpdateSupportRequestDto, adminUserId: number) {
    const request = await this.findOne(id);

    const data: Prisma.SupportRequestUpdateInput = {};

    if (dto.status !== undefined) {
      data.status = dto.status;

      // If changing to RESOLVED, set resolvedAt and resolvedBy
      if (dto.status === 'RESOLVED' && request.status !== 'RESOLVED') {
        (data as any).resolvedAt = new Date();
        data.resolvedBy = { connect: { id: adminUserId } };
      }
    }

    if (dto.internalNote !== undefined) {
      data.internalNote = dto.internalNote?.trim() || null;
    }

    // Update and history entry must be written atomically so the audit trail
    // can never diverge from the actual status.
    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.supportRequest.update({
        where: { id },
        data,
        include: this.supportRequestInclude,
      });

      if (dto.status !== undefined || dto.internalNote !== undefined) {
        await tx.supportRequestHistory.create({
          data: {
            supportRequestId: id,
            previousStatus: request.status,
            newStatus: result.status,
            previousInternalNote: request.internalNote,
            newInternalNote: result.internalNote,
            changedById: adminUserId,
          },
        });
      }

      return result;
    });

    return updated;
  }
}
