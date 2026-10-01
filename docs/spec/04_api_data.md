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

## 3. Các Mô hình Dữ liệu TypeScript (Frontend Models)

Toàn bộ các kiểu dữ liệu dùng chung trong thư mục `src/types/` được đặc tả như sau:

```typescript
// 1. Phân loại định dạng Media
export type MediaType = 'image' | 'video' | 'audio' | 'unknown';

// 2. Thông tin một mục Media trong thư mục
export interface MediaItem {
  path: string;           // Đường dẫn tuyệt đối
  name: string;           // Tên file kèm đuôi mở rộng
  media_type: MediaType;  // Phân loại 'image' | 'video' | 'audio'
  extension: string;      // Đuôi mở rộng chữ thường (jpg, mp4, mp3...)
  size_bytes: number;     // Kích thước tệp (bytes)
}

// 3. Phản hồi danh sách thư mục từ Rust Core
export interface MediaListResponse {
  parent_dir: string;
  current_index: number;
  total_count: number;
  items: MediaItem[];
}

// 4. Metadata âm thanh chi tiết
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

// 5. Trạng thái Vòng lặp A-B Loop
export interface ABLoopState {
  point_a: number | null;     // Mốc thời gian A (giây)
  point_b: number | null;     // Mốc thời gian B (giây)
  is_active: boolean;         // Đang bật hay tắt vòng lặp
  fade_duration_ms: number;   // Thời lượng fade tính toán (0 đến 100 ms)
}

// 6. Trạng thái Đánh dấu trong Phiên làm việc (Session Mark State)
export interface MarkSessionState {
  marked_paths: Set<string>;  // Tập hợp các file đã được đánh dấu
  last_marked_path: string | null;
}
```

---

## 4. Quản lý Vòng đời & Xử lý Tham số Khởi chạy (App Lifecycle & Args)

Hệ thống hỗ trợ 2 phương thức mở tệp:
1. **Khởi chạy từ dòng lệnh / File Association (Cold Start):**
   - Khi người dùng click đúp file từ OS, đường dẫn file được truyền vào biến dòng lệnh `std::env::args()[1]`.
   - Rust Core nạp file và khởi tạo cửa sổ chính.
2. **Kéo thả hoặc Mở file khi ứng dụng đang chạy (Hot Switch / Single Instance):**
   - Áp dụng plugin `tauri-plugin-single-instance`. Khi một file mới được click đúp trong lúc Media Tool đã mở:
     - Ứng dụng không mở thêm cửa sổ mới (giữ đúng nguyên tắc One App).
     - Đưa cửa sổ hiện tại lên tiêu điểm (focus window).
     - Phát sự kiện `app:open-file` kèm đường dẫn mới để Frontend tự động chuyển file ngay lập tức.
