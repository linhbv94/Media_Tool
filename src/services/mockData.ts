import { MediaItem, AudioMetadataResponse, MediaListResponse } from '../types';

export const MOCK_FIXTURES: MediaItem[] = [
  {
    path: '/fixtures/images/01_morning.jpg',
    name: '01_morning.jpg',
    media_type: 'image',
    extension: 'jpg',
    size_bytes: 2048500
  },
  {
    path: '/fixtures/images/02_architecture.png',
    name: '02_architecture.png',
    media_type: 'image',
    extension: 'png',
    size_bytes: 1845600
  },
  {
    path: '/fixtures/images/03_motion.gif',
    name: '03_motion.gif',
    media_type: 'image',
    extension: 'gif',
    size_bytes: 3412000
  },
  {
    path: '/fixtures/images/10_city_night.webp',
    name: '10_city_night.webp',
    media_type: 'image',
    extension: 'webp',
    size_bytes: 1245000
  },
  {
    path: '/fixtures/images/corrupted_sample.jpg',
    name: 'corrupted_sample.jpg',
    media_type: 'image',
    extension: 'jpg',
    size_bytes: 1024
  },
  {
    path: '/fixtures/videos/demo_action_60s.mp4',
    name: 'demo_action_60s.mp4',
    media_type: 'video',
    extension: 'mp4',
    size_bytes: 28450000
  },
  {
    path: '/fixtures/videos/short_clip_10s.webm',
    name: 'short_clip_10s.webm',
    media_type: 'video',
    extension: 'webm',
    size_bytes: 7500000
  },
  {
    path: '/fixtures/audios/with_id3_album_art.mp3',
    name: 'with_id3_album_art.mp3',
    media_type: 'audio',
    extension: 'mp3',
    size_bytes: 8450000
  },
  {
    path: '/fixtures/audios/acoustic_guitar.wav',
    name: 'acoustic_guitar.wav',
    media_type: 'audio',
    extension: 'wav',
    size_bytes: 14200000
  },
  {
    path: '/fixtures/audios/no_metadata_sample.flac',
    name: 'no_metadata_sample.flac',
    media_type: 'audio',
    extension: 'flac',
    size_bytes: 18900000
  }
];

// Demo sample assets for browser rendering fallback
export const SAMPLE_MEDIA_URLS: Record<string, string> = {
  '/fixtures/images/01_morning.jpg': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80',
  '/fixtures/images/02_architecture.png': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1920&q=80',
  '/fixtures/images/03_motion.gif': 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1920&q=80',
  '/fixtures/images/10_city_night.webp': 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1920&q=80',
  '/fixtures/images/corrupted_sample.jpg': 'https://invalid-url-that-fails-to-load.test/corrupted.jpg',
  '/fixtures/videos/demo_action_60s.mp4': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  '/fixtures/videos/short_clip_10s.webm': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  '/fixtures/audios/with_id3_album_art.mp3': 'https://actions.google.com/sounds/v1/weather/rain_heavy.ogg',
  '/fixtures/audios/acoustic_guitar.wav': 'https://actions.google.com/sounds/v1/water/lake_waves_lapping.ogg',
  '/fixtures/audios/no_metadata_sample.flac': 'https://actions.google.com/sounds/v1/weather/wind_gusting.ogg'
};

export const MOCK_AUDIO_METADATA: Record<string, AudioMetadataResponse> = {
  '/fixtures/audios/with_id3_album_art.mp3': {
    title: 'Counting Stars',
    artist: 'OneRepublic',
    album: 'Native',
    album_artist: 'OneRepublic',
    track_number: 3,
    year: 2013,
    genre: 'Pop Rock',
    duration_seconds: 257.0,
    artwork_data_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80'
  },
  '/fixtures/audios/acoustic_guitar.wav': {
    title: 'Acoustic Guitar Harmony',
    artist: 'David Acoustic',
    album: 'Guitar Sessions',
    year: 2021,
    genre: 'Acoustic',
    duration_seconds: 180.0
  },
  '/fixtures/audios/no_metadata_sample.flac': {
    title: 'no_metadata_sample',
    artist: 'Unknown Artist',
    duration_seconds: 145.0
  }
};

export function getMockDirectoryMedia(currentPath?: string): MediaListResponse {
  const currentIdx = currentPath
    ? MOCK_FIXTURES.findIndex(item => item.path === currentPath)
    : 0;
  
  return {
    parent_dir: '/fixtures',
    current_index: currentIdx >= 0 ? currentIdx : 0,
    total_count: MOCK_FIXTURES.length,
    items: [...MOCK_FIXTURES]
  };
}
