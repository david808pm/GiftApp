import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGiftDto } from './dto/create-gift.dto';
import { UpdateGiftDto } from './dto/update-gift.dto';
import { GiftQueryDto } from './dto/gift-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class GiftsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Helpers ──────────────────────────────────────────────

  private giftInclude = {
    campaign: { select: { id: true, name: true, slug: true } },
    images: { orderBy: { sortOrder: 'asc' as const } },
    createdBy: { select: { id: true, name: true, email: true } },
    updatedBy: { select: { id: true, name: true, email: true } },
  };

  private async syncImages(giftId: number, imageUrls: string[] | undefined) {
    if (imageUrls === undefined || imageUrls.length === 0) return;

    // Delete existing images and re-insert
    await this.prisma.giftImage.deleteMany({ where: { giftId } });

    const imageRecords = imageUrls.map((url, i) => ({
      giftId,
      imageUrl: url.trim(),
      sortOrder: i,
      isPrimary: i === 0,
    }));

    // TODO: batch create when supported
    for (const img of imageRecords) {
      await this.prisma.giftImage.create({ data: img });
    }
  }

  private async validateCampaign(campaignId: number) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });
    if (!campaign || campaign.deletedAt) {
      throw new NotFoundException('La campaña seleccionada no existe.');
    }
    return campaign;
  }

  // ── Admin: list ──────────────────────────────────────────

  async findAll(query: GiftQueryDto) {
    const {
      search,
      campaignId,
      status,
      allowedGender,
      minAge,
      maxAge,
      includeDeleted,
    } = query;

    const where: Prisma.GiftWhereInput = {};

    if (includeDeleted !== 'true') {
      where.deletedAt = null;
    }

    if (campaignId !== undefined) {
      where.campaignId = campaignId;
    }

    if (status) {
      where.status = status;
    }

    if (allowedGender) {
      where.allowedGender = allowedGender;
    }

    if (minAge !== undefined || maxAge !== undefined) {
      where.AND = [];
      if (minAge !== undefined) {
        (where.AND as Prisma.GiftWhereInput[]).push({ minAge: { lte: maxAge } });
      }
      if (maxAge !== undefined) {
        (where.AND as Prisma.GiftWhereInput[]).push({ maxAge: { gte: minAge } });
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { reference: { contains: search } },
        { campaign: { name: { contains: search } } },
      ];
    }

    return this.prisma.gift.findMany({
      where,
      include: this.giftInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  // ── Admin: get by id ─────────────────────────────────────

  async findOne(id: number) {
    const gift = await this.prisma.gift.findUnique({
      where: { id },
      include: this.giftInclude,
    });

    if (!gift || gift.deletedAt) {
      throw new NotFoundException('Regalo no encontrado.');
    }

    return gift;
  }

  // ── Admin: create ────────────────────────────────────────

  async create(dto: CreateGiftDto, adminUserId: number) {
    await this.validateCampaign(dto.campaignId);

    const reference = dto.reference.trim().toUpperCase();
    const minAge = dto.minAge ?? 0;
    const maxAge = dto.maxAge ?? 13;

    // Validate minAge <= maxAge
    if (minAge > maxAge) {
      throw new BadRequestException(
        'La edad mínima debe ser menor o igual a la edad máxima.',
      );
    }

    // Validate reference uniqueness within campaign
    const existing = await this.prisma.gift.findUnique({
      where: {
        campaignId_reference: {
          campaignId: dto.campaignId,
          reference,
        },
      },
    });
    if (existing && !existing.deletedAt) {
      throw new ConflictException(
        'Ya existe un regalo con esa referencia en esta campaña.',
      );
    }
    // If soft-deleted, restore
    if (existing && existing.deletedAt) {
      const restored = await this.prisma.gift.update({
        where: { id: existing.id },
        data: {
          name: dto.name.trim(),
          shortDescription: dto.shortDescription?.trim(),
          technicalDescription: dto.technicalDescription?.trim(),
          dimensions: dto.dimensions?.trim(),
          stock: dto.stock ?? 0,
          minAge,
          maxAge,
          allowedGender: dto.allowedGender ?? 'all',
          status: dto.status ?? 'ACTIVE',
          deletedAt: null,
          updatedBy: { connect: { id: adminUserId } },
        },
        include: this.giftInclude,
      });
      await this.syncImages(restored.id, dto.imageUrls);
      // TODO: AuditLog — log gift restore when AuditLog module is implemented.
      return this.findOne(restored.id);
    }

    const gift = await this.prisma.gift.create({
      data: {
        campaignId: dto.campaignId,
        name: dto.name.trim(),
        reference,
        shortDescription: dto.shortDescription?.trim(),
        technicalDescription: dto.technicalDescription?.trim(),
        dimensions: dto.dimensions?.trim(),
        stock: dto.stock ?? 0,
        minAge,
        maxAge,
        allowedGender: dto.allowedGender ?? 'all',
        status: dto.status ?? 'ACTIVE',
        createdById: adminUserId,
      },
      include: this.giftInclude,
    });

    await this.syncImages(gift.id, dto.imageUrls);

    // TODO: AuditLog — log gift creation when AuditLog module is implemented.

    return this.findOne(gift.id);
  }

  // ── Admin: update ────────────────────────────────────────

  async update(id: number, dto: UpdateGiftDto, adminUserId: number) {
    const gift = await this.findOne(id);

    const data: Prisma.GiftUpdateInput = {};

    // campaignId
    if (dto.campaignId !== undefined) {
      // TODO: When Selection model exists, block campaignId change if gift has selections.
      await this.validateCampaign(dto.campaignId);
      data.campaign = { connect: { id: dto.campaignId } };
    }

    // reference
    const campaignId = dto.campaignId ?? gift.campaignId;
    if (dto.reference !== undefined) {
      const reference = dto.reference.trim().toUpperCase();
      if (reference !== gift.reference) {
        const existing = await this.prisma.gift.findUnique({
          where: { campaignId_reference: { campaignId, reference } },
        });
        if (existing && existing.id !== id && !existing.deletedAt) {
          throw new ConflictException(
            'Ya existe un regalo con esa referencia en la campaña.',
          );
        }
        data.reference = reference;
      }
    }

    if (dto.name !== undefined) data.name = dto.name.trim();
    if (dto.shortDescription !== undefined) data.shortDescription = dto.shortDescription?.trim();
    if (dto.technicalDescription !== undefined) data.technicalDescription = dto.technicalDescription?.trim();
    if (dto.dimensions !== undefined) data.dimensions = dto.dimensions?.trim();
    if (dto.stock !== undefined) data.stock = dto.stock;
    if (dto.minAge !== undefined) data.minAge = dto.minAge;
    if (dto.maxAge !== undefined) data.maxAge = dto.maxAge;
    if (dto.allowedGender !== undefined) data.allowedGender = dto.allowedGender;
    if (dto.status !== undefined) data.status = dto.status;

    // Validate minAge <= maxAge after potential updates
    const finalMinAge = dto.minAge ?? gift.minAge;
    const finalMaxAge = dto.maxAge ?? gift.maxAge;
    if (finalMinAge > finalMaxAge) {
      throw new BadRequestException(
        'La edad mínima debe ser menor o igual a la edad máxima.',
      );
    }

    data.updatedBy = { connect: { id: adminUserId } };

    const updated = await this.prisma.gift.update({
      where: { id },
      data,
      include: this.giftInclude,
    });

    // Sync images only if imageUrls is explicitly provided
    if (dto.imageUrls !== undefined) {
      await this.syncImages(id, dto.imageUrls);
    }

    // TODO: AuditLog — log gift update when AuditLog module is implemented.

    return this.findOne(id);
  }

  // ── Admin: soft delete ───────────────────────────────────

  async remove(id: number) {
    await this.findOne(id);

    // TODO: Check for selections when Selection model exists.
    // TODO: AuditLog — log gift deletion when AuditLog module is implemented.

    return this.prisma.gift.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'INACTIVE' },
      include: this.giftInclude,
    });
  }
}
