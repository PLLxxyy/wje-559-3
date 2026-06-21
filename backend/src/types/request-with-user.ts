import { Request } from 'express';
import { UserRole } from '../constants/enums';

export interface RequestUser {
  id: number;
  username: string;
  role: UserRole;
  departmentId: number | null;
}

export interface RequestWithUser extends Request {
  user: RequestUser;
}
