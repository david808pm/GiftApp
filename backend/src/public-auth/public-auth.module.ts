import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PublicAuthService } from './public-auth.service';
import { PublicAuthController } from './public-auth.controller';
import { PublicEmployeeJwtStrategy } from './strategies/public-employee-jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'public-employee-jwt' }),
    JwtModule.register({
      secret: process.env.PUBLIC_JWT_SECRET || process.env.JWT_SECRET || 'fallback',
      signOptions: { expiresIn: '4h' },
    }),
  ],
  controllers: [PublicAuthController],
  providers: [PublicAuthService, PublicEmployeeJwtStrategy],
  exports: [PublicAuthService],
})
export class PublicAuthModule {}
