import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from '../decorator/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get(Roles, context.getHandler());

    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request['authUser'];
    
    if (!roles.includes(user?.userRole))
      throw new ForbiddenException(
        'You do not have permission to access this route',
      );

    return true;
  }
}
