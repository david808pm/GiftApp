import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class PublicEmployeeJwtGuard extends AuthGuard('public-employee-jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}
