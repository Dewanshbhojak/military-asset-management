import React, { useState, useEffect } from 'react';
import { assetService } from '../services/assetService';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { EmptyState } from '../components/EmptyState';
import { Shield, Filter, RefreshCw, Layers } from 'lucide-react';

export const InventoryPage = () => {
  const { user, role } = useAuth();
  const [inventoryList, setInventoryList] = useState([]);
  const [bases, setBases] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [selectedBase, setSelectedBase] = useState(
    role === 'BASE_COMMANDER' && user?.baseId ? String(user.baseId) : 'ALL'
  );
  const [selectedEquipment, setSelectedEquipment] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const fetchInventoryData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [basesRes, equipRes] = await Promise.allSettled([
        assetService.getBases(),
        assetService.getEquipment(),
      ]);

      if (basesRes.status === 'fulfilled') setBases(basesRes.value || []);
      if (equipRes.status === 'fulfilled') setEquipmentList(equipRes.value || []);

      const targetBase = role === 'BASE_COMMANDER' ? user?.baseId : (selectedBase !== 'ALL' ? selectedBase : null);
      const data = await assetService.getInventory(targetBase);
      setInventoryList(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch inventory stock records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, [selectedBase]);

  // Client filtering
  const filteredItems = inventoryList.filter((item) => {
    const itemBaseId = item.baseId || item.base?.id;
    const itemEquipId = item.equipmentId || item.equipment?.id;

    if (selectedBase !== 'ALL' && String(itemBaseId) !== String(selectedBase)) {
      return false;
    }
    if (selectedEquipment !== 'ALL' && String(itemEquipId) !== String(selectedEquipment)) {
      return false;
    }
    const equipment = equipmentList.find((entry) => String(entry.id) === String(itemEquipId));
    const status = Number(item.quantity || 0) === 0 ? 'CRITICAL' : Number(item.quantity || 0) < 20 ? 'LOW STOCK' : 'ADEQUATE';
    if (selectedType !== 'ALL' && equipment?.type !== selectedType) return false;
    if (selectedStatus !== 'ALL' && status !== selectedStatus) return false;
    return true;
  });

  const getBaseName = (baseId) => {
    const b = bases.find((x) => String(x.id) === String(baseId));
    return b ? b.name : `Base #${baseId}`;
  };

  const getEquipmentName = (equipId) => {
    const e = equipmentList.find((x) => String(x.id) === String(equipId));
    return e ? e.name : `Equipment #${equipId}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Shield className="w-6 h-6 text-amber-400" /> INVENTORY CONTROL
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Fictional demo stock · current balances by base and catalog item
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 px-2">
            <Filter className="w-3.5 h-3.5 text-amber-400" /> Filter:
          </div>

          {role !== 'BASE_COMMANDER' && (
            <select
              value={selectedBase}
              onChange={(e) => setSelectedBase(e.target.value)}
              className="bg-slate-950 text-slate-200 border border-slate-800 text-xs rounded-lg px-3 py-1.5 outline-none focus:border-amber-500/50"
            >
              <option value="ALL">All Bases</option>
              {bases.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          )}

          <select
            value={selectedEquipment}
            onChange={(e) => setSelectedEquipment(e.target.value)}
            className="bg-slate-950 text-slate-200 border border-slate-800 text-xs rounded-lg px-3 py-1.5 outline-none focus:border-amber-500/50"
          >
            <option value="ALL">All Equipment</option>
            {equipmentList.map((eq) => (
              <option key={eq.id} value={eq.id}>
                {eq.name}
              </option>
            ))}
          </select>

          <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="bg-slate-950 text-slate-200 border border-slate-800 text-xs rounded-lg px-3 py-1.5 outline-none">
            <option value="ALL">All Equipment Types</option>
            {[...new Set(equipmentList.map((item) => item.type))].filter(Boolean).map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
          <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="bg-slate-950 text-slate-200 border border-slate-800 text-xs rounded-lg px-3 py-1.5 outline-none">
            <option value="ALL">All Stock Status</option><option value="ADEQUATE">Adequate</option><option value="LOW STOCK">Low stock</option><option value="CRITICAL">Critical</option>
          </select>

          <button
            onClick={fetchInventoryData}
            title="Refresh Stock"
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading && <LoadingSpinner text="Fetching real-time inventory records..." />}

      {error && <ErrorMessage message={error} onRetry={fetchInventoryData} />}

      {!loading && !error && filteredItems.length === 0 && (
        <EmptyState title="No inventory stock found" description="There are no inventory records for the selected filters." icon={Layers} />
      )}

      {!loading && !error && filteredItems.length > 0 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Base</th>
                  <th className="py-3.5 px-6">Equipment</th><th className="py-3.5 px-6">Type</th>
                  <th className="py-3.5 px-6 text-right">Quantity</th><th className="py-3.5 px-6">Unit</th>
                  <th className="py-3.5 px-6">Status</th><th className="py-3.5 px-6">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {filteredItems.map((inv) => {
                  const qty = inv.quantity || 0;
                  const isZero = qty === 0;
                  const isLow = qty > 0 && qty < 20;
                  const equipment = equipmentList.find((entry) => String(entry.id) === String(inv.equipmentId || inv.equipment?.id));

                  return (
                    <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-6 font-medium text-slate-200">
                        {getBaseName(inv.baseId || inv.base?.id)}
                      </td>
                      <td className="py-3.5 px-6 font-medium text-slate-200">
                        {getEquipmentName(inv.equipmentId || inv.equipment?.id)}
                      </td>
                      <td className="py-3.5 px-6">{equipment?.type || '—'}</td>
                      <td className="py-3.5 px-6 text-right font-mono font-bold text-base text-slate-100">
                        {qty.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-6">{equipment?.unit || 'UNIT'}</td>
                      <td className="py-3.5 px-6">
                        {isZero ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-400 border border-red-800/60">
                            CRITICAL
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800/60">
                            LOW STOCK
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                            ADEQUATE
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-xs text-slate-400">{inv.updatedAt ? new Date(inv.updatedAt).toLocaleString() : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
