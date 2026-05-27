import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { QueryCampaignsDto } from './dto/query-campaigns.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CampaignsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Admin: list ──────────────────────────────────────────

  async findAll(query: QueryCampaignsDto) {
    const { search, status, includeDeleted } = query;

    const where: Prisma.CampaignWhereInput = {};

    if (includeDeleted !== 'true') {
      where.deletedAt = null;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { slug: { contains: search } },
      ];
    }

    return this.prisma.campaign.findMany({
      where,
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        updatedBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ── Admin: get by id ─────────────────────────────────────

  async findOne(id: number) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        updatedBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (!campaign || campaign.deletedAt) {
      throw new NotFoundException('Campaña no encontrada.');
    }

    return campaign;
  }

  // ── Admin: create ────────────────────────────────────────

  async create(dto: CreateCampaignDto, adminUserId: number) {
    const slug = dto.slug.trim().toLowerCase();

    // Check slug uniqueness (including soft-deleted)
    const existing = await this.prisma.campaign.findUnique({
      where: { slug },
    });
    if (existing) {
      throw new ConflictException('Ya existe una campaña con ese slug.');
    }

    // TODO: AuditLog — log campaign creation when AuditLog module is implemented.

    return this.prisma.campaign.create({
      data: {
        name: dto.name.trim(),
        slug,
        welcomeText: dto.welcomeText?.trim(),
        rulesText: dto.rulesText?.trim(),
        status: dto.status || 'ACTIVE',
        logoText: dto.logoText?.trim(),
        primaryColor: dto.primaryColor?.trim(),
        startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
        createdById: adminUserId,
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });
  }

  // ── Admin: update ────────────────────────────────────────

  async update(id: number, dto: UpdateCampaignDto, adminUserId: number) {
    const campaign = await this.findOne(id);

    const data: Prisma.CampaignUpdateInput = {};

    if (dto.name !== undefined) data.name = dto.name.trim();
    if (dto.welcomeText !== undefined) data.welcomeText = dto.welcomeText?.trim();
    if (dto.rulesText !== undefined) data.rulesText = dto.rulesText?.trim();
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.logoText !== undefined) data.logoText = dto.logoText?.trim();
    if (dto.primaryColor !== undefined) data.primaryColor = dto.primaryColor?.trim();
    if (dto.startsAt !== undefined) data.startsAt = dto.startsAt ? new Date(dto.startsAt) : null;
    if (dto.endsAt !== undefined) data.endsAt = dto.endsAt ? new Date(dto.endsAt) : null;

    if (dto.slug !== undefined) {
      const slug = dto.slug.trim().toLowerCase();
      if (slug !== campaign.slug) {
        const existing = await this.prisma.campaign.findUnique({
          where: { slug },
        });
        if (existing) {
          throw new ConflictException('Ya existe una campaña con ese slug.');
        }
        data.slug = slug;
      }
    }

    data.updatedBy = { connect: { id: adminUserId } };

    // TODO: AuditLog — log campaign update when AuditLog module is implemented.

    return this.prisma.campaign.update({
      where: { id },
      data,
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        updatedBy: { select: { id: true, name: true, email: true } },
      },
    });
  }

  // ── Admin: soft delete ───────────────────────────────────

  async remove(id: number) {
    await this.findOne(id);

    // TODO: AuditLog — log campaign deletion when AuditLog module is implemented.
    // TODO: Check for dependent employees, gifts, selections before soft-deleting.

    return this.prisma.campaign.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'CLOSED' },
    });
  }

  // ── Public: get by slug ──────────────────────────────────

  async findBySlug(slug: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { slug: slug.trim().toLowerCase() },
    });

    if (!campaign || campaign.deletedAt) {
      throw new NotFoundException('Campaña no encontrada.');
    }

    // Return safe public fields only
    return {
      id: campaign.id,
      name: campaign.name,
      slug: campaign.slug,
      welcomeText: campaign.welcomeText,
      rulesText: campaign.rulesText,
      status: campaign.status,
      logoText: campaign.logoText,
      primaryColor: campaign.primaryColor,
    };
  }
}
