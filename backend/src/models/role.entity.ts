import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { UserRole } from '../constants/enums';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: UserRole, unique: true })
  name: UserRole;

  @Column({ type: 'jsonb', default: [] })
  permissions: string[];
}
