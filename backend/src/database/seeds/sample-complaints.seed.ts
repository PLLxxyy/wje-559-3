import { Repository } from 'typeorm';
import { ComplaintCategory, Priority, TicketStatus } from '../../constants/enums';
import { Complaint } from '../../models/complaint.entity';

export async function seedSampleComplaints(complaints: Repository<Complaint>) {
  if (await complaints.count()) return;
  await complaints.save(complaints.create({
    ticketNo: 'TS-20260115-0001',
    reporterId: 4,
    category: ComplaintCategory.NOISE,
    title: '楼下装修噪音扰民',
    description: '连续三天早上7点开始电钻',
    images: [],
    location: '3号楼2单元',
    priority: Priority.HIGH,
    status: TicketStatus.SUBMITTED,
    assignedDeptId: null,
    handlerId: null,
  }));
}
