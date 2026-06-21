import { Body, Controller, Get, Param, Post, Put, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '../constants/enums';
import { Roles } from '../middlewares/role.middleware';
import { ComplaintsService } from '../services/complaints.service';
import { RequestWithUser } from '../types/request-with-user';
import { ok } from '../utils/response-formatter';

@ApiBearerAuth()
@ApiTags('complaints')
@Controller('complaints')
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @Roles(UserRole.RESIDENT)
  @Post()
  async create(@Req() req: RequestWithUser, @Body() body: any) {
    return ok(await this.complaintsService.create(req.user, body));
  }

  @Get()
  async list(@Req() req: RequestWithUser, @Query() query: any) {
    return ok(await this.complaintsService.list(req.user, query));
  }

  @Get(':id')
  async detail(@Req() req: RequestWithUser, @Param('id') id: string) {
    return ok(await this.complaintsService.detail(req.user, Number(id)));
  }

  @Roles(UserRole.DEPT_ADMIN)
  @Put(':id/assign')
  async assign(@Req() req: RequestWithUser, @Param('id') id: string, @Body() body: any) {
    return ok(await this.complaintsService.assign(req.user, Number(id), body));
  }

  @Roles(UserRole.GRID_WORKER)
  @Put(':id/process')
  async process(@Req() req: RequestWithUser, @Param('id') id: string, @Body() body: any) {
    return ok(await this.complaintsService.process(req.user, Number(id), body));
  }

  @Roles(UserRole.GRID_WORKER)
  @Put(':id/review')
  async review(@Req() req: RequestWithUser, @Param('id') id: string, @Body() body: any) {
    return ok(await this.complaintsService.review(req.user, Number(id), body));
  }

  @Roles(UserRole.DEPT_ADMIN)
  @Put(':id/resolve')
  async resolve(@Req() req: RequestWithUser, @Param('id') id: string, @Body() body: any) {
    return ok(await this.complaintsService.resolve(req.user, Number(id), body));
  }

  @Roles(UserRole.RESIDENT)
  @Put(':id/close')
  async close(@Req() req: RequestWithUser, @Param('id') id: string, @Body() body: any) {
    return ok(await this.complaintsService.close(req.user, Number(id), body));
  }

  @Roles(UserRole.RESIDENT)
  @Put(':id/reopen')
  async reopen(@Req() req: RequestWithUser, @Param('id') id: string, @Body() body: any) {
    return ok(await this.complaintsService.reopen(req.user, Number(id), body));
  }

  @Post(':id/comments')
  async addComment(@Req() req: RequestWithUser, @Param('id') id: string, @Body() body: any) {
    return ok(await this.complaintsService.addComment(req.user, Number(id), body.content));
  }

  @Get(':id/comments')
  async comments(@Req() req: RequestWithUser, @Param('id') id: string) {
    return ok(await this.complaintsService.listComments(req.user, Number(id)));
  }

  @Get(':id/logs')
  async logs(@Req() req: RequestWithUser, @Param('id') id: string) {
    return ok(await this.complaintsService.listLogs(req.user, Number(id)));
  }
}
