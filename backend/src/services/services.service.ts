import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { OverdueStatus, ServiceStatus, UserRole } from '../constants/enums';
import { ServiceRequest } from '../models/service-request.entity';
import { RequestUser } from '../types/request-with-user';
import { generateRequestNo } from '../utils/id-generator';
import { pageResult, parsePagination } from '../utils/pagination';

@Injectable()
export class ServicesService {
  constructor(@InjectRepository(ServiceRequest) private readonly requests: Repository<ServiceRequest>) {}

  async create(user: RequestUser, body: Partial<ServiceRequest>) {
    const count = await this.requests.count();
    return this.requests.save(this.requests.create({
      requestNo: generateRequestNo(count + 1),
      requesterId: user.id,
      type: body.type,
      title: body.title,
      description: body.description,
      attachments: body.attachments ?? [],
      status: ServiceStatus.PENDING,
    }));
  }

  async list(user: RequestUser, query: any) {
    const { page, limit, skip } = parsePagination(query);
    const where = this.scopeWhere(user);
    if (query.status) where.status = query.status;
    const [items, total] = await this.requests.findAndCount({ where, order: { createdAt: 'DESC' }, skip, take: limit });
    const itemsWithOverdue = items.map(item => ({
      ...item,
      overdueStatus: this.calculateOverdueStatus(item),
    }));
    return pageResult(itemsWithOverdue, total, page, limit);
  }

  async detail(user: RequestUser, id: number) {
    const request = await this.requests.findOne({ where: { id } });
    if (!request) throw new NotFoundException('Service request not found');
    this.assertVisible(user, request);
    return {
      ...request,
      overdueStatus: this.calculateOverdueStatus(request),
    };
  }

  async accept(user: RequestUser, id: number, dueDate: string) {
    const request = await this.findOneEntity(user, id);
    request.status = ServiceStatus.ACCEPTED;
    request.handlerId = user.id;
    request.dueDate = new Date(dueDate);
    return this.requests.save(request);
  }

  async complete(user: RequestUser, id: number) {
    const request = await this.findOneEntity(user, id);
    request.status = ServiceStatus.COMPLETED;
    request.handlerId = request.handlerId ?? user.id;
    request.completedAt = new Date();
    return this.requests.save(request);
  }

  async reject(user: RequestUser, id: number, reason: string) {
    const request = await this.findOneEntity(user, id);
    request.status = ServiceStatus.REJECTED;
    request.handlerId = request.handlerId ?? user.id;
    request.rejectionReason = reason;
    return this.requests.save(request);
  }

  async rate(user: RequestUser, id: number, rating: number, ratingComment?: string) {
    const request = await this.findOneEntity(user, id);
    if (request.requesterId !== user.id) throw new ForbiddenException('Can only rate own request');
    request.rating = rating;
    request.ratingComment = ratingComment ?? null;
    return this.requests.save(request);
  }

  private async findOneEntity(user: RequestUser, id: number): Promise<ServiceRequest> {
    const request = await this.requests.findOne({ where: { id } });
    if (!request) throw new NotFoundException('Service request not found');
    this.assertVisible(user, request);
    return request;
  }

  private scopeWhere(user: RequestUser): FindOptionsWhere<ServiceRequest> {
    if (user.role === UserRole.RESIDENT) return { requesterId: user.id };
    if (user.role === UserRole.GRID_WORKER) return { handlerId: user.id };
    return {};
  }

  private assertVisible(user: RequestUser, request: ServiceRequest) {
    if (user.role === UserRole.RESIDENT && request.requesterId !== user.id) throw new ForbiddenException('Out of data scope');
    if (user.role === UserRole.GRID_WORKER && request.handlerId && request.handlerId !== user.id) throw new ForbiddenException('Out of data scope');
  }

  calculateOverdueStatus(request: ServiceRequest): OverdueStatus {
    if (request.status === ServiceStatus.COMPLETED || request.status === ServiceStatus.REJECTED) {
      return OverdueStatus.NORMAL;
    }
    if (!request.dueDate) return OverdueStatus.NORMAL;

    const now = new Date();
    const dueDate = new Date(request.dueDate);
    const diffMs = dueDate.getTime() - now.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffDays <= 0) return OverdueStatus.OVERDUE;
    if (diffDays <= 3) return OverdueStatus.APPROACHING;
    return OverdueStatus.NORMAL;
  }

  async findOverdueRequests() {
    const requests = await this.requests.find({
      where: [
        { status: ServiceStatus.PENDING },
        { status: ServiceStatus.ACCEPTED },
        { status: ServiceStatus.IN_PROGRESS },
      ],
    });
    return requests.filter(r => r.dueDate && this.calculateOverdueStatus(r) === OverdueStatus.OVERDUE);
  }

  async findApproachingRequests() {
    const requests = await this.requests.find({
      where: [
        { status: ServiceStatus.PENDING },
        { status: ServiceStatus.ACCEPTED },
        { status: ServiceStatus.IN_PROGRESS },
      ],
    });
    return requests.filter(r => r.dueDate && this.calculateOverdueStatus(r) === OverdueStatus.APPROACHING);
  }

  async countOverdue(): Promise<number> {
    const requests = await this.findOverdueRequests();
    return requests.length;
  }

  async countApproaching(): Promise<number> {
    const requests = await this.findApproachingRequests();
    return requests.length;
  }
}
