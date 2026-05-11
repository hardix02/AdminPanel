import { useDeferredValue, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  CalendarClock,
  CheckCircle2,
  Clock3,
  PauseCircle,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import Modal from '../../components/common/Modal';
import {
  createAlgoAccess,
  deleteAlgoAccess,
  extendAlgoAccess,
  fetchAlgoAccessList,
  toggleAlgoAccessStatus,
  updateAlgoAccess,
} from '../../services/algoAccessService';
import type { AlgoAccessRecord, AlgoStatus } from '../../types/algoAccess';

type AlgoFormState = {
  userName: string;
  email: string;
  accountId: string;
  algoName: string;
  purchasedPlan: string;
  durationDays: string;
  startedOn: string;
  expiresOn: string;
  status: AlgoStatus;
  heartbeatStatus: 'online' | 'offline' | 'delayed';
  notes: string;
};

const statusConfig: Record<AlgoStatus, { label: string; className: string; dotClassName: string }> = {
  active: {
    label: 'Active',
    className: 'status-badge status-badge-active',
    dotClassName: 'status-dot status-dot-active',
  },
  inactive: {
    label: 'Inactive',
    className: 'status-badge status-badge-inactive',
    dotClassName: 'status-dot status-dot-inactive',
  },
  'expiring-soon': {
    label: 'Expiring soon',
    className: 'status-badge status-badge-expiring',
    dotClassName: 'status-dot status-dot-expiring',
  },
};

const emptyAlgoForm: AlgoFormState = {
  userName: '',
  email: '',
  accountId: '',
  algoName: '',
  purchasedPlan: '',
  durationDays: '30',
  startedOn: '',
  expiresOn: '',
  status: 'active',
  heartbeatStatus: 'online',
  notes: '',
};

const formatHeartbeat = (value: string) => {
  const heartbeatDate = new Date(value);
  const diffInMinutes = Math.max(Math.round((Date.now() - heartbeatDate.getTime()) / (1000 * 60)), 0);

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;

  const diffInHours = Math.round(diffInMinutes / 60);
  return `${diffInHours}h ago`;
};

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    return (error.response?.data?.message as string | undefined) ?? fallback;
  }

  return fallback;
};

const toFormState = (record: AlgoAccessRecord): AlgoFormState => ({
  userName: record.userName,
  email: record.email,
  accountId: record.accountId,
  algoName: record.algoName,
  purchasedPlan: record.purchasedPlan,
  durationDays: String(record.durationDays),
  startedOn: record.startedOn,
  expiresOn: record.expiresOn,
  status: record.status,
  heartbeatStatus: record.heartbeatStatus,
  notes: record.notes ?? '',
});

const Dashboard = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AlgoStatus>('all');
  const [isAlgoModalOpen, setIsAlgoModalOpen] = useState(false);
  const [algoModalMode, setAlgoModalMode] = useState<'create' | 'edit'>('create');
  const [selectedAlgo, setSelectedAlgo] = useState<AlgoAccessRecord | null>(null);
  const [algoForm, setAlgoForm] = useState<AlgoFormState>(emptyAlgoForm);
  const deferredSearch = useDeferredValue(search);

  const dashboardQuery = useQuery({
    queryKey: ['algo-access', deferredSearch, statusFilter],
    queryFn: () => fetchAlgoAccessList({ search: deferredSearch, status: statusFilter }),
  });

  const invalidateAlgoAccess = () => queryClient.invalidateQueries({ queryKey: ['algo-access'] });

  const createMutation = useMutation({
    mutationFn: createAlgoAccess,
    onSuccess: () => {
      toast.success('Algo access record created.');
      setIsAlgoModalOpen(false);
      setSelectedAlgo(null);
      setAlgoForm(emptyAlgoForm);
      invalidateAlgoAccess();
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Unable to create algo access record.')),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateAlgoAccess>[1] }) =>
      updateAlgoAccess(id, payload),
    onSuccess: () => {
      toast.success('Algo access record updated.');
      setIsAlgoModalOpen(false);
      setSelectedAlgo(null);
      setAlgoForm(emptyAlgoForm);
      invalidateAlgoAccess();
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Unable to update algo access record.')),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAlgoAccess,
    onSuccess: () => {
      toast.success('Algo access record deleted.');
      invalidateAlgoAccess();
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Unable to delete algo access record.')),
  });

  const toggleMutation = useMutation({
    mutationFn: toggleAlgoAccessStatus,
    onSuccess: (response) => {
      toast.success(`${response.data.userName} status updated.`);
      invalidateAlgoAccess();
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Unable to update algo status right now.')),
  });

  const extendMutation = useMutation({
    mutationFn: (id: string) => extendAlgoAccess(id, 30),
    onSuccess: (response) => {
      toast.success(`${response.data.userName} extended by 30 days.`);
      invalidateAlgoAccess();
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Unable to extend access right now.')),
  });

  const records = dashboardQuery.data?.data ?? [];
  const summary = dashboardQuery.data?.summary ?? {
    total: 0,
    active: 0,
    inactive: 0,
    expiringSoon: 0,
  };

  const actionPending =
    toggleMutation.isPending ||
    extendMutation.isPending ||
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  const modalTitle = algoModalMode === 'create' ? 'Add Algo Access' : 'Edit Algo Access';
  const modalSubtitle =
    algoModalMode === 'create'
      ? 'Create a new EX5 access record with runtime and duration details.'
      : 'Update the selected EX5 access record.';

  const quickSummary = useMemo(
    () => [
      { icon: CalendarClock, label: `${summary.expiringSoon} renewals pending` },
      { icon: CheckCircle2, label: `${summary.active} active licenses` },
      { icon: PauseCircle, label: `${summary.inactive} inactive licenses` },
    ],
    [summary.active, summary.expiringSoon, summary.inactive]
  );

  const openCreateModal = () => {
    setAlgoModalMode('create');
    setSelectedAlgo(null);
    setAlgoForm(emptyAlgoForm);
    setIsAlgoModalOpen(true);
  };

  const openEditModal = (record: AlgoAccessRecord) => {
    setAlgoModalMode('edit');
    setSelectedAlgo(record);
    setAlgoForm(toFormState(record));
    setIsAlgoModalOpen(true);
  };

  const handleAlgoFormChange = (field: keyof AlgoFormState, value: string) => {
    setAlgoForm((current) => ({ ...current, [field]: value }));
  };

  const handleAlgoSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = {
      userName: algoForm.userName.trim(),
      email: algoForm.email.trim(),
      accountId: algoForm.accountId.trim(),
      algoName: algoForm.algoName.trim(),
      purchasedPlan: algoForm.purchasedPlan.trim(),
      durationDays: Number(algoForm.durationDays),
      startedOn: algoForm.startedOn,
      expiresOn: algoForm.expiresOn,
      status: algoForm.status,
      heartbeatStatus: algoForm.heartbeatStatus,
      notes: algoForm.notes.trim(),
    };

    if (algoModalMode === 'create') {
      createMutation.mutate(payload);
      return;
    }

    if (selectedAlgo) {
      updateMutation.mutate({ id: selectedAlgo.id, payload });
    }
  };

  const handleDelete = (record: AlgoAccessRecord) => {
    const confirmed = window.confirm(`Delete algo access for ${record.userName}?`);

    if (confirmed) {
      deleteMutation.mutate(record.id);
    }
  };

  return (
    <div className="dashboard-grid">
      <section className="metric-grid">
        <article className="metric-card">
          <div className="metric-card-header">
            <p className="metric-label">Total Users</p>
            <div className="metric-icon">
              <ShieldCheck size={20} />
            </div>
          </div>
          <h4 className="metric-value">{summary.total}</h4>
          <p className="metric-trend">Protected algo accounts</p>
        </article>

        <article className="metric-card">
          <div className="metric-card-header">
            <p className="metric-label">Active</p>
            <div className="metric-icon">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <h4 className="metric-value">{summary.active}</h4>
          <p className="metric-trend">Currently enabled</p>
        </article>

        <article className="metric-card">
          <div className="metric-card-header">
            <p className="metric-label">Expiring Soon</p>
            <div className="metric-icon">
              <Clock3 size={20} />
            </div>
          </div>
          <h4 className="metric-value">{summary.expiringSoon}</h4>
          <p className="metric-trend">Need follow-up</p>
        </article>

        <article className="metric-card">
          <div className="metric-card-header">
            <p className="metric-label">Inactive</p>
            <div className="metric-icon">
              <PauseCircle size={20} />
            </div>
          </div>
          <h4 className="metric-value">{summary.inactive}</h4>
          <p className="metric-trend">Paused or disabled</p>
        </article>
      </section>

      <section className="section-card dashboard-table-card">
        <div className="section-card-header dashboard-table-header">
          <div>
            <p className="section-kicker">Management Table</p>
            <h3 className="section-title">EX5 user access records</h3>
          </div>

          <div className="table-filters">
            <label className="table-search">
              <Search size={16} />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search user, email, account, algo"
              />
            </label>

            <select
              className="table-select"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as 'all' | AlgoStatus)}
            >
              <option value="all">All status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="expiring-soon">Expiring soon</option>
            </select>

            <button type="button" className="ghost-button" onClick={() => dashboardQuery.refetch()} disabled={dashboardQuery.isFetching}>
              <RefreshCw size={16} className={dashboardQuery.isFetching ? 'spin-icon' : ''} />
              <span>Refresh</span>
            </button>

            <button type="button" className="ghost-button ghost-button-strong" onClick={openCreateModal}>
              <Plus size={16} />
              <span>Add Algo</span>
            </button>
          </div>
        </div>

        <div className="dashboard-mini-summary">
          {quickSummary.map(({ icon: Icon, label }) => (
            <div key={label} className="mini-summary-pill">
              <Icon size={16} />
              <span>{label}</span>
            </div>
          ))}
        </div>

        {dashboardQuery.isLoading ? (
          <div className="empty-state">Loading EX5 access records...</div>
        ) : dashboardQuery.isError ? (
          <div className="empty-state empty-state-danger">Unable to load dashboard data from API.</div>
        ) : (
          <div className="operations-table-wrap">
            <table className="operations-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Algo</th>
                  <th>Account</th>
                  <th>Plan</th>
                  <th>Duration</th>
                  <th>Expiry</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <div className="empty-state">No records matched the current filters.</div>
                    </td>
                  </tr>
                ) : (
                  records.map((record) => {
                    const status = statusConfig[record.status];

                    return (
                      <tr key={record.id}>
                        <td>
                          <div className="table-user">
                            <div className="user-avatar small-avatar">
                              {record.userName
                                .split(' ')
                                .map((part) => part[0])
                                .join('')
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>
                            <div>
                              <div className="table-primary">{record.userName}</div>
                              <div className="table-secondary">{record.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="table-primary">{record.algoName}</div>
                          <div className="table-secondary">{record.notes || 'No notes added'}</div>
                        </td>
                        <td>
                          <div className="table-primary">{record.accountId}</div>
                          <div className="table-secondary">Heartbeat: {formatHeartbeat(record.lastHeartbeatAt)}</div>
                        </td>
                        <td>{record.purchasedPlan}</td>
                        <td>{record.durationLabel}</td>
                        <td>
                          <div className="table-primary">{record.expiresOn}</div>
                          <div className="table-secondary">Started: {record.startedOn}</div>
                        </td>
                        <td>
                          <span className={status.className}>
                            <span className={status.dotClassName} />
                            {status.label}
                          </span>
                        </td>
                        <td>
                          <div className="row-actions">
                            <button type="button" className="table-action-button" onClick={() => toggleMutation.mutate(record.id)} disabled={actionPending}>
                              {record.status === 'inactive' ? 'Activate' : 'Deactivate'}
                            </button>
                            <button
                              type="button"
                              className="table-action-button table-action-button-secondary"
                              onClick={() => extendMutation.mutate(record.id)}
                              disabled={actionPending}
                            >
                              Extend 30D
                            </button>
                            <button type="button" className="icon-action-button" onClick={() => openEditModal(record)}>
                              <Pencil size={16} />
                            </button>
                            <button type="button" className="icon-action-button danger" onClick={() => handleDelete(record)}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal title={modalTitle} subtitle={modalSubtitle} open={isAlgoModalOpen} onClose={() => setIsAlgoModalOpen(false)}>
        <form className="entity-form" onSubmit={handleAlgoSubmit}>
          <div className="form-grid">
            <label className="input-group">
              <span className="input-label-text">User name</span>
              <input className="field" value={algoForm.userName} onChange={(event) => handleAlgoFormChange('userName', event.target.value)} required />
            </label>
            <label className="input-group">
              <span className="input-label-text">Email</span>
              <input className="field" type="email" value={algoForm.email} onChange={(event) => handleAlgoFormChange('email', event.target.value)} required />
            </label>
            <label className="input-group">
              <span className="input-label-text">Account ID</span>
              <input className="field" value={algoForm.accountId} onChange={(event) => handleAlgoFormChange('accountId', event.target.value)} required />
            </label>
            <label className="input-group">
              <span className="input-label-text">Algo name</span>
              <input className="field" value={algoForm.algoName} onChange={(event) => handleAlgoFormChange('algoName', event.target.value)} required />
            </label>
            <label className="input-group">
              <span className="input-label-text">Purchased plan</span>
              <input className="field" value={algoForm.purchasedPlan} onChange={(event) => handleAlgoFormChange('purchasedPlan', event.target.value)} required />
            </label>
            <label className="input-group">
              <span className="input-label-text">Duration days</span>
              <input className="field" type="number" min="1" value={algoForm.durationDays} onChange={(event) => handleAlgoFormChange('durationDays', event.target.value)} required />
            </label>
            <label className="input-group">
              <span className="input-label-text">Started on</span>
              <input className="field" type="date" value={algoForm.startedOn} onChange={(event) => handleAlgoFormChange('startedOn', event.target.value)} required />
            </label>
            <label className="input-group">
              <span className="input-label-text">Expires on</span>
              <input className="field" type="date" value={algoForm.expiresOn} onChange={(event) => handleAlgoFormChange('expiresOn', event.target.value)} required />
            </label>
            <label className="input-group">
              <span className="input-label-text">Status</span>
              <select className="field select-field" value={algoForm.status} onChange={(event) => handleAlgoFormChange('status', event.target.value)} required>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="expiring-soon">Expiring soon</option>
              </select>
            </label>
            <label className="input-group">
              <span className="input-label-text">Heartbeat</span>
              <select className="field select-field" value={algoForm.heartbeatStatus} onChange={(event) => handleAlgoFormChange('heartbeatStatus', event.target.value)} required>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="delayed">Delayed</option>
              </select>
            </label>
          </div>

          <label className="input-group">
            <span className="input-label-text">Notes</span>
            <textarea className="field textarea-field" value={algoForm.notes} onChange={(event) => handleAlgoFormChange('notes', event.target.value)} rows={4} />
          </label>

          <div className="modal-actions">
            <button type="button" className="ghost-button" onClick={() => setIsAlgoModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary modal-submit-button" disabled={createMutation.isPending || updateMutation.isPending}>
              {algoModalMode === 'create' ? 'Create Algo Access' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Dashboard;
