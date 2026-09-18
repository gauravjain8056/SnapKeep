import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, Globe, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      await register(email, password, timezone);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    'w-full pl-10 pr-4 py-2.5 bg-black/60 border border-purple-900/50 hover:border-purple-700/60 focus:border-purple-500 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition';

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6 animate-slideUp">

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-800 via-purple-600 to-violet-500 flex items-center justify-center text-white mx-auto shadow-2xl purple-glow-sm">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Create your account
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500">
            Never miss an assignment deadline, fee notice, or circular again
          </p>
        </div>

        {/* Card */}
        <div className="glass-panel p-7 rounded-3xl border border-purple-900/40 shadow-2xl">
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-purple-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="student@college.edu"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Password <span className="text-zinc-600 font-normal">(min 6 chars)</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-purple-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Timezone */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Timezone <span className="text-zinc-600 font-normal">(for accurate daily notices)</span>
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-purple-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-black/60 border border-purple-900/50 hover:border-purple-700/60 focus:border-purple-500 rounded-xl text-xs text-zinc-200 focus:outline-none transition"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST — UTC+5:30)</option>
                  <option value="America/New_York">America/New_York (EST — UTC-5:00)</option>
                  <option value="America/Los_Angeles">America/Los_Angeles (PST — UTC-8:00)</option>
                  <option value="Europe/London">Europe/London (GMT — UTC+0:00)</option>
                  <option value="Asia/Singapore">Asia/Singapore (SGT — UTC+8:00)</option>
                  <option value="Asia/Tokyo">Asia/Tokyo (JST — UTC+9:00)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-purple-700 hover:bg-purple-600 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-purple-800/40 mt-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-purple-900/30 text-center text-xs text-zinc-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-purple-400 hover:text-purple-300 transition">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
