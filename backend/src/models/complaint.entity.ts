import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ComplaintCategory, Priority, TicketStatus } from '../constants/enums';
import { Department } from './department.entity';
import { User } from './user.entity';

@Entity('complaints')
export class Complaint {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  ticketNo: string;

  @Column()
  reporterId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reporterId' })
  reporter?: User;

  @Column({ type: 'enum', enum: ComplaintCategory })
  category: ComplaintCategory;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'jsonb', default: [] })
  images: string[];

  @Column()
  location: string;

  @Column({ type: 'enum', enum: Priority, default: Priority.MEDIUM })
  priority: Priority;

  @Column({ type: 'enum', enum: TicketStatus, default: TicketStatus.SUBMITTED })
  status: TicketStatus;

  @Column({ type: 'int', nullable: true })
  assignedDeptId: number | null;

  @ManyToOne(() => Department, { nullable: true })
  @JoinColumn({ name: 'assignedDeptId' })
  assignedDept?: Department;

  @Column({ type: 'int', nullable: true })
  handlerId: number | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'handlerId' })
  handler?: User;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  closedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
