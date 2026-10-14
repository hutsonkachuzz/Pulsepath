import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Mic } from 'lucide-react';

export function VoiceNoteBubble({ isMe, duration = '0:14' }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);

  const parseSeconds = (dur) => {
    if (!dur) return 14;
    const parts = dur.split(':');
    if (parts.length === 2) {
      return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    }
    return 14;
  };

  const totalSeconds = parseSeconds(duration);
  const elapsedSeconds = Math.min(totalSeconds, Math.floor((progress / 100) * totalSeconds));
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = String(secs % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const togglePlay = () => {
    if (isPlaying) {
      clearInterval(intervalRef.current);
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(intervalRef.current);
            setIsPlaying(false);
            return 0;
          }
          return prev + 4;
        });
      }, 250);
    }
  };

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  // WhatsApp-style audio wave bars
  const waveBars = [
    25, 45, 80, 60, 35, 90, 75, 50, 85, 40, 65, 95, 70, 45, 80, 55, 30, 85, 60, 40, 70, 90, 50, 35, 60, 80
  ];

  return (
    <div className="flex items-center gap-2.5 py-1 min-w-[210px] sm:min-w-[245px]">
      {/* Play/Pause circular button */}
      <button
        type="button"
        onClick={togglePlay}
        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 shadow-md transition-all active:scale-95 cursor-pointer ${
          isMe
            ? 'bg-white/20 text-white hover:bg-white/30'
            : 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
        }`}
        title={isPlaying ? 'Pause' : 'Play voice message'}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
        ) : (
          <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current translate-x-0.5" />
        )}
      </button>

      {/* Waveform and progress */}
      <div className="flex-1 flex flex-col justify-center gap-1">
        <div className="flex items-center gap-[3px] h-6 sm:h-7 cursor-pointer" onClick={togglePlay}>
          {waveBars.map((height, i) => {
            const barProgress = (i / waveBars.length) * 100;
            const isPlayed = barProgress <= progress;

            return (
              <span
                key={i}
                style={{ height: `${height}%` }}
                className={`w-[2.5px] sm:w-[3px] rounded-full transition-all duration-150 ${
                  isPlayed
                    ? isMe
                      ? 'bg-white'
                      : 'bg-rose-400'
                    : isMe
                    ? 'bg-white/30'
                    : 'bg-white/20'
                } ${isPlaying ? 'hover:opacity-80' : ''}`}
              />
            );
          })}
        </div>

        {/* Duration and Mic badge */}
        <div className="flex items-center justify-between text-[11px] font-medium tabular-nums opacity-85 select-none">
          <span>{isPlaying ? formatTime(elapsedSeconds) : duration}</span>
          <span className="flex items-center gap-1 text-[10px] opacity-75">
            <Mic className="w-3 h-3" /> Voice note
          </span>
        </div>
      </div>
    </div>
  );
}
