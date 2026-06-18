import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.company.findMany({
      where: { deletedAt: null, isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async create(dto: CreateCompanyDto) {
    const slug = dto.slug
      ? dto.slug.trim().toLowerCase()
      : CompaniesService.generateSlug(dto.name);

    const existing = await this.prisma.company.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException('Ya existe una empresa con ese nombre.');
    }

    return this.prisma.company.create({
      data: {
        name: dto.name.trim(),
        slug,
        isActive: dto.isActive ?? true,
      },
    });
  }

  static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
