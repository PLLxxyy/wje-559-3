import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Priority, TicketStatus, UserRole } from '../constants/enums';
import { ComplaintComment } from '../models/complaint-comment.entity';
import { ComplaintLog } from '../models/complaint-log.entity';
import { Complaint } from '../models/complaint.entity';
import { RequestUser } from '../types/request-with-user';
import { generateTicketNo } from '../utils/id-generator';
import { pageResult, parsePagination } from '../utils/pagination';
import { BusinessException } from '../middlewares/error-handler.middleware';

const ALLOWED_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  [TicketStatus.SUBMITTED]: [TicketStatus.ASSIGNED, TicketStatus.REOPENED],
  [TicketStatus.ASSIGNED]: [TicketStatus.IN_PROGRESS],
  [TicketStatus.IN_PROGRESS]: [TicketStatus.PENDING_REVIEW],
  [TicketStatus.PENDING_REVIEW]: [TicketStatus.RESOLVED, TicketStatus.REOPENED],
  [TicketStatus.RESOLVED]: [TicketStatus.CLOSED, TicketStatus.REOPENED],
  [TicketStatus.CLOSED]: [TicketStatus.REOPENED],
  [TicketStatus.REOPENED]: [TicketStatus.ASSIGNED, TicketStatus.IN_PROGRESS],
};

@Injectable()
export class ComplaintsService {
  constructor(
    @InjectRepository(Complaint) private readonly complaints: Repository<Complaint>,
    @InjectRepository(ComplaintLog) private readonly logs: Repository<ComplaintLog>,
    @InjectRepository(ComplaintComment) private readonly comments: Repository<ComplaintComment>,
  ) {}

  async create(user: RequestUser, body: Partial<Complaint>) {
    const count = await this.complaints.count();
    const complaint = this.complaints.create({
      ticketNo: generateTicketNo(count + 1),
      reporterId: user.id,
      category: body.category,
      title: body.title,
      description: body.description,
      images: body.images ?? [],
      location: body.location,
      priority: body.priority ?? Priority.MEDIUM,
      status: TicketStatus.SUBMITTED,
      assignedDeptId: null,
      handlerId: null,
    });
    const saved = await this.complaints.save(complaint);
    await this.recordLog(saved.id, null, TicketStatus.SUBMITTED, user.id, '提交投诉');
    return saved;
  }

  async list(user: RequestUser, query: any) {
    const { page, limit, skip } = parsePagination(query);
    const where = this.scopeWhere(user);
    if (query.status) where.status = query.status;
    const [items, total] = await this.complaints.findAndCount({ where, order: { createdAt: 'DESC' }, skip, take: limit });
    return pageResult(items, total, page, limit);
  }

  async detail(user: RequestUser, id: number) {
    const complaint = await this.complaints.findOne({ where: { id } });
    if (!complaint) throw new NotFoundException('Complaint not found');
    this.assertVisible(user, complaint);
    return complaint;
  }

  assign(user: RequestUser, id: number, body: { handlerId: number; assignedDeptId: number; comment?: string }) {
    return this.transition(user, id, TicketStatus.ASSIGNED, body.comment || '分派工单', { handlerId: body.handlerId, assignedDeptId: body.assignedDeptId });
  }

  process(user: RequestUser, id: number, body: { comment?: string }) {
    return this.transition(user, id, TicketStatus.IN_PROGRESS, body.comment || '开始处理');
  }

  review(user: RequestUser, id: number, body: { comment?: string }) {
    return this.transition(user, id, TicketStatus.PENDING_REVIEW, body.comment || '提交审核');
  }

  resolve(user: RequestUser, id: number, body: { comment?: string }) {
    return this.transition(user, id, TicketStatus.RESOLVED, body.comment || '审核完结', { resolvedAt: new Date() });
  }

  close(user: RequestUser, id: number, body: { comment?: string }) {
    return this.transition(user, id, TicketStatus.CLOSED, body.comment || '确认关闭', { closedAt: new Date() });
  }

  reopen(user: RequestUser, id: number, body: { comment?: string }) {
    return this.transition(user, id, TicketStatus.REOPENED, body.comment || '重开工单');
  }

  async addComment(user: RequestUser, id: number, content: string) {
    await this.detail(user, id);
    return this.comments.save(this.comments.create({ complaintId: id, authorId: user.id, content }));
  }

  async listComments(user: RequestUser, id: number) {
    await this.detail(user, id);
    return this.comments.find({ where: { complaintId: id }, order: { createdAt: 'ASC' } });
  }

  async listLogs(user: RequestUser, id: number) {
    await this.detail(user, id);
    return this.logs.find({ where: { complaintId: id }, order: { createdAt: 'ASC' } });
  }

  private async transition(user: RequestUser, id: number, toStatus: TicketStatus, comment: string, patch: Partial<Complaint> = {}) {
    const complaint = await this.detail(user, id);
    if (!ALLOWED_TRANSITIONS[complaint.status].includes(toStatus)) {
      throw new BusinessException(`Invalid transition ${complaint.status} -> ${toStatus}`, 'INVALID_STATUS_TRANSITION');
    }
    if ([TicketStatus.CLOSED, TicketStatus.REOPENED].includes(toStatus) && user.role === UserRole.RESIDENT && complaint.reporterId !== user.id) {
      throw new ForbiddenException('Can only operate own complaint');
    }
    const from = complaint.status;
    Object.assign(complaint, patch, { status: toStatus });
    const saved = await this.complaints.save(complaint);
    await this.recordLog(id, from, toStatus, user.id, comment);
    return saved;
  }

  private recordLog(complaintId: number, fromStatus: TicketStatus | null, toStatus: TicketStatus, operatorId: number, comment: string) {
    return this.logs.save(this.logs.create({ complaintId, fromStatus, toStatus, operatorId, comment }));
  }

  private scopeWhere(user: RequestUser): FindOptionsWhere<Complaint> {
    if (user.role === UserRole.RESIDENT) return { reporterId: user.id };
    if (user.role === UserRole.GRID_WORKER) return { handlerId: user.id };
    if (user.role === UserRole.DEPT_ADMIN) return { assignedDeptId: user.departmentId ?? undefined };
    return {};
  }

  private assertVisible(user: RequestUser, complaint: Complaint) {
    if (user.role === UserRole.RESIDENT && complaint.reporterId !== user.id) throw new ForbiddenException('Out of data scope');
    if (user.role === UserRole.GRID_WORKER && complaint.handlerId !== user.id) throw new ForbiddenException('Out of data scope');
    if (user.role === UserRole.DEPT_ADMIN && complaint.assignedDeptId !== user.departmentId && complaint.status !== TicketStatus.SUBMITTED) throw new ForbiddenException('Out of data scope');
  }
}
