import { UserRole } from './enums';

export const ROLE_LEVEL: Record<UserRole, number> = {
  [UserRole.RESIDENT]: 1,
  [UserRole.GRID_WORKER]: 2,
  [UserRole.DEPT_ADMIN]: 3,
  [UserRole.SUPER_ADMIN]: 4,
};

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.RESIDENT]: ['complaint:create', 'service:create', 'service:rate', 'announcement:read'],
  [UserRole.GRID_WORKER]: ['complaint:process', 'service:handle', 'grid:read'],
  [UserRole.DEPT_ADMIN]: ['complaint:assign', 'complaint:resolve', 'grid:manage', 'dashboard:read', 'announcement:write'],
  [UserRole.SUPER_ADMIN]: ['*'],
};

export function hasRoleAtLeast(actual: UserRole, required: UserRole): boolean {
  return ROLE_LEVEL[actual] >= ROLE_LEVEL[required];
}
