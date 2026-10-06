# Đặc tả Kỹ thuật Module Đọc PDF (PDF Reader Module Specification)

> **Mã đặc tả:** `_spec8_pdf_reader_module`  
> **Phiên bản tài liệu:** `1.2.0-draft`  
> **Áp dụng dự kiến từ:** `v1.2.0`  
> **Dự án:** VXMedia (`media_tool`)  
> **Tài liệu tham chiếu:** [00_system_overview.md](00_system_overview.md), [07_folder_tabs_multi_window.md](07_folder_tabs_multi_window.md) & [version_management.md](../version_management.md)

---

## 1. Bối cảnh & Tầm nhìn Sản phẩm (Product Vision)

### 1.1. Vấn đề Thực tế & Cơ hội Mở rộng
Trong quá trình vận hành VXMedia với 3 định dạng ban đầu (`image`, `video`, `audio`), người dùng thường xuyên làm việc với các thư mục dự án hỗn hợp (Mixed Asset Folders) chứa cả ảnh tư liệu, video demo, nhạc nền và các tệp tài liệu đặc tả, hợp đồng, storyboard dưới định dạng **PDF (`.pdf`)**.

Hiện tại:
- Khi gặp file `.pdf`, ứng dụng bỏ qua (không hiển thị trên Sidebar) hoặc người dùng buộc phải chuyển sang một ứng dụng PDF chuyên dụng nặng nề của bên thứ ba (Adobe Acrobat, Foxit, hoặc trình duyệt Chrome ngốn hàng trăm MB RAM).
- Trải nghiệm đứt gãy: Không thể vừa nghe nhạc nền/podcast ở tab Audio của VXMedia mà vừa đọc tài liệu PDF một cách đồng bộ trong cùng một cửa sổ làm việc nhẹ nhàng.

### 1.2. Định vị "Workspace Content Viewer" Toàn diện
Thay vì tạo ra một ứng dụng đọc PDF riêng biệt gây phân mảnh trải nghiệm và lãng phí hạ tầng, **VXMedia nâng cấp PDF trở thành Media Type thứ 4** bình đẳng với Image, Video, và Audio:

```text
VXMedia Core Architecture
 ├── 1. Image Viewer   (Zoom, Pan, Rotate, Spacebar Mark)
 ├── 2. Video Player   (Timeline, Volume, Seek, Auto-hide HUD)
 ├── 3. Audio Player   (A–B Loop, ID3 Metadata, Global Background Engine)
 └── 4. PDF Reader     (Cuộn liên tục, Zoom mượt, Jump Page, Text Select, Dark Mode)
```

---

## 2. Mô hình Tư duy Cốt lõi & Luồng Nghiệp vụ (Mental Model & Business Flows)

### 2.1. Phối hợp với Hệ thống Tab & Âm thanh Toàn cục (Global Audio Coexistence)
Module PDF kế thừa 100% kiến trúc 4 tầng: `App → Windows → Tabs → Folder Sessions`:
1. **Phát nhạc ngầm liên tục khi đọc sách/tài liệu:** Khi người dùng mở nhạc ở Tab Audio (hoặc phát video/podcast), sau đó chuyển sang Tab PDF hoặc mở một file PDF trong cùng thư mục, luồng âm thanh từ `Global Audio Engine` **vẫn tiếp tục phát êm ái mà không bị ngắt quãng**. Thanh điều khiển `MiniAudioPill` hiển thị ở góc dưới cho phép tạm dừng hoặc đổi bài hát bất kỳ lúc nào.
2. **Tab Thư mục Độc lập:** Mở thư mục chứa PDF sẽ tạo hoặc tái sử dụng `FolderSession`. Sidebar nhận diện và hiển thị các file `.pdf` với biểu tượng màu đỏ đặc trưng.

```text
[Tab 1: /Music/Chill_BGM] (Audio đang phát ──► Persistent Engine)
          │
          ▼ Người dùng click chuyển Tab
[Tab 2: /Books/Tech_Specs]
          ├── Sidebar: file1.pdf, file2.pdf, diagram.png
          └── Viewport: <PdfViewer /> hiển thị tài liệu
                └── MiniAudioPill (Bật / Pause / Next nhạc góc dưới)
```

### 2.2. Quy tắc Điều phối Cạnh tranh Media
- **Audio + PDF:** Cùng tồn tại song song. Âm thanh tiếp tục phát bình thường.
- **Video + PDF:** Khi người dùng chuyển từ tab Video đang phát sang tab PDF, video tự động tạm dừng để tiết kiệm tài nguyên GPU. Khi quay lại tab Video, video giữ nguyên mốc thời gian tạm dừng.

---

## 3. Mở rộng Hệ thống Kiểu Dữ liệu (Type System Extensions)

### 3.1. Cập nhật `MediaType` và `MediaItem`
Bổ sung `'pdf'` vào liên hiệp kiểu dữ liệu cốt lõi:

```typescript
export type MediaType = 'image' | 'video' | 'audio' | 'pdf';

export interface MediaItem {
  name: string;
  path: string;
  media_type: MediaType;
  size?: number;
  extension?: string;
  // Bổ sung riêng cho PDF (tùy chọn nạp trước):
  pdf_page_count?: number;
}
```

### 3.2. Trạng thái Phiên Làm việc PDF (`PdfSessionState`)
Mỗi phiên đọc tài liệu PDF lưu giữ trạng thái đọc độc lập để khi người dùng chuyển qua lại giữa các tab, trang đang đọc và độ thu phóng không bị mất:

```typescript
export interface PdfSessionState {
  currentPage: number;          // Trang hiện tại (1-indexed)
  totalPages: number;           // Tổng số trang
  zoom: number;                 // Tỷ lệ thu phóng (mặc định 1.0 = 100%, 0.5 → 4.0)
  fitMode: 'width' | 'page' | 'custom'; // Chế độ vừa chiều ngang / vừa trang
  rotation: number;             // Xoay trang: 0 | 90 | 180 | 270 độ
  invertColor: boolean;         // Đảo màu thông minh (Dark Mode cho PDF trắng)
  scrollTop: number;            // Vị trí cuộn pixel
}
```

---

## 4. Kiến trúc Render & Lõi Kỹ thuật (Technical Architecture)

### 4.1. Lựa chọn Lõi Render: Mozilla `pdfjs-dist`
- **Công nghệ lõi:** Sử dụng thư viện chuẩn công nghiệp **`pdfjs-dist`** của Mozilla Firefox.
- **Cơ chế hoạt động:**
  1. Frontend đọc file PDF qua giao thức `asset://` cục bộ hoặc fetch array buffer từ Tauri backend.
  2. `pdfjs-dist` phân tích cấu trúc PDF và dựng từng trang ra phần tử `<canvas>` bằng Web Worker nền (`pdf.worker.min.mjs`), hoàn toàn không làm đơ giao diện chính.
  3. Dựng kèm một lớp văn bản trong suốt (`textLayer`) đặt khớp tuyệt đối phía trên Canvas để cho phép người dùng bôi đen, sao chép văn bản (`Cmd+C` / `Ctrl+C`).

### 4.2. Kỹ thuật Render Trang Ảo (Virtual Scrolling & High-DPI Canvas)
- **Tối ưu RAM (Virtualization):** Đối với các tài liệu dài hàng trăm trang (sách, ebook), ứng dụng chỉ render các trang nằm trong vùng nhìn thấy (Viewport) cộng thêm 1 trang đệm phía trên và 1 trang phía dưới (`buffer: 1`). Các trang nằm ngoài vùng nhìn sẽ được giải phóng Canvas để giữ RAM luôn dưới 80 MB.
- **Hỗ trợ Màn hình Retina / 4K:** Nhân kích thước Canvas với `window.devicePixelRatio` (thường là 2× trên macOS Retina) để chữ và hình vẽ vector luôn sắc nét tuyệt đối, không bị vỡ hạt khi phóng to.

---

## 5. Thiết kế Giao diện (UI Wireframe) & HUD Điều khiển

### 5.1. Bố cục Tổng thể Khung nhìn PDF (`PdfViewer`)

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ [TitleBar / Tabs]  Tab 1: Nhạc (Playing) │ Tab 2: Tai_Lieu.pdf          [H][B]│
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                         ┌───────────────────────┐                            │
│                         │                       │                            │
│                         │       TRANG 1         │                            │
│                         │                       │                            │
│                         │   Nội dung tài liệu   │                            │
│                         │                       │                            │
│                         └───────────────────────┘                            │
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────────────┐   │
│   │ [◄ Trang 1 / 48 ►] │ [-] 100% [+] │ [Vừa Ngang] │ [Đảo Màu] │ [Xoay] │   │
│   └──────────────────────────────────────────────────────────────────────┘   │
│                                           ┌──────────────────────────────┐   │
│                                           │ 🎵 Bài hát... [⏯] [⏭] [Tab] │   │
│                                           └──────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 5.2. Thanh Điều khiển Nổi PDF (Floating Bottom PDF HUD)
Thanh HUD bán trong suốt đặt ở đáy màn hình, tự động ẩn khi không di chuột (tuân thủ cài đặt chung của hệ thống):
1. **Bộ Điều hướng Trang (Page Navigator):**
   - Nút `◄` (Trang trước - `PageUp` / `K`) và nút `►` (Trang sau - `PageDown` / `J`).
   - Ô nhập số trang trực tiếp: `[ 15 ] / 120` (gõ số và bấm Enter để nhảy tới trang).
2. **Bộ Thu phóng (Zoom Controls):**
   - Nút `[-]`, ô tỷ lệ `[ 120% ]`, nút `[+]`.
   - Phím tắt nhanh: `Fit Width` (Vừa chiều rộng cửa sổ) và `Fit Page` (Vừa trọn trang).
3. **Chế độ Ban đêm Thông minh (Smart Invert / Dark Mode):**
   - Chuyển đổi nền giấy trắng chữ đen thành nền xám đen chữ trắng (`filter: invert(0.9) hue-rotate(180deg)`), chống mỏi mắt khi đọc tài liệu trong phòng tối.
4. **Xoay Trang (Rotate):** Xoay tài liệu 90 độ theo chiều kim đồng hồ (`R`).

---

## 6. Bảng Phím tắt Thống nhất (Keyboard Shortcuts Mapping)

Tương thích chuẩn mực trên cả macOS và Windows 11:

| Tác vụ | Phím tắt macOS | Phím tắt Windows 11 | Ghi chú |
| :--- | :--- | :--- | :--- |
| **Trang kế tiếp** | `PageDown` / `J` / `Mũi tên xuống` | `PageDown` / `J` / `Down Arrow` | Cuộn đến trang sau |
| **Trang trước** | `PageUp` / `K` / `Mũi tên lên` | `PageUp` / `K` / `Up Arrow` | Cuộn về trang trước |
| **Đầu tài liệu** | `Home` / `Cmd + Mũi tên lên` | `Home` / `Ctrl + Home` | Nhảy về trang 1 |
| **Cuối tài liệu** | `End` / `Cmd + Mũi tên xuống` | `End` / `Ctrl + End` | Nhảy đến trang cuối |
| **Phóng to (Zoom In)** | `Cmd + =` hoặc `+` | `Ctrl + =` hoặc `+` | Tăng 15% |
| **Thu nhỏ (Zoom Out)** | `Cmd + -` hoặc `-` | `Ctrl + -` hoặc `-` | Giảm 15% |
| **Về 100% (Reset Zoom)** | `Cmd + 0` | `Ctrl + 0` | Tỷ lệ gốc 1:1 |
| **Vừa Chiều rộng (Fit Width)** | `W` | `W` | Canh vừa mép ngang |
| **Vừa Khung hình (Fit Page)** | `F` | `F` | Canh vừa chiều cao |
| **Xoay trang 90°** | `R` | `R` | Xoay theo chiều kim đồng hồ |
| **Bật/Tắt Dark Mode** | `I` | `I` | Invert màu giấy đọc đêm |
| **Ẩn / Hiện HUD** | `H` | `H` | Toàn quyền tập trung đọc |
| **Ghim Cửa sổ On-Top** | `P` | `P` | Vừa đọc tài liệu vừa code |
| **Danh sách Tệp (Sidebar)** | `B` / `L` | `B` / `L` | Xem các file khác trong thư mục |

---

## 7. Hợp đồng Backend & Hệ Điều hành (Backend & OS Integration)

### 7.1. Cập nhật Bộ quét Tệp Rust (`src-tauri/src/commands/fs_scan.rs`)
Thêm phần mở rộng `.pdf` vào danh sách nhận diện media:

```rust
pub fn classify_media_type(ext: &str) -> Option<&'static str> {
    match ext.to_lowercase().as_str() {
        // Hình ảnh
        "jpg" | "jpeg" | "png" | "webp" | "gif" | "svg" | "bmp" | "ico" | "avif" => Some("image"),
        // Video
        "mp4" | "mkv" | "webm" | "mov" | "avi" | "m4v" => Some("video"),
        // Âm thanh
        "mp3" | "wav" | "flac" | "ogg" | "aac" | "m4a" | "wma" | "aiff" => Some("audio"),
        // Tài liệu PDF
        "pdf" => Some("pdf"),
        _ => None,
    }
}
```

### 7.2. Cấu hình Đăng ký Đuôi Tệp Hệ điều hành (`tauri.conf.json`)
Bổ sung khai báo file association để macOS (Finder) và Windows (File Explorer) có thể liên kết tính năng "Open With" trực tiếp với VXMedia:

```json
{
  "ext": ["pdf"],
  "name": "PDF Document",
  "description": "Portable Document Format",
  "role": "Viewer"
}
```

---

## 8. Tiêu chuẩn Nghiệm thu QA (Acceptance Criteria)

- **AC-PDF-01 (Mở tệp đơn lẻ):** Mở ứng dụng với tham số đường dẫn file `.pdf`, ứng dụng tự động hiển thị tab đọc PDF và render trang 1 sắc nét.
- **AC-PDF-02 (Duyệt thư mục hỗn hợp):** Mở một thư mục chứa cả ảnh, video, nhạc và PDF; Sidebar hiển thị đầy đủ icon màu đỏ phân biệt cho các tệp PDF; click vào tệp PDF nào sẽ hoán đổi giao diện sang chế độ đọc PDF của tệp đó.
- **AC-PDF-03 (Âm thanh nền bền vững):** Đang phát một tệp âm thanh ở tab A, chuyển sang xem tệp PDF ở tab B, âm thanh tiếp tục phát bình thường không vấp giật; thanh `MiniAudioPill` phản hồi chính xác.
- **AC-PDF-04 (Điều hướng & Nhảy trang):** Thao tác cuộn chuột, phím `PageUp`/`PageDown` và nhập số trang trực tiếp hoạt động mượt mà, phản hồi dưới 16ms.
- **AC-PDF-05 (Thu phóng & Vừa màn hình):** Các chế độ Zoom tự do, `Fit Width`, `Fit Page` điều chỉnh tỷ lệ Canvas chính xác, chữ và hình vẽ không bị méo lệch.
- **AC-PDF-06 (Bôi đen & Sao chép chữ):** Người dùng có thể quét chuột chọn văn bản trên trang PDF và bấm `Cmd+C` / `Ctrl+C` sao chép nội dung vào Clipboard hệ thống.
- **AC-PDF-07 (Chế độ Ban đêm Invert):** Bật chế độ Invert biến nền trắng thành nền tối dễ chịu, hình ảnh minh họa bên trong PDF vẫn giữ độ tương phản hợp lý.
- **AC-PDF-08 (Giải phóng Bộ nhớ):** Đóng tab PDF hoặc thoát app giải phóng toàn bộ Worker và bộ nhớ đệm Canvas, không rò rỉ RAM (Zero Leak).

---

## 9. Ranh giới Phạm vi Triển khai (Scope Boundary)

### Trong phạm vi V1.2.0 (In-Scope):
* Hiển thị tài liệu PDF với hiệu năng cao (Single page hoặc Continuous scroll).
* Zoom mượt, Fit Width, Fit Page, xoay trang 90°.
* Text Selection & Copy to Clipboard.
* Bộ điều hướng trang, nhảy trang bằng số.
* Tích hợp thanh Sidebar danh sách tệp và thanh MiniAudioPill phát nhạc toàn cục.
* Hỗ trợ đầy đủ phím tắt trên macOS và Windows 11.

### Ngoài phạm vi V1.2.0 (Out-of-Scope / Để lại tương lai):
* Chỉnh sửa nội dung PDF, thêm chú thích (Annotation), vẽ bút màu, thêm chữ ký số.
* Điền biểu mẫu PDF Form tương tác (Interactive Form Filling).
* Chuyển đổi định dạng PDF sang Word/Excel.
* Mã hóa hoặc gỡ mật khẩu file PDF bảo vệ bản quyền phức tạp.
