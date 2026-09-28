import React, { useState, useEffect } from 'react';
import { assetService } from '../services/assetService';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { EmptyState } from '../components/EmptyState';
import { Modal } from '../components/Modal';
import { Boxes, Plus, ShieldAlert, Truck, Flame, Loader2 } from 'lucide-react';

export const EquipmentPage = () => {
  const { role } = useAuth();
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('WEAPON');
  const [unit, setUnit] = useState('UNIT');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);

  const fetchEquipment = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await assetService.getEquipment();
      setEquipmentList(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch equipment catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  const handleCreateEquipment = async (e) => {
    e.preventDefault();
    if (!name) {
      setModalError('Equipment name is required.');
      return;
    }
    setModalError(null);
    setSubmitting(true);
    try {
      await assetService.createEquipment({ name, type, unit, description });
      setName('');
      setType('WEAPON');
      setUnit('UNIT');
      setDescription('');
      setModalOpen(false);
      fetchEquipment();
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || 'Failed to create equipment item.');
    } finally {
      setSubmitting(false);
    }
  };

  const getTypeIcon = (eqType) => {
    switch (eqType) {
      case 'WEAPON':
        return ShieldAlert;
      case 'VEHICLE':
        return Truck;
      case 'AMMUNITION':
        return Flame;
      default:
        return Boxes;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Boxes className="w-6 h-6 text-amber-400" /> Equipment Catalog
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Fictional demonstration catalog for logistics planning and application testing
          </p>
        </div>

        {(role === 'ADMIN' || role === 'LOGISTICS_OFFICER') && (
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Add Catalog Item
          </button>
        )}
      </div>

      {loading && <LoadingSpinner text="Loading equipment catalog..." />}

      {error && <ErrorMessage message={error} onRetry={fetchEquipment} />}

      {!loading && !error && equipmentList.length === 0 && (
        <EmptyState title="No equipment registered" description="Equipment catalog is currently empty." icon={Boxes} />
      )}

      {!loading && !error && equipmentList.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {equipmentList.map((item) => {
            const IconComponent = getTypeIcon(item.type);
            return (
              <div
                key={item.id}
                className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 hover:border-amber-500/40 transition-colors shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                      ID: #{item.id}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      {item.type || 'WEAPON'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mt-3">
                    <div className="p-2.5 bg-slate-800/80 rounded-xl text-amber-400 shrink-0">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-100">{item.name}</h3>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">Unit: {item.unit || 'UNIT'}</p>
                    </div>
                  </div>

                  {item.description && (
                    <p className="text-xs text-slate-400/80 mt-3 pt-3 border-t border-slate-800/60 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Equipment Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Register Equipment Catalog Item">
        <form onSubmit={handleCreateEquipment} className="space-y-4">
          {modalError && (
            <div className="p-3 bg-red-950/50 border border-red-800/60 rounded-lg text-red-300 text-xs">
              {modalError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Equipment Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Assault Rifle"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100 outline-none focus:border-amber-500/60"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Equipment Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100 outline-none focus:border-amber-500/60"
              >
                <option value="WEAPON">WEAPON</option>
                <option value="VEHICLE">VEHICLE</option>
                <option value="AMMUNITION">AMMUNITION</option>
                <option value="COMMUNICATION">COMMUNICATION</option>
                <option value="PROTECTIVE">PROTECTIVE</option>
                <option value="LOGISTICS">LOGISTICS</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Unit of Measure
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. PIECE, ROUNDS, UNIT"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100 outline-none focus:border-amber-500/60"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Demo Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional fictional catalog note"
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100 outline-none focus:border-amber-500/60"
            />
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
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Save Equipment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
