# API & Data Contract Specification: Media Tool (`_spec4_api_data`)

> **Phiên bản:** 1.0.0  
> **Ngày cập nhật:** 2026-10-01  
> **Phân loại đặc tả:** Hợp đồng Dữ liệu, Mô hình Đối tượng & Tauri IPC Commands  
> **Tài liệu tham chiếu:** [00_system_overview.md](00_system_overview.md), [02_feature_flow.md](02_feature_flow.md)  

---

## 1. Kiến trúc Giao tiếp IPC (Tauri 2 Bridge)

Giao tiếp giữa giao diện người dùng (Frontend TypeScript/React) và nhân hệ thống (Rust Backend) được thực hiện thông qua cơ chế bất đồng bộ an toàn kiểu (Type-safe IPC) của Tauri 2:

```text
┌──────────────────────────────────────┐          ┌──────────────────────────────────────┐
│        Frontend (TypeScript)         │          │             Backend (Rust)           │
│                                      │          │                                      │
│  invoke('get_directory_media', {...})│ ───────► │  #[tauri::command]                   │
│                                      │          │  pub fn get_directory_media(...)     │
│  invoke('copy_files_to_clipboard')   │ ───────► │  pub fn copy_files_to_clipboard(...) │
│  invoke('read_audio_metadata', {...})│ ───────► │  pub fn read_audio_metadata(...)    │
│                                      │          │                                      │
│  listen('app:open-file', handler)    │ ◄─────── │  app_handle.emit("app:open-file", ..)│
└──────────────────────────────────────┘          └──────────────────────────────────────┘
```

### 1.2 Cơ chế Nạp Media An Toàn & Tránh Lỗi CORS (`convertFileSrc`)
Để tránh lỗi chặn truy cập hệ thống tệp cục bộ (`file:// protocol restriction`) và chính sách CSP của Webview:
* **Không dùng trực tiếp URL `file://`:** Thẻ `<video>`, `<audio>` hoặc `<img>` không nạp đường dẫn tệp trực tiếp dạng `file:///Users/...`.
* **Chuyển đổi qua Tauri Asset Protocol:**
  ```typescript
  import { convertFileSrc } from '@tauri-apps/api/core';

  // Chuyển /Users/vic/Movies/video.mp4 thành asset://localhost/... (trên Mac) hoặc https://asset.localhost/... (trên Win)
  const safeMediaSrc = convertFileSrc(item.path);
  ```
* **Cấu hình CSP trong `tauri.conf.json`:**
  Khai báo `csp: "default-src 'self'; media-src 'self' asset: https://asset.localhost blob: data:; img-src 'self' asset: https://asset.localhost blob: data:;"` để đảm bảo stream video 4K/8K và nạp ảnh mượt mà 100%.

---

## 2. Danh mục Lệnh Tauri (IPC Commands Specification)

### 2.1 Lệnh: `get_directory_media`
Quét thư mục chứa tệp mục tiêu, lọc các tệp tin media tương ứng và trả về danh sách đã được sắp xếp tự nhiên (`natural_sort`).

* **TypeScript Signature:**
  ```typescript
  export async function getDirectoryMedia(filePath: string): Promise<MediaListResponse>;
  ```

* **Rust Command Signature:**
  ```rust
  #[tauri::command]
  pub fn get_directory_media(file_path: String) -> Result<MediaListResponse, String>;
  ```

* **Schema Payload Đầu vào (Arguments):**
  ```json
  {
    "file_path": "/Users/vic/Movies/sample_video.mp4"
  }
  ```

* **Schema Payload Đầu ra (Response JSON):**
  ```json
  {
    "parent_dir": "/Users/vic/Movies",
    "current_index": 2,
    "total_count": 5,
    "items": [
      {
        "path": "/Users/vic/Movies/intro.mp4",
        "name": "intro.mp4",
        "media_type": "video",
        "extension": "mp4",
        "size_bytes": 10485760
      },
      {
        "path": "/Users/vic/Movies/part_01.mp4",
        "name": "part_01.mp4",
        "media_type": "video",
        "extension": "mp4",
        "size_bytes": 52428800
      },
      {
        "path": "/Users/vic/Movies/sample_video.mp4",
        "name": "sample_video.mp4",
        "media_type": "video",
        "extension": "mp4",
        "size_bytes": 31457280
      }
    ]
  }
  ```

---

### 2.2 Lệnh: `clipboard_files` (Copy & Cut File Descriptors)
Ghi trực tiếp danh sách đường dẫn tệp vào bộ nhớ tạm của hệ điều hành dưới dạng **File Descriptors thật** để dán vào Finder trên Mac hoặc File Explorer trên Windows, hỗ trợ cả chế độ **Copy (Sao chép)** và **Cut (Di chuyển/Move)**.

* **TypeScript Signature:**
  ```typescript
  export async function clipboardFiles(filePaths: string[], isCut: boolean = false): Promise<boolean>;
  ```

* **Rust Command Signature:**
  ```rust
  #[tauri::command]
  pub fn clipboard_files(file_paths: Vec<String>, is_cut: bool) -> Result<bool, String>;
  ```

* **Đặc tả Kỹ thuật Tầng Native (OS Implementation):**
  - **Trên Windows (`src/platform/windows.rs`):**
    - Sử dụng Win32 Clipboard API (`OpenClipboard`, `EmptyClipboard`, `SetClipboardData`).
    - Cấu trúc dữ liệu: `DROPFILES` với cờ `fWide = TRUE` (chuỗi UTF-16 kép kết thúc bằng null kép `\0\0`), định dạng `CF_HDROP`.
    - **Nếu `is_cut == true`:** Đăng ký thêm định dạng clipboard `CFSTR_PREFERREDDROPEFFECT` với giá trị `DROPEFFECT_MOVE` (0x2). Khi người dùng dán vào Explorer, tệp sẽ được chuyển (Cut & Move) sang thư mục đích.
  - **Trên macOS (`src/platform/macos.rs`):**
    - Sử dụng `NSPasteboard` (`generalPasteboard`).
    - Đưa dữ liệu vào kiểu `NSPasteboardTypeFileURL` (mảng `NSURL`).
    - **Nếu `is_cut == true`:** Thiết lập pasteboard type mở rộng đánh dấu cut operation để Finder thực hiện lệnh Move.

---

### 2.3 Lệnh: `read_audio_metadata`
Đọc thẻ ID3/Metadata và trích xuất bìa đĩa (Album Art) từ file âm thanh mà không làm biến đổi file.

* **TypeScript Signature:**
  ```typescript
  export async function readAudioMetadata(filePath: string): Promise<AudioMetadataResponse>;
  ```

* **Rust Command Signature:**
  ```rust
  #[tauri::command]
  pub fn read_audio_metadata(file_path: String) -> Result<AudioMetadataResponse, String>;
  ```

* **Schema Payload Đầu ra (Response JSON):**
  ```json
  {
    "title": "Counting Stars",
    "artist": "OneRepublic",
    "album": "Native",
    "album_artist": "OneRepublic",
    "track_number": 3,
    "year": 2013,
    "genre": "Pop Rock",
    "duration_seconds": 257.0,
    "artwork_data_url": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ..."
  }
  ```

---

### 2.4 Lệnh: `set_always_on_top` (Pin on Top Window)
Bật hoặc tắt chế độ luôn nổi trên cùng của cửa sổ ứng dụng (Pin on Top).

* **TypeScript Signature:**
  ```typescript
  export async function setAlwaysOnTop(isPinned: boolean): Promise<boolean>;
  ```

* **Rust Command Signature:**
  ```rust
  #[tauri::command]
  pub fn set_always_on_top(window: tauri::Window, is_pinned: bool) -> Result<bool, String> {
      window.set_always_on_top(is_pinned).map_err(|e| e.to_string())?;
      Ok(is_pinned)
  }
  ```

---

### 2.5 Nhóm Lệnh Hộp Thoại & Nạp Tệp Hệ Thống (`dialog`)
1. **Lệnh `open_file_dialog`:** Mở hộp thoại chọn tệp media bản địa của OS (`rfd` / Cocoa NSOpenPanel).
   * **TypeScript Signature:** `export async function openFileDialog(): Promise<string | null>;`
   * **Rust Signature:** `pub async fn open_file_dialog() -> Result<Option<String>, String>;`
2. **Lệnh `open_folder_dialog`:** Mở hộp thoại chọn thư mục chứa media.
   * **TypeScript Signature:** `export async function openFolderDialog(): Promise<string | null>;`
   * **Rust Signature:** `pub async fn open_folder_dialog() -> Result<Option<String>, String>;`
3. **Lệnh `get_initial_media_file`:** Đọc đường dẫn tệp được truyền qua tham số dòng lệnh CLI (`std::env::args()`) khi khởi động ứng dụng qua *Open With*.
   * **TypeScript Signature:** `export async function getInitialMediaFile(): Promise<string | null>;`
   * **Rust Signature:** `pub fn get_initial_media_file() -> Option<String>;`
4. **Hệ thống Sự kiện (Tauri Events):**
   * `open-media-file`: Phát từ Rust khi macOS nhận sự kiện mở file khi app đang chạy (`RunEvent::Opened { urls }`).
   * `trigger-open-file` & `trigger-open-folder`: Phát khi người dùng chọn menu *File* trên Menu Bar hệ thống hoặc bấm `Cmd+O` / `Cmd+Shift+O`.

---

## 3. Các Mô hình Dữ liệu TypeScript (Frontend Models)

Toàn bộ các kiểu dữ liệu dùng chung trong thư mục `src/types/` được đặc tả như sau:

```typescript
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
  theme: ThemeMode;              // Chủ đề màu sắc (Mặc định: 'system' - Thích ứng theo OS)
  language: AppLanguage;         // Ngôn ngữ giao diện (Mặc định: 'vi' - Tiếng Việt / 'en' - English)
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
```

---

## 4. Quản lý Vòng đời, Khởi chạy & Lưu trữ Cấu hình (App Lifecycle & Persistence)

### 4.1 Khởi chạy từ File Association / "Open With" (Cold Start & Warm Switch)
Hệ thống xử lý tương thích 100% cả macOS và Windows 11 qua kiến trúc Dual-Channel:
1. **Cold Start (Ứng dụng chưa mở):**
   - **macOS:** Hệ điều hành gửi AppleEvents (`kAEOpenDocuments`) qua `tauri::RunEvent::Opened { urls }`. Rust Backend bắt sự kiện này trong `app.run()`, lưu vào trạng thái thread-safe `InitialMediaState(Mutex<Option<String>>)`. Khi Frontend React khởi tạo (`App.tsx` mount), React gọi command `get_initial_media_file()` để lấy đường dẫn và load ngay lập tức mà không bị mất sự kiện (khắc phục hoàn toàn race condition).
   - **Windows:** Hệ điều hành truyền đường dẫn qua tham số dòng lệnh `std::env::args()`. Hàm `get_initial_media_file()` phân tích args, chuẩn hóa path và trả về cho React.
2. **Warm Switch (Ứng dụng đang chạy):**
   - Khi người dùng click "Open With" hoặc kéo tệp vào icon Dock/Taskbar, sự kiện `RunEvent::Opened` trên Rust phát event `open-media-file` đến webview, đồng thời gọi `win.unminimize()` và `win.set_focus()` để đưa cửa sổ lên trên cùng.
   - Frontend `listenOpenMediaFile` nhận payload đường dẫn và gọi `handleLoadPath` chuyển đổi file/thư mục mượt mà.

### 4.2 Lưu trữ Cấu hình & Trạng thái Người dùng (Config Persistence)
Toàn bộ cấu hình và trạng thái của ứng dụng được lưu trữ an toàn trong Webview LocalStorage của hệ điều hành:
- **Vị trí lưu trữ vật lý trên ổ cứng:**
  - **macOS:** `~/Library/Application Support/com.vxmedia.desktop/WebKit/WebsiteData/Default/LocalStorage/`
  - **Windows 11:** `%APPDATA%\com.vxmedia.desktop\EBWebView\Default\Local Storage\`
- **Các khóa cấu hình chính:**
  - `media_tool_settings`: Lưu toàn bộ cài đặt hệ thống (`AppSettings`) gồm chủ đề, ngôn ngữ, bước tua, thời gian ẩn HUD, độ mượt A-B fade, v.v.
  - `media_tool_loop_file`: Lưu chế độ lặp file hiện tại (`'all'` | `'single'` | `'off'`). Khi người dùng bấm đổi chế độ lặp (hoặc phím `L`), trạng thái được ghi đè tức thì để duy trì chính xác ở lần mở app kế tiếp.
  - `media_tool_volume`: Lưu mức âm lượng gần nhất (`0.0` - `1.0`).

### 4.3 Thoát Sạch Khi Bấm Nút Đỏ [X] (Zero-Residue Quit):
- Lắng nghe `WindowEvent::CloseRequested` trên tầng Rust:
  - Hủy buffer RAM ảnh 3-slot và giải phóng AudioContext.
  - Gọi `window.app_handle().exit(0)` thoát hoàn toàn tiến trình, xóa sạch chấm tròn Dock trên macOS ngay lập tức.

