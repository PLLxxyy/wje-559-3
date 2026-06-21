import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../models/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(@InjectRepository(AuditLog) private readonly logs: Repository<AuditLog>) {}

  async log(input: Partial<AuditLog>) {
    await this.logs.save(this.logs.create(input));
  }

  list() {
    return this.logs.find({ order: { createdAt: 'DESC' }, take: 100 });
  }
}
