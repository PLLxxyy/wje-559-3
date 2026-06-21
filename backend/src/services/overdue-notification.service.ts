import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OverdueStatus } from '../constants/enums';
import { ServicesService } from './services.service';
import { NotificationService } from './notification.service';

type NotificationStage = typeof OverdueStatus.APPROACHING | typeof OverdueStatus.OVERDUE;

@Injectable()
export class OverdueNotificationService {
  private notifiedKeys: Set<string> = new Set();

  constructor(
    private readonly servicesService: ServicesService,
    private readonly notificationService: NotificationService,
  ) {}

  private getNotificationKey(requestId: number, stage: NotificationStage): string {
    return `${requestId}-${stage}`;
  }

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async checkOverdueRequests() {
    const overdueRequests = await this.servicesService.findOverdueRequests();

    for (const request of overdueRequests) {
      const key = this.getNotificationKey(request.id, OverdueStatus.OVERDUE);
      if (request.handlerId && !this.notifiedKeys.has(key)) {
        this.notificationService.notify(
          request.handlerId,
          '服务请求逾期提醒',
          `服务请求「${request.title}」（编号：${request.requestNo}）已逾期，请尽快处理。`,
        );
        this.notifiedKeys.add(key);
      }
    }

    const approachingRequests = await this.servicesService.findApproachingRequests();

    for (const request of approachingRequests) {
      const key = this.getNotificationKey(request.id, OverdueStatus.APPROACHING);
      if (request.handlerId && !this.notifiedKeys.has(key)) {
        const dueDate = new Date(request.dueDate!);
        const daysLeft = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        this.notificationService.notify(
          request.handlerId,
          '服务请求即将到期提醒',
          `服务请求「${request.title}」（编号：${request.requestNo}）将在 ${daysLeft} 天后到期，请及时处理。`,
        );
        this.notifiedKeys.add(key);
      }
    }
  }

  clearNotified(requestId: number) {
    this.notifiedKeys.delete(this.getNotificationKey(requestId, OverdueStatus.APPROACHING));
    this.notifiedKeys.delete(this.getNotificationKey(requestId, OverdueStatus.OVERDUE));
  }

  isNotified(requestId: number, stage: NotificationStage): boolean {
    return this.notifiedKeys.has(this.getNotificationKey(requestId, stage));
  }
}
