import { useMemo } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import blessingsData from '../../config/blessings.json';
import { Blessing } from '../../types';
import { twMerge } from 'tailwind-merge';

const blessings = blessingsData.blessings as Blessing[];

export default function Tooltip() {
  const nearestLantern = useGameStore((state) => state.nearestLantern);
  const dayNightMode = useGameStore((state) => state.dayNightMode);
  const cameraData = useGameStore((state) => state.camera);
  const viewportSize = useGameStore((state) => state.viewportSize);

  const screenPosition = useMemo(() => {
    if (!nearestLantern || !cameraData || !viewportSize) return null;

    const pos = new THREE.Vector3(...nearestLantern.position);

    const projectionMatrix = new THREE.Matrix4().fromArray(cameraData.projectionMatrix);
    const matrixWorldInverse = new THREE.Matrix4().fromArray(cameraData.matrixWorldInverse);

    const combinedMatrix = new THREE.Matrix4().multiplyMatrices(projectionMatrix, matrixWorldInverse);
    pos.applyMatrix4(combinedMatrix);

    const x = (pos.x * 0.5 + 0.5) * viewportSize.width;
    const y = (-pos.y * 0.5 + 0.5) * viewportSize.height;

    return { x, y };
  }, [nearestLantern, cameraData, viewportSize]);

  const blessing = useMemo(() => {
    if (!nearestLantern) return null;
    return blessings.find(b => b.id === nearestLantern.blessingId) || null;
  }, [nearestLantern]);

  if (!nearestLantern || !screenPosition || !blessing) return null;

  return (
    <div
      className="absolute z-20 pointer-events-none"
      style={{
        left: screenPosition.x,
        top: screenPosition.y,
        transform: 'translate(-50%, -120%)',
      }}
    >
      <div
        className={twMerge(
          'relative px-6 py-4 rounded-2xl',
          'backdrop-blur-md',
          'border',
          'transition-all duration-300 animate-fadeIn',
          dayNightMode === 'night'
            ? 'bg-gradient-to-br from-red-900/90 to-red-800/80 border-red-500/40 shadow-xl shadow-red-500/20'
            : 'bg-gradient-to-br from-red-100/95 to-amber-50/95 border-red-400/40 shadow-xl shadow-amber-200/30'
        )}
      >
        <div className="relative z-10">
          <div
            className={twMerge(
              'text-lg font-bold mb-1',
              dayNightMode === 'night' ? 'text-yellow-300' : 'text-red-800'
            )}
            style={{ fontFamily: "'Ma Shan Zheng', cursive" }}
          >
            🏮 祝福
          </div>
          <div
            className={twMerge(
              'text-xl font-medium',
              dayNightMode === 'night' ? 'text-white' : 'text-red-900'
            )}
            style={{ fontFamily: "'ZCOOL XiaoWei', serif" }}
          >
            {blessing.text}
          </div>
        </div>

        <div
          className="absolute left-1/2 -bottom-2 w-4 h-4 rotate-45 -translate-x-1/2"
          style={
            dayNightMode === 'night'
              ? { background: 'linear-gradient(135deg, rgba(127, 29, 29, 0.9), rgba(153, 27, 27, 0.8)' }
              : { background: 'linear-gradient(135deg, rgba(254, 226, 226, 0.95), rgba(255, 251, 235, 0.95)' }
          }
        />

        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={
            dayNightMode === 'night'
              ? {
                  background: 'radial-gradient(circle at center, rgba(251, 191, 36, 0.15) 0%, transparent 70%)',
                }
              : {
                  background: 'radial-gradient(circle at center, rgba(251, 191, 36, 0.1) 0%, transparent 70%)',
                }
          }
        />
      </div>
    </div>
  );
}
