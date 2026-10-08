import { AppUpdates } from './components/AppUpdates';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  AppSettings,
  LoopFileMode,
} from './types';
import {
  FolderSession,
  SerializedFolderSession,
  GlobalAudioState,
} from './types/session';
import {
  getDirectoryMedia,
  clipboardFiles,
  setAlwaysOnTop,
  openFileDialog,
  openFolderDialog,
  getInitialMediaFile,
  listenOpenMediaFile,
  listenMenuOpenEvents,
  startDragging,
  setWindowDecorations,
  createMediaWindow,
  logFrontend,
} from './services/tauri';
import { t } from './services/i18n';
import { WindowBar } from './components/WindowBar';
import { TabBar } from './components/TabBar';
import { Viewer } from './components/Viewer';
import { Player } from './components/Player';
import { PdfViewer } from './components/PdfViewer';
import { MiniAudioPill } from './components/MiniAudioPill';
import { Sidebar } from './components/Sidebar';
import { ContextMenu } from './components/ContextMenu';
import { SettingsModal, SettingsTabType } from './components/SettingsModal';
import { Toast } from './components/Toast';
import { VolumeOSD } from './components/VolumeOSD';
import { useKeyboardDispatcher } from './hooks/useKeyboardDispatcher';
import { FolderOpen, Folder, PlaySquare } from 'lucide-react';

const DEFAULT_SETTINGS: AppSettings = {
  single_instance: true,
  auto_pin: false,
  hud_hide_delay_ms: 2000,
  theme: 'system',
  language: 'vi',
  seek_short_sec: 1.0,
  seek_long_sec: 5.0,
  ab_loop_crossfade_ms: 45,
  default_loop_file: 'all',
  autoplay_next: true,
  volume: 0.8,
};

function normalizePath(rawPath: string): string {
  return rawPath.replace(/\\/g, '/');
}

export const App: React.FC = () => {
  // 1. Multi-Tab Folder Sessions State
  const [sessions, setSessions] = useState<FolderSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Active Session derived values
  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeSessionId) || null,
    [sessions, activeSessionId]
  );
  const emptyMarkedPaths = useMemo(() => new Set<string>(), []);
  const items = activeSession ? activeSession.items : [];
  const currentIndex = activeSession ? activeSession.currentIndex : 0;
  const markedPaths = activeSession ? activeSession.markedPaths : emptyMarkedPaths;
  const currentItem = items[currentIndex] || null;

  // Window & UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<SettingsTabType>('general');

  const handleOpenAbout = useCallback(() => {
    setSettingsInitialTab('about');
    setIsSettingsOpen(true);
  }, []);

  const [isPinned, setIsPinned] = useState<boolean>(false);
  const [hudVisible, setHudVisible] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isMiniPip, setIsMiniPip] = useState<boolean>(false);
  const [manualHudHidden, setManualHudHidden] = useState<boolean>(false);

  // Settings & Volume
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('media_tool_settings');
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const i18n = useMemo(() => t(settings.language || 'vi'), [settings.language]);

  const [volume, setVolume] = useState<number>(() => {
    try {
      const savedVol = localStorage.getItem('media_tool_volume');
      return savedVol ? Number(savedVol) : 0.8;
    } catch {
      return 0.8;
    }
  });
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volumeOSDVisible, setVolumeOSDVisible] = useState<boolean>(false);
  const [shuffle, setShuffle] = useState<boolean>(false);
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);
  const [loopFileMode, setLoopFileMode] = useState<LoopFileMode>(() => {
    try {
      const savedLoop = localStorage.getItem('media_tool_loop_file');
      if (savedLoop === 'off' || savedLoop === 'single' || savedLoop === 'all') {
        return savedLoop as LoopFileMode;
      }
    } catch {}
    return settings.default_loop_file || 'all';
  });

  // Global Audio Playback (App-Level persistent)
  const sharedAudioRef = useRef<HTMLAudioElement | null>(null);
  const [globalAudio, setGlobalAudio] = useState<GlobalAudioState>({
    isPlaying: false,
    item: null,
    currentTime: 0,
    duration: 0,
    volume,
    isMuted: false,
    originSessionId: null,
  });

  // Context Menu State
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);

  // Timers
  const hudTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const osdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cross-Window Broadcast Channel
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    try {
      const channel = new BroadcastChannel('vxmedia_bus');
      broadcastChannelRef.current = channel;
      channel.onmessage = (event) => {
        const msg = event.data;
        if (!msg || !msg.type) return;
        if (msg.type === 'PAUSE_AUDIO') {
          if (sharedAudioRef.current && !sharedAudioRef.current.paused) {
            sharedAudioRef.current.pause();
          }
        } else if (msg.type === 'AUDIO_STATE_UPDATE') {
          setGlobalAudio(msg.state);
        }
      };
      return () => {
        channel.close();
      };
    } catch {}
  }, []);

  // 2. Adaptive Theme Effect
  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = (isDark: boolean, isBlack: boolean) => {
      root.classList.remove('dark', 'light');
      root.classList.add(isDark ? 'dark' : 'light');
      if (isBlack) {
        root.style.backgroundColor = '#000000';
      } else {
        root.style.backgroundColor = '';
      }
    };

    if (settings.theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mq.matches, false);
      const listener = (e: MediaQueryListEvent) => {
        applyTheme(e.matches, false);
      };
      mq.addEventListener('change', listener);
      return () => mq.removeEventListener('change', listener);
    } else if (settings.theme === 'light') {
      applyTheme(false, false);
    } else if (settings.theme === 'black') {
      applyTheme(true, true);
    } else {
      applyTheme(true, false);
    }
  }, [settings.theme]);

  // Load target file or directory into a FolderSession
  const handleLoadPath = useCallback(async (targetPath: string) => {
    logFrontend(`handleLoadPath invoking getDirectoryMedia with path: ${targetPath}`);
    try {
      const res = await getDirectoryMedia(targetPath);
      logFrontend(`getDirectoryMedia result: items count=${res?.items?.length ?? 0}, current_index=${res?.current_index ?? -1}`);
      if (!res || res.items.length === 0) return;

      const normTarget = normalizePath(targetPath);
      const folderPath = normalizePath(res.parent_dir);
      const folderName = folderPath.split('/').filter(Boolean).pop() || 'Folder';

      setSessions((prev) => {
        // Rule 1: Same Folder -> Reuse Tab & Navigate!
        const existingIdx = prev.findIndex((s) => s.folderPath.toLowerCase() === folderPath.toLowerCase());
        if (existingIdx !== -1) {
          const updated = [...prev];
          const session = updated[existingIdx];
          const targetIndex = session.items.findIndex(
            (it) => normalizePath(it.path).toLowerCase() === normTarget.toLowerCase()
          );
          const nextIndex = targetIndex !== -1 ? targetIndex : (res.current_index >= 0 ? res.current_index : session.currentIndex);
          updated[existingIdx] = {
            ...session,
            currentIndex: nextIndex,
          };
          setActiveSessionId(session.id);
          return updated;
        }

        // Rule 2: Different Folder -> Create New FolderSession & Tab!
        const newSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
        const newSession: FolderSession = {
          id: newSessionId,
          folderPath,
          folderName,
          items: res.items,
          currentIndex: res.current_index >= 0 ? res.current_index : 0,
          markedPaths: new Set(),
        };
        setActiveSessionId(newSessionId);
        return [...prev, newSession];
      });
    } catch (e) {
      logFrontend(`handleLoadPath failed: ${e}`);
      console.warn('Failed to load media path:', e);
    }
  }, []);

  const handleOpenFile = useCallback(async () => {
    const filePath = await openFileDialog();
    if (filePath) {
      await handleLoadPath(filePath);
    }
  }, [handleLoadPath]);

  const handleOpenFolder = useCallback(async () => {
    const folderPath = await openFolderDialog();
    if (folderPath) {
      await handleLoadPath(folderPath);
    }
  }, [handleLoadPath]);

  // Drag & drop file / folder into window
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        const filePath = (file as unknown as { path?: string }).path;
        if (filePath) {
          await handleLoadPath(filePath);
        }
      }
    },
    [handleLoadPath]
  );

  // Tab Bar Actions
  const handleSelectTab = useCallback((sessionId: string) => {
    setActiveSessionId(sessionId);
  }, []);

  const handleCloseTab = useCallback((sessionId: string) => {
    setSessions((prev) => {
      const idx = prev.findIndex((s) => s.id === sessionId);
      const filtered = prev.filter((s) => s.id !== sessionId);
      if (activeSessionId === sessionId) {
        if (filtered.length > 0) {
          const nextIdx = Math.min(idx, filtered.length - 1);
          setActiveSessionId(filtered[nextIdx].id);
        } else {
          setActiveSessionId(null);
        }
      }
      return filtered;
    });
  }, [activeSessionId]);

  const handleCloseOtherTabs = useCallback((sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id === sessionId));
    setActiveSessionId(sessionId);
  }, []);

  const handleMoveTabToNewWindow = useCallback(async (sessionId: string) => {
    const sessionToMove = sessions.find((s) => s.id === sessionId);
    if (!sessionToMove) return;

    const winLabel = 'win_' + Date.now();
    const serialized: SerializedFolderSession = {
      ...sessionToMove,
      markedPaths: Array.from(sessionToMove.markedPaths),
    };

    try {
      localStorage.setItem('vxmedia_transfer_' + winLabel, JSON.stringify(serialized));
    } catch (e) {
      console.warn('Failed to save session for new window transfer:', e);
      return;
    }

    try {
      // Open new Tauri window
      await createMediaWindow(winLabel, sessionToMove.folderName);
      // Remove from current window only after new window is created
      handleCloseTab(sessionId);
    } catch (err) {
      console.error('Failed to create new media window:', err);
      localStorage.removeItem('vxmedia_transfer_' + winLabel);
    }
  }, [sessions, handleCloseTab]);

  // Initial Mount: Detect if this is a Secondary Window with transferred session OR Main Window cold start
  useEffect(() => {
    logFrontend('App mounted. Checking window parameters.');

    const params = new URLSearchParams(window.location.search);
    const winParam = params.get('win');

    if (winParam) {
      const transferKey = 'vxmedia_transfer_' + winParam;
      const transferJson = localStorage.getItem(transferKey);
      if (transferJson) {
        try {
          const data: SerializedFolderSession = JSON.parse(transferJson);
          localStorage.removeItem(transferKey);
          const restoredSession: FolderSession = {
            ...data,
            markedPaths: new Set(data.markedPaths || []),
          };
          setSessions([restoredSession]);
          setActiveSessionId(restoredSession.id);
          logFrontend(`Secondary window restored session: ${restoredSession.folderName}`);
        } catch (e) {
          console.warn('Failed to parse transferred session:', e);
        }
      }
    }

    // Main Window: Normal discovery
    let initialPollDone = false;
    let retryTimer: ReturnType<typeof setInterval> | null = null;

    if (!winParam) {
      getInitialMediaFile().then((initialPath) => {
        logFrontend(`getInitialMediaFile (pass 1) returned: ${initialPath}`);
        if (initialPath) {
          initialPollDone = true;
          handleLoadPath(initialPath);
        } else {
          let retryCount = 0;
          retryTimer = setInterval(() => {
            if (initialPollDone || retryCount >= 6) {
              if (retryTimer) clearInterval(retryTimer);
              return;
            }
            retryCount++;
            getInitialMediaFile().then((retryPath) => {
              logFrontend(`getInitialMediaFile (pass ${retryCount + 1}) returned: ${retryPath}`);
              if (retryPath && !initialPollDone) {
                initialPollDone = true;
                if (retryTimer) clearInterval(retryTimer);
                handleLoadPath(retryPath);
              }
            });
          }, 120);
        }
      });
    }

    const unlistenFilePromise = listenOpenMediaFile((filePath) => {
      logFrontend(`listenOpenMediaFile event received: ${filePath}`);
      initialPollDone = true;
      if (retryTimer) clearInterval(retryTimer);
      handleLoadPath(filePath);
    });

    const unlistenMenuPromise = listenMenuOpenEvents(
      () => { handleOpenFile(); },
      () => { handleOpenFolder(); }
    );

    if (settings.auto_pin) {
      setAlwaysOnTop(true).then(setIsPinned);
    }

    return () => {
      if (retryTimer) clearInterval(retryTimer);
      unlistenFilePromise.then((fn) => fn());
      unlistenMenuPromise.then((fn) => fn());
    };
  }, [settings.auto_pin, handleLoadPath, handleOpenFile, handleOpenFolder]);

  // Mini PiP Breakpoint Listener (< 500px width or < 320px height)
  useEffect(() => {
    const checkMiniPip = () => {
      const isMini = window.innerWidth < 500 || window.innerHeight < 320;
      setIsMiniPip(isMini);
    };

    checkMiniPip();
    window.addEventListener('resize', checkMiniPip);
    return () => window.removeEventListener('resize', checkMiniPip);
  }, []);

  // Window Decorations based on Mini PiP mode
  useEffect(() => {
    setWindowDecorations(!isMiniPip);
    return () => {
      setWindowDecorations(true);
    };
  }, [isMiniPip]);

  const isAutoHide = isMiniPip || settings.hud_hide_delay_ms > 0;

  useEffect(() => {
    if (settings.hud_hide_delay_ms > 0) {
      setManualHudHidden(false);
    }
  }, [settings.hud_hide_delay_ms]);

  // Auto-Hide HUD Logic
  const resetHudTimer = useCallback(() => {
    if (!isAutoHide) {
      if (!manualHudHidden) {
        setHudVisible(true);
      }
      return;
    }

    setHudVisible(true);
    if (hudTimerRef.current) clearTimeout(hudTimerRef.current);

    const delay = isMiniPip ? 1000 : settings.hud_hide_delay_ms;
    if (delay > 0) {
      hudTimerRef.current = setTimeout(() => {
        if (!contextMenuPos && !isSettingsOpen) {
          setHudVisible(false);
        }
      }, delay);
    }
  }, [isAutoHide, isMiniPip, settings.hud_hide_delay_ms, manualHudHidden, contextMenuPos, isSettingsOpen]);

  useEffect(() => {
    const onUserActivity = () => {
      resetHudTimer();
    };

    window.addEventListener('mousemove', onUserActivity);
    window.addEventListener('mousedown', onUserActivity);
    return () => {
      window.removeEventListener('mousemove', onUserActivity);
      window.removeEventListener('mousedown', onUserActivity);
    };
  }, [resetHudTimer]);

  // Toast Feedback Helper
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2000);
  }, []);

  const handleToggleHud = useCallback(() => {
    if (isAutoHide) {
      showToast(
        settings.language === 'vi'
          ? 'Đang bật tự động ẩn HUD (Cài đặt)'
          : 'HUD auto-hide is enabled (Settings)'
      );
      return;
    }
    setManualHudHidden((prev) => {
      const next = !prev;
      setHudVisible(!next);
      return next;
    });
  }, [isAutoHide, settings.language, showToast]);

  // Navigation: Prev / Next
  const handleNext = useCallback(() => {
    if (items.length === 0 || !activeSessionId) return;
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== activeSessionId) return s;
        let nextIdx: number;
        if (shuffle && shuffledIndices.length === s.items.length) {
          const currentPos = shuffledIndices.indexOf(s.currentIndex);
          const nextPos = (currentPos + 1) % shuffledIndices.length;
          nextIdx = shuffledIndices[nextPos];
        } else {
          nextIdx = (s.currentIndex + 1) % s.items.length;
        }
        return { ...s, currentIndex: nextIdx };
      })
    );
  }, [items.length, activeSessionId, shuffle, shuffledIndices]);

  const handlePrev = useCallback(() => {
    if (items.length === 0 || !activeSessionId) return;
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== activeSessionId) return s;
        let prevIdx: number;
        if (shuffle && shuffledIndices.length === s.items.length) {
          const currentPos = shuffledIndices.indexOf(s.currentIndex);
          const prevPos = (currentPos - 1 + shuffledIndices.length) % shuffledIndices.length;
          prevIdx = shuffledIndices[prevPos];
        } else {
          prevIdx = (s.currentIndex - 1 + s.items.length) % s.items.length;
        }
        return { ...s, currentIndex: prevIdx };
      })
    );
  }, [items.length, activeSessionId, shuffle, shuffledIndices]);

  // Mark / Unmark
  const isCurrentMarked = currentItem ? markedPaths.has(currentItem.path) : false;

  const handleToggleMark = useCallback(() => {
    if (!currentItem || !activeSessionId) return;
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== activeSessionId) return s;
        const nextMarked = new Set(s.markedPaths);
        if (nextMarked.has(currentItem.path)) {
          nextMarked.delete(currentItem.path);
        } else {
          nextMarked.add(currentItem.path);
        }
        return { ...s, markedPaths: nextMarked };
      })
    );
  }, [currentItem, activeSessionId]);

  // Copy / Cut Actions
  const handleCopyCurrent = useCallback(() => {
    if (!currentItem) return;
    clipboardFiles([currentItem.path], false).then(() => {
      showToast(i18n.toast_copied_current);
    });
  }, [currentItem, showToast, i18n]);

  const handleCopyMarked = useCallback(() => {
    const paths = Array.from(markedPaths);
    if (paths.length === 0) return;
    clipboardFiles(paths, false).then(() => {
      showToast(i18n.toast_copied_n(paths.length));
    });
  }, [markedPaths, showToast, i18n]);

  const handleCutMarked = useCallback(() => {
    const paths = Array.from(markedPaths);
    if (paths.length === 0) return;
    clipboardFiles(paths, true).then(() => {
      showToast(i18n.toast_cut_n(paths.length));
    });
  }, [markedPaths, showToast, i18n]);

  // Volume Control with OSD
  const handleVolumeChange = useCallback((newVol: number) => {
    const clamped = Math.max(0, Math.min(1, newVol));
    setVolume(clamped);
    setIsMuted(false);
    localStorage.setItem('media_tool_volume', clamped.toFixed(2));

    if (sharedAudioRef.current) {
      sharedAudioRef.current.volume = clamped;
      sharedAudioRef.current.muted = false;
    }

    setVolumeOSDVisible(true);
    if (osdTimerRef.current) clearTimeout(osdTimerRef.current);
    osdTimerRef.current = setTimeout(() => {
      setVolumeOSDVisible(false);
    }, 1000);
  }, []);

  const handleVolumeDelta = useCallback(
    (delta: number) => {
      handleVolumeChange(volume + delta);
    },
    [volume, handleVolumeChange]
  );

  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (sharedAudioRef.current) {
        sharedAudioRef.current.muted = next;
      }
      setVolumeOSDVisible(true);
      if (osdTimerRef.current) clearTimeout(osdTimerRef.current);
      osdTimerRef.current = setTimeout(() => setVolumeOSDVisible(false), 1000);
      return next;
    });
  }, []);

  // Shuffle & Loop Modes
  const handleToggleShuffle = useCallback(() => {
    setShuffle((prev) => {
      const next = !prev;
      if (next && items.length > 0) {
        const arr = Array.from({ length: items.length }, (_, i) => i);
        arr.splice(currentIndex, 1);
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        setShuffledIndices([currentIndex, ...arr]);
      }
      return next;
    });
  }, [items.length, currentIndex]);

  const handleCycleLoopFile = useCallback(() => {
    setLoopFileMode((prev) => {
      let next: LoopFileMode;
      if (prev === 'off') next = 'single';
      else if (prev === 'single') next = 'all';
      else next = 'off';

      try {
        localStorage.setItem('media_tool_loop_file', next);
      } catch {}
      return next;
    });
  }, []);

  // Pin on Top & Fullscreen
  const handleTogglePin = useCallback(() => {
    setAlwaysOnTop(!isPinned).then(setIsPinned);
  }, [isPinned]);

  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.warn);
    } else {
      document.exitFullscreen().catch(console.warn);
    }
  }, []);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPos({ x: e.clientX, y: e.clientY });
  };

  // Keyboard Dispatcher
  useKeyboardDispatcher({
    mediaType: currentItem?.media_type || 'image',
    isSettingsOpen,
    onPrev: handlePrev,
    onNext: handleNext,
    onTogglePlay: () => {
      if (currentItem?.media_type === 'audio' || currentItem?.media_type === 'video') {
        window.dispatchEvent(new CustomEvent('player:toggle-play'));
      } else if (globalAudio.isPlaying) {
        // In Viewer, toggle background audio
        if (sharedAudioRef.current) {
          if (sharedAudioRef.current.paused) {
            sharedAudioRef.current.play().catch(console.warn);
          } else {
            sharedAudioRef.current.pause();
          }
        }
      }
    },
    onSeekRelative: (seconds) => {
      window.dispatchEvent(new CustomEvent('player:seek-relative', { detail: { seconds } }));
    },
    onSeekPercent: (percent) => {
      window.dispatchEvent(new CustomEvent('player:seek-percent', { detail: { percent } }));
    },
    onToggleMark: handleToggleMark,
    onCopyCurrent: handleCopyCurrent,
    onCopyMarked: handleCopyMarked,
    onCutMarked: handleCutMarked,
    onSetPointA: () => {
      window.dispatchEvent(new CustomEvent('player:set-point-a'));
    },
    onSetPointB: () => {
      window.dispatchEvent(new CustomEvent('player:set-point-b'));
    },
    onToggleABLoop: () => {
      window.dispatchEvent(new CustomEvent('player:toggle-ab-loop'));
    },
    onToggleShuffle: handleToggleShuffle,
    onCycleLoopFile: handleCycleLoopFile,
    onVolumeDelta: handleVolumeDelta,
    onToggleMute: handleToggleMute,
    onTogglePin: handleTogglePin,
    onToggleSidebar: () => setIsSidebarOpen((prev) => !prev),
    onToggleHud: handleToggleHud,
    onToggleFullscreen: handleToggleFullscreen,
    onOpenSettings: () => {
      setSettingsInitialTab('general');
      setIsSettingsOpen((prev) => !prev);
    },
    onOpenAbout: handleOpenAbout,
    onOpenFile: handleOpenFile,
    onOpenFolder: handleOpenFolder,
  });

  // Track Global Audio Element Events
  const handleAudioPlay = () => {
    setGlobalAudio((prev) => {
      const next = {
        ...prev,
        isPlaying: true,
        item: currentItem?.media_type === 'audio' ? currentItem : prev.item,
        originSessionId: activeSessionId || prev.originSessionId,
      };
      broadcastChannelRef.current?.postMessage({ type: 'AUDIO_STATE_UPDATE', state: next });
      return next;
    });
  };

  const handleAudioPause = () => {
    setGlobalAudio((prev) => {
      const next = { ...prev, isPlaying: false };
      broadcastChannelRef.current?.postMessage({ type: 'AUDIO_STATE_UPDATE', state: next });
      return next;
    });
  };

  const handleAudioTimeUpdate = () => {
    if (sharedAudioRef.current) {
      setGlobalAudio((prev) => ({
        ...prev,
        currentTime: sharedAudioRef.current?.currentTime || 0,
        duration: sharedAudioRef.current?.duration || 0,
      }));
    }
  };

  const handleAudioNext = useCallback(() => {
    const targetSessionId = globalAudio.originSessionId;
    if (targetSessionId) {
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== targetSessionId || s.items.length === 0) return s;
          const nextIdx = (s.currentIndex + 1) % s.items.length;
          return { ...s, currentIndex: nextIdx };
        })
      );
    } else {
      handleNext();
    }
  }, [globalAudio.originSessionId, handleNext]);

  const handleAudioEnded = () => {
    if (loopFileMode === 'single') {
      if (sharedAudioRef.current) {
        sharedAudioRef.current.currentTime = 0;
        sharedAudioRef.current.play().catch(console.warn);
      }
    } else if (loopFileMode === 'all') {
      handleAudioNext();
    } else {
      setGlobalAudio((prev) => ({ ...prev, isPlaying: false }));
    }
  };

  return (
    <div
      onContextMenu={handleContextMenu}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`w-screen h-screen relative overflow-hidden select-none transition-colors duration-200 ${
        settings.theme === 'black'
          ? 'bg-black text-slate-100'
          : 'bg-transparent text-slate-900 dark:text-slate-100'
      }`}
    >
      {/* Persistent App-Level Audio Element */}
      <audio
        ref={sharedAudioRef}
        onPlay={handleAudioPlay}
        onPause={handleAudioPause}
        onTimeUpdate={handleAudioTimeUpdate}
        onEnded={handleAudioEnded}
        className="hidden"
      />

      {/* Unified Window Bar with Tab Bar */}
      <WindowBar
        isPinned={isPinned}
        onTogglePin={handleTogglePin}
        hudVisible={hudVisible}
        onToggleHud={handleToggleHud}
        isAutoHide={isAutoHide}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        onOpenSettings={() => {
          setSettingsInitialTab('general');
          setIsSettingsOpen(true);
        }}
        onOpenFile={handleOpenFile}
        onOpenFolder={handleOpenFolder}
        isMiniPip={isMiniPip}
        language={settings.language || 'vi'}
        tabBarContent={
          sessions.length > 0 ? (
            <TabBar
              sessions={sessions}
              activeSessionId={activeSessionId}
              onSelectTab={handleSelectTab}
              onCloseTab={handleCloseTab}
              onCloseOtherTabs={handleCloseOtherTabs}
              onMoveTabToNewWindow={handleMoveTabToNewWindow}
              onNewTab={handleOpenFolder}
            />
          ) : undefined
        }
      />

      {/* Permanent Top Window Drag Strip active even when HUD is hidden */}
      <div
        data-tauri-drag-region
        onMouseDown={(e) => {
          if (e.button === 0 && !(e.target as HTMLElement).closest('button, input, select, textarea, [role="button"]')) {
            startDragging();
          }
        }}
        className="absolute top-0 left-0 w-full h-10 z-20 pointer-events-auto"
      />

      {/* Main Viewport: Hot-swap between Viewer and Player */}
      {currentItem && currentItem.media_type === 'image' ? (
        <>
          <Viewer
            item={currentItem}
            currentIndex={currentIndex}
            totalCount={items.length}
            isMarked={isCurrentMarked}
            markedCount={markedPaths.size}
            hudVisible={hudVisible}
            language={settings.language || 'vi'}
            isMiniPip={isMiniPip}
            onPrev={handlePrev}
            onNext={handleNext}
            onToggleMark={handleToggleMark}
            onCopyMarked={handleCopyMarked}
            onCutMarked={handleCutMarked}
            onToggleFullscreen={handleToggleFullscreen}
          />
          {/* Mini Audio Pill when browsing images with background music loaded */}
          {globalAudio.item && activeSession?.id !== globalAudio.originSessionId && (
            <MiniAudioPill
              isPlaying={globalAudio.isPlaying}
              item={globalAudio.item}
              currentTime={globalAudio.currentTime}
              duration={globalAudio.duration}
              onTogglePlay={() => {
                if (sharedAudioRef.current) {
                  if (sharedAudioRef.current.paused) {
                    sharedAudioRef.current.play().catch(console.warn);
                  } else {
                    sharedAudioRef.current.pause();
                  }
                }
              }}
              onNextTrack={handleAudioNext}
              onJumpToAudioSession={() => {
                if (globalAudio.originSessionId) {
                  setActiveSessionId(globalAudio.originSessionId);
                }
              }}
            />
          )}
        </>
      ) : currentItem && currentItem.media_type === 'pdf' ? (
        <>
          <PdfViewer
            item={currentItem}
            currentIndex={currentIndex}
            totalCount={items.length}
            hudVisible={hudVisible}
            language={settings.language || 'vi'}
            isMiniPip={isMiniPip}
            onPrev={handlePrev}
            onNext={handleNext}
          />
          {/* Mini Audio Pill when reading PDF with background music loaded */}
          {globalAudio.item && activeSession?.id !== globalAudio.originSessionId && (
            <MiniAudioPill
              isPlaying={globalAudio.isPlaying}
              item={globalAudio.item}
              currentTime={globalAudio.currentTime}
              duration={globalAudio.duration}
              onTogglePlay={() => {
                if (sharedAudioRef.current) {
                  if (sharedAudioRef.current.paused) {
                    sharedAudioRef.current.play().catch(console.warn);
                  } else {
                    sharedAudioRef.current.pause();
                  }
                }
              }}
              onNextTrack={handleAudioNext}
              onJumpToAudioSession={() => {
                if (globalAudio.originSessionId) {
                  setActiveSessionId(globalAudio.originSessionId);
                }
              }}
            />
          )}
        </>
      ) : currentItem ? (
        <Player
          item={currentItem}
          currentIndex={currentIndex}
          totalCount={items.length}
          isMarked={isCurrentMarked}
          markedCount={markedPaths.size}
          hudVisible={hudVisible}
          volume={volume}
          isMuted={isMuted}
          shuffle={shuffle}
          loopFileMode={loopFileMode}
          seekShortSec={settings.seek_short_sec}
          seekLongSec={settings.seek_long_sec}
          abLoopCrossfadeMs={settings.ab_loop_crossfade_ms}
          isMiniPip={isMiniPip}
          language={settings.language || 'vi'}
          onPrev={handlePrev}
          onNext={handleNext}
          onToggleMark={handleToggleMark}
          onCopyMarked={handleCopyMarked}
          onCutMarked={handleCutMarked}
          onVolumeChange={handleVolumeChange}
          onToggleMute={handleToggleMute}
          onToggleShuffle={handleToggleShuffle}
          onCycleLoopFile={handleCycleLoopFile}
          onToggleFullscreen={handleToggleFullscreen}
          sharedAudioRef={sharedAudioRef}
        />
      ) : (
        <div
          data-tauri-drag-region
          className="w-full h-full flex flex-col items-center justify-center gap-4 text-center px-6 select-none bg-slate-950/40"
        >
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shadow-lg backdrop-blur-sm">
            <PlaySquare className="w-8 h-8 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold tracking-wide text-slate-800 dark:text-slate-100">
              {i18n.app_title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
              {i18n.drag_drop_hint}
            </p>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <button
              onClick={handleOpenFile}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium shadow-md transition-all active:scale-95"
            >
              <FolderOpen className="w-4 h-4" />
              <span>{i18n.open_file}</span>
            </button>
            <button
              onClick={handleOpenFolder}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 hover:text-white text-xs font-medium transition-all active:scale-95"
            >
              <Folder className="w-4 h-4 text-amber-400" />
              <span>{i18n.open_folder}</span>
            </button>
          </div>
        </div>
      )}

      {/* Right Drawer: File List */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        items={items}
        currentIndex={currentIndex}
        markedPaths={markedPaths}
        language={settings.language || 'vi'}
        onSelectItem={(idx) => {
          if (!activeSessionId) return;
          setSessions((prev) =>
            prev.map((s) => (s.id === activeSessionId ? { ...s, currentIndex: idx } : s))
          );
          setIsSidebarOpen(false);
        }}
      />

      {/* Toast Notification */}
      <Toast message={toastMessage} />

      {/* Volume OSD */}
      <VolumeOSD volume={volume} isMuted={isMuted} visible={volumeOSDVisible} />

      {/* Context Menu on Right Click */}
      {contextMenuPos && (
        <ContextMenu
          x={contextMenuPos.x}
          y={contextMenuPos.y}
          currentItem={currentItem}
          isMarked={isCurrentMarked}
          markedCount={markedPaths.size}
          isPlaying={globalAudio.isPlaying}
          isPinned={isPinned}
          language={settings.language || 'vi'}
          onClose={() => setContextMenuPos(null)}
          onToggleMark={handleToggleMark}
          onCopyCurrent={handleCopyCurrent}
          onCopyMarked={handleCopyMarked}
          onCutMarked={handleCutMarked}
          onTogglePlay={() => {
            if (currentItem?.media_type === 'audio' || currentItem?.media_type === 'video') {
              window.dispatchEvent(new CustomEvent('player:toggle-play'));
            } else if (sharedAudioRef.current) {
              if (sharedAudioRef.current.paused) {
                sharedAudioRef.current.play().catch(console.warn);
              } else {
                sharedAudioRef.current.pause();
              }
            }
          }}
          onRotateImage={() => window.dispatchEvent(new CustomEvent('viewer:rotate'))}
          onFlipImage={() => window.dispatchEvent(new CustomEvent('viewer:flip-h'))}
          onTogglePin={handleTogglePin}
          onToggleHud={handleToggleHud}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          onToggleFullscreen={handleToggleFullscreen}
          onOpenSettings={() => {
            setSettingsInitialTab('general');
            setIsSettingsOpen(true);
          }}
          onOpenAbout={handleOpenAbout}
        />
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        initialTab={settingsInitialTab}
        settings={settings}
        language={settings.language || 'vi'}
        onSaveSettings={(newSettings) => {
          setSettings(newSettings);
          localStorage.setItem('media_tool_settings', JSON.stringify(newSettings));
          if (newSettings.default_loop_file) {
            setLoopFileMode(newSettings.default_loop_file);
            try {
              localStorage.setItem('media_tool_loop_file', newSettings.default_loop_file);
            } catch {}
          }
        }}
        onClose={() => {
          setIsSettingsOpen(false);
          setSettingsInitialTab('general');
        }}
      />
      <AppUpdates language={settings.language || 'vi'} notice />
    </div>
  );
};
