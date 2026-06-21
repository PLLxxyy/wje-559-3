import { Repository } from 'typeorm';
import { Department } from '../../models/department.entity';

export async function seedDepartments(departments: Repository<Department>) {
  const rows = [
    { id: 1, name: '社区综合治理办', code: 'GOV', areaCode: 'A001' },
    { id: 2, name: '物业协调部', code: 'PROPERTY', areaCode: 'A002' },
  ];
  for (const row of rows) {
    await departments.upsert(row, ['id']);
  }
}
