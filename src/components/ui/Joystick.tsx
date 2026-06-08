import { useRef, useCallback, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

interface JoystickProps {
  onMove: (x: number, y: number) => void;
}

export default function Joystick({ onMove }: JoystickProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const checkTouch = () => {
      setIsVisible('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    checkTouch();
    window.addEventListener('touchstart', checkTouch, { once: true });
    return () => window.removeEventListener('touchstart', checkTouch);
  }, []);

  const clamp = useCallback((value: number, min: number, max: number) => {
    return Math.max(min, Math.min(max, value));
  }, []);

  const updateHandlePosition = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current || !handleRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    const maxDistance = rect.width / 3;

    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const angle = Math.atan2(deltaY, deltaX);

    const clampedDistance = Math.min(distance, maxDistance);
    const handleX = Math.cos(angle) * clampedDistance;
    const handleY = Math.sin(angle) * clampedDistance;

    handleRef.current.style.transform = `translate(${handleX}px, ${handleY}px)`;

    const normalizedX = clamp(handleX / maxDistance, -1, 1);
    const normalizedY = clamp(handleY / maxDistance, -1, 1);

    currentPos.current = { x: normalizedX, y: normalizedY };
    onMove(normalizedX, normalizedY);
  }, [clamp, onMove]);

  const resetHandle = useCallback(() => {
    if (handleRef.current) {
      handleRef.current.style.transform = 'translate(0, 0)';
    }
    currentPos.current = { x: 0, y: 0 };
    onMove(0, 0);
    setIsDragging(false);
  }, [onMove]);

  const handleStart = useCallback((clientX: number, clientY: number) => {
    setIsDragging(true);
    startPos.current = { x: clientX, y: clientY };
    updateHandlePosition(clientX, clientY);
  }, [updateHandlePosition]);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging) return;
    updateHandlePosition(clientX, clientY);
  }, [isDragging, updateHandlePosition]);

  const handleEnd = useCallback(() => {
    resetHandle();
  }, [resetHandle]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  }, [handleStart]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  }, [handleMove]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    handleEnd();
  }, [handleEnd]);

  if (!isVisible) return null;

  return (
    <div className="absolute bottom-8 left-8 z-10">
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={twMerge(
          'w-32 h-32 rounded-full',
          'bg-black/30 backdrop-blur-sm',
          'border-2 border-white/20',
          'flex items-center justify-center',
          'touch-none select-none',
          'transition-all duration-200',
          isDragging ? 'scale-110 bg-black/40' : ''
        )}
      >
        <div
          ref={handleRef}
          className={twMerge(
            'w-14 h-14 rounded-full',
            'bg-gradient-to-br from-red-500 to-red-700',
            'border-2 border-yellow-400/50',
            'shadow-lg shadow-red-500/30',
            'transition-transform duration-75',
            'flex items-center justify-center'
          )}
        >
          <div className="w-4 h-4 rounded-full bg-yellow-400/60" />
        </div>
      </div>
      <div className="text-center mt-2 text-white/60 text-xs font-medium">
        移动摇杆
      </div>
    </div>
  );
}
