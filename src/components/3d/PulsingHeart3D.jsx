import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function PulsingHeart3D({ scale = 1, interactive = true }) {
  const meshRef = useRef();

  // Create parametric extruded 3D heart geometry
  const heartGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const x = 0, y = 0;
    
    // Smooth parametric heart outline
    shape.moveTo(x + 0.25, y + 0.25);
    shape.bezierCurveTo(x + 0.25, y + 0.25, x + 0.2, y, x, y);
    shape.bezierCurveTo(x - 0.3, y, x - 0.3, y + 0.35, x - 0.3, y + 0.35);
    shape.bezierCurveTo(x - 0.3, y + 0.55, x - 0.1, y + 0.77, x + 0.25, y + 0.95);
    shape.bezierCurveTo(x + 0.6, y + 0.77, x + 0.8, y + 0.55, x + 0.8, y + 0.35);
    shape.bezierCurveTo(x + 0.8, y + 0.35, x + 0.8, y, x + 0.5, y);
    shape.bezierCurveTo(x + 0.35, y, x + 0.25, y + 0.25, x + 0.25, y + 0.25);

    const extrudeSettings = {
      depth: 0.2,
      bevelEnabled: true,
      bevelSegments: 8,
      steps: 2,
      bevelSize: 0.08,
      bevelThickness: 0.08,
    };

    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.center();
    return geom;
  }, []);

  // Heartbeat animation loop (68-72 bpm resting heartbeat pulse)
  useFrame(({ clock, pointer }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();

    // Resting human heartbeat rhythm: two rapid thumps, then rest
    const cycle = (t * 1.2) % 1;
    let beat = 1;
    if (cycle < 0.15) {
      beat = 1 + Math.sin((cycle / 0.15) * Math.PI) * 0.14;
    } else if (cycle > 0.2 && cycle < 0.35) {
      beat = 1 + Math.sin(((cycle - 0.2) / 0.15) * Math.PI) * 0.08;
    }

    const currentScale = scale * beat;
    meshRef.current.scale.set(currentScale, currentScale, currentScale);

    // Subtle gentle rotation and mouse parallax
    meshRef.current.rotation.y = Math.sin(t * 0.5) * 0.2 + (interactive ? pointer.x * 0.3 : 0);
    meshRef.current.rotation.x = Math.cos(t * 0.4) * 0.1 - (interactive ? pointer.y * 0.2 : 0) + Math.PI;
    meshRef.current.rotation.z = Math.sin(t * 0.3) * 0.05;
  });

  return (
    <mesh ref={meshRef} geometry={heartGeometry}>
      <meshStandardMaterial
        color="#FF4D6D"
        emissive="#C9184A"
        emissiveIntensity={0.6}
        roughness={0.2}
        metalness={0.15}
      />
    </mesh>
  );
}
