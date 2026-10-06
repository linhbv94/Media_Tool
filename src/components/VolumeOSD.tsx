import React from 'react';
import { Volume2, Volume1, VolumeX } from 'lucide-react';

interface VolumeOSDProps {
  volume: number;
  isMuted: boolean;
  visible: boolean;
}

export const VolumeOSD: React.FC<VolumeOSDProps> = ({ volume, isMuted, visible }) => {
  if (!visible) return null;

  const currentPercent = isMuted ? 0 : Math.round(volume * 100);

  const renderIcon = () => {
    if (isMuted || currentPercent === 0) return <VolumeX className="w-8 h-8 text-rose-400" />;
    if (currentPercent < 50) return <Volume1 className="w-8 h-8 text-cyan-400" />;
    return <Volume2 className="w-8 h-8 text-cyan-400" />;
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none transition-opacity duration-200">
      <div className="glass-panel px-6 py-5 rounded-2xl flex flex-col items-center gap-3 min-w-[180px] shadow-2xl border border-white/10">
        <div className="flex items-center gap-3">
          {renderIcon()}
          <span className="text-2xl font-bold tracking-tight text-slate-100">
            {currentPercent}%
          </span>
        </div>
        {/* Progress Bar */}
        <div className="w-full bg-slate-700/50 h-2 rounded-full overflow-hidden p-0.5 border border-white/5">
          <div
            className={`h-full rounded-full transition-all duration-75 ${
              isMuted ? 'bg-rose-500 w-0' : 'bg-cyan-500'
            }`}
            style={{ width: `${currentPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
