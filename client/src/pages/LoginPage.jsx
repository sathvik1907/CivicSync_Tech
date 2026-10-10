import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export function LoginPage() {
  const { login, quickLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectPath = location.state?.from?.pathname || '/';

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (['officer', 'coordinator'].includes(user.role)) {
        navigate('/admin');
      } else {
        navigate(redirectPath === '/login' ? '/my-reports' : redirectPath);
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  }

  async function handleQuick(role) {
    setError('');
    setLoading(true);
    try {
      const user = await quickLogin(role);
      if (['officer', 'coordinator'].includes(user.role)) {
        navigate('/admin');
      } else {
        navigate('/my-reports');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white mx-auto shadow-md shadow-emerald-500/20">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Sign in to CivicSync
          </h2>
          <p className="text-xs text-slate-500">
            Access your personal civic report dashboard or department administrative queue
          </p>
        </div>

        {/* Quick Demo Login Box */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-4 space-y-2.5 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
            <Sparkles className="w-4 h-4 text-amber-600" />
            Hackathon 1-Click Judging Accounts:
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuick('resident')}
              className="py-2 px-2 text-center rounded-xl bg-white border border-amber-200 text-xs font-semibold text-slate-800 hover:bg-amber-100/50 transition-colors shadow-xs"
            >
              Resident
            </button>
            <button
              type="button"
              onClick={() => handleQuick('officer')}
              className="py-2 px-2 text-center rounded-xl bg-white border border-amber-200 text-xs font-semibold text-blue-800 hover:bg-blue-50 transition-colors shadow-xs"
            >
              Officer (GCC)
            </button>
            <button
              type="button"
              onClick={() => handleQuick('coordinator')}
              className="py-2 px-2 text-center rounded-xl bg-white border border-amber-200 text-xs font-semibold text-purple-800 hover:bg-purple-50 transition-colors shadow-xs"
            >
              Coordinator
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="resident@civicsync.demo"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In to Account'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-emerald-600 hover:text-emerald-700">
              Create resident account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
