import { Sun, Moon, Sparkles } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { DayNightMode } from '../../types';
import { twMerge } from 'tailwind-merge';

export default function Controls() {
  const dayNightMode = useGameStore((state) => state.dayNightMode);
  const setDayNightMode = useGameStore((state) => state.setDayNightMode);
  const showBloom = useGameStore((state) => state.showBloom);
  const setShowBloom = useGameStore((state) => state.setShowBloom);

  const toggleDayNight = () => {
    const newMode: DayNightMode = dayNightMode === 'day' ? 'night' : 'day';
    setDayNightMode(newMode);
    if (newMode === 'day') {
      setShowBloom(false);
    }
  };

  return (
    <div className="absolute top-4 right-4 z-10 flex flex-col gap-3">
      <button
        onClick={toggleDayNight}
        className={twMerge(
          'flex items-center gap-2 px-4 py-3 rounded-xl backdrop-blur-md',
          'transition-all duration-300 hover:scale-105 active:scale-95',
          dayNightMode === 'night'
            ? 'bg-indigo-900/60 text-yellow-200 border border-indigo-500/30 shadow-lg shadow-indigo-500/20'
            : 'bg-amber-100/80 text-amber-900 border border-amber-300/50 shadow-lg shadow-amber-200/30'
        )}
      >
        {dayNightMode === 'night' ? (
          <>
            <Sun className="w-5 h-5" />
            <span className="text-sm font-medium">切换日间</span>
          </>
        ) : (
          <>
            <Moon className="w-5 h-5" />
            <span className="text-sm font-medium">切换夜间</span>
          </>
        )}
      </button>

      {dayNightMode === 'night' && (
        <button
          onClick={() => setShowBloom(!showBloom)}
          className={twMerge(
            'flex items-center gap-2 px-4 py-3 rounded-xl backdrop-blur-md',
            'transition-all duration-300 hover:scale-105 active:scale-95',
            showBloom
              ? 'bg-purple-900/60 text-purple-200 border border-purple-500/30 shadow-lg shadow-purple-500/20'
              : 'bg-gray-800/60 text-gray-300 border border-gray-600/30 shadow-lg shadow-gray-500/10'
          )}
        >
          <Sparkles className={twMerge('w-5 h-5', showBloom && 'animate-pulse')} />
          <span className="text-sm font-medium">
            Bloom {showBloom ? '开启' : '关闭'}
          </span>
        </button>
      )}
    </div>
  );
}
