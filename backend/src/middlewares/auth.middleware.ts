import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserStatus } from '../constants/enums';
import { User } from '../models/user.entity';
import { RequestWithUser } from '../types/request-with-user';

@Injectable()
export class AuthMiddleware implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>('public', [context.getHandler(), context.getClass()]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const authHeader = request.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    if (!token) throw new UnauthorizedException('Missing bearer token');

    try {
      const payload = await this.jwtService.verifyAsync(token);
      const user = await this.users.findOne({ where: { id: payload.sub } });
      if (!user || user.status !== UserStatus.ACTIVE) throw new UnauthorizedException('User disabled or not found');
      request.user = { id: user.id, username: user.username, role: user.role, departmentId: user.departmentId };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
