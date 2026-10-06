import React, { useState, useMemo, useRef, useEffect } from 'react';
import { MediaItem, AppLanguage } from '../types';
import { t } from '../services/i18n';
import { X, Search, Image as ImageIcon, Video, Music, Star, FileText } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: MediaItem[];
  currentIndex: number;
  markedPaths: Set<string>;
  language: AppLanguage;
  onSelectItem: (index: number) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  items,
  currentIndex,
  markedPaths,
  language,
  onSelectItem,
}) => {
  const i18n = t(language);
  const [searchQuery, setSearchQuery] = useState('');
  const currentItemRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return items.map((item, originalIndex) => ({ item, originalIndex }));
    }
    const q = searchQuery.toLowerCase();
    return items
      .map((item, originalIndex) => ({ item, originalIndex }))
      .filter(({ item }) => item.name.toLowerCase().includes(q));
  }, [items, searchQuery]);

  // Click-outside listener: clicking anywhere outside the sidebar (e.g. image/video viewer) closes the sidebar
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: MouseEvent) => {
      if (panelRef.current && panelRef.current.contains(e.target as Node)) {
        return;
      }
      const target = e.target as HTMLElement | null;
      if (target?.closest('[data-toggle-sidebar]')) {
        return;
      }
      onClose();
    };

    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handlePointerDown);
    }, 50);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [isOpen, onClose]);

  // Auto-scroll list to active item when opened or active index changes
  useEffect(() => {
    if (isOpen) {
      // Use setTimeout 50ms to ensure the sidebar transition animation / DOM render is mounted
      const timer = setTimeout(() => {
        if (currentItemRef.current) {
          currentItemRef.current.scrollIntoView({
            block: 'center',
            behavior: 'smooth',
          });
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, currentIndex]);

  if (!isOpen) return null;

  const renderIcon = (type: MediaItem['media_type']) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />;
      case 'video':
        return <Video className="w-4 h-4 text-cyan-500 dark:text-cyan-400 shrink-0" />;
      case 'audio':
        return <Music className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />;
      case 'pdf':
        return <FileText className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0" />;
      default:
        return <ImageIcon className="w-4 h-4 text-slate-400 shrink-0" />;
    }
  };

  return (
    <>
      {/* Invisible backdrop to capture clicks on media / canvas area */}
      <div
        className="fixed inset-0 z-30 bg-transparent"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className="absolute top-0 right-0 bottom-0 w-72 glass-panel border-l border-slate-200 dark:border-white/10 z-40 flex flex-col shadow-2xl transition-transform duration-300 animate-in slide-in-from-right"
      >
      {/* Header */}
      <div className="h-12 px-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50/70 dark:bg-black/20">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-slate-900 dark:text-white">{i18n.file_list}</span>
          <span className="text-xs font-mono text-slate-600 dark:text-slate-400 bg-slate-200/60 dark:bg-white/5 border border-slate-300/60 dark:border-white/10 px-2 py-0.5 rounded-full font-medium">
            {items.length}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Search */}
      <div className="p-3 border-b border-slate-200 dark:border-white/10 bg-white/40 dark:bg-transparent">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 absolute left-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={i18n.quick_filter}
            className="w-full bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors shadow-2xs"
          />
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredItems.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            {i18n.no_files_found}
          </div>
        ) : (
          filteredItems.map(({ item, originalIndex }) => {
            const isCurrent = originalIndex === currentIndex;
            const isMarked = markedPaths.has(item.path);

            return (
              <button
                key={item.path}
                ref={isCurrent ? currentItemRef : undefined}
                onClick={() => onSelectItem(originalIndex)}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-left text-xs transition-colors ${
                  isCurrent
                    ? 'bg-cyan-50 dark:bg-cyan-500/20 text-cyan-900 dark:text-cyan-200 border border-cyan-300 dark:border-cyan-500/30 font-semibold shadow-2xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {renderIcon(item.media_type)}
                  <span className="truncate font-medium">{item.name}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {isMarked && (
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 dark:text-amber-400 dark:fill-amber-400" />
                  )}
                  {isCurrent && (
                    <div className="w-2 h-2 rounded-full bg-cyan-500 dark:bg-cyan-400 shadow-sm shadow-cyan-400/50" />
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
    </>
  );
};
