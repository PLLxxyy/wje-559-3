import { Controller, Get } from '@nestjs/common';
import { Public } from '../middlewares/role.middleware';
import { ok } from '../utils/response-formatter';

@Controller('health')
export class HealthController {
  @Public()
  @Get()
  health() {
    return ok({ status: 'ok' });
  }
}
