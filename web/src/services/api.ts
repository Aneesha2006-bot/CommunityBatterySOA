import { BatteryState, ReservePolicy, BatteryRequest, AppNotification, User, RequestPriority } from '../types';
import { batteryStorage } from './batteryStorage';

let currentAuthToken: string | null = null;
let currentUser: User | null = null;

export const setAuthToken = (token: string | null) => {
  currentAuthToken = token;
};

export const setCurrentUser = (user: User | null) => {
  currentUser = user;
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

export const api = {
  // Battery State
  getBatteryState: async (): Promise<BatteryState> => {
    try {
      const res = await fetch('/api/battery/state', { headers: getHeaders() });
      if (res.ok) {
        const backendState = await res.json();
        const local = batteryStorage.getBatteryState();
        return {
          ...local,
          availableEnergyKwh: backendState.currentChargeKwh ?? local.availableEnergyKwh,
          percentage: backendState.percentage ?? local.percentage,
        };
      }
    } catch {
      // safe fallback to local persistence
    }
    return batteryStorage.getBatteryState();
  },

  // Reserve Policy
  getReservePolicy: async (): Promise<ReservePolicy> => {
    try {
      const res = await fetch('/api/reserve/policy', { headers: getHeaders() });
      if (res.ok) {
        const backendPolicy = await res.json();
        const local = batteryStorage.getPolicy();
        return {
          ...local,
          reserveFloorKwh: backendPolicy.reserveFloorKwh ?? local.reserveFloorKwh,
          perMemberDailyCapKwh: backendPolicy.perMemberDailyCapKwh ?? local.perMemberDailyCapKwh,
        };
      }
    } catch {
      // safe fallback
    }
    return batteryStorage.getPolicy();
  },

  updateReservePolicy: async (floor: number, cap: number): Promise<ReservePolicy> => {
    if (!currentUser) throw new Error('Not authenticated');
    try {
      await fetch('/api/reserve/policy', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ reserveFloorKwh: floor, perMemberDailyCapKwh: cap }),
      });
    } catch {
      // local fallback
    }
    return batteryStorage.updatePolicy(floor, cap, currentUser);
  },

  // Requests
  getRequests: async (): Promise<BatteryRequest[]> => {
    if (!currentUser) return [];
    return batteryStorage.getRequestsForUser(currentUser);
  },

  submitRequest: async (
    requestedKwh: number,
    priority: RequestPriority,
    reason: string
  ): Promise<BatteryRequest> => {
    if (!currentUser) throw new Error('User must be logged in to submit a request');
    return batteryStorage.submitRequest(currentUser, requestedKwh, priority, reason);
  },

  approveRequest: async (
    requestId: string,
    approvedKwh: number,
    remarks: string
  ): Promise<BatteryRequest> => {
    if (!currentUser || currentUser.role !== 'coordinator') {
      throw new Error('Only energy coordinators can approve requests');
    }
    return batteryStorage.approveRequest(requestId, approvedKwh, remarks, currentUser);
  },

  modifyAllocation: async (
    requestId: string,
    newApprovedKwh: number,
    remarks: string
  ): Promise<BatteryRequest> => {
    if (!currentUser || currentUser.role !== 'coordinator') {
      throw new Error('Only energy coordinators can modify allocations');
    }
    return batteryStorage.approveRequest(requestId, newApprovedKwh, remarks, currentUser);
  },

  allocateRequest: async (requestId: string): Promise<BatteryRequest> => {
    if (!currentUser || currentUser.role !== 'coordinator') {
      throw new Error('Only energy coordinators can commit allocations');
    }
    return batteryStorage.allocateRequest(requestId, currentUser);
  },

  deallocateRequest: async (requestId: string, remarks: string): Promise<BatteryRequest> => {
    if (!currentUser || currentUser.role !== 'coordinator') {
      throw new Error('Only energy coordinators can deallocate energy');
    }
    return batteryStorage.deallocateRequest(requestId, remarks, currentUser);
  },

  rejectRequest: async (requestId: string, reason: string): Promise<BatteryRequest> => {
    if (!currentUser || currentUser.role !== 'coordinator') {
      throw new Error('Only energy coordinators can reject requests');
    }
    return batteryStorage.rejectRequest(requestId, reason, currentUser);
  },

  // Notifications
  getNotifications: async (): Promise<AppNotification[]> => {
    if (!currentUser) return [];
    return batteryStorage.getNotifications(currentUser);
  },

  markNotificationRead: async (notifId: string): Promise<void> => {
    batteryStorage.markNotificationRead(notifId);
  },

  markAllNotificationsRead: async (): Promise<void> => {
    if (!currentUser) return;
    batteryStorage.markAllNotificationsRead(currentUser);
  },

  // Compatibility methods for legacy views
  submitDischarge: async (kwh: number, purposeOrEmergency?: string | boolean, ..._rest: any[]): Promise<any> => {
    if (!currentUser) throw new Error('Not authenticated');
    void _rest;
    const isEmerg = typeof purposeOrEmergency === 'boolean' ? purposeOrEmergency : false;
    const priority: RequestPriority = isEmerg ? 'EMERGENCY' : 'NORMAL';
    const reason = typeof purposeOrEmergency === 'string' ? purposeOrEmergency : 'Residential appliances power';
    const req = await batteryStorage.submitRequest(currentUser, kwh, priority, reason);
    return {
      id: req.id,
      status: req.status,
      requestedKwh: req.requestedKwh,
      grantedKwh: req.allocatedKwh ?? 0,
      deniedKwh: 0,
      reasonCode: 'SUCCESS',
      createdAt: req.createdAt,
    };
  },

  listDischarges: async (): Promise<any[]> => {
    if (!currentUser) return [];
    return batteryStorage.getRequestsForUser(currentUser);
  },

  listRejected: async (): Promise<any[]> => {
    if (!currentUser) return [];
    return batteryStorage.getRequestsForUser(currentUser).filter(r => r.status === 'REJECTED');
  },

  submitPrivacyRequest: async (typeOrPayload: any, details?: string): Promise<any> => {
    return {
      id: 'PR-' + Date.now(),
      type: typeof typeOrPayload === 'string' ? typeOrPayload : typeOrPayload?.type,
      details,
      status: 'RECEIVED',
      receivedAt: new Date().toISOString(),
    };
  },
};
