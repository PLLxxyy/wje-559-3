import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { GridWorkerStatus } from '../constants/enums';
import { User } from './user.entity';

@Entity('grid_workers')
export class GridWorker {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user?: User;

  @Column()
  name: string;

  @Column()
  phone: string;

  @Column()
  gridArea: string;

  @Column()
  areaCode: string;

  @Column({ type: 'enum', enum: GridWorkerStatus, default: GridWorkerStatus.ACTIVE })
  status: GridWorkerStatus;

  @Column({ type: 'int', nullable: true })
  supervisorId: number | null;

  @Column({ default: 20 })
  maxTickets: number;

  @Column({ default: 0 })
  currentTickets: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
