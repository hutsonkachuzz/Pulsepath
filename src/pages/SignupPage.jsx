import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RomanticButton } from '../components/common/RomanticButton';
import { GlassCard } from '../components/common/GlassCard';
import { Heart, Lock, Mail, User, Sparkles } from 'lucide-react';
import { PulsePathLogo } from '../components/common/PulsePathLogo';

export function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dob, setDob] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await signup(email, password, name);
      navigate('/onboarding');
    } catch (err) {
      setError(err.message || 'Error creating account. Please try again.');
    } finally {
      setLoading(false);
    }
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
            Start your journey
          </h1>
          <p className="text-xs text-rose-200/70 mt-0.5 font-normal">
            Create your private space together.
          </p>
        </div>

        {/* Card */}
        <GlassCard className="p-5 sm:p-6 shadow-2xl border-rose-500/25">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-rose-200/90 mb-1">
                Your Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-rose-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Eren"
                  className="w-full glass-input pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl"
                />
              </div>
            </div>

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
                  placeholder="eren@example.com"
                  className="w-full glass-input pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-rose-200/90 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-rose-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full glass-input pl-8 pr-2.5 py-2 text-xs rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-rose-200/90 mb-1">
                  Confirm
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-rose-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full glass-input pl-8 pr-2.5 py-2 text-xs rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-rose-200/90 mb-1">
                Anniversary / Date of Birth (Optional)
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full glass-input px-3 py-1.5 text-xs rounded-xl"
              />
            </div>

            <RomanticButton
              type="submit"
              size="md"
              loading={loading}
              className="w-full mt-2"
            >
              Continue to Couple Setup ❤️
            </RomanticButton>
          </form>
        </GlassCard>

        {/* Login Link & Back to Landing Link */}
        <div className="text-center text-xs text-rose-200/70 mt-4 space-y-2">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-rose-400 hover:text-rose-300 underline underline-offset-4">
              Sign In
            </Link>
          </p>
          <div>
            <Link
              to="/welcome"
              className="inline-flex items-center gap-1 text-[11px] text-rose-300/80 hover:text-white transition-colors py-1"
            >
              <span>← Back to Private Space</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
