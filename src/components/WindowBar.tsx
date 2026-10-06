import React from 'react';
import { Pin, Eye, EyeOff, ListFilter, Settings, FolderOpen, Folder, X } from 'lucide-react';
import { AppLanguage } from '../types';
import { t } from '../services/i18n';
import { startDragging, closeWindow } from '../services/tauri';

interface WindowBarProps {
  isPinned: boolean;
  onTogglePin: () => void;
  hudVisible: boolean;
  onToggleHud: () => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenSettings: () => void;
  onOpenFile?: () => void;
  onOpenFolder?: () => void;
  language: AppLanguage;
  isMiniPip?: boolean;
  isAutoHide?: boolean;
  tabBarContent?: React.ReactNode;
}

export const WindowBar: React.FC<WindowBarProps> = ({
  isPinned,
  onTogglePin,
  hudVisible,
  onToggleHud,
  isSidebarOpen,
  onToggleSidebar,
  onOpenSettings,
  onOpenFile,
  onOpenFolder,
  language,
  isMiniPip = false,
  isAutoHide = false,
  tabBarContent,
}) => {
  const i18n = t(language);
  const isMac = typeof navigator !== 'undefined' && (/Mac|iPod|iPhone|iPad/.test(navigator.platform) || /Macintosh/.test(navigator.userAgent));

  const handleMouseDown = (e: React.MouseEvent) => {
    if (
      e.button === 0 &&
      !(e.target as HTMLElement).closest(
        'button, input, select, textarea, [role="button"], [role="tab"], [data-no-drag], .tab-bar, .tab-item'
      )
    ) {
      startDragging();
    }
  };

  return (
    <div
      data-tauri-drag-region
      onMouseDown={handleMouseDown}
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      className={`absolute top-0 left-0 w-full ${
        isMiniPip
          ? 'h-7 px-2'
          : isMac
          ? 'h-7 pl-[82px] pr-3'
          : 'h-8 pl-3 pr-3'
      } flex items-center justify-between z-40 transition-opacity duration-200 select-none bg-gradient-to-b from-black/80 via-black/45 to-transparent ${
        hudVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Left: App Name, Tabs, and Quick Open Actions */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-[calc(100%-260px)]">
        {!isMiniPip && (
          <span className="text-xs font-semibold tracking-wider font-mono opacity-90 text-slate-200 flex items-center leading-none shrink-0">
            {i18n.app_title}
          </span>
        )}

        {/* Tab Bar Content */}
        {!isMiniPip && tabBarContent}

        {/* Quick Open File */}
        {onOpenFile && !isMiniPip && !tabBarContent && (
          <button
            onClick={onOpenFile}
            title={i18n.open_file}
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium text-slate-300 hover:text-white hover:bg-white/15 transition-all whitespace-nowrap leading-none shrink-0"
          >
            <FolderOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>{i18n.open_file}</span>
          </button>
        )}

        {/* Quick Open Folder */}
        {onOpenFolder && !isMiniPip && !tabBarContent && (
          <button
            onClick={onOpenFolder}
            title={i18n.open_folder}
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium text-slate-300 hover:text-white hover:bg-white/15 transition-all whitespace-nowrap leading-none shrink-0"
          >
            <Folder className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{i18n.open_folder}</span>
          </button>
        )}
      </div>

      {/* Right: Actions */}
      <div
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        className="flex items-center gap-1"
      >
        {/* Pin on Top Button */}
        <button
          onClick={onTogglePin}
          title={isPinned ? 'Bỏ ghim (P)' : 'Ghim trên cùng (P)'}
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium transition-all leading-none ${
            isPinned
              ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/50 shadow-sm'
              : 'text-slate-200 hover:text-white hover:bg-white/15 border border-transparent'
          }`}
        >
          <Pin className={`w-3.5 h-3.5 ${isPinned ? 'rotate-45 text-cyan-300' : ''}`} />
          {!isMiniPip && <span>{isPinned ? i18n.pinned : i18n.pin}</span>}
        </button>

        {isMiniPip && (
          <button
            onClick={() => closeWindow()}
            title="Đóng cửa sổ"
            className="p-1 rounded text-slate-300 hover:text-white hover:bg-rose-500/80 transition-all leading-none"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {!isMiniPip && (
          <>
            {/* Toggle HUD Button */}
            <button
              onClick={onToggleHud}
              disabled={isAutoHide}
              title={
                isAutoHide
                  ? (language === 'vi' ? 'Đang bật tự động ẩn HUD (Cài đặt)' : 'HUD auto-hide is enabled (Settings)')
                  : (hudVisible ? 'Ẩn HUD (H)' : 'Hiện HUD (H)')
              }
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border border-transparent transition-all leading-none ${
                isAutoHide
                  ? 'opacity-30 cursor-not-allowed text-slate-400'
                  : 'text-slate-200 hover:text-white hover:bg-white/15'
              }`}
            >
              {hudVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{i18n.hud}</span>
            </button>

            {/* Toggle Sidebar Button */}
            <button
              onClick={onToggleSidebar}
              title="Danh sách tệp (B)"
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium transition-all leading-none ${
                isSidebarOpen
                  ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/50 shadow-sm'
                  : 'text-slate-200 hover:text-white hover:bg-white/15 border border-transparent'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>{i18n.folder_list}</span>
            </button>

            {/* Settings Button */}
            <button
              onClick={onOpenSettings}
              title={i18n.settings}
              className="p-1 rounded text-slate-200 hover:text-white hover:bg-white/15 border border-transparent transition-all leading-none"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
