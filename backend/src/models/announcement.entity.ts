import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { AnnouncementCategory, AnnouncementStatus } from '../constants/enums';
import { User } from './user.entity';

@Entity('announcements')
export class Announcement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'enum', enum: AnnouncementCategory })
  category: AnnouncementCategory;

  @Column()
  authorId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'authorId' })
  author?: User;

  @Column({ type: 'int', nullable: true })
  reviewerId: number | null;

  @Column({ type: 'enum', enum: AnnouncementStatus, default: AnnouncementStatus.DRAFT })
  status: AnnouncementStatus;

  @Column({ type: 'timestamp', nullable: true })
  publishAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  expireAt: Date | null;

  @Column({ default: 0 })
  viewCount: number;

  @Column({ default: false })
  isTop: boolean;

  @Column({ type: 'jsonb', default: [] })
  attachments: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
