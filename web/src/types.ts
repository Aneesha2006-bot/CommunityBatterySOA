export interface User {
  username: string;
  subject: string;
  roles: string[];
  accessToken: string;
}

export interface BatteryState {
  capacityKwh: number;
  currentChargeKwh: number;
  percentage: number;
  lastUpdated: string;
  version: number;
}

export interface ReservePolicy {
  reserveFloorKwh: number;
  perMemberDailyCapKwh: number;
  version: number;
  updatedBy: string;
  updatedAt: string;
}

export interface DischargeRequest {
  id: string;
  memberRef: string;
  requestedKwh: number;
  grantedKwh: number;
  deniedKwh: number;
  reasonCode: string;
  status: 'GRANTED' | 'PARTIALLY_GRANTED' | 'DENIED' | 'PENDING_COORDINATOR_REVIEW';
  emergency: boolean;
  createdAt: string;
  processedByInstance: string;
}

export interface RejectedRequest {
  id: number;
  requestId: string;
  memberRef: string;
  deniedKwh: number;
  reasonCode: string;
  correlationId: string;
  timestamp: string;
}

export interface PrivacyRequest {
  id?: string;
  requestType: 'ACCESS' | 'CORRECTION' | 'ERASURE' | 'GRIEVANCE';
  description: string;
  status?: string;
  submittedAt?: string;
}
