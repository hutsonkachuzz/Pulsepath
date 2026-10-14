import React, { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { PulsingHeart3D } from './PulsingHeart3D';
import { FloatingHeartsField } from './FloatingHeartsField';
import { StarMemoryParticles } from './StarMemoryParticles';

export function RomanticCanvas({
  showCentralHeart = true,
  heartScale = 1.2,
  interactive = true,
  className = ''
}) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  if (prefersReducedMotion) {
    return (
      <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-rose-500/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl" />
      </div>
    );
  }

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ pointerEvents: interactive ? 'auto' : 'none' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 8, 5]} intensity={1.2} color="#FFF0F3" />
        <pointLight position={[-4, -2, 2]} intensity={0.8} color="#FF758F" />
        <pointLight position={[0, 4, 3]} intensity={1.5} color="#FF4D6D" />
        <pointLight position={[4, -3, 2]} intensity={0.6} color="#FFE5EC" />

        <Suspense fallback={null}>
          <FloatingHeartsField count={22} />
          <StarMemoryParticles count={120} />
          {showCentralHeart && (
            <PulsingHeart3D scale={heartScale} interactive={interactive} />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}
