import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { assetService } from '../services/assetService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { EmptyState } from '../components/EmptyState';
import { Modal } from '../components/Modal';
import { Users, Plus, Shield, Loader2 } from 'lucide-react';

export const UsersPage = () => {
  const [usersList, setUsersList] = useState([]);
  const [bases, setBases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userRole, setUserRole] = useState('BASE_COMMANDER');
  const [baseId, setBaseId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const [uRes, bRes] = await Promise.allSettled([
        authService.getUsers(),
        assetService.getBases(),
      ]);

      if (uRes.status === 'fulfilled') setUsersList(Array.isArray(uRes.value) ? uRes.value : []);
      if (bRes.status === 'fulfilled') {
        const bList = bRes.value || [];
        setBases(bList);
        if (bList.length > 0 && !baseId) setBaseId(String(bList[0].id));
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch user accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setModalError('Name, email, and password are required.');
      return;
    }
    setModalError(null);
    setSubmitting(true);
    try {
      await authService.createUser({
        name,
        email,
        password,
        role: userRole,
        baseId: userRole === 'BASE_COMMANDER' && baseId ? parseInt(baseId, 10) : null,
      });

      setName('');
      setEmail('');
      setPassword('');
      setUserRole('BASE_COMMANDER');
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || 'Failed to register user.');
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleBadgeStyle = (r) => {
    switch (r) {
      case 'ADMIN':
        return 'bg-amber-950 text-amber-400 border-amber-800/60';
      case 'BASE_COMMANDER':
        return 'bg-blue-950 text-blue-400 border-blue-800/60';
      case 'LOGISTICS_OFFICER':
        return 'bg-emerald-950 text-emerald-400 border-emerald-800/60';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getBaseName = (bId) => {
    if (!bId) return 'N/A (Global Access)';
    return bases.find((b) => String(b.id) === String(bId))?.name || `Base #${bId}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-400" /> User Access Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            System users, role-based security assignments, and base scoping
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Register New User
        </button>
      </div>

      {loading && <LoadingSpinner text="Fetching registered user accounts..." />}

      {error && <ErrorMessage message={error} onRetry={fetchUsers} />}

      {!loading && !error && usersList.length === 0 && (
        <EmptyState title="No users found" description="No user account records exist." icon={Users} />
      )}

      {!loading && !error && usersList.length > 0 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-6">User ID</th>
                  <th className="py-3.5 px-6">Officer Name</th>
                  <th className="py-3.5 px-6">Email Address</th>
                  <th className="py-3.5 px-6">Role</th>
                  <th className="py-3.5 px-6">Assigned Base</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-6 font-mono text-xs text-slate-400">#{u.id}</td>
                    <td className="py-3.5 px-6 text-slate-100 font-bold">{u.name || 'N/A'}</td>
                    <td className="py-3.5 px-6 font-mono text-xs text-slate-300">{u.email}</td>
                    <td className="py-3.5 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold border ${getRoleBadgeStyle(u.role)}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-xs text-slate-300">{getBaseName(u.baseId)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Register New System User">
        <form onSubmit={handleCreateUser} className="space-y-4">
          {modalError && (
            <div className="p-3 bg-red-950/50 border border-red-800/60 rounded-lg text-red-300 text-xs">
              {modalError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Officer Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Major Rajesh Kumar"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100 outline-none focus:border-amber-500/60"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Service Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="officer@military.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100 outline-none focus:border-amber-500/60"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100 outline-none focus:border-amber-500/60"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Assign Role
              </label>
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100 outline-none focus:border-amber-500/60"
              >
                <option value="ADMIN">ADMIN</option>
                <option value="BASE_COMMANDER">BASE_COMMANDER</option>
                <option value="LOGISTICS_OFFICER">LOGISTICS_OFFICER</option>
              </select>
            </div>

            {userRole === 'BASE_COMMANDER' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Assigned Base
                </label>
                <select
                  value={baseId}
                  onChange={(e) => setBaseId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100 outline-none focus:border-amber-500/60"
                >
                  {bases.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} (ID: #{b.id})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-2"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Save User
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
