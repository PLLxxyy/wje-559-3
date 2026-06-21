import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '../constants/enums';
import { Roles } from '../middlewares/role.middleware';
import { GridsService } from '../services/grids.service';
import { ok } from '../utils/response-formatter';

@ApiBearerAuth()
@ApiTags('grids')
@Controller('grids')
export class GridsController {
  constructor(private readonly gridsService: GridsService) {}

  @Roles(UserRole.DEPT_ADMIN)
  @Post('workers')
  async create(@Body() body: any) {
    return ok(await this.gridsService.create(body));
  }

  @Roles(UserRole.DEPT_ADMIN)
  @Get('workers')
  async list() {
    return ok(await this.gridsService.list());
  }

  @Roles(UserRole.DEPT_ADMIN)
  @Get('workers/:id')
  async detail(@Param('id') id: string) {
    return ok(await this.gridsService.detail(Number(id)));
  }

  @Roles(UserRole.DEPT_ADMIN)
  @Put('workers/:id')
  async update(@Param('id') id: string, @Body() body: any) {
    return ok(await this.gridsService.update(Number(id), body));
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Delete('workers/:id')
  async remove(@Param('id') id: string) {
    return ok(await this.gridsService.remove(Number(id)));
  }

  @Roles(UserRole.DEPT_ADMIN)
  @Put('workers/:id/assign-area')
  async assignArea(@Param('id') id: string, @Body() body: any) {
    return ok(await this.gridsService.assignArea(Number(id), body));
  }

  @Roles(UserRole.DEPT_ADMIN)
  @Get('workers/:id/stats')
  async stats(@Param('id') id: string) {
    return ok(await this.gridsService.stats(Number(id)));
  }

  @Get('areas')
  async areas() {
    return ok(await this.gridsService.areas());
  }

  @Get('areas/:code/workers')
  async workersByArea(@Param('code') code: string) {
    return ok(await this.gridsService.workersByArea(code));
  }
}
