import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RomanticButton } from '../components/common/RomanticButton';
import { GlassCard } from '../components/common/GlassCard';
import { Heart, Lock, Mail, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { PulsePathLogo } from '../components/common/PulsePathLogo';

export function LoginPage() {
  const { login, loginAsDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Compute redirect target destination
  const getDestination = () => {
    const searchParams = new URLSearchParams(location.search);
    const rawRedirect = searchParams.get('redirect');
    const redirectPath = rawRedirect ? decodeURIComponent(rawRedirect) : null;
    let destination = location.state?.from?.pathname || redirectPath || '/home';
    if (!destination || destination === '/' || destination === '/welcome' || destination.startsWith('/welcome') || destination === '/login') {
      destination = '/home';
    }
    return destination;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      sessionStorage.setItem('pulsepath_logged_in', 'true');
      navigate(getDestination(), { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (role = 'eren') => {
    await loginAsDemo(role);
    sessionStorage.setItem('pulsepath_logged_in', 'true');
    navigate(getDestination(), { replace: true });
  };

  return (
    <div className="h-full min-h-full w-full flex flex-col items-center justify-center p-3 text-white relative overflow-y-auto select-none">
      <div className="w-full max-w-sm relative z-10 py-4 my-auto">
        {/* Header with Centered Official Logo */}
        <div className="text-center mb-5">
          <div className="flex justify-center mb-2.5">
            <Link to="/welcome" className="inline-block group" aria-label="PulsePath Home">
              <PulsePathLogo
                size={48}
                variant="primary"
                alt="PulsePath logo"
                className="group-hover:scale-105 active:scale-95 transition-transform filter drop-shadow-[0_4px_16px_rgba(255,42,122,0.45)]"
              />
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Welcome back
          </h1>
          <p className="text-xs text-rose-200/70 mt-0.5 font-normal">
            Continue your private journey together.
          </p>
        </div>

        {/* Card */}
        <GlassCard className="p-5 sm:p-6 shadow-2xl border-rose-500/25">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-rose-200/90 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-rose-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="love@pulsepath.com"
                  className="w-full glass-input pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-rose-200/90">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => alert('Password reset link sent to your email!')}
                  className="text-[10px] text-rose-400 hover:text-rose-300"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-rose-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full glass-input pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl"
                />
              </div>
            </div>

            <RomanticButton
              type="submit"
              size="md"
              loading={loading}
              className="w-full mt-2"
            >
              Sign In to PulsePath ❤️
            </RomanticButton>
          </form>

          {/* Quick Demo Login */}
          <div className="mt-5 pt-4 border-t border-white/10 text-center">
            <p className="text-[11px] text-rose-300/80 mb-2 flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Or sign in instantly with Demo Couple:</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemo('eren')}
                className="px-2.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 hover:border-rose-400/40 active:scale-95 text-xs font-medium text-white transition-all hover:bg-white/[0.08]"
              >
                Eren 👦
              </button>
              <button
                type="button"
                onClick={() => handleDemo('mikasa')}
                className="px-2.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 hover:border-pink-400/40 active:scale-95 text-xs font-medium text-white transition-all hover:bg-white/[0.08]"
              >
                Mikasa 👧
              </button>
            </div>
          </div>
        </GlassCard>

        {/* Signup Link & Back to Landing Link */}
        <div className="text-center text-xs text-rose-200/70 mt-4 space-y-2">
          <p>
            Don't have a shared space yet?{' '}
            <Link to="/signup" className="font-semibold text-rose-400 hover:text-rose-300 underline underline-offset-4">
              Create Your Space
            </Link>
          </p>
          <div>
            <Link
              to="/welcome"
              className="inline-flex items-center gap-1 text-[11px] text-rose-300/80 hover:text-white transition-colors py-1"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Back to Private Space</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
