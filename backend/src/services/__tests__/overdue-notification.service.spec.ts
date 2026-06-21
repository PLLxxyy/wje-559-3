import { Test, TestingModule } from '@nestjs/testing';
import { OverdueNotificationService } from '../overdue-notification.service';
import { ServicesService } from '../services.service';
import { NotificationService } from '../notification.service';
import { OverdueStatus, ServiceStatus, ServiceType } from '../../constants/enums';
import { ServiceRequest } from '../../models/service-request.entity';

describe('OverdueNotificationService', () => {
  let service: OverdueNotificationService;
  let servicesService: jest.Mocked<ServicesService>;
  let notificationService: jest.Mocked<NotificationService>;

  const createMockRequest = (id: number, handlerId: number, dueDate: Date): ServiceRequest => ({
    id,
    requestNo: `REQ${id}`,
    type: ServiceType.CERTIFICATE,
    requesterId: 1,
    title: `测试请求${id}`,
    description: '测试描述',
    attachments: [],
    status: ServiceStatus.IN_PROGRESS,
    handlerId,
    dueDate,
    completedAt: null,
    rejectionReason: null,
    rating: null,
    ratingComment: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OverdueNotificationService,
        {
          provide: ServicesService,
          useValue: {
            findOverdueRequests: jest.fn(),
            findApproachingRequests: jest.fn(),
          },
        },
        {
          provide: NotificationService,
          useValue: {
            notify: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OverdueNotificationService>(OverdueNotificationService);
    servicesService = module.get(ServicesService);
    notificationService = module.get(NotificationService);
    jest.clearAllMocks();
  });

  describe('按阶段区分去重', () => {
    it('同一个请求先收到即将到期通知后，真正逾期时应再次发送逾期通知', async () => {
      const request = createMockRequest(1, 100, new Date(Date.now() - 86400000));

      servicesService.findOverdueRequests.mockResolvedValue([]);
      servicesService.findApproachingRequests.mockResolvedValue([request]);
      await service.checkOverdueRequests();

      expect(notificationService.notify).toHaveBeenCalledTimes(1);
      expect(notificationService.notify).toHaveBeenCalledWith(
        100,
        '服务请求即将到期提醒',
        expect.stringContaining('测试请求1'),
      );
      expect(service.isNotified(1, OverdueStatus.APPROACHING)).toBe(true);
      expect(service.isNotified(1, OverdueStatus.OVERDUE)).toBe(false);

      jest.clearAllMocks();

      servicesService.findOverdueRequests.mockResolvedValue([request]);
      servicesService.findApproachingRequests.mockResolvedValue([]);
      await service.checkOverdueRequests();

      expect(notificationService.notify).toHaveBeenCalledTimes(1);
      expect(notificationService.notify).toHaveBeenCalledWith(
        100,
        '服务请求逾期提醒',
        expect.stringContaining('测试请求1'),
      );
      expect(service.isNotified(1, OverdueStatus.APPROACHING)).toBe(true);
      expect(service.isNotified(1, OverdueStatus.OVERDUE)).toBe(true);
    });

    it('同一阶段内重复运行不应重复发送通知', async () => {
      const request = createMockRequest(2, 200, new Date(Date.now() - 86400000));

      servicesService.findOverdueRequests.mockResolvedValue([request]);
      servicesService.findApproachingRequests.mockResolvedValue([]);

      await service.checkOverdueRequests();
      await service.checkOverdueRequests();

      expect(notificationService.notify).toHaveBeenCalledTimes(1);
    });

    it('即将到期阶段重复运行不应重复发送通知', async () => {
      const request = createMockRequest(3, 300, new Date(Date.now() + 86400000 * 2));

      servicesService.findOverdueRequests.mockResolvedValue([]);
      servicesService.findApproachingRequests.mockResolvedValue([request]);

      await service.checkOverdueRequests();
      await service.checkOverdueRequests();

      expect(notificationService.notify).toHaveBeenCalledTimes(1);
      expect(service.isNotified(3, OverdueStatus.APPROACHING)).toBe(true);
      expect(service.isNotified(3, OverdueStatus.OVERDUE)).toBe(false);
    });

    it('不同请求的通知互不影响', async () => {
      const request1 = createMockRequest(4, 400, new Date(Date.now() - 86400000));
      const request2 = createMockRequest(5, 500, new Date(Date.now() - 86400000));

      servicesService.findOverdueRequests.mockResolvedValue([request1, request2]);
      servicesService.findApproachingRequests.mockResolvedValue([]);

      await service.checkOverdueRequests();

      expect(notificationService.notify).toHaveBeenCalledTimes(2);
      expect(notificationService.notify).toHaveBeenCalledWith(
        400,
        '服务请求逾期提醒',
        expect.stringContaining('测试请求4'),
      );
      expect(notificationService.notify).toHaveBeenCalledWith(
        500,
        '服务请求逾期提醒',
        expect.stringContaining('测试请求5'),
      );
    });

    it('clearNotified 应清除该请求的所有阶段通知记录', async () => {
      const request = createMockRequest(6, 600, new Date(Date.now() + 86400000 * 2));

      servicesService.findOverdueRequests.mockResolvedValue([]);
      servicesService.findApproachingRequests.mockResolvedValue([request]);
      await service.checkOverdueRequests();

      servicesService.findOverdueRequests.mockResolvedValue([request]);
      servicesService.findApproachingRequests.mockResolvedValue([]);
      await service.checkOverdueRequests();

      expect(service.isNotified(6, OverdueStatus.APPROACHING)).toBe(true);
      expect(service.isNotified(6, OverdueStatus.OVERDUE)).toBe(true);

      service.clearNotified(6);

      expect(service.isNotified(6, OverdueStatus.APPROACHING)).toBe(false);
      expect(service.isNotified(6, OverdueStatus.OVERDUE)).toBe(false);
    });

    it('没有 handlerId 的请求不应发送通知', async () => {
      const request = createMockRequest(7, null as any, new Date(Date.now() - 86400000));

      servicesService.findOverdueRequests.mockResolvedValue([request]);
      servicesService.findApproachingRequests.mockResolvedValue([]);

      await service.checkOverdueRequests();

      expect(notificationService.notify).not.toHaveBeenCalled();
    });

    it('同一请求先逾期后即将到期（边界情况），两个阶段都应发送通知', async () => {
      const request = createMockRequest(8, 800, new Date(Date.now() + 86400000 * 2));

      servicesService.findOverdueRequests.mockResolvedValue([request]);
      servicesService.findApproachingRequests.mockResolvedValue([]);
      await service.checkOverdueRequests();

      expect(notificationService.notify).toHaveBeenCalledTimes(1);
      expect(notificationService.notify).toHaveBeenCalledWith(
        800,
        '服务请求逾期提醒',
        expect.stringContaining('测试请求8'),
      );

      jest.clearAllMocks();

      servicesService.findOverdueRequests.mockResolvedValue([]);
      servicesService.findApproachingRequests.mockResolvedValue([request]);
      await service.checkOverdueRequests();

      expect(notificationService.notify).toHaveBeenCalledTimes(1);
      expect(notificationService.notify).toHaveBeenCalledWith(
        800,
        '服务请求即将到期提醒',
        expect.stringContaining('测试请求8'),
      );
    });
  });
});
