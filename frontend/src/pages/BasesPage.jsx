import React, { useState, useEffect } from 'react';
import { assetService } from '../services/assetService';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { EmptyState } from '../components/EmptyState';
import { Modal } from '../components/Modal';
import { Building2, Plus, MapPin, Loader2 } from 'lucide-react';

export const BasesPage = () => {
  const { role } = useAuth();
  const [bases, setBases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);

  const fetchBases = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await assetService.getBases();
      setBases(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch military bases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBases();
  }, []);

  const handleCreateBase = async (e) => {
    e.preventDefault();
    if (!name || !location) {
      setModalError('Base name and location are required.');
      return;
    }
    setModalError(null);
    setSubmitting(true);
    try {
      await assetService.createBase({ name, location });
      setName('');
      setLocation('');
      setModalOpen(false);
      fetchBases();
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || 'Failed to create base.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-amber-400" /> Military Bases
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Registered military commands, bases, and strategic locations
          </p>
        </div>

        {role === 'ADMIN' && (
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Add Military Base
          </button>
        )}
      </div>

      {loading && <LoadingSpinner text="Fetching military base registry..." />}

      {error && <ErrorMessage message={error} onRetry={fetchBases} />}

      {!loading && !error && bases.length === 0 && (
        <EmptyState title="No military bases found" description="No military base records are currently registered." icon={Building2} />
      )}

      {!loading && !error && bases.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bases.map((base) => (
            <div
              key={base.id}
              className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 hover:border-amber-500/40 transition-colors shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                    BASE ID: #{base.id}
                  </span>
                  <h3 className="text-base font-bold text-slate-100 mt-2">{base.name}</h3>
                </div>
                <div className="p-2.5 bg-slate-800/80 rounded-lg text-slate-400">
                  <Building2 className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center gap-2 text-xs text-slate-400">
                <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="truncate">{base.location || 'Location Not Specified'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Base Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Register New Military Base">
        <form onSubmit={handleCreateBase} className="space-y-4">
          {modalError && (
            <div className="p-3 bg-red-950/50 border border-red-800/60 rounded-lg text-red-300 text-xs">
              {modalError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Base Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Delta Air Base"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100 outline-none focus:border-amber-500/60"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Strategic Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Ladakh Sector"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100 outline-none focus:border-amber-500/60"
              required
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
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Save Base
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
