import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (err.response?.status === 401
          ? 'Invalid email or password.'
          : 'Failed to connect to authentication server.');
      setError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const fillQuickAccount = (accEmail, accPass) => {
    setEmail(accEmail);
    setPassword(accPass);
    setError(null);
  };

  return (
    <div className="login-screen min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Dynamic Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl p-8 backdrop-blur-md relative z-10">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400 mb-3 shadow-inner">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">INDIAN ARMY</h1>
          <p className="text-xs text-slate-300 mt-1 uppercase tracking-widest">LOGISTICS COMMAND</p>
          <p className="text-xs text-slate-400 mt-3">SECURE ASSET MANAGEMENT PORTAL</p>
          <p className="text-[10px] text-amber-400 mt-2 tracking-[0.2em]">AUTHORIZED PERSONNEL ONLY</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-950/50 border border-red-800/60 rounded-xl flex items-center gap-3 text-red-300 text-sm">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Service Email
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@military.com"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/60 rounded-xl pl-11 pr-4 py-3 text-slate-100 text-sm placeholder:text-slate-600 outline-none transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Security Key / Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/60 rounded-xl pl-11 pr-4 py-3 text-slate-100 text-sm placeholder:text-slate-600 outline-none transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Authenticating...
              </>
            ) : (
              'Sign In to Command Center'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3 text-center">
            Seeded Test Credentials
          </p>
          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={() => fillQuickAccount('admin@military.com', 'Admin@123')}
              className="text-left text-xs bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 p-2.5 rounded-lg flex justify-between items-center transition-colors"
            >
              <span className="font-mono text-slate-300">admin@military.com</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-bold">ADMIN</span>
            </button>
            <button
              type="button"
              onClick={() => fillQuickAccount('commander.alpha@military.com', 'Commander@123')}
              className="text-left text-xs bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 p-2.5 rounded-lg flex justify-between items-center transition-colors"
            >
              <span className="font-mono text-slate-300">commander.alpha@military.com</span>
              <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-bold">COMMANDER</span>
            </button>
            <button
              type="button"
              onClick={() => fillQuickAccount('logistics@military.com', 'Logistics@123')}
              className="text-left text-xs bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 p-2.5 rounded-lg flex justify-between items-center transition-colors"
            >
              <span className="font-mono text-slate-300">logistics@military.com</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">LOGISTICS</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
