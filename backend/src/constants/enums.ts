export enum ComplaintCategory {
  PROPERTY = '物业',
  ENVIRONMENT = '环境',
  SAFETY = '安全',
  NOISE = '噪音',
  FACILITY = '设施',
  OTHER = '其他',
}

export enum TicketStatus {
  SUBMITTED = 'SUBMITTED',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  PENDING_REVIEW = 'PENDING_REVIEW',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  REOPENED = 'REOPENED',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum UserRole {
  RESIDENT = 'RESIDENT',
  GRID_WORKER = 'GRID_WORKER',
  DEPT_ADMIN = 'DEPT_ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  DISABLED = 'DISABLED',
}

export enum ServiceType {
  CERTIFICATE = '证明开具',
  INFO_QUERY = '信息查询',
  POLICY_CONSULT = '政策咨询',
  AGENT_SERVICE = '代办服务',
}

export enum ServiceStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
}

export enum AnnouncementCategory {
  NOTICE = '通知',
  EVENT = '活动',
  POLICY = '政策',
  EMERGENCY = '紧急',
}

export enum AnnouncementStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum GridWorkerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ON_LEAVE = 'ON_LEAVE',
}
