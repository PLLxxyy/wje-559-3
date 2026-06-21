import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TicketStatus } from '../constants/enums';
import { Complaint } from './complaint.entity';
import { User } from './user.entity';

@Entity('complaint_logs')
export class ComplaintLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  complaintId: number;

  @ManyToOne(() => Complaint)
  @JoinColumn({ name: 'complaintId' })
  complaint?: Complaint;

  @Column({ type: 'enum', enum: TicketStatus, nullable: true })
  fromStatus: TicketStatus | null;

  @Column({ type: 'enum', enum: TicketStatus })
  toStatus: TicketStatus;

  @Column()
  operatorId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'operatorId' })
  operator?: User;

  @Column({ type: 'text', nullable: true })
  comment: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
