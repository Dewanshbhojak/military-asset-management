import React, { useState, useEffect } from 'react';
import { transactionService } from '../services/transactionService';
import { assetService } from '../services/assetService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { EmptyState } from '../components/EmptyState';
import { ShoppingCart, Plus, CheckCircle2, Loader2 } from 'lucide-react';

export const PurchasesPage = () => {
  const [purchases, setPurchases] = useState([]);
  const [bases, setBases] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state
  const [baseId, setBaseId] = useState('');
  const [equipmentId, setEquipmentId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [pRes, bRes, eRes] = await Promise.allSettled([
        transactionService.getPurchases(),
        assetService.getBases(),
        assetService.getEquipment(),
      ]);

      if (pRes.status === 'fulfilled') setPurchases(Array.isArray(pRes.value) ? pRes.value : []);
      if (bRes.status === 'fulfilled') {
        const bList = bRes.value || [];
        setBases(bList);
        if (bList.length > 0 && !baseId) setBaseId(String(bList[0].id));
      }
      if (eRes.status === 'fulfilled') {
        const eList = eRes.value || [];
        setEquipmentList(eList);
        if (eList.length > 0 && !equipmentId) setEquipmentId(String(eList[0].id));
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load purchase records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmitPurchase = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMsg(null);

    const qty = parseInt(quantity, 10);
    if (!baseId || !equipmentId || isNaN(qty) || qty <= 0) {
      setFormError('Please select a base, equipment, and enter a valid quantity greater than 0.');
      return;
    }

    setSubmitting(true);
    try {
      await transactionService.createPurchase({
        baseId: parseInt(baseId, 10),
        equipmentId: parseInt(equipmentId, 10),
        quantity: qty,
      });

      setSuccessMsg(`Purchase of ${qty} unit(s) recorded successfully! PURCHASE_CREATED event published.`);
      setQuantity('');
      loadData();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Failed to submit purchase transaction.');
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
          <ShoppingCart className="w-6 h-6 text-amber-400" /> EQUIPMENT PROCUREMENT
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Record and monitor incoming assets
        </p>
      </div>

      {/* Form Container */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-md">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-amber-400" /> New Equipment Purchase Form
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

        <form onSubmit={handleSubmitPurchase} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
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
              Purchase Quantity
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g. 50"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100 outline-none focus:border-amber-500/60 font-mono"
              required
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 px-4 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                </>
              ) : (
                'Submit Purchase Order'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* History Table */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-200">Purchase Transaction History</h3>

        {loading && <LoadingSpinner text="Fetching purchase history..." />}

        {error && <ErrorMessage message={error} onRetry={loadData} />}

        {!loading && !error && purchases.length === 0 && (
          <EmptyState title="No purchases recorded" description="No purchase transactions found in the history log." icon={ShoppingCart} />
        )}

        {!loading && !error && purchases.length > 0 && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Transaction ID</th>
                    <th className="py-3.5 px-6">Base</th>
                    <th className="py-3.5 px-6">Equipment</th>
                    <th className="py-3.5 px-6 text-right">Quantity</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {purchases.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-6 font-mono text-xs text-slate-400">#{p.id}</td>
                      <td className="py-3.5 px-6 text-slate-200 font-medium">{getBaseName(p.baseId)}</td>
                      <td className="py-3.5 px-6 text-slate-200 font-medium">{getEquipName(p.equipmentId)}</td>
                      <td className="py-3.5 px-6 text-right font-mono font-bold text-emerald-400">
                        +{p.quantity}
                      </td>
                      <td className="py-3.5 px-6">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                          {p.status || 'COMPLETED'}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-xs text-slate-400 font-mono">
                        {p.createdAt ? new Date(p.createdAt).toLocaleString() : 'N/A'}
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
