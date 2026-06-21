import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true })
  userId: number | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @Column()
  action: string;

  @Column()
  entity: string;

  @Column({ type: 'int', nullable: true })
  entityId: number | null;

  @Column({ type: 'jsonb', default: {} })
  details: Record<string, unknown>;

  @Column()
  ip: string;

  @Column()
  userAgent: string;

  @CreateDateColumn()
  createdAt: Date;
}
