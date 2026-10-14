import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Sparkles, KeyRound, Lock, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PulsePathLogo } from '../components/common/PulsePathLogo';
import { MasterPasswordModal } from '../components/auth/MasterPasswordModal';
import { RomanticCanvas } from '../components/3d/RomanticCanvas';

export function WelcomePage() {
  const { currentUser, loginAsDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Query parameters for shared couple code or partner preference
  const sharedCode = searchParams.get('code') || null;
  const initialPartner = searchParams.get('partner') || 'eren';

  // Step 1: Landing page loads first without any auto-opening popup modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(initialPartner);

  const handleMasterPasswordSuccess = async ({ partner }) => {
    try {
      await loginAsDemo(partner || selectedPartner);
      sessionStorage.setItem('pulsepath_logged_in', 'true');
    } catch (err) {
      console.warn('Demo login notification:', err);
      sessionStorage.setItem('pulsepath_logged_in', 'true');
    }

    // Determine target destination (e.g. Chat or Dashboard)
    const rawRedirect = searchParams.get('redirect');
    const redirectPath = rawRedirect ? decodeURIComponent(rawRedirect) : null;
    let destination = location.state?.from?.pathname || redirectPath || '/home';

    // Prevent redirect loop back to welcome or login page
    if (!destination || destination === '/' || destination === '/welcome' || destination.startsWith('/welcome') || destination === '/login') {
      destination = '/home';
    }

    navigate(destination, { replace: true });
  };

  return (
    <div className="relative h-full min-h-full w-full flex flex-col justify-between items-center overflow-y-auto overflow-x-hidden text-white select-none py-3 px-3">
      {/* 3D Romantic Floating Particles Canvas Background */}
      <RomanticCanvas
        showCentralHeart={false}
        heartScale={1.0}
        interactive={true}
        className="z-0 opacity-75"
      />

      {/* Ambient Romantic Background Glow Lights */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[340px] h-[340px] rounded-full bg-gradient-to-tr from-pink-600/15 via-rose-500/12 to-violet-600/18 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[280px] h-[260px] rounded-full bg-gradient-to-b from-purple-700/12 to-transparent blur-3xl pointer-events-none" />
      </div>

      {/* Top Subtle Mobile Brand Bar */}
      <header className="relative z-10 w-full px-2 pt-1 flex justify-between items-center">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-rose-200/90 tracking-wide">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Private Space for Two</span>
        </div>

        <div className="text-[10px] text-rose-300/80 font-mono tracking-wider px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10">
          {sharedCode ? `SPACE: ${sharedCode}` : 'PULSE-7K29'}
        </div>
      </header>

      {/* Center Landing Showcase (Portrait Mobile Optimized) */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center px-2 my-auto py-4 w-full max-w-sm">
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center w-full"
        >
          {/* Logo Floating Aura */}
          <div className="relative flex items-center justify-center">
            {/* Ambient Glow Halo */}
            <div
              className="absolute w-36 h-36 rounded-full bg-gradient-to-tr from-pink-500/35 via-rose-500/25 to-purple-600/35 blur-2xl pointer-events-none transform scale-110"
              aria-hidden="true"
            />

            {/* Custom App Logo (Floating gently) */}
            <motion.div
              animate={{
                y: [0, -6, 0]
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="relative z-10 cursor-pointer"
              onClick={() => setIsModalOpen(true)}
              title="Click to enter"
            >
              <PulsePathLogo
                size={88}
                variant="primary"
                withGlow={false}
                alt="PulsePath logo"
                className="filter drop-shadow-[0_10px_28px_rgba(255,42,122,0.48)] active:scale-95 transition-transform duration-200"
              />
            </motion.div>
          </div>

          {/* Soft Reflection Light */}
          <div className="w-24 h-2 mt-2 rounded-full bg-gradient-to-r from-transparent via-rose-500/30 to-transparent blur-sm pointer-events-none" />

          {/* Brand Name & Poetic Tagline */}
          <div className="mt-4 px-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
              PulsePath
            </h1>
            <p className="mt-1.5 text-xs text-rose-200/85 font-normal max-w-[280px] mx-auto leading-relaxed">
              Two hearts. One journey. Every moment becomes a memory.
            </p>
          </div>

          {/* Select Partner Profile for Quick Entry */}
          <div className="mt-5 w-full max-w-[290px]">
            <div className="text-[11px] font-medium text-rose-300/80 mb-2 flex items-center justify-center gap-1">
              <UserCheck className="w-3 h-3 text-rose-400" />
              <span>Choose your partner profile:</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedPartner('eren')}
                className={`p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer touch-manipulation ${
                  selectedPartner === 'eren'
                    ? 'bg-rose-500/25 border-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.4)] ring-1 ring-rose-400/50'
                    : 'bg-white/[0.04] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    E
                  </div>
                  <div className="text-left min-w-0">
                    <div className="text-xs font-bold text-white leading-tight">Eren</div>
                    <div className="text-[9px] text-rose-300/80 leading-none">Partner 1</div>
                  </div>
                </div>
                {selectedPartner === 'eren' && (
                  <div className="w-3.5 h-3.5 rounded-full bg-rose-500 flex items-center justify-center text-[9px] text-white shrink-0">
                    ✓
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() => setSelectedPartner('mikasa')}
                className={`p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer touch-manipulation ${
                  selectedPartner === 'mikasa'
                    ? 'bg-pink-500/25 border-pink-400 shadow-[0_0_12px_rgba(236,72,153,0.4)] ring-1 ring-pink-400/50'
                    : 'bg-white/[0.04] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-pink-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    M
                  </div>
                  <div className="text-left min-w-0">
                    <div className="text-xs font-bold text-white leading-tight">Mikasa</div>
                    <div className="text-[9px] text-pink-300/80 leading-none">Partner 2</div>
                  </div>
                </div>
                {selectedPartner === 'mikasa' && (
                  <div className="w-3.5 h-3.5 rounded-full bg-pink-500 flex items-center justify-center text-[9px] text-white shrink-0">
                    ✓
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Prominent Enter Button */}
          <div className="mt-5 w-full max-w-[290px]">
            <div className="relative group w-full">
              {/* Outer Pulsing Glow Aura */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 opacity-60 blur-md transition duration-300 animate-pulse-subtle" />

              {/* Enter Button */}
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="relative w-full min-h-[46px] px-4 py-3 rounded-2xl bg-gradient-to-r from-[#200827] via-[#2d0a36] to-[#1e0725] border border-rose-400/40 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.25)] active:scale-[0.98] transition-all duration-200 cursor-pointer focus:outline-none touch-manipulation"
              >
                <KeyRound className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="tracking-wide">
                  Enter Private Space {selectedPartner === 'mikasa' ? 'as Mikasa' : 'as Eren'}
                </span>
                <ArrowRight className="w-4 h-4 text-rose-300 shrink-0" />
              </button>
            </div>

            {/* Quick Resume Active Session (if already logged in) */}
            {currentUser && sessionStorage.getItem('pulsepath_logged_in') === 'true' && (
              <div className="mt-2.5">
                <button
                  type="button"
                  onClick={() => navigate('/home')}
                  className="w-full py-1.5 px-3 rounded-xl bg-white/[0.05] hover:bg-white/10 active:scale-95 text-[11px] font-medium text-emerald-300 border border-emerald-500/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>Resume Space as {currentUser.name} →</span>
                </button>
              </div>
            )}

            {/* Alternative Links (Login / Signup) */}
            <div className="mt-3 flex items-center justify-center gap-3 text-xs text-rose-200/70">
              <Link to="/login" className="hover:text-white underline-offset-2 hover:underline">
                Email Sign In
              </Link>
              <span>•</span>
              <Link to="/signup" className="hover:text-white underline-offset-2 hover:underline">
                Create Space
              </Link>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full px-2 pb-1 text-center text-[10px] text-rose-300/60 flex flex-col items-center gap-0.5">
        <p className="flex items-center gap-1 justify-center">
          <span>PulsePath • Made with</span>
          <Heart className="w-2.5 h-2.5 fill-rose-500 text-rose-500 inline" />
          <span>for two hearts</span>
        </p>
      </footer>

      {/* Master Password Login Pop-up Modal (Container-Scoped inside phone frame) */}
      <MasterPasswordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleMasterPasswordSuccess}
        initialPartner={selectedPartner}
        coupleCode={sharedCode}
        isMobileLink={true}
        scoped={true}
      />
    </div>
  );
}

export default WelcomePage;
