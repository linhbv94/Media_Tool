import React, { useState, useEffect } from 'react';
import { AppSettings, ThemeMode, AppLanguage, LoopFileMode } from '../types';
import { t } from '../services/i18n';
import { X, Sliders, Play, HardDrive, Keyboard, RotateCcw, Info, Sparkles, CheckCircle2 } from 'lucide-react';

export type SettingsTabType = 'general' | 'playback' | 'cache' | 'hotkeys' | 'about';

interface SettingsModalProps {
  isOpen: boolean;
  settings: AppSettings;
  language?: AppLanguage;
  initialTab?: SettingsTabType;
  onSaveSettings: (settings: AppSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  initialTab = 'general',
  onSaveSettings,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTabType>(initialTab);
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [ramFreedNotice, setRamFreedNotice] = useState(false);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const i18n = t(localSettings.language);

  if (!isOpen) return null;

  const handleClearRam = () => {
    setRamFreedNotice(true);
    setTimeout(() => setRamFreedNotice(false), 2000);
  };

  const handleResetDefaults = () => {
    const defaults: AppSettings = {
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
    setLocalSettings(defaults);
    onSaveSettings(defaults);
  };

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const updated = { ...localSettings, [key]: value };
    setLocalSettings(updated);
    onSaveSettings(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white dark:bg-[#141821] rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col text-xs transition-colors duration-200"
      >
        {/* Header */}
        <div className="h-14 px-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50/70 dark:bg-black/20">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-slate-900 dark:text-white">
              {i18n.settings_title}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body: Sidebar + Main Content */}
        <div className="flex min-h-[420px]">
          {/* Tab Sidebar */}
          <div className="w-48 border-r border-slate-200 dark:border-white/10 p-3 space-y-1.5 bg-slate-50/50 dark:bg-black/20">
            <button
              onClick={() => setActiveTab('general')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium text-left transition-all ${
                activeTab === 'general'
                  ? 'bg-cyan-50 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/40 font-semibold shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>{i18n.tab_general}</span>
            </button>

            <button
              onClick={() => setActiveTab('playback')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium text-left transition-all ${
                activeTab === 'playback'
                  ? 'bg-cyan-50 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/40 font-semibold shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Play className="w-4 h-4" />
              <span>{i18n.tab_playback}</span>
            </button>

            <button
              onClick={() => setActiveTab('cache')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium text-left transition-all ${
                activeTab === 'cache'
                  ? 'bg-cyan-50 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/40 font-semibold shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <HardDrive className="w-4 h-4" />
              <span>{i18n.tab_cache}</span>
            </button>

            <button
              onClick={() => setActiveTab('hotkeys')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium text-left transition-all ${
                activeTab === 'hotkeys'
                  ? 'bg-cyan-50 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/40 font-semibold shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Keyboard className="w-4 h-4" />
              <span>{i18n.tab_hotkeys}</span>
            </button>

            <button
              onClick={() => setActiveTab('about')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium text-left transition-all ${
                activeTab === 'about'
                  ? 'bg-cyan-50 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/40 font-semibold shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Info className="w-4 h-4" />
              <span>{i18n.tab_about}</span>
            </button>
          </div>

          {/* Tab Content Panel */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-white dark:bg-[#141821]">
            {/* TAB 1: GENERAL */}
            {activeTab === 'general' && (
              <div className="space-y-5">
                {/* Window & System Behavior */}
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-cyan-700 dark:text-cyan-400 mb-3">
                    {i18n.sec_window_behavior}
                  </h4>
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={localSettings.single_instance}
                        onChange={(e) => updateSetting('single_instance', e.target.checked)}
                        className="mt-0.5 rounded border-slate-300 dark:border-slate-700 text-cyan-600 focus:ring-cyan-500 accent-cyan-600"
                      />
                      <div>
                        <span className="font-medium text-slate-800 dark:text-slate-200 group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors">
                          {i18n.single_instance}
                        </span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {i18n.single_instance_desc}
                        </p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={localSettings.auto_pin}
                        onChange={(e) => updateSetting('auto_pin', e.target.checked)}
                        className="rounded border-slate-300 dark:border-slate-700 text-cyan-600 focus:ring-cyan-500 accent-cyan-600"
                      />
                      <div>
                        <span className="font-medium text-slate-800 dark:text-slate-200 group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors">
                          {i18n.auto_pin}
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* HUD Auto-hide delay */}
                <div className="pt-4 border-t border-slate-200 dark:border-white/10">
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-cyan-700 dark:text-cyan-400 mb-3">
                    {i18n.hud_hide_delay}
                  </h4>
                  <select
                    value={localSettings.hud_hide_delay_ms}
                    onChange={(e) => updateSetting('hud_hide_delay_ms', Number(e.target.value))}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-500 font-medium shadow-2xs"
                  >
                    <option value={1000}>{i18n.hud_1s}</option>
                    <option value={2000}>{i18n.hud_2s}</option>
                    <option value={3000}>{i18n.hud_3s}</option>
                    <option value={0}>{i18n.hud_never}</option>
                  </select>
                </div>

                {/* Theme & Colors (Adaptive OS / Dark / Light / Black) */}
                <div className="pt-4 border-t border-slate-200 dark:border-white/10">
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-cyan-700 dark:text-cyan-400 mb-3">
                    {i18n.sec_theme_colors}
                  </h4>
                  <div className="grid grid-cols-2 gap-2.5">
                    <label
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                        localSettings.theme === 'system'
                          ? 'bg-cyan-50/80 dark:bg-cyan-500/20 border-cyan-500 text-cyan-900 dark:text-cyan-200 shadow-xs ring-1 ring-cyan-500/30'
                          : 'bg-slate-50/70 dark:bg-black/20 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-100/70 dark:hover:bg-white/5'
                      }`}
                    >
                      <input
                        type="radio"
                        name="theme"
                        checked={localSettings.theme === 'system'}
                        onChange={() => updateSetting('theme', 'system' as ThemeMode)}
                        className="text-cyan-600 accent-cyan-600"
                      />
                      <span className="font-medium text-xs">{i18n.theme_system}</span>
                    </label>

                    <label
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                        localSettings.theme === 'dark'
                          ? 'bg-cyan-50/80 dark:bg-cyan-500/20 border-cyan-500 text-cyan-900 dark:text-cyan-200 shadow-xs ring-1 ring-cyan-500/30'
                          : 'bg-slate-50/70 dark:bg-black/20 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-100/70 dark:hover:bg-white/5'
                      }`}
                    >
                      <input
                        type="radio"
                        name="theme"
                        checked={localSettings.theme === 'dark'}
                        onChange={() => updateSetting('theme', 'dark' as ThemeMode)}
                        className="text-cyan-600 accent-cyan-600"
                      />
                      <span className="font-medium text-xs">{i18n.theme_dark}</span>
                    </label>

                    <label
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                        localSettings.theme === 'light'
                          ? 'bg-cyan-50/80 dark:bg-cyan-500/20 border-cyan-500 text-cyan-900 dark:text-cyan-200 shadow-xs ring-1 ring-cyan-500/30'
                          : 'bg-slate-50/70 dark:bg-black/20 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-100/70 dark:hover:bg-white/5'
                      }`}
                    >
                      <input
                        type="radio"
                        name="theme"
                        checked={localSettings.theme === 'light'}
                        onChange={() => updateSetting('theme', 'light' as ThemeMode)}
                        className="text-cyan-600 accent-cyan-600"
                      />
                      <span className="font-medium text-xs">{i18n.theme_light}</span>
                    </label>

                    <label
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                        localSettings.theme === 'black'
                          ? 'bg-cyan-50/80 dark:bg-cyan-500/20 border-cyan-500 text-cyan-900 dark:text-cyan-200 shadow-xs ring-1 ring-cyan-500/30'
                          : 'bg-slate-50/70 dark:bg-black/20 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-100/70 dark:hover:bg-white/5'
                      }`}
                    >
                      <input
                        type="radio"
                        name="theme"
                        checked={localSettings.theme === 'black'}
                        onChange={() => updateSetting('theme', 'black' as ThemeMode)}
                        className="text-cyan-600 accent-cyan-600"
                      />
                      <span className="font-medium text-xs">{i18n.theme_black}</span>
                    </label>
                  </div>
                </div>

                {/* Language Switcher (Tiếng Việt / English) */}
                <div className="pt-4 border-t border-slate-200 dark:border-white/10">
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-cyan-700 dark:text-cyan-400 mb-3">
                    {i18n.sec_language}
                  </h4>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="radio"
                        name="language"
                        checked={localSettings.language === 'vi'}
                        onChange={() => updateSetting('language', 'vi' as AppLanguage)}
                        className="text-cyan-600 accent-cyan-600 w-4 h-4"
                      />
                      <span className="font-medium text-slate-800 dark:text-slate-200 group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors">
                        🇻🇳 {i18n.lang_vi}
                      </span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="radio"
                        name="language"
                        checked={localSettings.language === 'en'}
                        onChange={() => updateSetting('language', 'en' as AppLanguage)}
                        className="text-cyan-600 accent-cyan-600 w-4 h-4"
                      />
                      <span className="font-medium text-slate-800 dark:text-slate-200 group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors">
                        🇺🇸 {i18n.lang_en}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PLAYBACK */}
            {activeTab === 'playback' && (
              <div className="space-y-5">
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-cyan-700 dark:text-cyan-400 mb-3">
                    {i18n.sec_seek_steps}
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                        {i18n.seek_short}
                      </label>
                      <select
                        value={localSettings.seek_short_sec}
                        onChange={(e) => updateSetting('seek_short_sec', Number(e.target.value))}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-lg px-3 py-1.5 text-slate-800 dark:text-slate-200 shadow-2xs font-medium"
                      >
                        <option value={1.0}>1.0s</option>
                        <option value={2.0}>2.0s</option>
                        <option value={3.0}>3.0s</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                        {i18n.seek_long}
                      </label>
                      <select
                        value={localSettings.seek_long_sec}
                        onChange={(e) => updateSetting('seek_long_sec', Number(e.target.value))}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-lg px-3 py-1.5 text-slate-800 dark:text-slate-200 shadow-2xs font-medium"
                      >
                        <option value={5.0}>5.0s</option>
                        <option value={10.0}>10.0s</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-white/10">
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-cyan-700 dark:text-cyan-400 mb-1">
                    {i18n.sec_ab_fade}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                    {i18n.ab_fade_desc}
                  </p>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={localSettings.ab_loop_crossfade_ms}
                      onChange={(e) => updateSetting('ab_loop_crossfade_ms', Number(e.target.value))}
                      className="flex-1 accent-cyan-600 dark:accent-cyan-400"
                    />
                    <span className="font-mono text-cyan-700 dark:text-cyan-300 font-bold min-w-[50px] text-right">
                      {localSettings.ab_loop_crossfade_ms} ms
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-white/10">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={localSettings.autoplay_next}
                      onChange={(e) => updateSetting('autoplay_next', e.target.checked)}
                      className="rounded border-slate-300 dark:border-slate-700 text-cyan-600 accent-cyan-600"
                    />
                    <span className="font-medium text-slate-800 dark:text-slate-200 group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors">
                      {i18n.autoplay_next}
                    </span>
                  </label>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-white/10">
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-cyan-700 dark:text-cyan-400 mb-3">
                    {i18n.default_loop_mode}
                  </h4>
                  <select
                    value={localSettings.default_loop_file}
                    onChange={(e) => updateSetting('default_loop_file', e.target.value as LoopFileMode)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 shadow-2xs font-medium focus:outline-none focus:border-cyan-500"
                  >
                    <option value="all">{i18n.loop_all_desc}</option>
                    <option value="single">{i18n.loop_single_desc}</option>
                    <option value="off">{i18n.loop_off_desc}</option>
                  </select>
                </div>
              </div>
            )}

            {/* TAB 3: CACHE */}
            {activeTab === 'cache' && (
              <div className="space-y-5">
                <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 p-4 rounded-xl text-emerald-900 dark:text-emerald-300">
                  <h4 className="font-semibold mb-1">
                    {i18n.sec_cache_arch}
                  </h4>
                  <p className="text-[11px] leading-relaxed text-emerald-800/90 dark:text-emerald-300/80">
                    {i18n.cache_arch_desc}
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-xl">
                  <div>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{i18n.ram_usage}</span>
                    <p className="text-xs text-cyan-700 dark:text-cyan-400 font-mono mt-0.5 font-semibold">
                      {i18n.ram_optimal}
                    </p>
                  </div>
                  <button
                    onClick={handleClearRam}
                    className="px-3.5 py-1.5 bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/15 border border-slate-300 dark:border-white/10 rounded-lg transition-colors font-medium text-xs flex items-center gap-1.5 text-slate-700 dark:text-slate-200 shadow-2xs"
                  >
                    <span>{i18n.btn_clear_ram}</span>
                  </button>
                </div>

                {ramFreedNotice && (
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium animate-in fade-in">
                    {i18n.ram_cleared}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: HOTKEYS */}
            {activeTab === 'hotkeys' && (
              <div className="space-y-4">
                <h4 className="text-xs uppercase tracking-wider font-semibold text-cyan-700 dark:text-cyan-400 mb-2">
                  {i18n.sec_hotkeys_title}
                </h4>
                <div className="grid grid-cols-2 gap-2.5 text-[11px]">
                  {[
                    { label: 'Ảnh trước / sau:', key: '← / →' },
                    { label: 'File media trước / sau:', key: 'Cmd/Ctrl + ← / →' },
                    { label: 'Phát / Tạm dừng:', key: 'Space' },
                    { label: 'Tua ±1s / ±5s:', key: '← / → , Shift + ← / →' },
                    { label: 'Nhảy mốc 0% - 90%:', key: '0 - 9' },
                    { label: 'Đánh dấu tệp:', key: 'M' },
                    { label: 'Copy tệp hiện tại:', key: 'Cmd/Ctrl + C' },
                    { label: 'Copy tất cả Đã Mark:', key: 'Cmd/Ctrl + Shift + C' },
                    { label: 'Cut tất cả Đã Mark:', key: 'Cmd/Ctrl + Shift + X' },
                    { label: 'Đặt điểm lặp A / B:', key: '[ / ]' },
                    { label: 'Bật/Tắt Lặp đoạn A-B:', key: '\\' },
                    { label: 'Bật/Tắt Xáo trộn:', key: 'S' },
                    { label: 'Chế độ Lặp Tệp:', key: 'L hoặc R' },
                    { label: 'Tăng / Giảm Âm lượng:', key: '↑ / ↓' },
                    { label: 'Bật/Tắt tiếng (Mute):', key: 'Shift + M' },
                    { label: 'Ghim trên cùng:', key: 'P' },
                    { label: 'Danh sách thư mục:', key: 'B' },
                    { label: 'Ẩn / Hiện HUD:', key: 'H' },
                  ].map((hk, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-white/5"
                    >
                      <span className="text-slate-600 dark:text-slate-400">{hk.label}</span>
                      <span className="font-mono text-cyan-800 dark:text-cyan-300 font-semibold bg-white dark:bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/10 shadow-2xs">
                        {hk.key}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: ABOUT */}
            {activeTab === 'about' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-cyan-500/5 to-transparent border border-cyan-500/20">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white shrink-0 font-bold text-2xl">
                    👁️
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {i18n.about_app_name}
                      </h3>
                      <span className="px-2 py-0.5 text-[11px] font-mono font-semibold bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 rounded-full border border-cyan-300 dark:border-cyan-500/30">
                        v1.2.0
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      {i18n.about_tagline}
                    </p>
                    <p className="text-xs font-semibold text-cyan-700 dark:text-cyan-400 mt-1">
                      {i18n.about_author}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-cyan-700 dark:text-cyan-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{i18n.about_diff_title}</span>
                  </h4>
                  <div className="space-y-2 text-xs">
                    {[
                      i18n.about_diff_1,
                      i18n.about_diff_2,
                      i18n.about_diff_3,
                      i18n.about_diff_4,
                      i18n.about_diff_5,
                    ].map((diff, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-white/5"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                          {diff}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="h-14 px-6 border-t border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50/70 dark:bg-black/30">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{i18n.btn_defaults}</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-semibold transition-all shadow-sm active:scale-95"
          >
            {i18n.btn_close}
          </button>
        </div>
      </div>
    </div>
  );
};
