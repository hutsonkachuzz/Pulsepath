import React, { useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCouple } from '../../context/CoupleContext';
import { Sun, Moon, Sunset, Sparkles, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

import { PulsePathLogo } from '../common/PulsePathLogo';

export function RomanticGreeting() {
  const { currentUser } = useAuth();
  const { couple, partnerName } = useCouple();

  const { greeting, emotionalNote, icon, badge } = useMemo(() => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      return {
        greeting: 'Good Morning ❤️',
        emotionalNote: `Another beautiful day to continue our journey together with ${partnerName || 'your favorite person'}.`,
        icon: Sun,
        badge: 'Sunrise Ritual'
      };
    } else if (hour >= 12 && hour < 17) {
      return {
        greeting: 'Good Afternoon ❤️',
        emotionalNote: `In every heartbeat of this afternoon, my heart is still walking right beside you.`,
        icon: Sparkles,
        badge: 'Daylight Whispers'
      };
    } else if (hour >= 17 && hour < 22) {
      return {
        greeting: 'Good Evening ❤️',
        emotionalNote: `Watching the world slow down, grateful for another day by your side.`,
        icon: Sunset,
        badge: 'Twilight Peace'
      };
    } else {
      return {
        greeting: 'Good Night ❤️',
        emotionalNote: `Another day became another memory in our eternal story. Sleep in peace, my love.`,
        icon: Moon,
        badge: 'Starlight Dream'
      };
    }
  }, [partnerName]);

  const displayName = currentUser?.nickname || currentUser?.name || 'My Love';
  const IconComponent = icon;

  const cleanGreeting = greeting.replace(/❤️/g, '').trim();
  const cleanName = displayName.replace(/❤️/g, '').trim();

  const handleSendLovePulse = () => {
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.2 },
      colors: ['#FF4D6D', '#FF758F', '#FFE5EC', '#E0AAFF']
    });
  };

  return (
    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
      <div className="min-w-0 flex-1">
        {/* Top Brand Mark & Emotional Badge */}
        <div className="flex items-center gap-2.5 mb-2.5">
          <PulsePathLogo
            size={32}
            variant="primary"
            withGlow={false}
            alt="PulsePath logo"
            className="filter drop-shadow-[0_2px_8px_rgba(255,42,122,0.35)]"
          />
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/10 text-xs font-medium text-rose-300/90 backdrop-blur-md">
            <IconComponent className="w-3.5 h-3.5 text-rose-400" />
            <span>{badge}</span>
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-snug break-words">
          {cleanGreeting},{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-300 via-pink-200 to-rose-400">
            {cleanName} ❤️
          </span>
        </h1>

        {/* Brand Continuous Journey Tagline */}
        <p className="mt-1 text-xs sm:text-sm font-medium text-rose-300/90 tracking-wide">
          Our journey continues, day by day.
        </p>

        {/* Emotional Note */}
        <p className="mt-1 text-xs text-rose-200/70 font-normal max-w-xl leading-relaxed">
          {emotionalNote}
        </p>
      </div>

      {/* Quick Love Touchpoint Button (Touch-friendly 44px min height on mobile) */}
      <button
        type="button"
        onClick={handleSendLovePulse}
        className="self-start sm:self-center min-h-[44px] px-4 py-2 rounded-2xl bg-white/[0.06] hover:bg-rose-500/20 active:bg-rose-500/30 border border-white/10 hover:border-rose-400/40 text-xs font-semibold text-rose-200 flex items-center gap-2 transition-all duration-300 active:scale-95 cursor-pointer shadow-sm group shrink-0"
        title="Send a heart flutter to your partner"
      >
        <Heart className="w-4 h-4 text-rose-400 group-hover:scale-125 transition-transform fill-rose-400/20 group-hover:fill-rose-400" />
        <span>Send Warmth</span>
      </button>
    </div>
  );
}
