import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { seedAdmin } from '../database/seeds/admin.seed';
import { seedDepartments } from '../database/seeds/departments.seed';
import { seedSampleAnnouncements } from '../database/seeds/sample-announcements.seed';
import { seedSampleComplaints } from '../database/seeds/sample-complaints.seed';
import { Announcement } from '../models/announcement.entity';
import { Complaint } from '../models/complaint.entity';
import { Department } from '../models/department.entity';
import { GridWorker } from '../models/grid-worker.entity';
import { Role } from '../models/role.entity';
import { User } from '../models/user.entity';
import { GridWorkerStatus } from '../constants/enums';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Role) private readonly roles: Repository<Role>,
    @InjectRepository(Department) private readonly departments: Repository<Department>,
    @InjectRepository(Complaint) private readonly complaints: Repository<Complaint>,
    @InjectRepository(Announcement) private readonly announcements: Repository<Announcement>,
    @InjectRepository(GridWorker) private readonly workers: Repository<GridWorker>,
  ) {}

  async onApplicationBootstrap() {
    await seedDepartments(this.departments);
    await seedAdmin(this.users, this.roles);
    await seedSampleComplaints(this.complaints);
    await seedSampleAnnouncements(this.announcements);
    if (!(await this.workers.count())) {
      await this.workers.save(this.workers.create({ userId: 3, name: '网格员王五', phone: '13900000003', gridArea: '第一网格', areaCode: 'A001', status: GridWorkerStatus.ACTIVE, supervisorId: 2, maxTickets: 20, currentTickets: 0 }));
    }
  }
}
