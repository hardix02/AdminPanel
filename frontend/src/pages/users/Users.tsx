import { useDeferredValue, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Crown, Pencil, Plus, RefreshCw, Search, Shield, Trash2, UserCog, Users2 } from 'lucide-react';
import Modal from '../../components/common/Modal';
import { createUser, deleteUser, fetchUsers, updateUser } from '../../services/userService';
import type { UserRecord, UserRole } from '../../types/user';

type UserFormState = {
  name: string;
  email: string;
  role: UserRole;
  password: string;
};

const emptyUserForm: UserFormState = {
  name: '',
  email: '',
  role: 'user',
  password: '',
};

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    return (error.response?.data?.message as string | undefined) ?? fallback;
  }

  return fallback;
};

const Users = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userModalMode, setUserModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [userForm, setUserForm] = useState<UserFormState>(emptyUserForm);
  const deferredSearch = useDeferredValue(search);

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  const invalidateUsers = () => queryClient.invalidateQueries({ queryKey: ['users'] });

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      toast.success('User created successfully.');
      setIsUserModalOpen(false);
      setSelectedUser(null);
      setUserForm(emptyUserForm);
      invalidateUsers();
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Unable to create user.')),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateUser>[1] }) => updateUser(id, payload),
    onSuccess: () => {
      toast.success('User updated successfully.');
      setIsUserModalOpen(false);
      setSelectedUser(null);
      setUserForm(emptyUserForm);
      invalidateUsers();
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Unable to update user.')),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      toast.success('User deleted successfully.');
      invalidateUsers();
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Unable to delete user.')),
  });

  const allUsers = usersQuery.data?.data ?? [];
  const filteredUsers = useMemo(() => {
    return allUsers.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(deferredSearch.toLowerCase()) ||
        user.email.toLowerCase().includes(deferredSearch.toLowerCase());
      const matchesRole = roleFilter === 'all' ? true : user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [allUsers, deferredSearch, roleFilter]);

  const summary = useMemo(
    () => ({
      total: allUsers.length,
      admins: allUsers.filter((user) => user.role === 'admin').length,
      superadmins: allUsers.filter((user) => user.role === 'superadmin').length,
      normalUsers: allUsers.filter((user) => user.role === 'user').length,
    }),
    [allUsers]
  );

  const pendingAction = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const openCreateModal = () => {
    setUserModalMode('create');
    setSelectedUser(null);
    setUserForm(emptyUserForm);
    setIsUserModalOpen(true);
  };

  const openEditModal = (user: UserRecord) => {
    setUserModalMode('edit');
    setSelectedUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      role: user.role,
      password: '',
    });
    setIsUserModalOpen(true);
  };

  const handleFormChange = (field: keyof UserFormState, value: string) => {
    setUserForm((current) => ({ ...current, [field]: value }));
  };

  const handleUserSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = {
      name: userForm.name.trim(),
      email: userForm.email.trim(),
      role: userForm.role,
      ...(userForm.password ? { password: userForm.password } : {}),
    };

    if (userModalMode === 'create') {
      createMutation.mutate(payload);
      return;
    }

    const userId = selectedUser?.id ?? selectedUser?._id;
    if (userId) {
      updateMutation.mutate({ id: userId, payload });
    }
  };

  const handleDelete = (user: UserRecord) => {
    const userId = user.id ?? user._id;
    if (!userId) return;

    const confirmed = window.confirm(`Delete user ${user.name}?`);
    if (confirmed) {
      deleteMutation.mutate(userId);
    }
  };

  const modalTitle = userModalMode === 'create' ? 'Create User' : 'Edit User';
  const modalSubtitle =
    userModalMode === 'create'
      ? 'Add a new user for dashboard access and admin operations.'
      : 'Update user identity, email, role, or password.';

  return (
    <div className="dashboard-grid">
      <section className="metric-grid">
        <article className="metric-card">
          <div className="metric-card-header">
            <p className="metric-label">Total Users</p>
            <div className="metric-icon">
              <Users2 size={20} />
            </div>
          </div>
          <h4 className="metric-value">{summary.total}</h4>
          <p className="metric-trend">All application users</p>
        </article>

        <article className="metric-card">
          <div className="metric-card-header">
            <p className="metric-label">Admins</p>
            <div className="metric-icon">
              <Shield size={20} />
            </div>
          </div>
          <h4 className="metric-value">{summary.admins}</h4>
          <p className="metric-trend">Operational admins</p>
        </article>

        <article className="metric-card">
          <div className="metric-card-header">
            <p className="metric-label">Superadmins</p>
            <div className="metric-icon">
              <Crown size={20} />
            </div>
          </div>
          <h4 className="metric-value">{summary.superadmins}</h4>
          <p className="metric-trend">Highest privilege users</p>
        </article>

        <article className="metric-card">
          <div className="metric-card-header">
            <p className="metric-label">Standard Users</p>
            <div className="metric-icon">
              <UserCog size={20} />
            </div>
          </div>
          <h4 className="metric-value">{summary.normalUsers}</h4>
          <p className="metric-trend">Non-admin users</p>
        </article>
      </section>

      <section className="section-card dashboard-table-card">
        <div className="section-card-header dashboard-table-header">
          <div>
            <p className="section-kicker">User Management</p>
            <h3 className="section-title">Application users and roles</h3>
          </div>

          <div className="table-filters">
            <label className="table-search">
              <Search size={16} />
              <input type="text" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search user name or email" />
            </label>

            <select className="table-select" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value as 'all' | UserRole)}>
              <option value="all">All roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Superadmin</option>
            </select>

            <button type="button" className="ghost-button" onClick={() => usersQuery.refetch()} disabled={usersQuery.isFetching}>
              <RefreshCw size={16} className={usersQuery.isFetching ? 'spin-icon' : ''} />
              <span>Refresh</span>
            </button>

            <button type="button" className="ghost-button ghost-button-strong" onClick={openCreateModal}>
              <Plus size={16} />
              <span>Add User</span>
            </button>
          </div>
        </div>

        {usersQuery.isLoading ? (
          <div className="empty-state">Loading users...</div>
        ) : usersQuery.isError ? (
          <div className="empty-state empty-state-danger">Unable to load users from API.</div>
        ) : (
          <div className="operations-table-wrap">
            <table className="operations-table users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="empty-state">No users matched the current filters.</div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const userId = user.id ?? user._id ?? user.email;
                    return (
                      <tr key={userId}>
                        <td>
                          <div className="table-user">
                            <div className="user-avatar small-avatar">
                              {user.name
                                .split(' ')
                                .map((part) => part[0])
                                .join('')
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>
                            <div className="table-primary">{user.name}</div>
                          </div>
                        </td>
                        <td>{user.email}</td>
                        <td>
                          <span className="user-role-pill">{user.role}</span>
                        </td>
                        <td>{user.createdAt ? new Date(user.createdAt).toISOString().slice(0, 10) : 'N/A'}</td>
                        <td>
                          <div className="row-actions">
                            <button type="button" className="icon-action-button" onClick={() => openEditModal(user)}>
                              <Pencil size={16} />
                            </button>
                            <button type="button" className="icon-action-button danger" onClick={() => handleDelete(user)} disabled={pendingAction}>
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

      <Modal title={modalTitle} subtitle={modalSubtitle} open={isUserModalOpen} onClose={() => setIsUserModalOpen(false)}>
        <form className="entity-form" onSubmit={handleUserSubmit}>
          <div className="form-grid">
            <label className="input-group">
              <span className="input-label-text">Name</span>
              <input className="field" value={userForm.name} onChange={(event) => handleFormChange('name', event.target.value)} required />
            </label>
            <label className="input-group">
              <span className="input-label-text">Email</span>
              <input className="field" type="email" value={userForm.email} onChange={(event) => handleFormChange('email', event.target.value)} required />
            </label>
            <label className="input-group">
              <span className="input-label-text">Role</span>
              <select className="field select-field" value={userForm.role} onChange={(event) => handleFormChange('role', event.target.value)} required>
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="superadmin">Superadmin</option>
              </select>
            </label>
            <label className="input-group">
              <span className="input-label-text">{userModalMode === 'create' ? 'Password' : 'New password'}</span>
              <input
                className="field"
                type="password"
                value={userForm.password}
                onChange={(event) => handleFormChange('password', event.target.value)}
                required={userModalMode === 'create'}
                placeholder={userModalMode === 'edit' ? 'Leave blank to keep current password' : 'Minimum 6 characters'}
              />
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="ghost-button" onClick={() => setIsUserModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary modal-submit-button" disabled={createMutation.isPending || updateMutation.isPending}>
              {userModalMode === 'create' ? 'Create User' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Users;
