import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { jwtConfig } from '../config/jwt.config';
import { UserRole, UserStatus } from '../constants/enums';
import { User } from '../models/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(body: Partial<User> & { password: string }) {
    const existing = await this.users.findOne({ where: { username: body.username } });
    if (existing) throw new ConflictException('Username already exists');
    const user = this.users.create({
      username: body.username,
      password: await bcrypt.hash(body.password, 10),
      realName: body.realName,
      phone: body.phone,
      email: body.email ?? null,
      avatar: body.avatar ?? null,
      role: UserRole.RESIDENT,
      status: UserStatus.ACTIVE,
      departmentId: null,
    });
    const saved = await this.users.save(user);
    return this.publicUser(saved);
  }

  async login(username: string, password: string) {
    const user = await this.users.findOne({ where: { username } });
    if (!user || !(await bcrypt.compare(password, user.password))) throw new UnauthorizedException('Invalid username or password');
    user.lastLoginAt = new Date();
    await this.users.save(user);
    return { user: this.publicUser(user), ...(await this.issueTokens(user)) };
  }

  async refresh(refreshToken: string) {
    const payload = await this.jwtService.verifyAsync(refreshToken, { secret: jwtConfig().secret });
    const user = await this.users.findOne({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedException('Invalid refresh token');
    return this.issueTokens(user);
  }

  async changePassword(userId: number, oldPassword: string, newPassword: string) {
    const user = await this.users.findOneByOrFail({ id: userId });
    if (!(await bcrypt.compare(oldPassword, user.password))) throw new UnauthorizedException('Invalid old password');
    user.password = await bcrypt.hash(newPassword, 10);
    await this.users.save(user);
    return { changed: true };
  }

  async profile(userId: number) {
    return this.publicUser(await this.users.findOneByOrFail({ id: userId }));
  }

  async updateProfile(userId: number, body: Partial<User>) {
    const user = await this.users.findOneByOrFail({ id: userId });
    Object.assign(user, { realName: body.realName ?? user.realName, phone: body.phone ?? user.phone, email: body.email ?? user.email, avatar: body.avatar ?? user.avatar });
    return this.publicUser(await this.users.save(user));
  }

  private async issueTokens(user: User) {
    const payload = { sub: user.id, username: user.username, role: user.role, departmentId: user.departmentId };
    return {
      accessToken: await this.jwtService.signAsync(payload, { expiresIn: jwtConfig().expiresIn }),
      refreshToken: await this.jwtService.signAsync({ ...payload, type: 'refresh' }, { expiresIn: jwtConfig().refreshExpiresIn }),
    };
  }

  private publicUser(user: User) {
    const { password, ...safe } = user;
    void password;
    return safe;
  }
}
