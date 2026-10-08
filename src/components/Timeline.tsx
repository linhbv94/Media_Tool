import React, { useRef, useState, useEffect } from 'react';
import { ABLoopState } from '../types';

interface TimelineProps {
  currentTime: number;
  duration: number;
  abLoop: ABLoopState;
  onSeek: (targetTime: number) => void;
  onSetPointA?: (time: number) => void;
  onSetPointB?: (time: number) => void;
  isMiniPip?: boolean;
}

export const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const Timeline: React.FC<TimelineProps> = ({
  currentTime,
  duration,
  abLoop,
  onSeek,
  onSetPointA,
  onSetPointB,
  isMiniPip = false,
}) => {
  const barRef = useRef<HTMLDivElement>(null);
  const [dragMode, setDragMode] = useState<'seek' | 'pointA' | 'pointB' | null>(null);

  // Global mousemove/mouseup listener while dragging
  useEffect(() => {
    if (!dragMode) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (e.buttons === 0) {
        setDragMode(null);
        return;
      }
      if (!barRef.current || duration <= 0) return;
      const rect = barRef.current.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const targetTime = ratio * duration;

      if (dragMode === 'seek') {
        onSeek(targetTime);
      } else if (dragMode === 'pointA' && onSetPointA) {
        const maxA = abLoop.point_b !== null ? Math.max(0, abLoop.point_b - 0.1) : duration;
        onSetPointA(Math.min(maxA, Math.max(0, targetTime)));
      } else if (dragMode === 'pointB' && onSetPointB) {
        const minB = abLoop.point_a !== null ? Math.min(duration, abLoop.point_a + 0.1) : 0;
        onSetPointB(Math.max(minB, Math.min(duration, targetTime)));
      }
    };

    const handleMouseUp = () => {
      setDragMode(null);
    };

    const handleBlur = () => {
      setDragMode(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('pointerup', handleMouseUp);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('pointerup', handleMouseUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [dragMode, duration, onSeek, onSetPointA, onSetPointB, abLoop.point_a, abLoop.point_b]);

  const handleTrackMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0 || !barRef.current || duration <= 0) return;
    const rect = barRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(ratio * duration);
    setDragMode('seek');
  };

  const handleMarkerAMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.button !== 0) return;
    setDragMode('pointA');
  };

  const handleMarkerBMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.button !== 0) return;
    setDragMode('pointB');
  };

  const currentPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const aPercent = abLoop.point_a !== null && duration > 0 ? (abLoop.point_a / duration) * 100 : null;
  const bPercent = abLoop.point_b !== null && duration > 0 ? (abLoop.point_b / duration) * 100 : null;

  if (isMiniPip) {
    return (
      <div
        ref={barRef}
        onMouseDown={handleTrackMouseDown}
        className="w-full h-1 bg-slate-800/80 cursor-pointer relative overflow-hidden"
      >
        <div
          className="h-full bg-cyan-400 transition-all duration-75"
          style={{ width: `${currentPercent}%` }}
        />
      </div>
    );
  }

  return (
    <div className="w-full flex items-center gap-3 select-none px-1">
      {/* Current Time Display */}
      <span className="text-xs font-mono font-medium text-slate-300 min-w-[42px] text-right">
        {formatTime(currentTime)}
      </span>

      {/* Progress Track */}
      <div
        ref={barRef}
        onMouseDown={handleTrackMouseDown}
        className="flex-1 h-6 flex items-center cursor-pointer group relative"
      >
        {/* Background Track */}
        <div className="w-full h-1.5 bg-slate-700/60 rounded-full relative overflow-hidden group-hover:h-2 transition-all">
          {/* Active A-B Loop Highlight Zone */}
          {aPercent !== null && bPercent !== null && (
            <div
              className={`absolute top-0 bottom-0 ${
                abLoop.is_active ? 'bg-cyan-500/40' : 'bg-slate-500/30'
              }`}
              style={{
                left: `${Math.min(aPercent, bPercent)}%`,
                width: `${Math.abs(bPercent - aPercent)}%`,
              }}
            />
          )}

          {/* Current Progress Bar */}
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-75"
            style={{ width: `${currentPercent}%` }}
          />
        </div>

        {/* Marker Point A (Draggable) */}
        {aPercent !== null && (
          <div
            onMouseDown={handleMarkerAMouseDown}
            className="absolute -top-1 -translate-x-1/2 flex flex-col items-center pointer-events-auto z-20 cursor-ew-resize group/marka"
            style={{ left: `${aPercent}%` }}
            title={`Điểm A: ${abLoop.point_a?.toFixed(1)}s (Kéo để điều chỉnh)`}
          >
            <span className="text-[9px] font-bold font-mono px-1 py-0.5 rounded bg-cyan-500 text-slate-950 shadow hover:scale-110 active:scale-95 transition-transform">
              A
            </span>
            <div className="w-0.5 h-3 bg-cyan-400" />
          </div>
        )}

        {/* Marker Point B (Draggable) */}
        {bPercent !== null && (
          <div
            onMouseDown={handleMarkerBMouseDown}
            className="absolute -top-1 -translate-x-1/2 flex flex-col items-center pointer-events-auto z-20 cursor-ew-resize group/markb"
            style={{ left: `${bPercent}%` }}
            title={`Điểm B: ${abLoop.point_b?.toFixed(1)}s (Kéo để điều chỉnh)`}
          >
            <span className="text-[9px] font-bold font-mono px-1 py-0.5 rounded bg-emerald-500 text-slate-950 shadow hover:scale-110 active:scale-95 transition-transform">
              B
            </span>
            <div className="w-0.5 h-3 bg-emerald-400" />
          </div>
        )}

        {/* Current Position Thumb */}
        <div
          className={`absolute w-3.5 h-3.5 bg-white rounded-full shadow-md -translate-x-1/2 transition-opacity pointer-events-none border border-cyan-500 ${
            dragMode === 'seek' ? 'opacity-100 scale-125' : 'opacity-0 group-hover:opacity-100'
          }`}
          style={{ left: `${currentPercent}%` }}
        />
      </div>

      {/* Duration Display */}
      <span className="text-xs font-mono font-medium text-slate-400 min-w-[42px]">
        {formatTime(duration)}
      </span>
    </div>
  );
};
