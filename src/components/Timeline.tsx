import React, { useRef, useCallback } from 'react';
import { ABLoopState } from '../types';

interface TimelineProps {
  currentTime: number;
  duration: number;
  abLoop: ABLoopState;
  onSeek: (targetTime: number) => void;
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
  isMiniPip = false,
}) => {
  const barRef = useRef<HTMLDivElement>(null);

  const calculateSeekTime = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!barRef.current || duration <= 0) return;
      const rect = barRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, clickX / rect.width));
      onSeek(ratio * duration);
    },
    [duration, onSeek]
  );

  const currentPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const aPercent = abLoop.point_a !== null && duration > 0 ? (abLoop.point_a / duration) * 100 : null;
  const bPercent = abLoop.point_b !== null && duration > 0 ? (abLoop.point_b / duration) * 100 : null;

  if (isMiniPip) {
    return (
      <div
        ref={barRef}
        onClick={calculateSeekTime}
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
        onClick={calculateSeekTime}
        className="flex-1 h-5 flex items-center cursor-pointer group relative"
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

        {/* Marker Point A */}
        {aPercent !== null && (
          <div
            className="absolute -top-1 -translate-x-1/2 flex flex-col items-center pointer-events-none z-10"
            style={{ left: `${aPercent}%` }}
          >
            <span className="text-[9px] font-bold font-mono px-1 py-0.2 rounded bg-cyan-500 text-slate-950 shadow">
              A
            </span>
            <div className="w-0.5 h-3 bg-cyan-400" />
          </div>
        )}

        {/* Marker Point B */}
        {bPercent !== null && (
          <div
            className="absolute -top-1 -translate-x-1/2 flex flex-col items-center pointer-events-none z-10"
            style={{ left: `${bPercent}%` }}
          >
            <span className="text-[9px] font-bold font-mono px-1 py-0.2 rounded bg-emerald-500 text-slate-950 shadow">
              B
            </span>
            <div className="w-0.5 h-3 bg-emerald-400" />
          </div>
        )}

        {/* Current Position Thumb */}
        <div
          className="absolute w-3.5 h-3.5 bg-white rounded-full shadow-md -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-cyan-500"
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
