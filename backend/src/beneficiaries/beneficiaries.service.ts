import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBeneficiaryDto } from './dto/create-beneficiary.dto';
import { UpdateBeneficiaryDto } from './dto/update-beneficiary.dto';
import { BeneficiaryQueryDto } from './dto/beneficiary-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class BeneficiariesService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Admin: list ──────────────────────────────────────────

  async findAll(query: BeneficiaryQueryDto) {
    const { search, employeeId, campaignId, gender, includeDeleted } = query;

    const where: Prisma.BeneficiaryWhereInput = {};

    if (includeDeleted !== 'true') {
      where.deletedAt = null;
    }

    if (employeeId !== undefined) {
      where.employeeId = employeeId;
    }

    if (gender) {
      where.gender = gender;
    }

    if (campaignId !== undefined) {
      where.employee = { campaignId, deletedAt: null };
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { employee: { fullName: { contains: search } } },
        { employee: { documentId: { contains: search } } },
      ];
    }

    return this.prisma.beneficiary.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            fullName: true,
            documentId: true,
            campaignId: true,
            campaign: { select: { id: true, name: true, slug: true } },
          },
        },
        createdBy: { select: { id: true, name: true, email: true } },
        updatedBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ── Admin: get by id ─────────────────────────────────────

  async findOne(id: number) {
    const beneficiary = await this.prisma.beneficiary.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            fullName: true,
            documentId: true,
            campaignId: true,
            status: true,
            campaign: { select: { id: true, name: true, slug: true } },
          },
        },
        createdBy: { select: { id: true, name: true, email: true } },
        updatedBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (!beneficiary || beneficiary.deletedAt) {
      throw new NotFoundException('Beneficiario no encontrado.');
    }

    return beneficiary;
  }

  // ── Admin: create ────────────────────────────────────────

  async create(dto: CreateBeneficiaryDto, adminUserId: number) {
    const fullName = dto.fullName.trim();

    // Validate employee exists and is not deleted
    const employee = await this.prisma.employee.findUnique({
      where: { id: dto.employeeId },
    });
    if (!employee || employee.deletedAt) {
      throw new NotFoundException('El empleado seleccionado no existe.');
    }

    // TODO: AuditLog — log beneficiary creation when AuditLog module is implemented.

    return this.prisma.beneficiary.create({
      data: {
        employeeId: dto.employeeId,
        fullName,
        age: dto.age,
        gender: dto.gender,
        createdById: adminUserId,
      },
      include: {
        employee: {
          select: {
            id: true,
            fullName: true,
            documentId: true,
            campaign: { select: { id: true, name: true, slug: true } },
          },
        },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });
  }

  // ── Admin: update ────────────────────────────────────────

  async update(id: number, dto: UpdateBeneficiaryDto, adminUserId: number) {
    const beneficiary = await this.findOne(id);
    const parentEmployee = beneficiary.employee;
    const isConfirmed = parentEmployee?.status === 'CONFIRMED';

    const data: Prisma.BeneficiaryUpdateInput = {};

    // fullName — allowed even if CONFIRMED? Per spec: "Allow changing fullName only if employee is not CONFIRMED"
    if (dto.fullName !== undefined) {
      if (isConfirmed) {
        throw new ForbiddenException(
          'No se puede modificar beneficiarios de un empleado con selección confirmada.',
        );
      }
      data.fullName = dto.fullName.trim();
    }

    // employeeId — block if CONFIRMED
    if (dto.employeeId !== undefined) {
      if (isConfirmed) {
        throw new ForbiddenException(
          'No se puede cambiar el empleado de un beneficiario con selección confirmada.',
        );
      }
      const employee = await this.prisma.employee.findUnique({
        where: { id: dto.employeeId },
      });
      if (!employee || employee.deletedAt) {
        throw new NotFoundException('El empleado seleccionado no existe.');
      }
      data.employee = { connect: { id: dto.employeeId } };
    }

    // age — block if CONFIRMED
    if (dto.age !== undefined) {
      if (isConfirmed) {
        throw new ForbiddenException(
          'No se puede modificar la edad de un beneficiario con selección confirmada.',
        );
      }
      data.age = dto.age;
    }

    // gender — block if CONFIRMED
    if (dto.gender !== undefined) {
      if (isConfirmed) {
        throw new ForbiddenException(
          'No se puede modificar el género de un beneficiario con selección confirmada.',
        );
      }
      data.gender = dto.gender;
    }

    data.updatedBy = { connect: { id: adminUserId } };

    // TODO: AuditLog — log beneficiary update when AuditLog module is implemented.

    return this.prisma.beneficiary.update({
      where: { id },
      data,
      include: {
        employee: {
          select: {
            id: true,
            fullName: true,
            documentId: true,
            campaign: { select: { id: true, name: true, slug: true } },
          },
        },
        createdBy: { select: { id: true, name: true, email: true } },
        updatedBy: { select: { id: true, name: true, email: true } },
      },
    });
  }

  // ── Admin: soft delete ───────────────────────────────────

  async remove(id: number) {
    const beneficiary = await this.findOne(id);

    // Block delete if parent employee is CONFIRMED
    const employee = await this.prisma.employee.findUnique({
      where: { id: beneficiary.employeeId },
    });
    if (employee && employee.status === 'CONFIRMED') {
      throw new ForbiddenException(
        'No se puede eliminar un beneficiario de un empleado con selección confirmada.',
      );
    }

    // TODO: Check for selections when Selection model exists.
    // TODO: AuditLog — log beneficiary deletion when AuditLog module is implemented.

    return this.prisma.beneficiary.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
