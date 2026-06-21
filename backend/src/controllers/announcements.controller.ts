import { Body, Controller, Delete, Get, Param, Post, Put, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '../constants/enums';
import { Public, Roles } from '../middlewares/role.middleware';
import { AnnouncementsService } from '../services/announcements.service';
import { RequestWithUser } from '../types/request-with-user';
import { ok } from '../utils/response-formatter';

@ApiTags('announcements')
@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @ApiBearerAuth()
  @Roles(UserRole.DEPT_ADMIN)
  @Post()
  async create(@Req() req: RequestWithUser, @Body() body: any) {
    return ok(await this.announcementsService.create(req.user, body));
  }

  @ApiBearerAuth()
  @Get()
  async list() {
    return ok(await this.announcementsService.list());
  }

  @Public()
  @Get('published')
  async published() {
    return ok(await this.announcementsService.published());
  }

  @ApiBearerAuth()
  @Get(':id')
  async detail(@Param('id') id: string) {
    return ok(await this.announcementsService.detail(Number(id)));
  }

  @ApiBearerAuth()
  @Put(':id')
  async update(@Req() req: RequestWithUser, @Param('id') id: string, @Body() body: any) {
    return ok(await this.announcementsService.update(req.user, Number(id), body));
  }

  @ApiBearerAuth()
  @Roles(UserRole.DEPT_ADMIN)
  @Put(':id/submit-review')
  async submitReview(@Req() req: RequestWithUser, @Param('id') id: string) {
    return ok(await this.announcementsService.submitReview(req.user, Number(id)));
  }

  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN)
  @Put(':id/approve')
  async approve(@Req() req: RequestWithUser, @Param('id') id: string) {
    return ok(await this.announcementsService.approve(req.user, Number(id)));
  }

  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN)
  @Put(':id/reject')
  async reject(@Req() req: RequestWithUser, @Param('id') id: string) {
    return ok(await this.announcementsService.reject(req.user, Number(id)));
  }

  @ApiBearerAuth()
  @Put(':id/archive')
  async archive(@Req() req: RequestWithUser, @Param('id') id: string) {
    return ok(await this.announcementsService.archive(req.user, Number(id)));
  }

  @ApiBearerAuth()
  @Delete(':id')
  async remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    return ok(await this.announcementsService.remove(req.user, Number(id)));
  }
}
