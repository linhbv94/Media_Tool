import { useEffect } from 'react';
import { MediaType } from '../types';

interface KeyboardDispatcherProps {
  mediaType: MediaType;
  isSettingsOpen: boolean;
  onPrev: () => void;
  onNext: () => void;
  onTogglePlay: () => void;
  onSeekRelative: (seconds: number) => void;
  onSeekPercent: (percent: number) => void;
  onToggleMark: () => void;
  onCopyCurrent: () => void;
  onCopyMarked: () => void;
  onCutMarked: () => void;
  onSetPointA: () => void;
  onSetPointB: () => void;
  onToggleABLoop: () => void;
  onToggleShuffle: () => void;
  onCycleLoopFile: () => void;
  onVolumeDelta: (delta: number) => void;
  onToggleMute: () => void;
  onTogglePin: () => void;
  onToggleSidebar: () => void;
  onToggleHud: () => void;
  onToggleFullscreen: () => void;
  onOpenSettings: () => void;
  onOpenFile?: () => void;
  onOpenFolder?: () => void;
}

export function useKeyboardDispatcher({
  mediaType,
  isSettingsOpen,
  onPrev,
  onNext,
  onTogglePlay,
  onSeekRelative,
  onSeekPercent,
  onToggleMark,
  onCopyCurrent,
  onCopyMarked,
  onCutMarked,
  onSetPointA,
  onSetPointB,
  onToggleABLoop,
  onToggleShuffle,
  onCycleLoopFile,
  onVolumeDelta,
  onToggleMute,
  onTogglePin,
  onToggleSidebar,
  onToggleHud,
  onToggleFullscreen,
  onOpenSettings,
  onOpenFile,
  onOpenFolder,
}: KeyboardDispatcherProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. INPUT FOCUS GUARD: If typing in input/select or settings modal is open, lock shortcuts
      const activeEl = document.activeElement;
      const isInputFocused =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.tagName === 'SELECT');

      if (isInputFocused) {
        return;
      }

      // If Settings Modal is open, only allow Escape or Cmd+, to close
      if (isSettingsOpen) {
        if (e.key === 'Escape' || ((e.metaKey || e.ctrlKey) && e.key === ',')) {
          e.preventDefault();
          onOpenSettings();
        }
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // OPEN FILE: Cmd+O / Ctrl+O
      if (isCmdOrCtrl && !e.shiftKey && (e.key === 'o' || e.key === 'O')) {
        e.preventDefault();
        onOpenFile?.();
        return;
      }

      // OPEN FOLDER: Cmd+Shift+O / Ctrl+Shift+O
      if (isCmdOrCtrl && e.shiftKey && (e.key === 'o' || e.key === 'O')) {
        e.preventDefault();
        onOpenFolder?.();
        return;
      }

      // 2. SETTINGS: Cmd + , or Ctrl + ,
      if (isCmdOrCtrl && e.key === ',') {
        e.preventDefault();
        onOpenSettings();
        return;
      }

      // 3. COPY / CUT HOTKEYS
      if (isCmdOrCtrl && e.shiftKey && (e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
        onCopyMarked();
        return;
      }
      if (isCmdOrCtrl && e.shiftKey && (e.key === 'X' || e.key === 'x')) {
        e.preventDefault();
        onCutMarked();
        return;
      }
      if (isCmdOrCtrl && !e.shiftKey && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        onCopyCurrent();
        return;
      }

      // 4. FILE PREV / NEXT: Cmd/Ctrl + Left / Right
      if (isCmdOrCtrl && e.key === 'ArrowLeft') {
        e.preventDefault();
        onPrev();
        return;
      }
      if (isCmdOrCtrl && e.key === 'ArrowRight') {
        e.preventDefault();
        onNext();
        return;
      }

      // 5. NAVIGATION / SEEK ARROWS
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (mediaType === 'image') {
          onPrev();
        } else {
          onSeekRelative(e.shiftKey ? -5.0 : -1.0);
        }
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (mediaType === 'image') {
          onNext();
        } else {
          onSeekRelative(e.shiftKey ? 5.0 : 1.0);
        }
        return;
      }

      // 6. PLAY / PAUSE: Space
      if (e.code === 'Space') {
        e.preventDefault();
        if (!e.repeat) {
          onTogglePlay();
        }
        return;
      }

      // 7. TIMELINE NUMBER JUMPS: 0 to 9
      if (!isCmdOrCtrl && !e.shiftKey && e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        const percent = Number(e.key) * 0.1;
        onSeekPercent(percent);
        return;
      }

      // 8. MARK / UNMARK: M (Shift+M is Mute)
      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        if (e.shiftKey) {
          onToggleMute();
        } else {
          onToggleMark();
        }
        return;
      }

      // 9. A-B LOOP HOTKEYS: [ and ] and \
      if (e.key === '[') {
        e.preventDefault();
        onSetPointA();
        return;
      }
      if (e.key === ']') {
        e.preventDefault();
        onSetPointB();
        return;
      }
      if (e.key === '\\') {
        e.preventDefault();
        onToggleABLoop();
        return;
      }

      // 10. SHUFFLE: S
      if (!isCmdOrCtrl && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        onToggleShuffle();
        return;
      }

      // 11. LOOP FILE: L or R
      if (!isCmdOrCtrl && (e.key === 'l' || e.key === 'L' || e.key === 'r' || e.key === 'R')) {
        e.preventDefault();
        onCycleLoopFile();
        return;
      }

      // 12. VOLUME: Arrow Up / Down
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        onVolumeDelta(0.05);
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        onVolumeDelta(-0.05);
        return;
      }

      // 13. PIN ON TOP: P
      if (!isCmdOrCtrl && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        onTogglePin();
        return;
      }

      // 14. SIDEBAR: B
      if (!isCmdOrCtrl && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        onToggleSidebar();
        return;
      }

      // 15. TOGGLE HUD: H
      if (!isCmdOrCtrl && (e.key === 'h' || e.key === 'H')) {
        e.preventDefault();
        onToggleHud();
        return;
      }

      // 16. FULLSCREEN: F or F11
      if (!isCmdOrCtrl && (e.key === 'f' || e.key === 'F' || e.key === 'F11')) {
        e.preventDefault();
        onToggleFullscreen();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    mediaType,
    isSettingsOpen,
    onPrev,
    onNext,
    onTogglePlay,
    onSeekRelative,
    onSeekPercent,
    onToggleMark,
    onCopyCurrent,
    onCopyMarked,
    onCutMarked,
    onSetPointA,
    onSetPointB,
    onToggleABLoop,
    onToggleShuffle,
    onCycleLoopFile,
    onVolumeDelta,
    onToggleMute,
    onTogglePin,
    onToggleSidebar,
    onToggleHud,
    onToggleFullscreen,
    onOpenSettings,
  ]);
}
