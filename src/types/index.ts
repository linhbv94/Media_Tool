// 1. Phân loại định dạng Media
export type MediaType = 'image' | 'video' | 'audio' | 'unknown';

// 2. Chế độ lặp tệp
export type LoopFileMode = 'off' | 'single' | 'all';

// 3. Thông tin một mục Media trong thư mục
export interface MediaItem {
  path: string;           // Đường dẫn tuyệt đối
  name: string;           // Tên file kèm đuôi mở rộng
  media_type: MediaType;  // Phân loại 'image' | 'video' | 'audio'
  extension: string;      // Đuôi mở rộng chữ thường (jpg, mp4, mp3...)
  size_bytes: number;     // Kích thước tệp (bytes)
}

// 4. Phản hồi danh sách thư mục từ Rust Core
export interface MediaListResponse {
  parent_dir: string;
  current_index: number;
  total_count: number;
  items: MediaItem[];
}

// 5. Metadata âm thanh chi tiết
export interface AudioMetadataResponse {
  title?: string;
  artist?: string;
  album?: string;
  album_artist?: string;
  track_number?: number;
  year?: number;
  genre?: string;
  duration_seconds?: number;
  artwork_data_url?: string; // Chuỗi Base64 Data URL nếu có bìa đĩa
}

// 6. Trạng thái Vòng lặp A-B Loop
export interface ABLoopState {
  point_a: number | null;     // Mốc thời gian A (giây)
  point_b: number | null;     // Mốc thời gian B (giây)
  is_active: boolean;         // Đang bật hay tắt vòng lặp
  fade_duration_ms: number;   // Thời lượng fade tính toán (0 đến 100 ms)
}

// 7. Trạng thái Playback Đầy đủ (Player State)
export interface PlaybackState {
  is_playing: boolean;
  current_time: number;
  duration: number;
  volume: number;              // 0.0 đến 1.0 (mặc định 0.8)
  is_muted: boolean;           // Đang tắt tiếng hay không
  shuffle: boolean;            // Đang bật xáo trộn thứ tự
  loop_file_mode: LoopFileMode;// 'off' | 'single' | 'all'
  ab_loop: ABLoopState;
  playback_rate: number;       // 1.0 (mặc định), 1.25, 1.5, 2.0...
}

export type ThemeMode = 'system' | 'dark' | 'light' | 'black';
export type AppLanguage = 'vi' | 'en';

// 8. Cấu hình Cài đặt Ứng dụng (App Settings Model)
export interface AppSettings {
  single_instance: boolean;      // Tái sử dụng cửa sổ (Mặc định: true)
  auto_pin: boolean;             // Tự động ghim khi mở (Mặc định: false)
  hud_hide_delay_ms: number;     // Thời gian ẩn HUD (Mặc định: 2000ms)
  theme: ThemeMode;              // Chủ đề màu sắc (Mặc định: 'system')
  language: AppLanguage;         // Ngôn ngữ giao diện (Mặc định: 'vi')
  seek_short_sec: number;        // Tua ngắn (Mặc định: 1.0s)
  seek_long_sec: number;         // Tua dài (Mặc định: 5.0s)
  ab_loop_crossfade_ms: number;  // Độ mượt A-B Loop (Mặc định: 45ms)
  default_loop_file: LoopFileMode; // Lặp file mặc định (Mặc định: 'all')
  autoplay_next: boolean;        // Tự phát khi next video (Mặc định: true)
  volume: number;                // Mức âm lượng lưu trữ (Mặc định: 0.8)
}

// 9. Trạng thái Đánh dấu trong Phiên làm việc (Session Mark State)
export interface MarkSessionState {
  marked_paths: Set<string>;  // Tập hợp các file đã được đánh dấu
  last_marked_path: string | null;
}
