import { useDeferredValue, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  CalendarClock,
  CheckCircle2,
  Clock3,
  LogOut,
  PauseCircle,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import Modal from '../components/common/Modal';
import Dropdown from '../components/common/Dropdown';
import {
  createAlgoAccess,
  deleteAlgoAccess,
  fetchAlgoAccessList,
  toggleAlgoAccessStatus,
  updateAlgoAccess,
} from '../services/algoAccessService';
import { fetchAlgorithms, createAlgorithm } from '../services/algorithmService';
import { useAuthStore } from '../store/useAuthStore';
import type { AlgoAccessRecord, AlgoStatus } from '../types/algoAccess';

/* ── form state ────────────────────────────────────────────── */

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
  oneTimeUse: boolean;
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
  oneTimeUse: false,
  notes: '',
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
  oneTimeUse: record.oneTimeUse ?? false,
  notes: record.notes ?? '',
});

/* ── component ─────────────────────────────────────────────── */

const AlgoAccess = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AlgoStatus>('all');
  const [algoFilter, setAlgoFilter] = useState('all');
  const [isAlgoModalOpen, setIsAlgoModalOpen] = useState(false);
  const [algoModalMode, setAlgoModalMode] = useState<'create' | 'edit'>('create');
  const [selectedAlgo, setSelectedAlgo] = useState<AlgoAccessRecord | null>(null);
  const [algoForm, setAlgoForm] = useState<AlgoFormState>(emptyAlgoForm);
  const [isAddingNewAlgo, setIsAddingNewAlgo] = useState(false);
  const [newAlgoName, setNewAlgoName] = useState('');
  const deferredSearch = useDeferredValue(search);

  const initials = user?.name
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() ?? 'AD';

  /* ── queries / mutations ───────────────────────────────── */

  const dashboardQuery = useQuery({
    queryKey: ['algo-access', deferredSearch, statusFilter, algoFilter],
    queryFn: () =>
      fetchAlgoAccessList({
        search: deferredSearch,
        status: statusFilter,
        algoName: algoFilter,
      }),
  });

  const algorithmsQuery = useQuery({
    queryKey: ['algorithms'],
    queryFn: fetchAlgorithms,
  });

  const invalidateAlgoAccess = () => queryClient.invalidateQueries({ queryKey: ['algo-access'] });
  const invalidateAlgorithms = () => queryClient.invalidateQueries({ queryKey: ['algorithms'] });

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

  const createAlgoMutation = useMutation({
    mutationFn: (name: string) => createAlgorithm(name),
    onSuccess: (response) => {
      toast.success(`Algorithm "${response.data.name}" added.`);
      setIsAddingNewAlgo(false);
      setNewAlgoName('');
      handleAlgoFormChange('algoName', response.data.name);
      invalidateAlgorithms();
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Unable to add algorithm.')),
  });

  /* ── derived state ─────────────────────────────────────── */

  const records = dashboardQuery.data?.data ?? [];
  const summary = dashboardQuery.data?.summary ?? {
    total: 0,
    active: 0,
    inactive: 0,
    expiringSoon: 0,
  };

  const actionPending =
    toggleMutation.isPending ||
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  const modalTitle = algoModalMode === 'create' ? 'Add New Algo' : 'Edit Algo';
  const modalSubtitle =
    algoModalMode === 'create'
      ? 'Fill in the user and plan details below.'
      : 'Update the details for this algo record.';

  const quickSummary = useMemo(
    () => [
      { icon: CalendarClock, label: `${summary.expiringSoon} renewals pending` },
      { icon: CheckCircle2, label: `${summary.active} active licenses` },
      { icon: PauseCircle, label: `${summary.inactive} inactive licenses` },
    ],
    [summary.active, summary.expiringSoon, summary.inactive]
  );

  const statusOptions = [
    { value: 'all', label: 'All status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'expiring-soon', label: 'Expiring soon' },
  ];

  const algoFilterOptions = [
    { value: 'all', label: 'All Algos' },
    ...(algorithmsQuery.data?.data.map((algo) => ({ value: algo.name, label: algo.name })) ?? []),
  ];

  const algoFormOptions =
    algorithmsQuery.data?.data.map((algo) => ({ value: algo.name, label: algo.name })) ?? [];

  /* ── handlers ──────────────────────────────────────────── */

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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

  const handleAlgoFormChange = (field: keyof AlgoFormState, value: string | boolean) => {
    setAlgoForm((current) => ({ ...current, [field]: value }));
  };

  const handleAlgoSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const startDate = new Date(algoForm.startedOn);
    const expiryDate = new Date(algoForm.expiresOn);
    const diffTime = expiryDate.getTime() - startDate.getTime();
    const calculatedDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    const payload = {
      userName: algoForm.userName.trim(),
      email: algoForm.email.trim(),
      accountId: algoForm.accountId.trim(),
      algoName: algoForm.algoName.trim(),
      purchasedPlan: `${calculatedDays} Days`,
      durationDays: calculatedDays,
      startedOn: algoForm.startedOn,
      expiresOn: algoForm.expiresOn,
      status: algoForm.status,
      oneTimeUse: algoForm.oneTimeUse,
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

  /* ── render ────────────────────────────────────────────── */

  return (
    <div className="app-shell">
      <div className="page-shell">
        {/* ── Top Bar ────────────────────────────────────── */}
        <header className="page-topbar">
          <div className="page-topbar-left">
            <div className="brand-mark">
              <ShieldCheck size={22} />
            </div>
            <div>
              <p className="topbar-note">Admin Panel</p>
              <h1 className="page-title">Algo Access</h1>
            </div>
          </div>

          <div className="page-topbar-right">
            <div className="topbar-user-chip">
              <div className="user-avatar small-avatar">{initials}</div>
              <span>{user?.name ?? 'Admin'}</span>
            </div>
            <button type="button" className="ghost-button" onClick={handleLogout}>
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* ── Metric Cards ───────────────────────────────── */}
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

        {/* ── Table Section ──────────────────────────────── */}
        <section className="section-card dashboard-table-card">
          <div className="section-card-header dashboard-table-header">
            <div>
              <p className="section-kicker">Management Table</p>
              <h3 className="section-title">Algo access records</h3>
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

              <Dropdown
                className="table-dropdown"
                options={statusOptions}
                value={statusFilter}
                onChange={(val) => setStatusFilter(val as any)}
              />

              <Dropdown
                className="table-dropdown"
                options={algoFilterOptions}
                value={algoFilter}
                onChange={(val) => setAlgoFilter(val)}
              />

              <button
                type="button"
                className="ghost-button"
                onClick={() => dashboardQuery.refetch()}
                disabled={dashboardQuery.isFetching}
              >
                <RefreshCw size={16} className={dashboardQuery.isFetching ? 'spin-icon' : ''} />
                <span>Refresh</span>
              </button>

              <button
                type="button"
                className="ghost-button ghost-button-strong"
                onClick={openCreateModal}
              >
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
            <div className="empty-state">Loading algo access records...</div>
          ) : dashboardQuery.isError ? (
            <div className="empty-state empty-state-danger">Unable to load data from API.</div>
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
                    <th>Type</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan={9}>
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
                          </td>
                          <td>
                            <div className="table-primary">{record.accountId}</div>
                          </td>
                          <td>{record.purchasedPlan}</td>
                          <td>{record.durationLabel}</td>
                          <td>
                            <div className="table-primary">{record.expiresOn}</div>
                            <div className="table-secondary">Started: {record.startedOn}</div>
                          </td>
                          <td>
                            {record.oneTimeUse ? (
                              <span className="type-badge type-badge-demo">Demo</span>
                            ) : (
                              <span className="type-badge type-badge-full">Full</span>
                            )}
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

        {/* ── Create / Edit Modal ────────────────────────── */}
        <Modal title={modalTitle} subtitle={modalSubtitle} open={isAlgoModalOpen} onClose={() => setIsAlgoModalOpen(false)}>
          <form className="entity-form" onSubmit={handleAlgoSubmit}>
            <div className="form-grid">
              <label className="input-group">
                <span className="input-label-text">User Name</span>
                <input className="field" placeholder="e.g. John Doe" value={algoForm.userName} onChange={(event) => handleAlgoFormChange('userName', event.target.value)} required />
              </label>
              <label className="input-group">
                <span className="input-label-text">Email</span>
                <input className="field" type="email" placeholder="e.g. john@example.com" value={algoForm.email} onChange={(event) => handleAlgoFormChange('email', event.target.value)} required />
              </label>
              <label className="input-group">
                <span className="input-label-text">Account ID</span>
                <input className="field" placeholder="e.g. MT5-800241" value={algoForm.accountId} onChange={(event) => handleAlgoFormChange('accountId', event.target.value)} required />
              </label>
              <div className="input-group">
                <div className="flex-row-between">
                  <span className="input-label-text">Algo Name</span>
                  <button
                    type="button"
                    className="icon-text-button-mini"
                    onClick={() => setIsAddingNewAlgo(!isAddingNewAlgo)}
                  >
                    <Plus size={14} />
                    <span>{isAddingNewAlgo ? 'Select existing' : 'Add New'}</span>
                  </button>
                </div>
                {isAddingNewAlgo ? (
                  <div className="flex-row-gap-2">
                    <input
                      className="field"
                      placeholder="Enter new algo name"
                      value={newAlgoName}
                      onChange={(e) => setNewAlgoName(e.target.value)}
                      autoFocus
                    />
                    <button
                      type="button"
                      className="btn-primary-mini"
                      onClick={() => {
                        if (newAlgoName.trim()) {
                          createAlgoMutation.mutate(newAlgoName.trim());
                        }
                      }}
                      disabled={createAlgoMutation.isPending}
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <Dropdown
                    options={algoFormOptions}
                    value={algoForm.algoName}
                    onChange={(val) => handleAlgoFormChange('algoName', val)}
                    placeholder="Select an algorithm"
                  />
                )}
              </div>
              <label className="input-group">
                <span className="input-label-text">Start Date</span>
                <input className="field" type="date" value={algoForm.startedOn} onChange={(event) => handleAlgoFormChange('startedOn', event.target.value)} required />
              </label>
              <label className="input-group">
                <span className="input-label-text">Expiry Date</span>
                <input className="field" type="date" value={algoForm.expiresOn} onChange={(event) => handleAlgoFormChange('expiresOn', event.target.value)} required />
              </label>
            </div>

            <label className="input-group">
              <span className="input-label-text">Notes (optional)</span>
              <textarea className="field textarea-field" placeholder="Any extra info about this user or plan..." value={algoForm.notes} onChange={(event) => handleAlgoFormChange('notes', event.target.value)} rows={3} />
            </label>

            <div className="toggle-row">
              <label className="toggle-label" htmlFor="oneTimeUse">
                <input
                  id="oneTimeUse"
                  type="checkbox"
                  className="toggle-checkbox"
                  checked={algoForm.oneTimeUse}
                  onChange={(event) => handleAlgoFormChange('oneTimeUse', event.target.checked)}
                />
                <span className="toggle-switch" />
                <span className="toggle-text">
                  Demo only (one-time use)
                  <span className="toggle-hint">Enable this if the user is on a trial or demo license</span>
                </span>
              </label>
            </div>

            <div className="modal-actions">
              <button type="button" className="ghost-button" onClick={() => setIsAlgoModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary modal-submit-button" disabled={createMutation.isPending || updateMutation.isPending}>
                {algoModalMode === 'create' ? 'Add Algo' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default AlgoAccess;
