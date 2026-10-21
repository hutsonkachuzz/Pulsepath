import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Camera,
  RotateCcw,
  Zap,
  ZapOff,
  Image as ImageIcon,
  Send,
  Sparkles,
  Clock,
  Flame,
  Check
} from 'lucide-react';
import { useStreak } from '../../context/StreakContext';

const SNAP_FILTERS = [
  { id: 'normal', name: 'Normal', css: 'none' },
  { id: 'sunset', name: 'Warm Sunset', css: 'sepia(0.25) saturate(1.4) contrast(1.05)' },
  { id: 'vintage', name: '90s Vintage', css: 'contrast(0.92) brightness(1.08) saturate(0.85) sepia(0.18)' },
  { id: 'rose', name: 'Romantic Rose', css: 'hue-rotate(-15deg) saturate(1.35) contrast(1.05)' },
  { id: 'neon', name: 'Midnight Neon', css: 'hue-rotate(195deg) contrast(1.25) saturate(1.3)' },
];

const TIMER_MODES = [
  { id: '10s', label: '⏱️ 10s Snap', duration: 10 },
  { id: 'loop', label: '♾️ Infinite Loop', duration: 0 },
  { id: 'keep', label: '📌 Keep in Chat', duration: -1 },
];

export function PulseSnapCameraModal({ onSendSnap }) {
  const { isCameraOpen, closeCamera, streakCount, streakEmoji, recordSnapSent } = useStreak();

  // Mode: 'viewfinder' | 'editor'
  const [mode, setMode] = useState('viewfinder');
  const [facingMode, setFacingMode] = useState('user'); // 'user' | 'environment'
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);

  // Editor states
  const [caption, setCaption] = useState('');
  const [selectedFilter, setSelectedFilter] = useState(SNAP_FILTERS[0]);
  const [showStreakStamp, setShowStreakStamp] = useState(true);
  const [timerMode, setTimerMode] = useState(TIMER_MODES[0]);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Start WebRTC Camera stream
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
        setIsCameraActive(true);
      }
    } catch (err) {
      console.warn('Camera error or permission denied:', err);
      setIsCameraActive(false);
      setCameraError('Camera access unavailable. You can upload any photo as a Pulse Snap!');
    }
  }, [facingMode]);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  useEffect(() => {
    if (isCameraOpen && mode === 'viewfinder') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isCameraOpen, mode, startCamera, stopCamera]);

  if (!isCameraOpen) return null;

  // Flip Camera
  const handleFlipCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Capture Photo from Camera Viewfinder
  const handleCapture = () => {
    if (videoRef.current && isCameraActive) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 720;
      canvas.height = video.videoHeight || 1280;
      const ctx = canvas.getContext('2d');

      // Mirror if front camera
      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      setCapturedImage(dataUrl);
      setMode('editor');
      stopCamera();
    } else {
      // If camera not ready, trigger file picker
      fileInputRef.current?.click();
    }
  };

  // Upload Photo from Gallery Fallback
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedImage(event.target?.result);
        setMode('editor');
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset to Viewfinder
  const handleRetake = () => {
    setCapturedImage(null);
    setCaption('');
    setMode('viewfinder');
    startCamera();
  };

  // Send Snap to Chat
  const handleSend = () => {
    if (!capturedImage) return;

    const snapPayload = {
      type: 'pulse_snap',
      mediaUrl: capturedImage,
      caption: caption.trim(),
      filter: selectedFilter.id,
      filterCss: selectedFilter.css,
      showStreakStamp,
      streakDay: streakCount,
      streakEmoji,
      timerMode: timerMode.id,
      timerDuration: timerMode.duration,
      unopened: true,
      createdAt: new Date().toISOString()
    };

    // Update streak counter & activity
    recordSnapSent();

    if (onSendSnap) {
      onSendSnap(snapPayload);
    }

    // Also dispatch custom event for instant chat sync
    window.dispatchEvent(new CustomEvent('pulsepath_snap_sent', { detail: snapPayload }));

    closeCamera();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[2500] bg-black flex flex-col justify-between overflow-hidden select-none">
        {/* Hidden Fallback File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* =====================================================================
            VIEWFINDER MODE (Live Camera 60FPS)
            ===================================================================== */}
        {mode === 'viewfinder' ? (
          <div className="relative w-full h-full flex flex-col justify-between">
            {/* Live Video Surface */}
            <div className="absolute inset-0 bg-[#0b0312] overflow-hidden flex items-center justify-center">
              {isCameraActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                />
              ) : (
                <div className="p-6 text-center text-white/70 max-w-xs flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center mb-3 text-rose-300">
                    <Camera className="w-8 h-8 animate-pulse" />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">Pulse Snap Camera</h4>
                  <p className="text-xs text-rose-200/70 mb-4">
                    {cameraError || 'Initializing camera viewfinder...'}
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white text-xs font-bold shadow-lg cursor-pointer"
                  >
                    Select Photo from Gallery
                  </button>
                </div>
              )}

              {/* Front Screen Flash Overlay */}
              {flashEnabled && (
                <div className="absolute inset-0 bg-amber-100/30 pointer-events-none animate-pulse" />
              )}
            </div>

            {/* Top Viewfinder Controls */}
            <div className="relative z-10 flex items-center justify-between p-4 pt-[calc(env(safe-area-inset-top,20px)+8px)]">
              <button
                type="button"
                onClick={closeCamera}
                className="p-2.5 rounded-full bg-black/45 backdrop-blur-md text-white/90 hover:text-white border border-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/45 backdrop-blur-md border border-white/10 text-xs font-bold text-rose-300">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Day {streakCount} Streak</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFlashEnabled(!flashEnabled)}
                  className={`p-2.5 rounded-full backdrop-blur-md border cursor-pointer ${
                    flashEnabled
                      ? 'bg-amber-400 text-black border-amber-300 shadow-[0_0_12px_#fbbf24]'
                      : 'bg-black/45 text-white/90 border-white/10'
                  }`}
                  title="Flash"
                >
                  {flashEnabled ? <Zap className="w-5 h-5 fill-current" /> : <ZapOff className="w-5 h-5" />}
                </button>

                <button
                  type="button"
                  onClick={handleFlipCamera}
                  className="p-2.5 rounded-full bg-black/45 backdrop-blur-md text-white/90 hover:text-white border border-white/10 cursor-pointer"
                  title="Switch Camera"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Bottom Shutter Controls */}
            <div className="relative z-10 flex items-center justify-around p-6 pb-[calc(env(safe-area-inset-bottom,20px)+12px)] bg-gradient-to-t from-black/85 via-black/40 to-transparent">
              {/* Photo Gallery Picker Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center text-white cursor-pointer active:scale-90 transition-transform"
                title="Open Gallery"
              >
                <ImageIcon className="w-6 h-6" />
              </button>

              {/* Shutter Capture Button (Snapchat-style ring) */}
              <button
                type="button"
                onClick={handleCapture}
                className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center cursor-pointer active:scale-90 transition-all shadow-[0_0_24px_rgba(244,63,94,0.6)]"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-500 via-pink-500 to-purple-600 hover:scale-105 active:scale-95 transition-transform" />
              </button>

              {/* Empty spacer for symmetrical balance */}
              <div className="w-12 h-12" />
            </div>
          </div>
        ) : (
          /* =====================================================================
              SNAP EDITOR STUDIO (Captions, Aesthetic Filters, Streak Watermark)
              ===================================================================== */
          <div className="relative w-full h-full flex flex-col justify-between">
            {/* Filtered Photo Background */}
            <div className="absolute inset-0 bg-black overflow-hidden flex items-center justify-center">
              <img
                src={capturedImage}
                alt="Pulse Snap Preview"
                className="w-full h-full object-cover"
                style={{ filter: selectedFilter.css }}
              />

              {/* Draggable Caption Bar (Snapchat Style) */}
              <motion.div
                drag="y"
                dragConstraints={{ top: -200, bottom: 200 }}
                className="absolute w-full px-4 z-20 cursor-grab active:cursor-grabbing"
              >
                <div className="w-full max-w-sm mx-auto p-2.5 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/20 shadow-2xl">
                  <input
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Add a romantic snap caption... 💬"
                    maxLength={100}
                    className="w-full bg-transparent text-center text-sm font-semibold text-white placeholder-white/50 outline-none drop-shadow-[0_2px_8px_rgba(244,63,94,0.8)]"
                    autoFocus
                  />
                </div>
              </motion.div>

              {/* Streak Watermark Badge Overlay */}
              {showStreakStamp && (
                <div className="absolute top-20 right-4 z-20 px-3 py-1.5 rounded-full bg-[#1c082e]/85 backdrop-blur-md border border-rose-400/40 shadow-lg text-white font-bold text-xs flex items-center gap-1.5 animate-pulse">
                  <span>{streakEmoji}</span>
                  <span>Day {streakCount} Streak</span>
                </div>
              )}
            </div>

            {/* Top Editor Controls */}
            <div className="relative z-30 flex items-center justify-between p-4 pt-[calc(env(safe-area-inset-top,20px)+8px)]">
              <button
                type="button"
                onClick={handleRetake}
                className="p-2.5 rounded-full bg-black/50 backdrop-blur-md text-white border border-white/15 cursor-pointer hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Streak Stamp Toggle */}
              <button
                type="button"
                onClick={() => setShowStreakStamp(!showStreakStamp)}
                className={`px-3 py-1.5 rounded-full backdrop-blur-md text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  showStreakStamp
                    ? 'bg-rose-500 text-white border-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.6)]'
                    : 'bg-black/50 text-white/70 border-white/15'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Streak Stamp</span>
              </button>

              {/* View Timer Mode Selector */}
              <button
                type="button"
                onClick={() => {
                  const currIdx = TIMER_MODES.findIndex((t) => t.id === timerMode.id);
                  const nextIdx = (currIdx + 1) % TIMER_MODES.length;
                  setTimerMode(TIMER_MODES[nextIdx]);
                }}
                className="px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/15 text-xs font-semibold text-white cursor-pointer hover:bg-white/10"
              >
                {timerMode.label}
              </button>
            </div>

            {/* Bottom Controls: Filters & Send Action */}
            <div className="relative z-30 p-4 pb-[calc(env(safe-area-inset-bottom,20px)+12px)] bg-gradient-to-t from-black/90 via-black/50 to-transparent space-y-3">
              {/* Aesthetic Filter Selector Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {SNAP_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSelectedFilter(f)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer border ${
                      selectedFilter.id === f.id
                        ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white border-white/40 shadow-[0_0_12px_rgba(244,63,94,0.6)] scale-105'
                        : 'bg-black/50 text-white/80 border-white/15 hover:bg-white/15'
                    }`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>

              {/* Big Romantic Send Snap Action Button */}
              <button
                type="button"
                onClick={handleSend}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:brightness-110 active:scale-98 text-white font-extrabold text-sm tracking-wide shadow-[0_4px_30px_rgba(244,63,94,0.5)] flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>Send Pulse Snap to Partner 🌸</span>
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </AnimatePresence>
  );
}
