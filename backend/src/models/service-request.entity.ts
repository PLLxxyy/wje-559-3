import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ServiceStatus, ServiceType } from '../constants/enums';
import { User } from './user.entity';

@Entity('service_requests')
export class ServiceRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  requestNo: string;

  @Column({ type: 'enum', enum: ServiceType })
  type: ServiceType;

  @Column()
  requesterId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'requesterId' })
  requester?: User;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'jsonb', default: [] })
  attachments: string[];

  @Column({ type: 'enum', enum: ServiceStatus, default: ServiceStatus.PENDING })
  status: ServiceStatus;

  @Column({ type: 'int', nullable: true })
  handlerId: number | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'handlerId' })
  handler?: User;

  @Column({ type: 'timestamp', nullable: true })
  dueDate: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string | null;

  @Column({ type: 'int', nullable: true })
  rating: number | null;

  @Column({ type: 'text', nullable: true })
  ratingComment: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
