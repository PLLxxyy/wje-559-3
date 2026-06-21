import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationService {
  notify(userId: number, title: string, content: string) {
    return { userId, title, content, sentAt: new Date().toISOString() };
  }
}
