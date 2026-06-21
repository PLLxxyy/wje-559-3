import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Complaint } from './complaint.entity';
import { User } from './user.entity';

@Entity('complaint_comments')
export class ComplaintComment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  complaintId: number;

  @ManyToOne(() => Complaint)
  @JoinColumn({ name: 'complaintId' })
  complaint?: Complaint;

  @Column()
  authorId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'authorId' })
  author?: User;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn()
  createdAt: Date;
}
