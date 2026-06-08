import { useState, useCallback, useEffect, useRef } from 'react';
import LanternScene from '../components/LanternScene/LanternScene';
import Controls from '../components/UI/Controls';
import Joystick from '../components/UI/Joystick';
import Tooltip from '../components/UI/Tooltip';
import FPSCounter from '../components/UI/FPSCounter';
import LoadingScreen from '../components/LoadingScreen';
import { useGameStore } from '../store/useGameStore';
import { Keyboard, MousePointer2 } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export default function Home() {
  const [loadProgress, setLoadProgress] = useState(0);
  const isLoaded = useGameStore((state) => state.isLoaded);
  const isPointerLocked = useGameStore((state) => state.isPointerLocked);
  const dayNightMode = useGameStore((state) => state.dayNightMode);
  const playerControl = useGameStore((state) => state.playerControl);
  const [showHint, setShowHint] = useState(true);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleLoadProgress = useCallback((progress: number) => {
    setLoadProgress(progress);
  }, []);

  const handleLoadingComplete = useCallback(() => {
    setTimeout(() => setShowHint(true), 1000);
  }, []);

  const handleJoystickMove = useCallback((x: number, y: number) => {
    if (playerControl) {
      playerControl.setJoystickInput(x, -y);
    }
  }, [playerControl]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1 && touchStartRef.current && playerControl) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      playerControl.setTouchRotation(deltaX, deltaY);
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    }
  }, [playerControl]);

  const handleTouchEnd = useCallback(() => {
    touchStartRef.current = null;
  }, []);

  useEffect(() => {
    if (isLoaded && showHint) {
      const timer = setTimeout(() => setShowHint(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [isLoaded, showHint]);

  return (
    <div
      className="relative w-full h-screen overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="absolute inset-0">
        <LanternScene onLoadProgress={handleLoadProgress} />
      </div>

      <LoadingScreen
        progress={loadProgress}
        onComplete={handleLoadingComplete}
      />

      {isLoaded && (
        <>
          <FPSCounter />
          <Controls />
          <Tooltip />
          <Joystick onMove={handleJoystickMove} />

          {showHint && !isPointerLocked && (
            <div
              className={twMerge(
                'absolute bottom-32 left-1/2 -translate-x-1/2 z-20',
                'animate-fadeInUp'
              )}
            >
              <div
                className={twMerge(
                  'px-8 py-6 rounded-2xl backdrop-blur-md',
                  'border-2 shadow-2xl',
                  dayNightMode === 'night'
                    ? 'bg-indigo-900/70 border-indigo-400/30 shadow-indigo-500/20'
                    : 'bg-amber-50/90 border-amber-400/50 shadow-amber-200/30'
                )}
              >
                <div className="flex items-start gap-6">
                  <div className="flex flex-col items-center">
                    <div
                      className={twMerge(
                        'w-14 h-14 rounded-xl flex items-center justify-center mb-2',
                        dayNightMode === 'night'
                          ? 'bg-blue-500/30 border border-blue-400/40'
                          : 'bg-blue-100 border border-blue-300'
                      )}
                    >
                      <MousePointer2 className={twMerge('w-7 h-7', dayNightMode === 'night' ? 'text-blue-300' : 'text-blue-600')} />
                    </div>
                    <span className={twMerge('text-xs font-medium', dayNightMode === 'night' ? 'text-blue-200' : 'text-blue-700')}>
                      点击锁定
                    </span>
                  </div>

                  <div className="w-px h-16 opacity-30" style={{ background: dayNightMode === 'night' ? '#93c5fd' : '#93c5fd' }} />

                  <div className="flex flex-col items-center">
                    <div
                      className={twMerge(
                        'w-14 h-14 rounded-xl flex items-center justify-center mb-2',
                        dayNightMode === 'night'
                          ? 'bg-purple-500/30 border border-purple-400/40'
                          : 'bg-purple-100 border border-purple-300'
                      )}
                    >
                      <Keyboard className={twMerge('w-7 h-7', dayNightMode === 'night' ? 'text-purple-300' : 'text-purple-600')} />
                    </div>
                    <span className={twMerge('text-xs font-medium text-center', dayNightMode === 'night' ? 'text-purple-200' : 'text-purple-700')}>
                      WASD移动
                    </span>
                  </div>

                  <div className="w-px h-16 opacity-30" style={{ background: dayNightMode === 'night' ? '#c4b5fd' : '#c4b5fd' }} />

                  <div className="flex flex-col items-center">
                    <div
                      className={twMerge(
                        'w-14 h-14 rounded-xl flex items-center justify-center mb-2',
                        dayNightMode === 'night'
                          ? 'bg-red-500/30 border border-red-400/40'
                          : 'bg-red-100 border border-red-300'
                      )}
                    >
                      <span className="text-3xl">🏮</span>
                    </div>
                    <span className={twMerge('text-xs font-medium text-center', dayNightMode === 'night' ? 'text-red-200' : 'text-red-700')}>
                      靠近灯笼看祝福
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setShowHint(false)}
                  className={twMerge(
                    'mt-5 w-full py-2 rounded-lg text-sm font-medium',
                    'transition-all hover:scale-105 active:scale-95',
                    dayNightMode === 'night'
                      ? 'bg-white/10 text-white/70 hover:bg-white/20'
                      : 'bg-black/5 text-black/60 hover:bg-black/10'
                  )}
                >
                  知道了
                </button>
              </div>
            </div>
          )}

          {!isPointerLocked && isLoaded && (
            <button
              onClick={() => {
                const canvas = document.querySelector('canvas');
                if (canvas) {
                  canvas.requestPointerLock();
                }
              }}
              className={twMerge(
                'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20',
                'px-10 py-5 rounded-2xl backdrop-blur-md',
                'border-2 shadow-2xl',
                'transition-all duration-300 hover:scale-110 active:scale-95',
                dayNightMode === 'night'
                  ? 'bg-gradient-to-br from-red-900/80 to-amber-900/80 border-red-400/40 shadow-red-500/30'
                  : 'bg-gradient-to-br from-red-100/95 to-amber-50/95 border-red-400/50 shadow-amber-200/40'
              )}
            >
              <div className="text-5xl mb-3 animate-bounce">🏮</div>
              <div
                className={twMerge('text-2xl font-bold mb-1', dayNightMode === 'night' ? 'text-yellow-300' : 'text-red-800')}
                style={{ fontFamily: "'Ma Shan Zheng', cursive" }}
              >
                点击开始漫游
              </div>
              <div className={twMerge('text-sm', dayNightMode === 'night' ? 'text-yellow-100/70' : 'text-red-700/70')}>
                进入灯笼长廊，感受节日氛围
              </div>
            </button>
          )}
        </>
      )}
    </div>
  );
}
