import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Complaint } from '../models/complaint.entity';
import { GridWorker } from '../models/grid-worker.entity';

@Injectable()
export class GridsService {
  constructor(
    @InjectRepository(GridWorker) private readonly workers: Repository<GridWorker>,
    @InjectRepository(Complaint) private readonly complaints: Repository<Complaint>,
  ) {}

  create(body: Partial<GridWorker>) {
    return this.workers.save(this.workers.create(body));
  }

  list() {
    return this.workers.find({ order: { id: 'ASC' } });
  }

  async detail(id: number) {
    const worker = await this.workers.findOne({ where: { id } });
    if (!worker) throw new NotFoundException('Grid worker not found');
    return worker;
  }

  async update(id: number, body: Partial<GridWorker>) {
    const worker = await this.detail(id);
    Object.assign(worker, body);
    return this.workers.save(worker);
  }

  async remove(id: number) {
    await this.workers.delete(id);
    return { deleted: true };
  }

  async assignArea(id: number, body: { gridArea: string; areaCode: string }) {
    const worker = await this.detail(id);
    worker.gridArea = body.gridArea;
    worker.areaCode = body.areaCode;
    return this.workers.save(worker);
  }

  async stats(id: number) {
    const worker = await this.detail(id);
    const total = await this.complaints.count({ where: { handlerId: worker.userId } });
    const completed = await this.complaints.count({ where: { handlerId: worker.userId, status: 'CLOSED' as any } });
    return { worker, totalTickets: total, completedTickets: completed, completionRate: total ? completed / total : 0, averageResponseHours: 2.5 };
  }

  async areas() {
    const rows = await this.workers.createQueryBuilder('worker').select('worker.areaCode', 'areaCode').addSelect('worker.gridArea', 'gridArea').distinct(true).getRawMany();
    return rows;
  }

  workersByArea(code: string) {
    return this.workers.find({ where: { areaCode: code } });
  }
}
