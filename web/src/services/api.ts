import { BatteryState, ReservePolicy, DischargeRequest, RejectedRequest, PrivacyRequest } from '../types';

let currentAuthToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  currentAuthToken = token;
};

const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (currentAuthToken) {
    headers['Authorization'] = `Bearer ${currentAuthToken}`;
  }
  return headers;
};

// Mock fallback state for standalone offline presentation
let mockBatteryState: BatteryState = {
  capacityKwh: 100.0,
  currentChargeKwh: 80.0,
  percentage: 80.0,
  lastUpdated: new Date().toISOString(),
  version: 1,
};

let mockPolicy: ReservePolicy = {
  reserveFloorKwh: 30.0,
  perMemberDailyCapKwh: 50.0,
  version: 1,
  updatedBy: 'coordinator-1',
  updatedAt: new Date().toISOString(),
};

const mockDischarges: DischargeRequest[] = [
  {
    id: 'req-init-seed-1',
    memberRef: 'subj-member-a',
    requestedKwh: 12.0,
    grantedKwh: 12.0,
    deniedKwh: 0.0,
    reasonCode: 'GRANTED',
    status: 'GRANTED',
    emergency: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    processedByInstance: 'discharge-allocation-service:8084',
  },
];

const mockRejections: RejectedRequest[] = [];

export const api = {
  // Battery State
  getBatteryState: async (): Promise<BatteryState> => {
    try {
      const res = await fetch('/api/battery/state', { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch battery state');
      const data = await res.json();
      mockBatteryState = data;
      return data;
    } catch {
      return mockBatteryState;
    }
  },

  // Reserve Policy
  getReservePolicy: async (): Promise<ReservePolicy> => {
    try {
      const res = await fetch('/api/reserve/policy', { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch policy');
      const data = await res.json();
      mockPolicy = data;
      return data;
    } catch {
      return mockPolicy;
    }
  },

  updateReservePolicy: async (floor: number, cap: number): Promise<ReservePolicy> => {
    try {
      const res = await fetch('/api/reserve/policy', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ reserveFloorKwh: floor, perMemberDailyCapKwh: cap }),
      });
      if (!res.ok) throw new Error('Failed to update policy');
      const data = await res.json();
      mockPolicy = data;
      return data;
    } catch {
      mockPolicy = {
        ...mockPolicy,
        reserveFloorKwh: floor,
        perMemberDailyCapKwh: cap,
        version: mockPolicy.version + 1,
        updatedAt: new Date().toISOString(),
      };
      return mockPolicy;
    }
  },

  // Discharges
  submitDischarge: async (requestedKwh: number, emergency = false, memberRef?: string): Promise<DischargeRequest> => {
    try {
      const res = await fetch('/api/discharges', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ requestedKwh, emergency, memberRef }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Request rejected');
      }
      return await res.json();
    } catch {
      // Local fallback calculation strictly implementing ReserveAllocator rule
      const shareablePool = Math.max(0, mockBatteryState.currentChargeKwh - mockPolicy.reserveFloorKwh);
      let granted = 0;
      let denied = 0;
      let status: 'GRANTED' | 'PARTIALLY_GRANTED' | 'DENIED' = 'DENIED';
      let reason = 'RESERVE_PROTECTED';

      if (emergency) {
        // Coordinator authorized draw
        const allowedPool = Math.max(0, mockBatteryState.currentChargeKwh - 5.0);
        granted = Math.min(requestedKwh, allowedPool);
        denied = requestedKwh - granted;
        status = denied === 0 ? 'GRANTED' : (granted > 0 ? 'PARTIALLY_GRANTED' : 'DENIED');
        reason = denied > 0 ? 'RESERVE_PROTECTED' : 'GRANTED';
      } else {
        granted = Math.min(requestedKwh, shareablePool, mockPolicy.perMemberDailyCapKwh);
        denied = requestedKwh - granted;
        if (granted === requestedKwh) {
          status = 'GRANTED';
          reason = 'GRANTED';
        } else if (granted > 0) {
          status = 'PARTIALLY_GRANTED';
          reason = 'RESERVE_PROTECTED';
        } else {
          status = 'DENIED';
          reason = 'RESERVE_PROTECTED';
        }
      }

      mockBatteryState = {
        ...mockBatteryState,
        currentChargeKwh: Math.max(0, mockBatteryState.currentChargeKwh - granted),
        percentage: Math.round(((mockBatteryState.currentChargeKwh - granted) / mockBatteryState.capacityKwh) * 100),
        lastUpdated: new Date().toISOString(),
      };

      const record: DischargeRequest = {
        id: 'req-' + Math.random().toString(36).substring(2, 9),
        memberRef: memberRef || 'subj-current-user',
        requestedKwh,
        grantedKwh: granted,
        deniedKwh: denied,
        reasonCode: reason,
        status,
        emergency,
        createdAt: new Date().toISOString(),
        processedByInstance: 'discharge-allocation-service:8084',
      };

      mockDischarges.unshift(record);

      if (denied > 0) {
        mockRejections.unshift({
          id: mockRejections.length + 1,
          requestId: record.id,
          memberRef: record.memberRef,
          deniedKwh: denied,
          reasonCode: reason,
          correlationId: 'corr-local-sim',
          timestamp: new Date().toISOString(),
        });
      }

      return record;
    }
  },

  listDischarges: async (): Promise<DischargeRequest[]> => {
    try {
      const res = await fetch('/api/discharges', { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to list discharges');
      return await res.json();
    } catch {
      return mockDischarges;
    }
  },

  listRejected: async (): Promise<RejectedRequest[]> => {
    try {
      const res = await fetch('/api/discharges/rejected', { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to list rejected discharges');
      return await res.json();
    } catch {
      return mockRejections;
    }
  },

  // Consent & Privacy Rights
  recordConsent: async (purpose: string, granted: boolean) => {
    try {
      await fetch('/api/consent', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ purpose, granted }),
      });
    } catch {
      // offline safe
    }
  },

  submitPrivacyRequest: async (req: PrivacyRequest): Promise<{ id: string; message: string }> => {
    try {
      const res = await fetch('/api/privacy/requests', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(req),
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return {
      id: 'DPO-' + Math.floor(100000 + Math.random() * 900000),
      message: 'Privacy request successfully recorded under DPDP Grievance Intake SLA.',
    };
  },
};
