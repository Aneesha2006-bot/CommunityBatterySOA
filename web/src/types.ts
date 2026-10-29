export type UserRole = 'consumer' | 'coordinator';

export interface User {
  username: string;
  fullName: string;
  subject: string;
  email: string;
  role: UserRole;
  accountNumber: string;
  dailyCapKwh: number;
  allocatedTodayKwh: number;
  accessToken: string;
}

export type BatteryStatus = 'Idle' | 'Discharging' | 'Charging' | 'Reserve Guarded';

export interface BatteryState {
  capacityKwh: number;
  availableEnergyKwh: number;
  allocatedEnergyKwh: number;
  reserveFloorKwh: number;
  remainingShareableKwh: number;
  percentage: number;
  status: BatteryStatus;
  lastUpdated: string;
  version: number;
  currentChargeKwh?: number;
}

export interface ReservePolicy {
  reserveFloorKwh: number;
  perMemberDailyCapKwh: number;
  absoluteSafetyMarginKwh?: number;
  version: number;
  updatedBy: string;
  updatedAt: string;
}

export type RequestStatus =
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'MODIFIED'
  | 'ALLOCATED'
  | 'REJECTED'
  | 'DEALLOCATED';

export type RequestPriority = 'NORMAL' | 'HIGH' | 'EMERGENCY';

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: 'CREATED' | 'APPROVED' | 'MODIFIED' | 'ALLOCATED' | 'DEALLOCATED' | 'REJECTED';
  performedBy: string;
  role: string;
  previousKwh?: number;
  newKwh?: number;
  remarks?: string;
}

export interface BatteryRequest {
  id: string;
  consumerId: string;
  consumerUsername: string;
  consumerName: string;
  requestedKwh: number;
  approvedKwh: number | null;
  allocatedKwh: number | null;
  priority: RequestPriority;
  reason: string;
  status: RequestStatus;
  coordinatorRemarks: string | null;
  createdAt: string;
  updatedAt: string;
  auditTrail: AuditEntry[];
}

export interface AppNotification {
  id: string;
  userId: string; // recipient subject or 'ALL_COORDINATORS'
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'alert';
}

// Backward-compatibility interfaces for legacy course views
export interface DischargeRequest {
  id: string;
  memberSubject?: string;
  memberRef?: string;
  consumerUsername?: string;
  requestedKwh: number;
  approvedKwh?: number;
  grantedKwh: number;
  deniedKwh: number;
  reasonCode?: string;
  purpose?: string;
  reason?: string;
  status: string;
  processedByInstance?: string;
  createdAt: string;
}

export interface RejectedRequest {
  id: string;
  requestId?: string;
  memberSubject?: string;
  memberRef?: string;
  consumerUsername?: string;
  requestedKwh: number;
  deniedKwh: number;
  reason: string;
  reasonCode?: string;
  correlationId?: string;
  timestamp: string;
}
