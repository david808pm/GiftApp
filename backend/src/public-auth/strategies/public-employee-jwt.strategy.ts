import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { requireEnv, MIN_SECRET_LENGTH } from '../../common/config/env';

@Injectable()
export class PublicEmployeeJwtStrategy extends PassportStrategy(
  Strategy,
  'public-employee-jwt',
) {
  constructor() {
    const secret = requireEnv('PUBLIC_JWT_SECRET', MIN_SECRET_LENGTH);

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: {
    sub: number;
    employeeId: number;
    campaignId: number;
    documentId: string;
    type: string;
  }) {
    if (payload.type !== 'employee') {
      throw new UnauthorizedException('Token inválido para este recurso.');
    }

    return {
      employeeId: payload.employeeId,
      campaignId: payload.campaignId,
      documentId: payload.documentId,
      tokenType: payload.type,
    };
  }
}
