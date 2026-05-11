export type AlgoStatus = 'active' | 'inactive' | 'expiring-soon';

export type AlgoAccessRecord = {
  id: string;
  userName: string;
  email: string;
  accountId: string;
  algoName: string;
  purchasedPlan: string;
  durationDays: number;
  durationLabel: string;
  startedOn: string;
  expiresOn: string;
  status: AlgoStatus;
  heartbeatStatus: 'online' | 'offline' | 'delayed';
  lastHeartbeatAt: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type AlgoAccessSummary = {
  total: number;
  active: number;
  inactive: number;
  expiringSoon: number;
};

export type AlgoAccessListResponse = {
  success: boolean;
  count: number;
  summary: AlgoAccessSummary;
  data: AlgoAccessRecord[];
};
