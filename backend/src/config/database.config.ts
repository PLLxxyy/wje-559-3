import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Announcement } from '../models/announcement.entity';
import { AuditLog } from '../models/audit-log.entity';
import { ComplaintComment } from '../models/complaint-comment.entity';
import { ComplaintLog } from '../models/complaint-log.entity';
import { Complaint } from '../models/complaint.entity';
import { Department } from '../models/department.entity';
import { GridWorker } from '../models/grid-worker.entity';
import { Role } from '../models/role.entity';
import { ServiceRequest } from '../models/service-request.entity';
import { User } from '../models/user.entity';

export const ENTITIES = [User, Role, Department, Complaint, ComplaintLog, ComplaintComment, ServiceRequest, Announcement, GridWorker, AuditLog];

export function databaseConfig(): TypeOrmModuleOptions {
  return {
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: Number(process.env.DATABASE_PORT || 5432),
    username: process.env.DATABASE_USER || process.env.DB_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || process.env.DB_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || process.env.DB_NAME || 'wjegov',
    entities: ENTITIES,
    synchronize: true,
    logging: false,
  };
}
