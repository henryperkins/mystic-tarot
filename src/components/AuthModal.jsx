/**
 * AuthModal Component
 * Provides login and registration UI
 */

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (mode === 'login') {
        result = await login(identifier, password);
      } else {
        result = await register(email, username, password);
      }

      if (result.success) {
        onClose();
        // Reset form
        setEmail('');
        setUsername('');
        setPassword('');
        setIdentifier('');
      } else {
        setError(result.error || 'An error occurred');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-slate-900 rounded-xl border border-emerald-400/40 p-6 m-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-amber-200 hover:text-amber-100"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-serif text-amber-200 mb-6">
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div>
                <label htmlFor="email" className="block text-sm text-amber-100 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-slate-800 border border-emerald-400/40 rounded-lg text-amber-100 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                />
              </div>
              <div>
                <label htmlFor="username" className="block text-sm text-amber-100 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  pattern="[a-zA-Z0-9_]{3,20}"
                  title="3-20 alphanumeric characters or underscores"
                  className="w-full px-4 py-2 bg-slate-800 border border-emerald-400/40 rounded-lg text-amber-100 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                />
              </div>
            </>
          )}

          {mode === 'login' && (
            <div>
              <label htmlFor="identifier" className="block text-sm text-amber-100 mb-1">
                Email or Username
              </label>
              <input
                type="text"
                id="identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                className="w-full px-4 py-2 bg-slate-800 border border-emerald-400/40 rounded-lg text-amber-100 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
              />
            </div>
          )}

          <div>
            <label htmlFor="password" className="block text-sm text-amber-100 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-2 bg-slate-800 border border-emerald-400/40 rounded-lg text-amber-100 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition"
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={switchMode}
            className="text-emerald-400 hover:text-emerald-300 text-sm"
          >
            {mode === 'login'
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </button>
        </div>

        <p className="mt-4 text-xs text-amber-100/60 text-center">
          Your journal entries will be securely saved and accessible across devices.
        </p>
      </div>
    </div>
  );
}
