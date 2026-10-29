import {
  BatteryState,
  ReservePolicy,
  BatteryRequest,
  AuditEntry,
  AppNotification,
  User,
  RequestPriority,
} from '../types';

const STORAGE_KEYS = {
  BATTERY: 'cb_battery_state_v2',
  POLICY: 'cb_reserve_policy_v2',
  REQUESTS: 'cb_requests_v2',
  NOTIFICATIONS: 'cb_notifications_v2',
};

// Default seed data
const DEFAULT_POLICY: ReservePolicy = {
  reserveFloorKwh: 30.0,
  perMemberDailyCapKwh: 50.0,
  absoluteSafetyMarginKwh: 5.0,
  version: 1,
  updatedBy: 'coordinator-1',
  updatedAt: new Date().toISOString(),
};

const DEFAULT_BATTERY: BatteryState = {
  capacityKwh: 100.0,
  availableEnergyKwh: 68.0,
  allocatedEnergyKwh: 12.0,
  reserveFloorKwh: 30.0,
  remainingShareableKwh: 38.0, // 68 - 30
  percentage: 68,
  status: 'Idle',
  lastUpdated: new Date().toISOString(),
  version: 2,
};

const DEFAULT_REQUESTS: BatteryRequest[] = [
  {
    id: 'REQ-1001',
    consumerId: 'subj-member-a',
    consumerUsername: 'member-a',
    consumerName: 'Alice Sharma',
    requestedKwh: 12.0,
    approvedKwh: 12.0,
    allocatedKwh: 12.0,
    priority: 'NORMAL',
    reason: 'Home solar battery top-up for residential appliances',
    status: 'ALLOCATED',
    coordinatorRemarks: 'Approved and allocated in full. Within daily cap.',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    auditTrail: [
      {
        id: 'aud-1001-1',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        action: 'CREATED',
        performedBy: 'Alice Sharma (member-a)',
        role: 'consumer',
        newKwh: 12.0,
        remarks: 'Request submitted',
      },
      {
        id: 'aud-1001-2',
        timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
        action: 'APPROVED',
        performedBy: 'Vikram Rao (coordinator-1)',
        role: 'coordinator',
        previousKwh: 12.0,
        newKwh: 12.0,
        remarks: 'Approved in full',
      },
      {
        id: 'aud-1001-3',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        action: 'ALLOCATED',
        performedBy: 'Vikram Rao (coordinator-1)',
        role: 'coordinator',
        newKwh: 12.0,
        remarks: 'Committed to battery draw ledger. 12.0 kWh deducted from available energy.',
      },
    ],
  },
  {
    id: 'REQ-1002',
    consumerId: 'subj-member-b',
    consumerUsername: 'member-b',
    consumerName: 'Bob Patel',
    requestedKwh: 45.0,
    approvedKwh: null,
    allocatedKwh: null,
    priority: 'NORMAL',
    reason: 'Electric Vehicle overnight fast-charge demand',
    status: 'PENDING_APPROVAL',
    coordinatorRemarks: null,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
    auditTrail: [
      {
        id: 'aud-1002-1',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        action: 'CREATED',
        performedBy: 'Bob Patel (member-b)',
        role: 'consumer',
        newKwh: 45.0,
        remarks: 'Request submitted for coordinator review. Status: Pending Approval.',
      },
    ],
  },
  {
    id: 'REQ-1003',
    consumerId: 'subj-member-b',
    consumerUsername: 'member-b',
    consumerName: 'Bob Patel',
    requestedKwh: 60.0,
    approvedKwh: null,
    allocatedKwh: null,
    priority: 'HIGH',
    reason: 'Commercial HVAC cooling test run',
    status: 'REJECTED',
    coordinatorRemarks: 'Exceeds per-member daily cap of 50.0 kWh and threatens reserve floor.',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 82800000).toISOString(),
    auditTrail: [
      {
        id: 'aud-1003-1',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        action: 'CREATED',
        performedBy: 'Bob Patel (member-b)',
        role: 'consumer',
        newKwh: 60.0,
        remarks: 'Request submitted',
      },
      {
        id: 'aud-1003-2',
        timestamp: new Date(Date.now() - 82800000).toISOString(),
        action: 'REJECTED',
        performedBy: 'Vikram Rao (coordinator-1)',
        role: 'coordinator',
        remarks: 'Rejected: Exceeds member daily quota limit.',
      },
    ],
  },
];

const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    userId: 'subj-member-a',
    title: 'Energy Request Allocated',
    message: 'Your request REQ-1001 for 12.0 kWh has been approved and committed to the battery ledger.',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: true,
    type: 'success',
  },
  {
    id: 'notif-2',
    userId: 'ALL_COORDINATORS',
    title: 'New Request Submitted',
    message: 'Bob Patel (member-b) submitted a new energy request REQ-1002 for 45.0 kWh.',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    read: false,
    type: 'info',
  },
];

class BatteryStorageService {
  private get<T>(key: string, fallback: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage error:', e);
    }
  }

  public init(): void {
    if (!localStorage.getItem(STORAGE_KEYS.POLICY)) {
      this.set(STORAGE_KEYS.POLICY, DEFAULT_POLICY);
    }
    if (!localStorage.getItem(STORAGE_KEYS.BATTERY)) {
      this.set(STORAGE_KEYS.BATTERY, DEFAULT_BATTERY);
    }
    if (!localStorage.getItem(STORAGE_KEYS.REQUESTS)) {
      this.set(STORAGE_KEYS.REQUESTS, DEFAULT_REQUESTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      this.set(STORAGE_KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATIONS);
    }
  }

  public getBatteryState(): BatteryState {
    this.init();
    const battery = this.get<BatteryState>(STORAGE_KEYS.BATTERY, DEFAULT_BATTERY);
    const policy = this.getPolicy();
    // Guarantee consistency
    const available = Math.max(0, Math.min(battery.capacityKwh, battery.availableEnergyKwh));
    const floor = policy.reserveFloorKwh;
    const remainingShareable = Math.max(0, available - floor);
    const percentage = Math.round((available / battery.capacityKwh) * 100);

    return {
      ...battery,
      availableEnergyKwh: available,
      reserveFloorKwh: floor,
      remainingShareableKwh: remainingShareable,
      percentage,
    };
  }

  public getPolicy(): ReservePolicy {
    this.init();
    return this.get<ReservePolicy>(STORAGE_KEYS.POLICY, DEFAULT_POLICY);
  }

  public updatePolicy(floor: number, cap: number, user: User): ReservePolicy {
    const current = this.getPolicy();
    const updated: ReservePolicy = {
      ...current,
      reserveFloorKwh: floor,
      perMemberDailyCapKwh: cap,
      version: current.version + 1,
      updatedBy: user.username,
      updatedAt: new Date().toISOString(),
    };
    this.set(STORAGE_KEYS.POLICY, updated);

    // Sync battery
    const battery = this.getBatteryState();
    this.set(STORAGE_KEYS.BATTERY, {
      ...battery,
      reserveFloorKwh: floor,
      remainingShareableKwh: Math.max(0, battery.availableEnergyKwh - floor),
      lastUpdated: new Date().toISOString(),
    });

    return updated;
  }

  public getAllRequests(): BatteryRequest[] {
    this.init();
    return this.get<BatteryRequest[]>(STORAGE_KEYS.REQUESTS, DEFAULT_REQUESTS);
  }

  public getRequestsForUser(user: User): BatteryRequest[] {
    const all = this.getAllRequests();
    if (user.role === 'coordinator') {
      return all;
    }
    return all.filter((r) => r.consumerId === user.subject || r.consumerUsername === user.username);
  }

  public submitRequest(
    consumer: User,
    requestedKwh: number,
    priority: RequestPriority,
    reason: string
  ): BatteryRequest {
    if (requestedKwh <= 0) {
      throw new Error('Requested energy volume must be greater than 0 kWh.');
    }
    if (requestedKwh > 100) {
      throw new Error('Requested energy volume exceeds the maximum battery capacity (100 kWh).');
    }

    const requests = this.getAllRequests();
    const nextNum = requests.length + 1001;
    const requestId = `REQ-${nextNum}`;

    const newRequest: BatteryRequest = {
      id: requestId,
      consumerId: consumer.subject,
      consumerUsername: consumer.username,
      consumerName: consumer.fullName,
      requestedKwh,
      approvedKwh: null,
      allocatedKwh: null,
      priority,
      reason: reason.trim() || 'General clean energy consumption',
      status: 'PENDING_APPROVAL',
      coordinatorRemarks: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      auditTrail: [
        {
          id: `aud-${requestId}-1`,
          timestamp: new Date().toISOString(),
          action: 'CREATED',
          performedBy: `${consumer.fullName} (${consumer.username})`,
          role: 'consumer',
          newKwh: requestedKwh,
          remarks: `Request submitted for ${requestedKwh.toFixed(1)} kWh. Initial status: Pending Approval. Battery capacity untouched.`,
        },
      ],
    };

    requests.unshift(newRequest);
    this.set(STORAGE_KEYS.REQUESTS, requests);

    // Create notification for coordinator
    this.addNotification({
      userId: 'ALL_COORDINATORS',
      title: 'New Energy Request',
      message: `${consumer.fullName} requested ${requestedKwh.toFixed(1)} kWh (${priority} priority). Pending coordinator review.`,
      type: 'info',
    });

    return newRequest;
  }

  public approveRequest(
    requestId: string,
    approvedKwh: number,
    remarks: string,
    coordinator: User
  ): BatteryRequest {
    const requests = this.getAllRequests();
    const req = requests.find((r) => r.id === requestId);
    if (!req) throw new Error('Request not found');

    if (req.status === 'ALLOCATED') {
      throw new Error('Request is already allocated. Use Deallocate or Modify to change active allocations.');
    }

    const battery = this.getBatteryState();
    if (req.priority !== 'EMERGENCY' && approvedKwh > battery.remainingShareableKwh) {
      throw new Error(
        `Approved amount (${approvedKwh.toFixed(1)} kWh) exceeds available shareable energy (${battery.remainingShareableKwh.toFixed(1)} kWh) above 30.0 kWh reserve floor.`
      );
    }

    const isModified = approvedKwh !== req.requestedKwh;
    req.approvedKwh = approvedKwh;
    req.status = isModified ? 'MODIFIED' : 'APPROVED';
    req.coordinatorRemarks = remarks.trim() || (isModified ? 'Allocation adjusted by coordinator.' : 'Approved as requested.');
    req.updatedAt = new Date().toISOString();

    const audit: AuditEntry = {
      id: `aud-${requestId}-${req.auditTrail.length + 1}`,
      timestamp: new Date().toISOString(),
      action: isModified ? 'MODIFIED' : 'APPROVED',
      performedBy: `${coordinator.fullName} (${coordinator.username})`,
      role: 'coordinator',
      previousKwh: req.requestedKwh,
      newKwh: approvedKwh,
      remarks: req.coordinatorRemarks,
    };
    req.auditTrail.push(audit);

    this.set(STORAGE_KEYS.REQUESTS, requests);

    // Notify consumer
    this.addNotification({
      userId: req.consumerId,
      title: `Request ${req.id} ${isModified ? 'Modified' : 'Approved'}`,
      message: `Your request was approved for ${approvedKwh.toFixed(1)} kWh (Original request: ${req.requestedKwh.toFixed(1)} kWh). Ready for allocation.`,
      type: 'success',
    });

    return req;
  }

  public allocateRequest(requestId: string, coordinator: User): BatteryRequest {
    const requests = this.getAllRequests();
    const req = requests.find((r) => r.id === requestId);
    if (!req) throw new Error('Request not found');

    if (req.status === 'ALLOCATED') {
      throw new Error('Request is already allocated. Cannot double-allocate energy.');
    }

    const approved = req.approvedKwh ?? req.requestedKwh;
    const battery = this.getBatteryState();

    if (req.priority !== 'EMERGENCY') {
      if (approved > battery.remainingShareableKwh) {
        throw new Error(
          `Cannot allocate: Available shareable pool is ${battery.remainingShareableKwh.toFixed(1)} kWh, which is less than requested allocation of ${approved.toFixed(1)} kWh.`
        );
      }
    } else {
      // Emergency check
      if (battery.availableEnergyKwh - approved < 5.0) {
        throw new Error('Cannot allocate: Energy draw cuts below 5.0 kWh absolute safety buffer.');
      }
    }

    // Atomic update
    const newAvailable = Math.max(0, battery.availableEnergyKwh - approved);
    const newAllocated = battery.allocatedEnergyKwh + approved;

    this.set(STORAGE_KEYS.BATTERY, {
      ...battery,
      availableEnergyKwh: newAvailable,
      allocatedEnergyKwh: newAllocated,
      remainingShareableKwh: Math.max(0, newAvailable - battery.reserveFloorKwh),
      percentage: Math.round((newAvailable / battery.capacityKwh) * 100),
      status: 'Discharging',
      lastUpdated: new Date().toISOString(),
      version: battery.version + 1,
    });

    req.allocatedKwh = approved;
    req.approvedKwh = approved;
    req.status = 'ALLOCATED';
    req.updatedAt = new Date().toISOString();

    const audit: AuditEntry = {
      id: `aud-${requestId}-${req.auditTrail.length + 1}`,
      timestamp: new Date().toISOString(),
      action: 'ALLOCATED',
      performedBy: `${coordinator.fullName} (${coordinator.username})`,
      role: 'coordinator',
      newKwh: approved,
      remarks: `Allocation committed to battery. ${approved.toFixed(1)} kWh deducted from available capacity. Battery available is now ${newAvailable.toFixed(1)} kWh.`,
    };
    req.auditTrail.push(audit);

    this.set(STORAGE_KEYS.REQUESTS, requests);

    // Notify consumer
    this.addNotification({
      userId: req.consumerId,
      title: `Energy Allocated: ${req.id}`,
      message: `Your energy allocation of ${approved.toFixed(1)} kWh is now active and committed to your account.`,
      type: 'success',
    });

    return req;
  }

  public deallocateRequest(requestId: string, remarks: string, coordinator: User): BatteryRequest {
    const requests = this.getAllRequests();
    const req = requests.find((r) => r.id === requestId);
    if (!req) throw new Error('Request not found');

    if (req.status !== 'ALLOCATED') {
      throw new Error(`Cannot deallocate: Request status is ${req.status}, not ALLOCATED.`);
    }

    const releaseAmount = req.allocatedKwh || 0;
    if (releaseAmount <= 0) {
      throw new Error('No active energy allocation found on this request to release.');
    }

    const battery = this.getBatteryState();
    const newAvailable = Math.min(battery.capacityKwh, battery.availableEnergyKwh + releaseAmount);
    const newAllocated = Math.max(0, battery.allocatedEnergyKwh - releaseAmount);

    this.set(STORAGE_KEYS.BATTERY, {
      ...battery,
      availableEnergyKwh: newAvailable,
      allocatedEnergyKwh: newAllocated,
      remainingShareableKwh: Math.max(0, newAvailable - battery.reserveFloorKwh),
      percentage: Math.round((newAvailable / battery.capacityKwh) * 100),
      status: 'Idle',
      lastUpdated: new Date().toISOString(),
      version: battery.version + 1,
    });

    req.allocatedKwh = 0;
    req.status = 'DEALLOCATED';
    req.coordinatorRemarks = remarks.trim() || 'Allocation released and returned to community battery capacity.';
    req.updatedAt = new Date().toISOString();

    const audit: AuditEntry = {
      id: `aud-${requestId}-${req.auditTrail.length + 1}`,
      timestamp: new Date().toISOString(),
      action: 'DEALLOCATED',
      performedBy: `${coordinator.fullName} (${coordinator.username})`,
      role: 'coordinator',
      previousKwh: releaseAmount,
      newKwh: 0,
      remarks: `Deallocated: ${releaseAmount.toFixed(1)} kWh returned to available battery capacity. Reason: ${req.coordinatorRemarks}`,
    };
    req.auditTrail.push(audit);

    this.set(STORAGE_KEYS.REQUESTS, requests);

    // Notify consumer
    this.addNotification({
      userId: req.consumerId,
      title: `Allocation Released: ${req.id}`,
      message: `Your allocation of ${releaseAmount.toFixed(1)} kWh has been deallocated and returned to the pool.`,
      type: 'warning',
    });

    return req;
  }

  public rejectRequest(requestId: string, reason: string, coordinator: User): BatteryRequest {
    const requests = this.getAllRequests();
    const req = requests.find((r) => r.id === requestId);
    if (!req) throw new Error('Request not found');

    if (req.status === 'ALLOCATED') {
      // If currently allocated, deallocate first to return energy
      const releaseAmount = req.allocatedKwh || 0;
      const battery = this.getBatteryState();
      const newAvailable = Math.min(battery.capacityKwh, battery.availableEnergyKwh + releaseAmount);
      const newAllocated = Math.max(0, battery.allocatedEnergyKwh - releaseAmount);

      this.set(STORAGE_KEYS.BATTERY, {
        ...battery,
        availableEnergyKwh: newAvailable,
        allocatedEnergyKwh: newAllocated,
        remainingShareableKwh: Math.max(0, newAvailable - battery.reserveFloorKwh),
        percentage: Math.round((newAvailable / battery.capacityKwh) * 100),
        lastUpdated: new Date().toISOString(),
      });
      req.allocatedKwh = 0;
    }

    req.status = 'REJECTED';
    req.coordinatorRemarks = reason.trim() || 'Request rejected by energy coordinator.';
    req.updatedAt = new Date().toISOString();

    const audit: AuditEntry = {
      id: `aud-${requestId}-${req.auditTrail.length + 1}`,
      timestamp: new Date().toISOString(),
      action: 'REJECTED',
      performedBy: `${coordinator.fullName} (${coordinator.username})`,
      role: 'coordinator',
      remarks: req.coordinatorRemarks,
    };
    req.auditTrail.push(audit);

    this.set(STORAGE_KEYS.REQUESTS, requests);

    // Notify consumer
    this.addNotification({
      userId: req.consumerId,
      title: `Request Rejected: ${req.id}`,
      message: `Your energy request for ${req.requestedKwh.toFixed(1)} kWh was rejected. Reason: ${req.coordinatorRemarks}`,
      type: 'alert',
    });

    return req;
  }

  public getNotifications(user: User): AppNotification[] {
    this.init();
    const notifs = this.get<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATIONS);
    if (user.role === 'coordinator') {
      return notifs.filter((n) => n.userId === 'ALL_COORDINATORS' || n.userId === user.subject);
    }
    return notifs.filter((n) => n.userId === user.subject);
  }

  public markNotificationRead(notifId: string): void {
    const notifs = this.get<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATIONS);
    const n = notifs.find((item) => item.id === notifId);
    if (n) {
      n.read = true;
      this.set(STORAGE_KEYS.NOTIFICATIONS, notifs);
    }
  }

  public markAllNotificationsRead(user: User): void {
    const notifs = this.get<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATIONS);
    notifs.forEach((n) => {
      if (user.role === 'coordinator' && (n.userId === 'ALL_COORDINATORS' || n.userId === user.subject)) {
        n.read = true;
      } else if (n.userId === user.subject) {
        n.read = true;
      }
    });
    this.set(STORAGE_KEYS.NOTIFICATIONS, notifs);
  }

  private addNotification(n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>): void {
    const notifs = this.get<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATIONS);
    const newN: AppNotification = {
      ...n,
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    notifs.unshift(newN);
    this.set(STORAGE_KEYS.NOTIFICATIONS, notifs);
  }
}

export const batteryStorage = new BatteryStorageService();
