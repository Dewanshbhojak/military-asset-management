import React, { useState, useEffect } from 'react';
import { transactionService } from '../services/transactionService';
import { assetService } from '../services/assetService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { EmptyState } from '../components/EmptyState';
import { ArrowLeftRight, CheckCircle2, Loader2 } from 'lucide-react';

export const TransfersPage = () => {
  const [transfers, setTransfers] = useState([]);
  const [bases, setBases] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [fromBaseId, setFromBaseId] = useState('');
  const [toBaseId, setToBaseId] = useState('');
  const [equipmentId, setEquipmentId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tRes, bRes, eRes] = await Promise.allSettled([
        transactionService.getTransfers(),
        assetService.getBases(),
        assetService.getEquipment(),
      ]);

      if (tRes.status === 'fulfilled') setTransfers(Array.isArray(tRes.value) ? tRes.value : []);
      if (bRes.status === 'fulfilled') {
        const bList = bRes.value || [];
        setBases(bList);
        if (bList.length >= 2) {
          if (!fromBaseId) setFromBaseId(String(bList[0].id));
          if (!toBaseId) setToBaseId(String(bList[1].id));
        } else if (bList.length === 1) {
          if (!fromBaseId) setFromBaseId(String(bList[0].id));
        }
      }
      if (eRes.status === 'fulfilled') {
        const eList = eRes.value || [];
        setEquipmentList(eList);
        if (eList.length > 0 && !equipmentId) setEquipmentId(String(eList[0].id));
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load transfer records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmitTransfer = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMsg(null);

    const qty = parseInt(quantity, 10);
    const fId = parseInt(fromBaseId, 10);
    const tId = parseInt(toBaseId, 10);

    if (fId === tId) {
      setFormError('Source Base and Destination Base must be different.');
      return;
    }

    if (!fromBaseId || !toBaseId || !equipmentId || isNaN(qty) || qty <= 0) {
      setFormError('Please select valid source/destination bases, equipment, and a quantity > 0.');
      return;
    }

    setSubmitting(true);
    try {
      await transactionService.createTransfer({
        fromBaseId: fId,
        toBaseId: tId,
        equipmentId: parseInt(equipmentId, 10),
        quantity: qty,
      });

      setSuccessMsg(
        `Transfer of ${qty} unit(s) from Base ${fId} to Base ${tId} initiated! TRANSFER_CREATED event published.`
      );
      setQuantity('');
      loadData();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Failed to initiate transfer.');
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
          <ArrowLeftRight className="w-6 h-6 text-amber-400" /> INTER-BASE ASSET TRANSFER
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Move equipment between authorized bases
        </p>
      </div>

      {/* Form Container */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-md">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
          <ArrowLeftRight className="w-4 h-4 text-amber-400" /> Initiate Stock Transfer Form
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

        <form onSubmit={handleSubmitTransfer} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Source Base (From)
              </label>
              <select
                value={fromBaseId}
                onChange={(e) => setFromBaseId(e.target.value)}
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
                Destination Base (To)
              </label>
              <select
                value={toBaseId}
                onChange={(e) => setToBaseId(e.target.value)}
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
                Transfer Quantity
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 20"
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
                  <Loader2 className="w-4 h-4 animate-spin" /> Transferring...
                </>
              ) : (
                'Execute Inter-Base Transfer'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* History Table */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-200">Transfer Transaction History</h3>

        {loading && <LoadingSpinner text="Fetching transfer history..." />}

        {error && <ErrorMessage message={error} onRetry={loadData} />}

        {!loading && !error && transfers.length === 0 && (
          <EmptyState title="No transfers recorded" description="No inter-base transfers found in history." icon={ArrowLeftRight} />
        )}

        {!loading && !error && transfers.length > 0 && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-6">ID</th>
                    <th className="py-3.5 px-6">Source (From)</th>
                    <th className="py-3.5 px-6">Destination (To)</th>
                    <th className="py-3.5 px-6">Equipment</th>
                    <th className="py-3.5 px-6 text-right">Quantity</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {transfers.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-6 font-mono text-xs text-slate-400">#{t.id}</td>
                      <td className="py-3.5 px-6 text-slate-200 font-medium">{getBaseName(t.fromBaseId)}</td>
                      <td className="py-3.5 px-6 text-slate-200 font-medium">{getBaseName(t.toBaseId)}</td>
                      <td className="py-3.5 px-6 text-slate-200 font-medium">{getEquipName(t.equipmentId)}</td>
                      <td className="py-3.5 px-6 text-right font-mono font-bold text-blue-400">
                        {t.quantity}
                      </td>
                      <td className="py-3.5 px-6">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-400 border border-blue-800/60">
                          {t.status || 'COMPLETED'}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-xs text-slate-400 font-mono">
                        {t.createdAt ? new Date(t.createdAt).toLocaleString() : 'N/A'}
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
