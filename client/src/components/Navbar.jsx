import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Shield,
  MapPin,
  BarChart3,
  FilePlus,
  FileText,
  User,
  LogOut,
  Menu,
  X,
  Building,
  AlertOctagon,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export function Navbar() {
  const { user, isResident, isOfficial, isCoordinator, logout, quickLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  async function handleQuickLogin(role) {
    try {
      await quickLogin(role);
      setDemoMenuOpen(false);
      setMobileMenuOpen(false);
      if (role === 'resident') navigate('/my-reports');
      else navigate('/admin');
    } catch (err) {
      alert(`Demo login error: ${err.message}`);
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 flex items-center gap-1">
                Civic<span className="text-emerald-600">Sync</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium block -mt-1 tracking-wider uppercase">
                Public Works Transparency
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive('/') ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Explore Works
            </Link>
            <Link
              to="/insights"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive('/insights') ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Community Insights
            </Link>
            <Link
              to="/reports/new"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive('/reports/new') ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Report Issue
            </Link>
            {user && (
              <Link
                to="/my-reports"
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  isActive('/my-reports') ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                My Reports
              </Link>
            )}

            {isOfficial && (
              <div className="pl-2 ml-2 border-l border-slate-200 flex items-center gap-1">
                <Link
                  to="/admin"
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                    location.pathname.startsWith('/admin')
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
                  }`}
                >
                  <Building className="w-4 h-4" />
                  Official Workspace
                </Link>
              </div>
            )}
          </nav>

          {/* Right Header Actions */}
          <div className="hidden md:flex items-center gap-2">
            {/* Quick Demo Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-50 to-orange-50 text-amber-900 border border-amber-200/80 hover:bg-amber-100 transition-colors shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Demo Logins
              </button>

              {demoMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs">
                  <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Instant Demo Accounts
                  </div>
                  <button
                    onClick={() => handleQuickLogin('resident')}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">Resident</div>
                      <div className="text-[11px] text-slate-500">Priya Ramanathan</div>
                    </div>
                    <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">Citizen</span>
                  </button>
                  <button
                    onClick={() => handleQuickLogin('officer')}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between border-t border-slate-100"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">Department Officer</div>
                      <div className="text-[11px] text-slate-500">GCC Roads Engineer</div>
                    </div>
                    <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">Officer</span>
                  </button>
                  <button
                    onClick={() => handleQuickLogin('coordinator')}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between border-t border-slate-100"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">City Coordinator</div>
                      <div className="text-[11px] text-slate-500">Municipal Administrator</div>
                    </div>
                    <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">Admin</span>
                  </button>
                </div>
              )}
            </div>

            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    {user.displayName}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider">
                    {user.role}
                  </div>
                </div>
                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs font-bold text-slate-700 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-2 rounded-lg transition-colors shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col space-y-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Explore Works
            </Link>
            <Link
              to="/insights"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Community Insights
            </Link>
            <Link
              to="/reports/new"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Report Issue
            </Link>
            {user && (
              <Link
                to="/my-reports"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                My Reports
              </Link>
            )}
            {isOfficial && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100"
              >
                Official Workspace
              </Link>
            )}
          </nav>

          <div className="pt-3 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Instant Demo Logins
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => handleQuickLogin('resident')}
                className="py-1.5 px-2 text-center rounded-lg bg-slate-100 text-[11px] font-semibold text-slate-800"
              >
                Resident
              </button>
              <button
                onClick={() => handleQuickLogin('officer')}
                className="py-1.5 px-2 text-center rounded-lg bg-blue-100 text-[11px] font-semibold text-blue-800"
              >
                Officer
              </button>
              <button
                onClick={() => handleQuickLogin('coordinator')}
                className="py-1.5 px-2 text-center rounded-lg bg-purple-100 text-[11px] font-semibold text-purple-800"
              >
                Coordinator
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            {user ? (
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-900">{user.displayName}</div>
                  <div className="text-xs text-slate-500 uppercase">{user.role}</div>
                </div>
                <button
                  onClick={logout}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 rounded-lg"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-xs font-bold text-slate-700 border border-slate-200 rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-xs font-bold text-white bg-emerald-600 rounded-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
