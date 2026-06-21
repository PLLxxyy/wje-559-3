import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnnouncementStatus, UserRole } from '../constants/enums';
import { Announcement } from '../models/announcement.entity';
import { RequestUser } from '../types/request-with-user';

@Injectable()
export class AnnouncementsService {
  constructor(@InjectRepository(Announcement) private readonly announcements: Repository<Announcement>) {}

  create(user: RequestUser, body: Partial<Announcement>) {
    return this.announcements.save(this.announcements.create({
      title: body.title,
      content: body.content,
      category: body.category,
      authorId: user.id,
      status: AnnouncementStatus.DRAFT,
      expireAt: body.expireAt ? new Date(body.expireAt) : null,
      isTop: body.isTop ?? false,
      attachments: body.attachments ?? [],
    }));
  }

  list() {
    return this.announcements.find({ order: { isTop: 'DESC', createdAt: 'DESC' } });
  }

  published() {
    return this.announcements.find({ where: { status: AnnouncementStatus.PUBLISHED }, order: { isTop: 'DESC', publishAt: 'DESC' } });
  }

  async detail(id: number) {
    const item = await this.announcements.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Announcement not found');
    item.viewCount += 1;
    return this.announcements.save(item);
  }

  async update(user: RequestUser, id: number, body: Partial<Announcement>) {
    const item = await this.getEditable(user, id);
    Object.assign(item, body);
    return this.announcements.save(item);
  }

  async submitReview(user: RequestUser, id: number) {
    const item = await this.getEditable(user, id);
    item.status = AnnouncementStatus.PENDING_REVIEW;
    return this.announcements.save(item);
  }

  async approve(user: RequestUser, id: number) {
    const item = await this.announcements.findOneByOrFail({ id });
    item.reviewerId = user.id;
    item.status = AnnouncementStatus.PUBLISHED;
    item.publishAt = new Date();
    return this.announcements.save(item);
  }

  async reject(user: RequestUser, id: number) {
    const item = await this.announcements.findOneByOrFail({ id });
    item.reviewerId = user.id;
    item.status = AnnouncementStatus.DRAFT;
    return this.announcements.save(item);
  }

  async archive(user: RequestUser, id: number) {
    const item = await this.getEditable(user, id, true);
    item.status = AnnouncementStatus.ARCHIVED;
    return this.announcements.save(item);
  }

  async remove(user: RequestUser, id: number) {
    const item = await this.getEditable(user, id, true);
    if (item.status !== AnnouncementStatus.DRAFT && user.role !== UserRole.SUPER_ADMIN) throw new ForbiddenException('Only draft can be deleted');
    await this.announcements.delete(id);
    return { deleted: true };
  }

  private async getEditable(user: RequestUser, id: number, superAdminAllowed = false) {
    const item = await this.announcements.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Announcement not found');
    if (item.authorId !== user.id && !(superAdminAllowed && user.role === UserRole.SUPER_ADMIN) && user.role !== UserRole.DEPT_ADMIN) {
      throw new ForbiddenException('Can only edit own announcement');
    }
    return item;
  }
}
