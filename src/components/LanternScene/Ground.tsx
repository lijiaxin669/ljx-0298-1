import { useMemo } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import sceneConfig from '../../config/sceneConfig.json';
import { SceneConfig } from '../../types';

const config = sceneConfig as SceneConfig;

export default function Ground() {
  const dayNightMode = useGameStore((state) => state.dayNightMode);

  const groundMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x2a2a2a),
      roughness: 0.8,
      metalness: 0.1,
    });
  }, []);

  const sideWalkMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x4a4a4a),
      roughness: 0.9,
      metalness: 0.05,
    });
  }, []);

  const { length, width } = config.street;

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[length + 20, width + 10]} />
        <primitive object={groundMaterial} attach="material" />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[length, width - 2]} />
        <meshStandardMaterial
          color={dayNightMode === 'night' ? 0x1a1a1a : 0x3a3a3a}
          roughness={0.7}
          metalness={0.15}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <planeGeometry args={[length, width - 2.2]} />
        <meshStandardMaterial
          color={dayNightMode === 'night' ? 0x252525 : 0x454545}
          roughness={0.6}
          metalness={0.2}
        />
      </mesh>

      {[-1, 1].map((side) => (
        <mesh
          key={`sidewalk-${side}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.01, side * (width / 2 - 0.5)]}
          receiveShadow
        >
          <planeGeometry args={[length, 1]} />
          <primitive object={sideWalkMaterial} attach="material" />
        </mesh>
      ))}

      {Array.from({ length: Math.floor(length / 4) }).map((_, i) => (
        <mesh
          key={`line-${i}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[-length / 2 + i * 4 + 2, 0.03, 0]}
          receiveShadow
        >
          <planeGeometry args={[2, 0.15]} />
          <meshStandardMaterial
            color={dayNightMode === 'night' ? 0xffd700 : 0xffff00}
            emissive={dayNightMode === 'night' ? 0xffd700 : 0x000000}
            emissiveIntensity={dayNightMode === 'night' ? 0.3 : 0}
          />
        </mesh>
      ))}
    </group>
  );
}
