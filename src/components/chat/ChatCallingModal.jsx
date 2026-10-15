import React, { useState, useEffect, useRef } from 'react';
import { PhoneOff, Mic, MicOff, Video, VideoOff, Heart } from 'lucide-react';

export function ChatCallingModal({
  isOpen,
  onClose,
  partnerName = 'Eren',
  partnerAvatar = '',
  userAvatar = '',
  userName = 'Me',
  isVideo = true
}) {
  const [callState, setCallState] = useState('calling'); // 'calling' | 'ringing' | 'connected'
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoActive, setIsVideoActive] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const audioCtxRef = useRef(null);

  // Gentle call chime using Web Audio API
  useEffect(() => {
    if (!isOpen) return;

    setCallState('calling');
    setCallDuration(0);
    setIsVideoActive(true);

    const t1 = setTimeout(() => {
      setCallState('ringing');
      playChime();
    }, 1200);

    const t2 = setTimeout(() => {
      setCallState('connected');
    }, 3800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [isOpen]);

  // Duration counter when connected
  useEffect(() => {
    if (callState !== 'connected') return;
    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [callState]);

  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      // Audio context might be restricted before gesture
    }
  };

  if (!isOpen) return null;

  const formatDuration = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl animate-fadeIn p-4 overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-rose-950/20 via-black/80 to-purple-950/40 pointer-events-none" />

      {/* Main Call Container Box */}
      <div className="relative w-full max-w-[340px] max-h-[min(90dvh,calc(100dvh-env(safe-area-inset-top,0px)-2rem))] rounded-[32px] bg-neutral-900/95 border border-white/15 p-5 sm:p-6 pb-[max(1.5rem,calc(env(safe-area-inset-bottom,0px)+1rem))] flex flex-col items-center text-center shadow-2xl overflow-y-auto select-none">
        
        {/* Floating Self Profile Bubble (Top Right) */}
        <div className="absolute top-4 right-4 z-20 flex flex-col items-center">
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-white/30 shadow-lg bg-neutral-800 flex items-center justify-center">
            {userAvatar ? (
              <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-bold text-white">{userName ? userName[0] : 'U'}</span>
            )}
            {!isVideoActive && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <VideoOff className="w-4 h-4 text-amber-300" />
              </div>
            )}
          </div>
          <span className="text-[10px] text-white/70 font-medium mt-1">You</span>
        </div>

        {/* Top Status Bar */}
        <div className="w-full flex items-center justify-between text-xs text-rose-200/70 mb-2 pr-16">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span>Video Call</span>
          </div>
          <span className="font-semibold tabular-nums text-emerald-400">
            {callState === 'connected' ? formatDuration(callDuration) : callState}
          </span>
        </div>

        {/* Central Circular Profile Picture Bubble (Partner DP) */}
        <div className="relative my-7 sm:my-8 flex items-center justify-center">
          {/* Radar ripple rings during calling/ringing */}
          {callState !== 'connected' && (
            <>
              <div className="absolute inset-0 -m-3 rounded-full border border-rose-500/35 animate-ping [animation-duration:2.5s]" />
              <div className="absolute inset-0 -m-7 rounded-full border border-rose-400/20 animate-pulse [animation-duration:2s]" />
            </>
          )}

          {/* Partner Circular DP Bubble with clean border */}
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-rose-400/50 shadow-[0_0_35px_rgba(244,63,94,0.35)] bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center relative z-10">
            {partnerAvatar ? (
              <img
                src={partnerAvatar}
                alt={partnerName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-3xl font-bold text-white">
                {partnerName ? partnerName[0] : 'P'}
              </div>
            )}
          </div>

          {/* Connected mini bubble badge */}
          {callState === 'connected' && (
            <div className="absolute -bottom-1 right-1 bg-emerald-500 text-white rounded-full p-1.5 border-2 border-[#150722] z-20 shadow-md">
              <Heart className="w-3.5 h-3.5 fill-current" />
            </div>
          )}
        </div>

        {/* Name and State text */}
        <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight mb-1 font-sans">
          {partnerName} ❤️
        </h3>
        <p className="text-xs text-rose-300/80 mb-6 font-normal">
          {callState === 'calling' && 'Calling your partner...'}
          {callState === 'ringing' && 'Ringing partner’s device...'}
          {callState === 'connected' && 'Connected • High Definition Video'}
        </p>

        {/* Essential Action Controls Bar: All icons in circular bubbles with clean borders */}
        <div className="flex items-center justify-center gap-4 sm:gap-5 w-full pt-3 border-t border-white/10">
          {/* Microphone Toggle Circular Bubble */}
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className={`w-12 h-12 sm:w-13 sm:h-13 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
              isMuted
                ? 'bg-amber-500/25 border-amber-400/40 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
            }`}
            title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
            aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Camera Toggle Circular Bubble */}
          <button
            type="button"
            onClick={() => setIsVideoActive(!isVideoActive)}
            className={`w-12 h-12 sm:w-13 sm:h-13 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
              !isVideoActive
                ? 'bg-amber-500/25 border-amber-400/40 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
            }`}
            title={isVideoActive ? 'Turn off camera' : 'Turn on camera'}
            aria-label={isVideoActive ? 'Turn off camera' : 'Turn on camera'}
          >
            {isVideoActive ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          {/* End Call Circular Bubble */}
          <button
            type="button"
            onClick={onClose}
            className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-rose-600 hover:bg-rose-700 border-2 border-rose-400/40 text-white flex items-center justify-center shadow-[0_0_20px_rgba(225,29,72,0.6)] active:scale-90 transition-transform cursor-pointer"
            title="End Call"
            aria-label="End Call"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>

      </div>
    </div>
  );
}

export default ChatCallingModal;
