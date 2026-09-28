import React, { useState, useEffect } from 'react';
import { assetService } from '../services/assetService';
import { transactionService } from '../services/transactionService';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/StatCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { Modal } from '../components/Modal';
import {
  Boxes,
  ShoppingCart,
  ArrowLeftRight,
  UserCheck,
  Flame,
  Filter,
  TrendingUp,
  Activity,
} from 'lucide-react';

export const DashboardPage = () => {
  const { user, role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Raw data
  const [bases, setBases] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [inventoryList, setInventoryList] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [expenditures, setExpenditures] = useState([]);

  // Filters
  const [selectedBase, setSelectedBase] = useState(user?.baseId ? String(user.baseId) : 'ALL');
  const [selectedEquipment, setSelectedEquipment] = useState('ALL');

  // Net Movement Modal State
  const [movementModalOpen, setMovementModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [basesRes, equipRes, purchasesRes, transfersRes, assignRes, expendRes] = await Promise.allSettled([
        assetService.getBases(),
        assetService.getEquipment(),
        transactionService.getPurchases(),
        transactionService.getTransfers(),
        transactionService.getAssignments(),
        transactionService.getExpenditures(),
      ]);

      if (basesRes.status === 'fulfilled') setBases(basesRes.value || []);
      if (equipRes.status === 'fulfilled') setEquipmentList(equipRes.value || []);
      if (purchasesRes.status === 'fulfilled') setPurchases(purchasesRes.value || []);
      if (transfersRes.status === 'fulfilled') setTransfers(transfersRes.value || []);
      if (assignRes.status === 'fulfilled') setAssignments(assignRes.value || []);
      if (expendRes.status === 'fulfilled') setExpenditures(expendRes.value || []);

      // Fetch Inventory
      try {
        const targetBase = role === 'BASE_COMMANDER' ? user?.baseId : (selectedBase !== 'ALL' ? selectedBase : null);
        const inv = await assetService.getInventory(targetBase);
        setInventoryList(Array.isArray(inv) ? inv : []);
      } catch (invErr) {
        console.warn('Inventory fetch warning:', invErr);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedBase]);

  // Filter helper functions
  const filterByEquip = (items) => {
    if (selectedEquipment === 'ALL') return items;
    return items.filter(
      (item) => String(item.equipmentId || item.equipment?.id) === String(selectedEquipment)
    );
  };

  const filterByBase = (items, baseField = 'baseId') => {
    if (selectedBase === 'ALL') return items;
    return items.filter((item) => String(item[baseField] || item.base?.id) === String(selectedBase));
  };

  // Calculations
  const filteredPurchases = filterByEquip(filterByBase(purchases, 'baseId'));
  const filteredAssignments = filterByEquip(filterByBase(assignments, 'baseId'));
  const filteredExpenditures = filterByEquip(filterByBase(expenditures, 'baseId'));

  // Transfers In / Out
  const transfersIn = filterByEquip(
    selectedBase === 'ALL'
      ? transfers
      : transfers.filter((t) => String(t.toBaseId) === String(selectedBase))
  );

  const transfersOut = filterByEquip(
    selectedBase === 'ALL'
      ? []
      : transfers.filter((t) => String(t.fromBaseId) === String(selectedBase))
  );

  const nationalTransfersOut = selectedBase === 'ALL' ? filterByEquip(transfers) : transfersOut;

  const totalPurchasesQty = filteredPurchases.reduce((acc, p) => acc + (p.quantity || 0), 0);
  const totalTransfersInQty = transfersIn.reduce((acc, t) => acc + (t.quantity || 0), 0);
  const totalTransfersOutQty = nationalTransfersOut.reduce((acc, t) => acc + (t.quantity || 0), 0);
  const totalAssignedQty = filteredAssignments.reduce((acc, a) => acc + (a.quantity || 0), 0);
  const totalExpendedQty = filteredExpenditures.reduce((acc, e) => acc + (e.quantity || 0), 0);

  // Net Movement = Purchases + Transfers In - Transfers Out
  const netMovementQty = totalPurchasesQty + totalTransfersInQty - totalTransfersOutQty;

  // Current Closing Balance (Current Stock)
  const filteredInventory = filterByEquip(
    selectedBase === 'ALL'
      ? inventoryList
      : inventoryList.filter((inv) => String(inv.baseId || inv.base?.id) === String(selectedBase))
  );
  const closingBalanceQty = filteredInventory.reduce((acc, inv) => acc + (inv.quantity || 0), 0);

  if (loading) return <LoadingSpinner text="Loading command dashboard metrics..." />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Activity className="w-6 h-6 text-amber-400" /> LOGISTICS COMMAND CENTER
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            National Asset Management System · <span className="text-emerald-400">● OPERATIONAL</span>
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 px-2">
            <Filter className="w-3.5 h-3.5 text-amber-400" /> Filters:
          </div>

          {/* Base Filter (Disabled if BASE_COMMANDER) */}
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

          {/* Equipment Filter */}
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
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchData} />}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Total Bases" value={bases.length.toLocaleString()} subtitle="Demo logistics network" icon={Activity} color="green" />
        <StatCard title="Total Equipment" value={equipmentList.length.toLocaleString()} subtitle="Catalog items" icon={Boxes} color="blue" />
        <StatCard title="Total Inventory" value={closingBalanceQty.toLocaleString()} subtitle="Available stock units" icon={Boxes} color="amber" />
        <StatCard
          title="Net Movement"
          value={(netMovementQty >= 0 ? `+${netMovementQty}` : netMovementQty).toLocaleString()}
          subtitle="Purchases + In - Out"
          icon={TrendingUp}
          color={netMovementQty >= 0 ? 'green' : 'red'}
          isClickable={true}
          onClick={() => setMovementModalOpen(true)}
        />
        <StatCard
          title="Closing Balance"
          value={closingBalanceQty.toLocaleString()}
          subtitle="Current available stock"
          icon={Boxes}
          color="amber"
        />
        <StatCard
          title="Assigned"
          value={totalAssignedQty.toLocaleString()}
          subtitle="Assigned assets"
          icon={UserCheck}
          color="purple"
        />
        <StatCard
          title="Expended"
          value={totalExpendedQty.toLocaleString()}
          subtitle="Expended assets"
          icon={Flame}
          color="red"
        />
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100">BASE DEPLOYMENT OVERVIEW</h2>
          <p className="text-xs text-slate-400">Fictional demonstration logistics locations</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {bases.map((base, index) => (
            <article key={base.id} className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
              <p className="text-[10px] uppercase tracking-widest text-amber-400">DEMO BASE {String(index + 1).padStart(2, '0')}</p>
              <h3 className="mt-2 text-sm font-semibold text-slate-100">{base.name}</h3>
              <p className="mt-1 text-xs text-slate-400">{base.location}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Activity Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Purchases */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-emerald-400" /> Recent Purchases
            </h3>
            <span className="text-xs text-slate-400">{filteredPurchases.length} total</span>
          </div>
          {filteredPurchases.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No purchases recorded.</p>
          ) : (
            <div className="divide-y divide-slate-800/60 text-xs">
              {filteredPurchases.slice(0, 5).map((p) => (
                <div key={p.id} className="py-2.5 flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-slate-200">Base {p.baseId}</span>
                    <span className="text-slate-400 ml-2">• Equipment {p.equipmentId}</span>
                  </div>
                  <span className="font-mono text-emerald-400 font-bold">+{p.quantity} units</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Transfers */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4 text-blue-400" /> Recent Inter-Base Transfers
            </h3>
            <span className="text-xs text-slate-400">{transfers.length} total</span>
          </div>
          {transfers.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No inter-base transfers recorded.</p>
          ) : (
            <div className="divide-y divide-slate-800/60 text-xs">
              {transfers.slice(0, 5).map((t) => (
                <div key={t.id} className="py-2.5 flex justify-between items-center">
                  <div>
                    <span className="text-slate-300 font-medium">Base {t.fromBaseId} → Base {t.toBaseId}</span>
                    <span className="text-slate-500 ml-2">• Equip {t.equipmentId}</span>
                  </div>
                  <span className="font-mono text-blue-400 font-bold">{t.quantity} units</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Net Movement Detail Modal */}
      <Modal
        isOpen={movementModalOpen}
        onClose={() => setMovementModalOpen(false)}
        title="Net Movement Breakdown Details"
      >
        <div className="space-y-6 text-sm">
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center font-mono">
            <span className="text-slate-400 text-xs">Net Calculation</span>
            <span className="font-bold text-amber-400">
              Purchases ({totalPurchasesQty}) + In ({totalTransfersInQty}) - Out ({totalTransfersOutQty}) = {netMovementQty}
            </span>
          </div>

          <div>
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
              Purchases ({filteredPurchases.length})
            </h4>
            {filteredPurchases.length === 0 ? (
              <p className="text-xs text-slate-500">None</p>
            ) : (
              <ul className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {filteredPurchases.map((p) => (
                  <li key={p.id} className="text-xs bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                    <span>Base #{p.baseId} — Equipment #{p.equipmentId}</span>
                    <span className="font-mono text-emerald-400 font-semibold">+{p.quantity}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">
              Transfers In ({transfersIn.length})
            </h4>
            {transfersIn.length === 0 ? (
              <p className="text-xs text-slate-500">None</p>
            ) : (
              <ul className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {transfersIn.map((t) => (
                  <li key={t.id} className="text-xs bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                    <span>From Base #{t.fromBaseId} → Equip #{t.equipmentId}</span>
                    <span className="font-mono text-blue-400 font-semibold">+{t.quantity}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">
              Transfers Out ({transfersOut.length})
            </h4>
            {transfersOut.length === 0 ? (
              <p className="text-xs text-slate-500">None</p>
            ) : (
              <ul className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {transfersOut.map((t) => (
                  <li key={t.id} className="text-xs bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                    <span>To Base #{t.toBaseId} — Equip #{t.equipmentId}</span>
                    <span className="font-mono text-red-400 font-semibold">-{t.quantity}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};
