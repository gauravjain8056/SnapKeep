import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Camera, LayoutDashboard, Clock, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 border-b border-zinc-800 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">

          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-blue-800 flex items-center justify-center text-white font-bold text-base">
                S
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-base font-bold tracking-tight text-white">
                  SnapKeep
                </span>
              </div>
            </Link>

            {/* Navigation links */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/"
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  isActive('/')
                    ? 'bg-blue-950 text-blue-200 border border-blue-900'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <Link
                to="/capture"
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  isActive('/capture')
                    ? 'bg-blue-950 text-blue-200 border border-blue-900'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Camera className="w-4 h-4" />
                Capture
              </Link>
              <Link
                to="/retention"
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  isActive('/retention')
                    ? 'bg-red-950/60 text-red-400 border border-red-900'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium bg-blue-800 hover:bg-blue-700 text-white transition-colors"
            >
              <Camera className="w-4 h-4" />
              <span>Capture</span>
            </Link>

            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-zinc-800 text-xs text-zinc-400">
              <span className="truncate max-w-[160px] font-mono">{user?.email}</span>
            </div>

            <button
              onClick={logout}
              title="Log out"
              className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-900 rounded transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
