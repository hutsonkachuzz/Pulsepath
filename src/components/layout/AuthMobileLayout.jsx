import React from 'react';
import { Outlet } from 'react-router-dom';
import { IPhoneMockupFrame } from './IPhoneMockupFrame';
import { LivingRomanticBackground } from '../common/LivingRomanticBackground';
import { FourCornerCrystalGlow } from '../effects/FourCornerCrystalGlow';

export function AuthMobileLayout() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center overflow-hidden bg-romantic-dark text-white relative">
      {/* 4-Corner Crystal Ambient Entry Glow */}
      <FourCornerCrystalGlow />

      {/* Living Romantic Blooming Hearts & Fluid Ambient Glow */}
      <LivingRomanticBackground />

      {/* Centered Mobile Device Frame (Edge-to-edge on mobile, 430px smartphone bezel on larger screens) */}
      <div className="w-full h-screen flex items-center justify-center relative z-10">
        <IPhoneMockupFrame hideAppHeader={true} hideBottomNav={true}>
          <Outlet />
        </IPhoneMockupFrame>
      </div>
    </div>
  );
}
