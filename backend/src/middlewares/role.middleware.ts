import { CanActivate, ExecutionContext, ForbiddenException, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../constants/enums';
import { hasRoleAtLeast } from '../constants/permissions';
import { RequestWithUser } from '../types/request-with-user';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
export const Public = () => SetMetadata('public', true);

@Injectable()
export class RoleMiddleware implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [context.getHandler(), context.getClass()]);
    if (!required?.length) return true;
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    if (!user) throw new ForbiddenException('Authentication required');
    if (required.some((role) => hasRoleAtLeast(user.role, role))) return true;
    throw new ForbiddenException('Role permission denied');
  }
}
