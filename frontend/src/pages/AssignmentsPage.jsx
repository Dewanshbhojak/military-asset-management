import React, { useState, useEffect } from 'react';
import { transactionService } from '../services/transactionService';
import { assetService } from '../services/assetService';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { EmptyState } from '../components/EmptyState';
import { UserCheck, CheckCircle2, Loader2, User } from 'lucide-react';

export const AssignmentsPage = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [bases, setBases] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [baseId, setBaseId] = useState('');
  const [equipmentId, setEquipmentId] = useState('');
  const [personnelName, setPersonnelName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [aRes, bRes, eRes] = await Promise.allSettled([
        transactionService.getAssignments(),
        assetService.getBases(),
        assetService.getEquipment(),
      ]);

      if (aRes.status === 'fulfilled') setAssignments(Array.isArray(aRes.value) ? aRes.value : []);
      if (bRes.status === 'fulfilled') {
        const bList = bRes.value || [];
        setBases(bList);
        if (bList.length > 0 && !baseId) {
          setBaseId(user?.baseId ? String(user.baseId) : String(bList[0].id));
        }
      }
      if (eRes.status === 'fulfilled') {
        const eList = eRes.value || [];
        setEquipmentList(eList);
        if (eList.length > 0 && !equipmentId) setEquipmentId(String(eList[0].id));
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load assignment records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMsg(null);

    const qty = parseInt(quantity, 10);
    if (!baseId || !equipmentId || !personnelName.trim() || isNaN(qty) || qty <= 0) {
      setFormError('Please fill all fields: base, equipment, personnel name, and quantity > 0.');
      return;
    }

    setSubmitting(true);
    try {
      await transactionService.createAssignment({
        baseId: parseInt(baseId, 10),
        equipmentId: parseInt(equipmentId, 10),
        personnelName: personnelName.trim(),
        quantity: qty,
      });

      setSuccessMsg(`Assigned ${qty} unit(s) to ${personnelName}! ASSIGNMENT_CREATED event published.`);
      setPersonnelName('');
      setQuantity('');
      loadData();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Failed to create assignment.');
    } finally {
      setSubmitting(false);
    }
  };

  const getBaseName = (bId) => bases.find((b) => String(b.id) === String(bId))?.name || `Base #${bId}`;
  const getEquipName = (eId) => equipmentList.find((e) => String(e.id) === String(eId))?.name || `Equipment #${eId}`;

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <UserCheck className="w-6 h-6 text-amber-400" /> PERSONNEL ASSET ASSIGNMENT
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Track assets assigned to personnel
        </p>
      </div>

      {/* Form Container */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-md">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-amber-400" /> New Equipment Assignment Form
        </h3>

        {formError && (
          <div className="mb-4 p-3 bg-red-950/50 border border-red-800/60 rounded-lg text-red-300 text-xs">
            {formError}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-950/50 border border-emerald-800/60 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmitAssignment} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Target Base
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

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Equipment Item
              </label>
              <select
                value={equipmentId}
                onChange={(e) => setEquipmentId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100 outline-none focus:border-amber-500/60"
              >
                {equipmentList.map((eq) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.name} (ID: #{eq.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Personnel Name / Rank
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={personnelName}
                  onChange={(e) => setPersonnelName(e.target.value)}
                  placeholder="e.g. Capt. Vikram Batra"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-sm text-slate-100 outline-none focus:border-amber-500/60"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Quantity Assigned
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 10"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100 outline-none focus:border-amber-500/60 font-mono"
                required
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 px-6 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Assigning...
                </>
              ) : (
                'Assign Equipment to Officer'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* History Table */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-200">Assignment History Log</h3>

        {loading && <LoadingSpinner text="Fetching assignment records..." />}

        {error && <ErrorMessage message={error} onRetry={loadData} />}

        {!loading && !error && assignments.length === 0 && (
          <EmptyState title="No assignments recorded" description="No personnel assignment records found." icon={UserCheck} />
        )}

        {!loading && !error && assignments.length > 0 && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-6">ID</th>
                    <th className="py-3.5 px-6">Personnel Name</th>
                    <th className="py-3.5 px-6">Base</th>
                    <th className="py-3.5 px-6">Equipment</th>
                    <th className="py-3.5 px-6 text-right">Quantity</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {assignments.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-6 font-mono text-xs text-slate-400">#{a.id}</td>
                      <td className="py-3.5 px-6 text-slate-100 font-bold">{a.personnelName}</td>
                      <td className="py-3.5 px-6 text-slate-200 font-medium">{getBaseName(a.baseId)}</td>
                      <td className="py-3.5 px-6 text-slate-200 font-medium">{getEquipName(a.equipmentId)}</td>
                      <td className="py-3.5 px-6 text-right font-mono font-bold text-purple-400">
                        {a.quantity}
                      </td>
                      <td className="py-3.5 px-6">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-400 border border-purple-800/60">
                          {a.status || 'ASSIGNED'}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-xs text-slate-400 font-mono">
                        {a.createdAt ? new Date(a.createdAt).toLocaleString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
