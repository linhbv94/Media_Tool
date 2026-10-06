import React, { useEffect, useRef } from 'react';
import { MediaItem, AppLanguage } from '../types';
import { t } from '../services/i18n';
import {
  Copy,
  Scissors,
  Star,
  Play,
  RotateCw,
  FlipHorizontal,
  Pin,
  Eye,
  ListFilter,
  Maximize2,
  Settings,
} from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  currentItem: MediaItem | null;
  isMarked: boolean;
  markedCount: number;
  isPlaying: boolean;
  isPinned: boolean;
  language: AppLanguage;
  onClose: () => void;
  onToggleMark: () => void;
  onCopyCurrent: () => void;
  onCopyMarked: () => void;
  onCutMarked: () => void;
  onTogglePlay: () => void;
  onRotateImage?: () => void;
  onFlipImage?: () => void;
  onTogglePin: () => void;
  onToggleHud: () => void;
  onToggleSidebar: () => void;
  onToggleFullscreen: () => void;
  onOpenSettings: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  currentItem,
  isMarked,
  markedCount,
  isPlaying,
  isPinned,
  language,
  onClose,
  onToggleMark,
  onCopyCurrent,
  onCopyMarked,
  onCutMarked,
  onTogglePlay,
  onRotateImage,
  onFlipImage,
  onTogglePin,
  onToggleHud,
  onToggleSidebar,
  onToggleFullscreen,
  onOpenSettings,
}) => {
  const i18n = t(language);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close context menu on click outside or escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!currentItem) return null;

  // Window edge boundary clamping
  const menuWidth = 260;
  const menuHeight = 360;
  const adjustedX = Math.max(10, Math.min(window.innerWidth - menuWidth - 10, x));
  const adjustedY = Math.max(10, Math.min(window.innerHeight - menuHeight - 10, y));

  const isMediaPlayback = currentItem.media_type === 'video' || currentItem.media_type === 'audio';

  return (
    <div
      ref={menuRef}
      style={{ left: adjustedX, top: adjustedY }}
      className="fixed z-50 w-64 glass-dropdown rounded-xl p-1.5 shadow-2xl text-xs divide-y divide-slate-200 dark:divide-white/10 select-none animate-in fade-in zoom-in-95 duration-100"
    >
      {/* File Action Group */}
      <div className="py-1">
        <button
          onClick={() => {
            onCopyCurrent();
            onClose();
          }}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-md text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Copy className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>{language === 'vi' ? 'Sao chép tệp này' : 'Copy this file'}</span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Cmd+C</span>
        </button>

        <button
          onClick={() => {
            onToggleMark();
            onClose();
          }}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-md text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Star
              className={`w-3.5 h-3.5 ${
                isMarked ? 'text-amber-500 fill-amber-500 dark:text-amber-400 dark:fill-amber-400' : 'text-slate-400'
              }`}
            />
            <span>{isMarked ? i18n.marked : i18n.mark}</span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">M</span>
        </button>

        {markedCount > 0 && (
          <>
            <button
              onClick={() => {
                onCopyMarked();
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-md text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Copy className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                <span>{language === 'vi' ? `Sao chép Đã Mark (${markedCount})` : `Copy Marked (${markedCount})`}</span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Cmd+Shift+C</span>
            </button>

            <button
              onClick={() => {
                onCutMarked();
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-md text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Scissors className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                <span>{language === 'vi' ? `Cắt Đã Mark (${markedCount})` : `Cut Marked (${markedCount})`}</span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Cmd+Shift+X</span>
            </button>
          </>
        )}
      </div>

      {/* Playback or Image Group */}
      {isMediaPlayback ? (
        <div className="py-1">
          <button
            onClick={() => {
              onTogglePlay();
              onClose();
            }}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-md text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Play className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>{isPlaying ? i18n.pause : i18n.play}</span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Space</span>
          </button>
        </div>
      ) : (
        <div className="py-1">
          {onRotateImage && (
            <button
              onClick={() => {
                onRotateImage();
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-md text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-2">
                <RotateCw className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{i18n.rotate}</span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">R</span>
            </button>
          )}

          {onFlipImage && (
            <button
              onClick={() => {
                onFlipImage();
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-md text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-2">
                <FlipHorizontal className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{language === 'vi' ? 'Lật ảnh ngang' : 'Flip Horizontal'}</span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">H-Flip</span>
            </button>
          )}
        </div>
      )}

      {/* Window Controls */}
      <div className="py-1">
        <button
          onClick={() => {
            onTogglePin();
            onClose();
          }}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-md text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Pin className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>{isPinned ? i18n.pinned : i18n.pin}</span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">P</span>
        </button>

        <button
          onClick={() => {
            onToggleHud();
            onClose();
          }}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-md text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Eye className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>{language === 'vi' ? 'Ẩn / Hiện HUD' : 'Toggle HUD'}</span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">H</span>
        </button>

        <button
          onClick={() => {
            onToggleSidebar();
            onClose();
          }}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-md text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
        >
          <div className="flex items-center gap-2">
            <ListFilter className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>{i18n.file_list}</span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">B</span>
        </button>

        <button
          onClick={() => {
            onToggleFullscreen();
            onClose();
          }}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-md text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Maximize2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>{i18n.fullscreen}</span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">F</span>
        </button>
      </div>

      {/* Settings */}
      <div className="py-1">
        <button
          onClick={() => {
            onOpenSettings();
            onClose();
          }}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-md text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Settings className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            <span>{language === 'vi' ? 'Cài đặt...' : 'Settings...'}</span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Cmd+,</span>
        </button>
      </div>
    </div>
  );
};
