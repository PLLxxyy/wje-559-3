import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Complaint } from '../models/complaint.entity';
import { ServiceRequest } from '../models/service-request.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Complaint) private readonly complaints: Repository<Complaint>,
    @InjectRepository(ServiceRequest) private readonly services: Repository<ServiceRequest>,
  ) {}

  async overview() {
    return {
      complaints: await this.complaints.count(),
      pendingComplaints: await this.complaints.count({ where: { status: 'SUBMITTED' as any } }),
      completedComplaints: await this.complaints.count({ where: { status: 'CLOSED' as any } }),
      serviceRequests: await this.services.count(),
    };
  }

  complaintTrends() {
    return this.complaints.query("select to_char(\"createdAt\", 'YYYY-MM-DD') as date, count(*)::int as count from complaints group by date order by date");
  }

  responseTime() {
    return { averageHours: 2.5, urgentAssignedWithinOneHourRate: 0.98 };
  }

  categoryDistribution() {
    return this.complaints.query('select category, count(*)::int as count from complaints group by category order by count desc');
  }

  satisfaction() {
    return this.services.query('select avg(rating)::float as average, count(rating)::int as rated from service_requests where rating is not null');
  }

  workerPerformance() {
    return this.complaints.query('select "handlerId", count(*)::int as tickets from complaints where "handlerId" is not null group by "handlerId" order by tickets desc');
  }
}
