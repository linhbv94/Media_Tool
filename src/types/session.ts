import { MediaItem } from './index';

export interface FolderSession {
  id: string;
  folderPath: string;
  folderName: string;
  items: MediaItem[];
  currentIndex: number;
  markedPaths: Set<string>;
  zoom?: number;
  pan?: { x: number; y: number };
  rotation?: number;
  flipH?: boolean;
  flipV?: boolean;
}

export interface SerializedFolderSession {
  id: string;
  folderPath: string;
  folderName: string;
  items: MediaItem[];
  currentIndex: number;
  markedPaths: string[];
  zoom?: number;
  pan?: { x: number; y: number };
  rotation?: number;
  flipH?: boolean;
  flipV?: boolean;
}

export interface GlobalAudioState {
  isPlaying: boolean;
  item: MediaItem | null;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  originSessionId: string | null;
}

export type CrossWindowAction =
  | { type: 'PLAY_AUDIO'; item: MediaItem; originSessionId: string; startTime?: number }
  | { type: 'PAUSE_AUDIO' }
  | { type: 'RESUME_AUDIO' }
  | { type: 'STOP_AUDIO' }
  | { type: 'SEEK_AUDIO'; time: number }
  | { type: 'AUDIO_STATE_UPDATE'; state: GlobalAudioState };
