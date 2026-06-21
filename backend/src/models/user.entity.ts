import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { UserRole, UserStatus } from '../constants/enums';
import { Department } from './department.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column()
  realName: string;

  @Column()
  phone: string;

  @Column({ type: 'varchar', nullable: true })
  email: string | null;

  @Column({ type: 'varchar', nullable: true })
  avatar: string | null;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.RESIDENT })
  role: UserRole;

  @Column({ type: 'int', nullable: true })
  departmentId: number | null;

  @ManyToOne(() => Department, { nullable: true })
  @JoinColumn({ name: 'departmentId' })
  department?: Department;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
