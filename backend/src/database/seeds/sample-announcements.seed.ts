import { Repository } from 'typeorm';
import { AnnouncementCategory, AnnouncementStatus } from '../../constants/enums';
import { Announcement } from '../../models/announcement.entity';

export async function seedSampleAnnouncements(announcements: Repository<Announcement>) {
  if (await announcements.count()) return;
  await announcements.save(announcements.create({
    title: '社区便民服务窗口开放通知',
    content: '本周起社区便民服务窗口工作日 9:00-17:00 开放。',
    category: AnnouncementCategory.NOTICE,
    authorId: 2,
    reviewerId: 1,
    status: AnnouncementStatus.PUBLISHED,
    publishAt: new Date(),
    expireAt: null,
    viewCount: 0,
    isTop: true,
    attachments: [],
  }));
}
