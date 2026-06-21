import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServicesService } from '../services.service';
import { ServiceRequest } from '../../models/service-request.entity';
import { OverdueStatus, ServiceStatus, ServiceType } from '../../constants/enums';
import { RequestUser } from '../../types/request-with-user';
import { UserRole } from '../../constants/enums';

describe('ServicesService - 逾期计算', () => {
  let service: ServicesService;
  let repository: jest.Mocked<Repository<ServiceRequest>>;

  const mockUser: RequestUser = {
    id: 1,
    username: 'test',
    role: UserRole.GRID_WORKER,
    departmentId: null,
  };

  const createMockRequest = (status: ServiceStatus, dueDate: Date | null): ServiceRequest => ({
    id: 1,
    requestNo: 'REQ001',
    type: ServiceType.CERTIFICATE,
    requesterId: 2,
    title: '测试请求',
    description: '测试描述',
    attachments: [],
    status,
    handlerId: 1,
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
        ServicesService,
        {
          provide: getRepositoryToken(ServiceRequest),
          useValue: {
            count: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
            findAndCount: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ServicesService>(ServicesService);
    repository = module.get(getRepositoryToken(ServiceRequest));
  });

  describe('calculateOverdueStatus', () => {
    it('已完成的请求应为 NORMAL', () => {
      const request = createMockRequest(
        ServiceStatus.COMPLETED,
        new Date(Date.now() - 86400000),
      );
      expect(service.calculateOverdueStatus(request)).toBe(OverdueStatus.NORMAL);
    });

    it('已拒绝的请求应为 NORMAL', () => {
      const request = createMockRequest(
        ServiceStatus.REJECTED,
        new Date(Date.now() - 86400000),
      );
      expect(service.calculateOverdueStatus(request)).toBe(OverdueStatus.NORMAL);
    });

    it('没有截止日期的请求应为 NORMAL', () => {
      const request = createMockRequest(ServiceStatus.IN_PROGRESS, null);
      expect(service.calculateOverdueStatus(request)).toBe(OverdueStatus.NORMAL);
    });

    it('已逾期的请求应为 OVERDUE', () => {
      const request = createMockRequest(
        ServiceStatus.IN_PROGRESS,
        new Date(Date.now() - 86400000),
      );
      expect(service.calculateOverdueStatus(request)).toBe(OverdueStatus.OVERDUE);
    });

    it('2天后到期的请求应为 APPROACHING', () => {
      const request = createMockRequest(
        ServiceStatus.IN_PROGRESS,
        new Date(Date.now() + 86400000 * 2),
      );
      expect(service.calculateOverdueStatus(request)).toBe(OverdueStatus.APPROACHING);
    });

    it('3天后到期的请求应为 APPROACHING', () => {
      const request = createMockRequest(
        ServiceStatus.IN_PROGRESS,
        new Date(Date.now() + 86400000 * 3),
      );
      expect(service.calculateOverdueStatus(request)).toBe(OverdueStatus.APPROACHING);
    });

    it('4天后到期的请求应为 NORMAL', () => {
      const request = createMockRequest(
        ServiceStatus.IN_PROGRESS,
        new Date(Date.now() + 86400000 * 4),
      );
      expect(service.calculateOverdueStatus(request)).toBe(OverdueStatus.NORMAL);
    });

    it('PENDING 状态已逾期应为 OVERDUE', () => {
      const request = createMockRequest(
        ServiceStatus.PENDING,
        new Date(Date.now() - 86400000),
      );
      expect(service.calculateOverdueStatus(request)).toBe(OverdueStatus.OVERDUE);
    });

    it('ACCEPTED 状态2天后到期应为 APPROACHING', () => {
      const request = createMockRequest(
        ServiceStatus.ACCEPTED,
        new Date(Date.now() + 86400000 * 2),
      );
      expect(service.calculateOverdueStatus(request)).toBe(OverdueStatus.APPROACHING);
    });

    it('刚到期（当前时间等于截止时间）应为 OVERDUE', () => {
      const now = new Date();
      const request = createMockRequest(ServiceStatus.IN_PROGRESS, new Date(now.getTime()));
      expect(service.calculateOverdueStatus(request)).toBe(OverdueStatus.OVERDUE);
    });
  });
});
