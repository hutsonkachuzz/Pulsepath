import React from 'react';
import { Outlet } from 'react-router-dom';
import { IPhoneMockupFrame } from './IPhoneMockupFrame';
import { LivingRomanticBackground } from '../common/LivingRomanticBackground';
import { FourCornerCrystalGlow } from '../effects/FourCornerCrystalGlow';

export function AuthMobileLayout() {
  return (
    <div
      className="min-h-[100dvh] h-[100dvh] w-full flex items-center justify-center overflow-hidden bg-romantic-dark text-white relative"
      style={{ minHeight: '100dvh', height: '100dvh' }}
    >
      {/* 4-Corner Crystal Ambient Entry Glow */}
      <FourCornerCrystalGlow />

      {/* Living Romantic Blooming Hearts & Fluid Ambient Glow */}
      <LivingRomanticBackground />

      {/* Centered Mobile Device Frame (Edge-to-edge on mobile, 430px smartphone bezel on larger screens) */}
      <div
        className="w-full h-full min-h-[100dvh] h-[100dvh] flex items-center justify-center relative z-10"
        style={{ minHeight: '100dvh', height: '100dvh' }}
      >
        <IPhoneMockupFrame hideAppHeader={true} hideBottomNav={true}>
          <Outlet />
        </IPhoneMockupFrame>
      </div>
    </div>
  );
}
