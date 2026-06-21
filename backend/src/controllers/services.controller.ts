import { Body, Controller, Get, Param, Post, Put, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '../constants/enums';
import { Roles } from '../middlewares/role.middleware';
import { ServicesService } from '../services/services.service';
import { RequestWithUser } from '../types/request-with-user';
import { ok } from '../utils/response-formatter';

@ApiBearerAuth()
@ApiTags('services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Roles(UserRole.RESIDENT)
  @Post()
  async create(@Req() req: RequestWithUser, @Body() body: any) {
    return ok(await this.servicesService.create(req.user, body));
  }

  @Get()
  async list(@Req() req: RequestWithUser, @Query() query: any) {
    return ok(await this.servicesService.list(req.user, query));
  }

  @Get(':id')
  async detail(@Req() req: RequestWithUser, @Param('id') id: string) {
    return ok(await this.servicesService.detail(req.user, Number(id)));
  }

  @Roles(UserRole.GRID_WORKER)
  @Put(':id/accept')
  async accept(@Req() req: RequestWithUser, @Param('id') id: string, @Body() body: any) {
    return ok(await this.servicesService.accept(req.user, Number(id), body.dueDate));
  }

  @Roles(UserRole.GRID_WORKER)
  @Put(':id/complete')
  async complete(@Req() req: RequestWithUser, @Param('id') id: string) {
    return ok(await this.servicesService.complete(req.user, Number(id)));
  }

  @Roles(UserRole.GRID_WORKER)
  @Put(':id/reject')
  async reject(@Req() req: RequestWithUser, @Param('id') id: string, @Body() body: any) {
    return ok(await this.servicesService.reject(req.user, Number(id), body.rejectionReason));
  }

  @Roles(UserRole.RESIDENT)
  @Post(':id/rate')
  async rate(@Req() req: RequestWithUser, @Param('id') id: string, @Body() body: any) {
    return ok(await this.servicesService.rate(req.user, Number(id), body.rating, body.ratingComment));
  }
}
