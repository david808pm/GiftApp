import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.adminUser.findUnique({
      where: { email: dto.email },
      include: { 
        role: true,
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role.name,
      companyId: user.companyId,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
        companyId: user.companyId,
        company: user.company,
      },
    };
  }

  async getProfile(userId: number) {
    const user = await this.prisma.adminUser.findUnique({
      where: { id: userId },
      include: { 
        role: true,
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado.');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Tu cuenta ha sido desactivada.');
    }

    // Accept ADMIN, SUPER_ADMIN, and COMPANY_VIEWER roles
    const allowedRoles = ['ADMIN', 'SUPER_ADMIN', 'COMPANY_VIEWER'];
    if (!allowedRoles.includes(user.role.name)) {
      throw new ForbiddenException('Acceso denegado.');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.name,
      companyId: user.companyId,
      company: user.company,
    };
  }

  async validateUser(userId: number) {
    const user = await this.prisma.adminUser.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user || !user.isActive) {
      return null;
    }

    return user;
  }
}
