import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export function PageHeader({
  title,
  subtitle,
  badge,
  badgeIcon: BadgeIcon,
  backLabel = 'Back',
  fallbackRoute = '/home',
  rightAction = null,
  className = ''
}) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate(fallbackRoute);
    }
  };

  return (
    <div className={`space-y-1.5 mb-4 select-none ${className}`}>
      {/* Top Row: Back Navigation Button & Optional Right Action */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={handleBack}
          aria-label={`Go back to ${backLabel}`}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 -ml-1 rounded-xl text-xs font-semibold text-rose-300 hover:text-white hover:bg-white/[0.08] active:scale-95 transition-all focus:outline-none cursor-pointer group"
        >
          <ChevronLeft className="w-4 h-4 text-rose-400 group-hover:-translate-x-0.5 transition-transform" />
          <span>{backLabel}</span>
        </button>

        {rightAction && (
          <div className="shrink-0">
            {rightAction}
          </div>
        )}
      </div>

      {/* Main Title & Subtitle Area (Portrait Mobile Scaled) */}
      <div className="pt-0.5">
        {badge && (
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/30 text-[10px] font-semibold uppercase tracking-wider text-rose-300 mb-1.5">
            {BadgeIcon && <BadgeIcon className="w-3 h-3 text-amber-300" />}
            <span>{badge}</span>
          </div>
        )}

        {title && (
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight">
            {title}
          </h1>
        )}

        {subtitle && (
          <p className="text-[11px] sm:text-xs text-rose-200/75 mt-0.5 font-normal leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
