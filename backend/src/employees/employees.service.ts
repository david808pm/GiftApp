import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeQueryDto } from './dto/employee-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Admin: list ──────────────────────────────────────────

  async findAll(query: EmployeeQueryDto) {
    const { search, campaignId, status, includeDeleted } = query;

    const where: Prisma.EmployeeWhereInput = {};

    if (includeDeleted !== 'true') {
      where.deletedAt = null;
    }

    if (status) {
      where.status = status;
    }

    if (campaignId !== undefined) {
      where.campaignId = campaignId;
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { documentId: { contains: search } },
        { email: { contains: search } },
      ];
    }

    return this.prisma.employee.findMany({
      where,
      include: {
        campaign: { select: { id: true, name: true, slug: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        updatedBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ── Admin: get by id ─────────────────────────────────────

  async findOne(id: number) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        campaign: { select: { id: true, name: true, slug: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        updatedBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (!employee || employee.deletedAt) {
      throw new NotFoundException('Empleado no encontrado.');
    }

    return employee;
  }

  // ── Admin: create ────────────────────────────────────────

  async create(dto: CreateEmployeeDto, adminUserId: number) {
    const documentId = dto.documentId.trim();
    const email = dto.email?.trim().toLowerCase() || null;
    const fullName = dto.fullName.trim();
    const phone = dto.phone?.trim() || null;
    const shippingAddress = dto.shippingAddress?.trim() || null;
    const shippingCity = dto.shippingCity?.trim() || null;

    // Validate campaign exists and is not deleted
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: dto.campaignId },
    });
    if (!campaign || campaign.deletedAt) {
      throw new NotFoundException('La campaña seleccionada no existe.');
    }

    // Validate documentId uniqueness within campaign
    const existing = await this.prisma.employee.findUnique({
      where: {
        campaignId_documentId: {
          campaignId: dto.campaignId,
          documentId,
        },
      },
    });
    if (existing && !existing.deletedAt) {
      throw new ConflictException(
        'Ya existe un empleado con ese documento en esta campaña.',
      );
    }
    // If soft-deleted, allow re-creation by restoring
    if (existing && existing.deletedAt) {
      // TODO: AuditLog — log employee restore when AuditLog module is implemented.
      return this.prisma.employee.update({
        where: { id: existing.id },
        data: {
          fullName,
          email,
          phone,
          shippingAddress,
          shippingCity,
          status: dto.status || 'PENDING',
          deletedAt: null,
          createdById: adminUserId,
          updatedById: adminUserId,
          confirmedAt: dto.status === 'CONFIRMED' ? new Date() : undefined,
        },
        include: {
          campaign: { select: { id: true, name: true, slug: true } },
        },
      });
    }

    // TODO: AuditLog — log employee creation when AuditLog module is implemented.

    return this.prisma.employee.create({
      data: {
        campaignId: dto.campaignId,
        fullName,
        documentId,
        email,
        phone,
        shippingAddress,
        shippingCity,
        status: dto.status || 'PENDING',
        confirmedAt: dto.status === 'CONFIRMED' ? new Date() : null,
        createdById: adminUserId,
      },
      include: {
        campaign: { select: { id: true, name: true, slug: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });
  }

  // ── Admin: update ────────────────────────────────────────

  async update(id: number, dto: UpdateEmployeeDto, adminUserId: number) {
    const employee = await this.findOne(id);

    const data: Prisma.EmployeeUpdateInput = {};

    // fullName
    if (dto.fullName !== undefined) {
      data.fullName = dto.fullName.trim();
    }

    // email
    if (dto.email !== undefined) {
      data.email = dto.email ? dto.email.trim().toLowerCase() : null;
    }

    // phone
    if (dto.phone !== undefined) {
      data.phone = dto.phone ? dto.phone.trim() : null;
    }

    // shippingAddress
    if (dto.shippingAddress !== undefined) {
      data.shippingAddress = dto.shippingAddress ? dto.shippingAddress.trim() : null;
    }

    // shippingCity
    if (dto.shippingCity !== undefined) {
      data.shippingCity = dto.shippingCity ? dto.shippingCity.trim() : null;
    }

    // campaignId — block if CONFIRMED
    if (dto.campaignId !== undefined) {
      if (employee.status === 'CONFIRMED' && dto.campaignId !== employee.campaignId) {
        throw new ForbiddenException(
          'No se puede cambiar la campaña de un empleado con selección confirmada.',
        );
      }
      const campaign = await this.prisma.campaign.findUnique({
        where: { id: dto.campaignId },
      });
      if (!campaign || campaign.deletedAt) {
        throw new NotFoundException('La campaña seleccionada no existe.');
      }
      data.campaign = { connect: { id: dto.campaignId } };
    }

    // documentId — block if CONFIRMED
    if (dto.documentId !== undefined) {
      if (employee.status === 'CONFIRMED') {
        throw new ForbiddenException(
          'No se puede cambiar el documento de un empleado con selección confirmada.',
        );
      }
      const newDocId = dto.documentId.trim();
      const campaignId = dto.campaignId ?? employee.campaignId;
      const existing = await this.prisma.employee.findUnique({
        where: {
          campaignId_documentId: {
            campaignId,
            documentId: newDocId,
          },
        },
      });
      if (existing && existing.id !== id && !existing.deletedAt) {
        throw new ConflictException(
          'Ya existe un empleado con ese documento en la campaña.',
        );
      }
      data.documentId = newDocId;
    }

    // status
    if (dto.status !== undefined) {
      if (dto.status === 'CONFIRMED' && !employee.confirmedAt) {
        (data as any).confirmedAt = new Date();
      }
      data.status = dto.status;
    }

    data.updatedBy = { connect: { id: adminUserId } };

    // TODO: AuditLog — log employee update when AuditLog module is implemented.

    return this.prisma.employee.update({
      where: { id },
      data,
      include: {
        campaign: { select: { id: true, name: true, slug: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        updatedBy: { select: { id: true, name: true, email: true } },
      },
    });
  }

  // ── Admin: soft delete ───────────────────────────────────

  async remove(id: number) {
    const employee = await this.findOne(id);

    if (employee.status === 'CONFIRMED') {
      throw new ForbiddenException(
        'No se puede eliminar un empleado con selección confirmada.',
      );
    }

    // TODO: Check for beneficiaries when Beneficiary model exists.
    // TODO: Check for selections when Selection model exists.
    // TODO: AuditLog — log employee deletion when AuditLog module is implemented.

    return this.prisma.employee.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'BLOCKED' },
    });
  }
}
