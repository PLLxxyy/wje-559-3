import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ServicesService } from './services.service';
import { NotificationService } from './notification.service';

@Injectable()
export class OverdueNotificationService {
  private notifiedRequests: Set<number> = new Set();

  constructor(
    private readonly servicesService: ServicesService,
    private readonly notificationService: NotificationService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async checkOverdueRequests() {
    const overdueRequests = await this.servicesService.findOverdueRequests();

    for (const request of overdueRequests) {
      if (request.handlerId && !this.notifiedRequests.has(request.id)) {
        this.notificationService.notify(
          request.handlerId,
          '服务请求逾期提醒',
          `服务请求「${request.title}」（编号：${request.requestNo}）已逾期，请尽快处理。`,
        );
        this.notifiedRequests.add(request.id);
      }
    }

    const approachingRequests = await this.servicesService.findApproachingRequests();

    for (const request of approachingRequests) {
      if (request.handlerId && !this.notifiedRequests.has(request.id)) {
        const dueDate = new Date(request.dueDate!);
        const daysLeft = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        this.notificationService.notify(
          request.handlerId,
          '服务请求即将到期提醒',
          `服务请求「${request.title}」（编号：${request.requestNo}）将在 ${daysLeft} 天后到期，请及时处理。`,
        );
        this.notifiedRequests.add(request.id);
      }
    }
  }

  clearNotified(requestId: number) {
    this.notifiedRequests.delete(requestId);
  }
}
