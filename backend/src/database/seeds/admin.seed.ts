import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { ROLE_PERMISSIONS } from '../../constants/permissions';
import { UserRole, UserStatus } from '../../constants/enums';
import { Role } from '../../models/role.entity';
import { User } from '../../models/user.entity';

export async function seedAdmin(users: Repository<User>, roles: Repository<Role>) {
  for (const [name, permissions] of Object.entries(ROLE_PERMISSIONS)) {
    await roles.upsert({ name: name as UserRole, permissions }, ['name']);
  }

  const password = await bcrypt.hash('Pass1234', 10);
  const accounts = [
    { username: 'superadmin', realName: '超级管理员', role: UserRole.SUPER_ADMIN, departmentId: 1, phone: '13900000001' },
    { username: 'deptadmin', realName: '部门管理员', role: UserRole.DEPT_ADMIN, departmentId: 1, phone: '13900000002' },
    { username: 'gridworker', realName: '网格员王五', role: UserRole.GRID_WORKER, departmentId: 1, phone: '13900000003' },
    { username: 'resident', realName: '居民李四', role: UserRole.RESIDENT, departmentId: null, phone: '13900000004' },
  ];
  for (const account of accounts) {
    const existing = await users.findOne({ where: { username: account.username } });
    if (!existing) await users.save(users.create({ ...account, password, status: UserStatus.ACTIVE, email: `${account.username}@example.com`, avatar: null }));
  }
}
