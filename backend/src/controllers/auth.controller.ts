import { Body, Controller, Get, Post, Put, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { RequestWithUser } from '../types/request-with-user';
import { ok } from '../utils/response-formatter';
import { Public } from '../middlewares/role.middleware';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() body: any) {
    return ok(await this.authService.register(body));
  }

  @Public()
  @Post('login')
  async login(@Body() body: any) {
    return ok(await this.authService.login(body.username, body.password));
  }

  @Public()
  @Post('refresh')
  async refresh(@Body() body: any) {
    return ok(await this.authService.refresh(body.refreshToken));
  }

  @ApiBearerAuth()
  @Put('password')
  async password(@Req() req: RequestWithUser, @Body() body: any) {
    return ok(await this.authService.changePassword(req.user.id, body.oldPassword, body.newPassword));
  }

  @ApiBearerAuth()
  @Get('profile')
  async profile(@Req() req: RequestWithUser) {
    return ok(await this.authService.profile(req.user.id));
  }

  @ApiBearerAuth()
  @Put('profile')
  async updateProfile(@Req() req: RequestWithUser, @Body() body: any) {
    return ok(await this.authService.updateProfile(req.user.id, body));
  }
}
