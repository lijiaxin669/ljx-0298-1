import { useEffect, useRef } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { twMerge } from 'tailwind-merge';
import { Gauge, Monitor } from 'lucide-react';

export default function FPSCounter() {
  const setFps = useGameStore((state) => state.setFps);
  const fps = useGameStore((state) => state.fps);
  const fpsRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const frameCountRef = useRef(0);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const updateFPS = () => {
      frameCountRef.current++;
      const now = performance.now();
      const delta = now - lastTimeRef.current;

      if (delta >= 500) {
        fpsRef.current = Math.round((frameCountRef.current * 1000) / delta);
        setFps(fpsRef.current);
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      animationFrameRef.current = requestAnimationFrame(updateFPS);
    };

    animationFrameRef.current = requestAnimationFrame(updateFPS);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [setFps]);

  const getFpsColor = () => {
    if (fps >= 55) return 'text-green-400';
    if (fps >= 35) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getFpsBg = () => {
    if (fps >= 55) return 'bg-green-900/40 border-green-500/30';
    if (fps >= 35) return 'bg-yellow-900/40 border-yellow-500/30';
    return 'bg-red-900/40 border-red-500/30';
  };

  return (
    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
      <div
        className={twMerge(
          'flex items-center gap-2 px-4 py-2 rounded-xl',
          'backdrop-blur-md border',
          getFpsBg()
        )}
      >
        <Gauge className={twMerge('w-4 h-4', getFpsColor())} />
        <span className={twMerge('text-sm font-bold font-mono', getFpsColor())}>
          {fps} FPS
        </span>
      </div>

      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900/40 backdrop-blur-md border border-gray-500/30">
        <Monitor className="w-4 h-4 text-blue-400" />
        <span className="text-xs text-gray-300 font-medium">
          灯笼: 250
        </span>
      </div>
    </div>
  );
}
