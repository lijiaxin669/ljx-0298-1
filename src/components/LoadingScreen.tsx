import { useGameStore } from '../store/useGameStore';
import { twMerge } from 'tailwind-merge';

interface LoadingScreenProps {
  progress: number;
  onComplete?: () => void;
}

export default function LoadingScreen({ progress, onComplete }: LoadingScreenProps) {
  const isLoaded = useGameStore((state) => state.isLoaded);

  if (isLoaded) return null;

  return (
    <div
      className={twMerge(
        'fixed inset-0 z-50 flex flex-col items-center justify-center',
        'bg-gradient-to-br from-red-900 via-red-800 to-amber-900',
        'transition-opacity duration-1000',
        progress >= 100 ? 'opacity-0 pointer-events-none' : 'opacity-100'
      )}
      onTransitionEnd={() => {
        if (progress >= 100 && onComplete) {
          onComplete();
        }
      }}
    >
      <div className="relative mb-8">
        <div className="relative w-32 h-32">
          <div className="absolute inset-0 rounded-full bg-red-600 animate-pulse" />
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-red-500 to-red-700 animate-bounce" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="text-5xl animate-spin-slow"
              style={{ animationDuration: '3s' }}
            >
              🏮
            </span>
          </div>
          <div className="absolute -inset-2 rounded-full border-4 border-yellow-500/30 animate-ping" />
        </div>
      </div>

      <h1
        className="text-4xl font-bold text-yellow-300 mb-4 tracking-wider"
        style={{ fontFamily: "'Ma Shan Zheng', cursive" }}
      >
        灯笼长廊
      </h1>

      <p
        className="text-yellow-100/80 mb-8 text-lg"
        style={{ fontFamily: "'ZCOOL XiaoWei', serif" }}
      >
        正在加载节日氛围...
      </p>

      <div className="w-72 h-3 bg-red-950/50 rounded-full overflow-hidden border border-red-700/50">
        <div
          className="h-full bg-gradient-to-r from-yellow-500 to-amber-400 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      <div className="mt-4 text-yellow-200/70 text-sm font-mono">
        {Math.round(progress)}%
      </div>

      <div className="mt-12 flex gap-8 text-yellow-200/60 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span>加载3D场景</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" style={{ animationDelay: '0.3s' }} />
          <span>生成灯笼阵列</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" style={{ animationDelay: '0.6s' }} />
          <span>准备祝福语</span>
        </div>
      </div>
    </div>
  );
}
