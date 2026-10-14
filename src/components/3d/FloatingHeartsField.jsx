import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function FloatingHeartsField({ count = 28 }) {
  const groupRef = useRef();

  // Reusable small heart shape
  const heartShape = useMemo(() => {
    const shape = new THREE.Shape();
    const x = 0, y = 0;
    shape.moveTo(x + 0.25, y + 0.25);
    shape.bezierCurveTo(x + 0.25, y + 0.25, x + 0.2, y, x, y);
    shape.bezierCurveTo(x - 0.3, y, x - 0.3, y + 0.35, x - 0.3, y + 0.35);
    shape.bezierCurveTo(x - 0.3, y + 0.55, x - 0.1, y + 0.77, x + 0.25, y + 0.95);
    shape.bezierCurveTo(x + 0.6, y + 0.77, x + 0.8, y + 0.55, x + 0.8, y + 0.35);
    shape.bezierCurveTo(x + 0.8, y + 0.35, x + 0.8, y, x + 0.5, y);
    shape.bezierCurveTo(x + 0.35, y, x + 0.25, y + 0.25, x + 0.25, y + 0.25);
    
    const geom = new THREE.ExtrudeGeometry(shape, {
      depth: 0.08,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.03,
      bevelThickness: 0.03,
    });
    geom.center();
    return geom;
  }, []);

  // Generate randomized positions, speeds, scales, rotations
  const particles = useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 14,
      y: (Math.random() - 0.5) * 12,
      z: (Math.random() - 0.5) * 8 - 2,
      speed: 0.2 + Math.random() * 0.4,
      rotSpeedX: (Math.random() - 0.5) * 0.8,
      rotSpeedY: (Math.random() - 0.5) * 0.8,
      scale: 0.18 + Math.random() * 0.22,
      phase: Math.random() * Math.PI * 2
    }));
  }, [count]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const elapsed = state.clock.getElapsedTime();
    // 120 FPS frame-rate-independent delta scaling
    const dt = Math.min(delta, 0.05);
    const frameRateFactor = dt * 60; // 1.0 at 60fps, 0.5 at 120fps

    groupRef.current.children.forEach((child, i) => {
      const p = particles[i];
      if (!p) return;

      // Drift upward and reset smoothly at any refresh rate
      child.position.y += p.speed * 0.02 * frameRateFactor;
      child.position.x = p.x + Math.sin(elapsed * 0.8 + p.phase) * 0.4;

      if (child.position.y > 6) {
        child.position.y = -6;
      }

      child.rotation.x += p.rotSpeedX * 0.02 * frameRateFactor;
      child.rotation.y += p.rotSpeedY * 0.02 * frameRateFactor;
    });
  });

  return (
    <group ref={groupRef}>
      {particles.map((p, i) => (
        <mesh
          key={i}
          geometry={heartShape}
          position={[p.x, p.y, p.z]}
          scale={[p.scale, p.scale, p.scale]}
          rotation={[Math.PI, 0, 0]}
        >
          <meshStandardMaterial
            color={i % 2 === 0 ? '#FF758F' : '#FF4D6D'}
            emissive="#A4133C"
            emissiveIntensity={0.3}
            roughness={0.4}
            metalness={0.1}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}
    </group>
  );
}
