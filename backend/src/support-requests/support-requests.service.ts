import {
  Injectable,
  NotFoundException,
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

    return this.prisma.supportRequest.create({
      data: {
        campaignId: dto.campaignId || null,
        employeeId,
        documentId,
        type: dto.type,
        message: dto.message.trim(),
        status: 'OPEN',
        verifiedEmployee,
      },
      include: this.supportRequestInclude,
    });
  }

  // ── Admin: list ──────────────────────────────────────────

  async findAll(query: SupportRequestQueryDto) {
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
        { documentId: { contains: search } },
        { message: { contains: search } },
        { employee: { fullName: { contains: search } } },
        { employee: { documentId: { contains: search } } },
      ];
    }

    return this.prisma.supportRequest.findMany({
      where,
      include: this.supportRequestInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  // ── Admin: get by id ─────────────────────────────────────

  async findOne(id: number) {
    const request = await this.prisma.supportRequest.findUnique({
      where: { id },
      include: this.supportRequestInclude,
    });

    if (!request) {
      throw new NotFoundException('Solicitud de soporte no encontrada.');
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

    const updated = await this.prisma.supportRequest.update({
      where: { id },
      data,
      include: this.supportRequestInclude,
    });

    // Create history entry
    if (dto.status !== undefined || dto.internalNote !== undefined) {
      await this.prisma.supportRequestHistory.create({
        data: {
          supportRequestId: id,
          previousStatus: request.status,
          newStatus: updated.status,
          previousInternalNote: request.internalNote,
          newInternalNote: updated.internalNote,
          changedById: adminUserId,
        },
      });
    }

    return updated;
  }
}
