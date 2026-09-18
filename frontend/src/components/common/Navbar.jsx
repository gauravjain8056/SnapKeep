import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Camera, LayoutDashboard, Clock, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 border-b border-purple-900/40 bg-black/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-700 via-purple-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-purple-700/30 group-hover:scale-105 transition">
                <Sparkles className="w-4.5 h-4.5" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-lg font-black tracking-tight text-white">
                  SnapKeep
                </span>
                <span className="text-[10px] uppercase font-bold text-purple-400 tracking-widest">
                  AI Memory
                </span>
              </div>
            </Link>

            {/* Navigation links */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  isActive('/')
                    ? 'bg-purple-700/20 text-purple-300 border border-purple-600/30'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <Link
                to="/capture"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  isActive('/capture')
                    ? 'bg-purple-700/20 text-purple-300 border border-purple-600/30'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Camera className="w-4 h-4" />
                Capture Memory
              </Link>
              <Link
                to="/retention"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  isActive('/retention')
                    ? 'bg-red-900/20 text-red-400 border border-red-500/30'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Clock className="w-4 h-4" />
                Expiring Items
              </Link>
            </div>
          </div>

          {/* User actions */}
          <div className="flex items-center gap-3">
            <Link
              to="/capture"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-purple-700 hover:bg-purple-600 text-white transition shadow-lg shadow-purple-700/30"
            >
              <Camera className="w-4 h-4" />
              <span>Snap</span>
            </Link>

            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-purple-900/50 text-xs text-zinc-500">
              <span className="truncate max-w-[150px] font-mono">{user?.email}</span>
            </div>

            <button
              onClick={logout}
              title="Log out"
              className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
