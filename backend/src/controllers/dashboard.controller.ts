import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '../constants/enums';
import { Roles } from '../middlewares/role.middleware';
import { DashboardService } from '../services/dashboard.service';
import { ok } from '../utils/response-formatter';

@ApiBearerAuth()
@ApiTags('dashboard')
@Roles(UserRole.DEPT_ADMIN)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  async overview() {
    return ok(await this.dashboardService.overview());
  }

  @Get('complaint-trends')
  async complaintTrends() {
    return ok(await this.dashboardService.complaintTrends());
  }

  @Get('response-time')
  responseTime() {
    return ok(this.dashboardService.responseTime());
  }

  @Get('category-distribution')
  async categoryDistribution() {
    return ok(await this.dashboardService.categoryDistribution());
  }

  @Get('satisfaction')
  async satisfaction() {
    return ok(await this.dashboardService.satisfaction());
  }

  @Get('worker-performance')
  async workerPerformance() {
    return ok(await this.dashboardService.workerPerformance());
  }
}
