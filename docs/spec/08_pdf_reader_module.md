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
 └── 4. PDF Reader     (Cuộn dọc liên tục, Retina Zoom, Thumbnails, Text Search, Native Print)
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
                ├── Left Thumbnail Drawer (Thanh ảnh thu nhỏ)
                ├── Text Search Bar (Cmd+F)
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
  pdf_page_count?: number;
}
```

### 3.2. Trạng thái Phiên Làm việc PDF (`PdfSessionState`)
Mỗi phiên đọc tài liệu PDF lưu giữ trạng thái đọc độc lập để khi người dùng chuyển qua lại giữa các tab, vị trí trang và độ thu phóng không bị mất:

```typescript
export interface PdfSessionState {
  currentPage: number;                  // Trang hiện tại (1-indexed)
  totalPages: number;                   // Tổng số trang
  zoom: number;                         // Tỷ lệ thu phóng (mặc định 1.0 = 100%, 0.5 → 4.0)
  fitMode: 'width' | 'page' | 'custom'; // Chế độ vừa chiều ngang / vừa trang
  rotation: number;                     // Xoay trang: 0 | 90 | 180 | 270 độ
  invertColor: boolean;                 // Đảo màu thông minh (Dark Mode cho PDF trắng)
  isThumbnailOpen: boolean;             // Bật/tắt thanh thumbnail bên trái
  searchQuery: string;                  // Từ khóa tìm kiếm hiện tại
  searchMatchIndex: number;             // Vị trí kết quả tìm kiếm đang focus
  searchTotalMatches: number;           // Tổng số kết quả tìm thấy
  scrollTop: number;                    // Vị trí cuộn pixel
}
```

---

## 4. Kiến trúc Render & Lõi Kỹ thuật (Technical Architecture)

### 4.1. Lựa chọn Lõi Render: Mozilla `pdfjs-dist`
- **Công nghệ lõi:** Sử dụng thư viện chuẩn công nghiệp **`pdfjs-dist`** của Mozilla Firefox.
- **Cơ chế hoạt động:**
  1. Frontend đọc file PDF qua giao thức `asset://` cục bộ hoặc fetch array buffer từ Tauri backend.
  2. `pdfjs-dist` phân tích cấu trúc PDF và dựng từng trang ra phần tử `<canvas>` bằng Web Worker nền (`pdf.worker.min.mjs`), hoàn toàn không làm đơ luồng giao diện chính.
  3. Dựng kèm một lớp văn bản trong suốt (`textLayer`) đặt khớp tuyệt đối phía trên Canvas để cho phép người dùng bôi đen, sao chép văn bản (`Cmd+C` / `Ctrl+C`) và đánh dấu highlight kết quả tìm kiếm.

### 4.2. Render Trang Ảo & Cuộn Dọc Liên Tục (Continuous Virtual Scrolling)
- **Cuộn dọc liên tục (Continuous Scroll):** Các trang được bố trí nối tiếp nhau theo chiều dọc trong container có `overflow-y-auto`, tạo trải nghiệm lướt đọc mượt mà như xem web.
- **Tối ưu RAM (Page Virtualization):** Đối với tài liệu dài (hàng trăm đến hàng nghìn trang), ứng dụng chỉ render các trang nằm trong khung nhìn cộng thêm 1 trang đệm phía trên và 1 trang phía dưới (`buffer: 1`). Các trang nằm ngoài vùng nhìn được gỡ bỏ Canvas và chỉ giữ placeholder có chiều cao tương ứng để giữ RAM luôn dưới 80 MB.
- **Hỗ trợ Màn hình Retina / 4K:** Kích thước Canvas được nhân với `window.devicePixelRatio` (thường là 2× trên macOS Retina) để đảm bảo chữ và các nét vẽ vector luôn sắc nét tuyệt đối, không bị vỡ hạt.

---

## 5. Thiết kế Giao diện (UI Wireframe) & HUD Điều khiển

### 5.1. Bố cục Tổng thể Khung nhìn PDF (`PdfViewer`)

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ [TitleBar / Tabs]  Tab 1: Nhạc (Playing) │ Tab 2: Tai_Lieu.pdf          [H][B]│
├──────┬───────────────────────────────────────────────────────────────┬───────┤
│ THUMB│                                              ┌──────────────┐ │ (Tùy  │
│ [X]  │                                              │ Search [1/8] │ │ chọn  │
│      │                   ┌───────────────────────┐  │ [◄] [►] [X]  │ │ Side- │
│ [ 1] │                   │                       │  └──────────────┘ │ bar   │
│ ┌──┐ │                   │       TRANG 1         │                   │ Danh  │
│ └──┘ │                   │   Nội dung tài liệu   │                   │ sách  │
│      │                   │                       │                   │ File) │
│ [ 2] │                   └───────────────────────┘                   │       │
│ ┌──┐ │                   ┌───────────────────────┐                   │       │
│ └──┘ │                   │       TRANG 2         │                   │       │
│      │                   └───────────────────────┘                   │       │
├──────┴───────────────────────────────────────────────────────────────┴───────┤
│   ┌──────────────────────────────────────────────────────────────────────┐   │
│   │ [Thmb] [◄ 1/48 ►] │ [-] 100% [+] │ [Vừa Ngang] │ [In 🖨️] │ [Xoay]   │   │
│   └──────────────────────────────────────────────────────────────────────┘   │
│                                           ┌──────────────────────────────┐   │
│                                           │ 🎵 Bài hát... [⏯] [⏭] [Tab] │   │
│                                           └──────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 5.2. Thanh Bên Ảnh Thu Nhỏ Trang (Left Sidebar Thumbnails)
- **Vị trí:** Ngăn kéo bên trái có thể bật/tắt (Toggleable Left Drawer).
- **Trải nghiệm:**
  - Hiển thị danh sách card thu nhỏ của từng trang kèm số trang bên dưới (`Trang 1`, `Trang 2`...).
  - Trang đang đọc trên màn hình sẽ có viền sáng Cyan (`ring-2 ring-cyan-500`).
  - Click vào bất kỳ thumbnail nào sẽ cuộn mượt (`scrollIntoView`) đưa trang đó ra giữa màn hình.
  - **Lazy Rendering:** Chỉ render thumbnail của các trang đang hiển thị trong danh sách cuộn thumbnail, tránh tốn CPU.

### 5.3. Hộp Thoại Tìm Kiếm Văn Bản Nổi (Floating Search Bar)
- **Kích hoạt:** Bấm `Cmd+F` (macOS) hoặc `Ctrl+F` (Windows).
- **Giao diện:** Hộp thoại kính mờ nhỏ gọn xuất hiện ở góc trên bên phải của tài liệu.
- **Chức năng:**
  - Ô nhập từ khóa (Search Input) với cơ chế debounce 200ms.
  - Badge đếm kết quả: `[ 3 / 18 ]` (kết quả hiện tại / tổng số kết quả).
  - Nút chuyển `◄` (Prev match) và `►` (Next match).
  - Tự động cuộn đến trang chứa từ khóa và bôi màu vàng nổi bật (`highlight-match`).
  - Phím `Enter` nhảy đến kết quả tiếp theo, `Shift+Enter` nhảy về kết quả trước, `Esc` đóng thanh tìm kiếm.

### 5.4. Hỗ trợ In Ấn Chuẩn Hệ Điều Hành (Native OS Print Dialog)
- **Kích hoạt:** Bấm `Cmd+P` (macOS) hoặc `Ctrl+P` (Windows) hoặc click nút biểu tượng máy in 🖨️ trên thanh HUD.
- **Cơ chế kỹ thuật:**
  - Sử dụng cơ chế in native của WebView (`window.print()`).
  - Đi kèm khối `@media print`:
    - Ẩn toàn bộ giao diện thanh tiêu đề, tabs, HUD, sidebar và controls.
    - Dàn trang toàn bộ các trang PDF với kích thước chuẩn trang in (A4/Letter), ngắt trang tự động bằng `page-break-after: always`.
  - Mở trực tiếp **Print Dialog chuẩn mực của hệ điều hành** (trên macOS mở hộp thoại in Apple Quartz mượt mà, trên Windows 11 mở hộp thoại Print hiện đại của Windows). Người dùng có thể chọn máy in vật lý hoặc xuất ra file "Save as PDF".

---

## 6. Bảng Phím tắt Thống nhất (Keyboard Shortcuts Mapping)

Tương thích chuẩn mực trên cả macOS và Windows 11:

| Tác vụ | Phím tắt macOS | Phím tắt Windows 11 | Ghi chú |
| :--- | :--- | :--- | :--- |
| **Tìm kiếm văn bản** | `Cmd + F` | `Ctrl + F` | Mở hộp thoại Search |
| **In tài liệu (Print)** | `Cmd + P` | `Ctrl + P` | Mở Print Dialog chuẩn OS |
| **Bật/Tắt Thumbnails** | `T` hoặc `Cmd + Alt + 1` | `T` hoặc `Ctrl + Alt + 1` | Hiện/ẩn thanh ảnh thu nhỏ bên trái |
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

## 7. Phân tích Độ Phức tạp & Đánh giá Effort (Feature Effort Matrix)

Phân tích chuyên sâu trả lời câu hỏi: **"Trong các tính năng yêu cầu, có cái nào effort cao không?"**

| Tính năng | Mức độ Effort | Đánh giá Kỹ thuật & Rủi ro | Giải pháp Khả thi Tối ưu |
| :--- | :---: | :--- | :--- |
| **1. Mở PDF từ Finder / Open** | 🟢 **Rất Thấp** (0.5 ngày) | Hạ tầng `fileAssociations`, `RunEvent::Opened` và lệnh mở thư mục trong Tauri đã hoàn thiện 100%. | Chỉ cần thêm đuôi `.pdf` vào bộ lọc và gọi mở tab tương ứng. |
| **2. Render trang Retina sắc nét** | 🟢 **Thấp** (0.5 ngày) | `pdfjs-dist` hỗ trợ sẵn tham số `viewport.scale = scale * window.devicePixelRatio`. | Cực kỳ sắc nét, chạy mượt trên cả Mac Retina và màn hình 4K. |
| **3. Scroll dọc liên tục** | 🟢 **Thấp** (0.5 - 1 ngày) | Dùng container `overflow-y-auto` xếp các thẻ `<canvas>` theo chiều dọc. | Áp dụng `IntersectionObserver` để theo dõi trang đang xem. |
| **4. Zoom +/-, Fit Width, Fit Page** | 🟡 **Thấp - Vừa** (0.5 ngày) | Tính toán tỷ lệ `viewport.width / container.width`. | Hoàn toàn tương tự cơ chế Zoom/Fit đã làm bên module Viewer ảnh. |
| **5. Page Number & Jump to Page** | 🟢 **Thấp** (0.5 ngày) | Nhập số trang → gọi `document.getElementById('page-N').scrollIntoView()`. | Rất đơn giản, không có rủi ro kỹ thuật. |
| **6. Hỗ trợ In dùng Print Dialog OS** | 🟡 **Vừa** (1 ngày) | Gọi `window.print()` mở hộp thoại native của OS. Thách thức: cần style `@media print` dàn trang sạch sẽ. | Ẩn toàn bộ HUD/Tabs bằng CSS print, in trực tiếp nội dung canvas. |
| **7. Left Sidebar Thumbnails (Bật/tắt)** | 🟡 **Vừa** (1.5 ngày) | Cần render canvas kích thước nhỏ (`scale: 0.2`). Nếu tài liệu 500 trang mà vẽ hết cùng lúc sẽ ngốn CPU. | **Giải pháp:** Lazy render thumbnails (chỉ render các ô đang cuộn tới trong drawer bên trái). |
| **8. Search Text (Tìm kiếm Văn bản)** | 🔴 **Cao nhất trong danh sách** (2 - 3 ngày) | `pdfjs-dist` hỗ trợ trích xuất text qua `getTextContent()`, nhưng việc highlight chuỗi nằm rải rác giữa nhiều dòng, căn tọa độ text layer và quản lý chỉ mục kết quả (`[3/18]`) đòi hỏi logic phức tạp nhất. | **Giải pháp V1:** Tận dụng thư viện con `PDFFindController` đi kèm `pdfjs-dist` để không phải tự viết thuật toán tìm kiếm từ đầu. |

> **Kết luận về Effort:** Hầu hết 7 tính năng đầu đều ở mức **Thấp đến Vừa**. Duy nhất tính năng **Search Text** là có độ phức tạp cao hơn cả do liên quan đến phân tách chuỗi đa dòng và căn chỉnh DOM textLayer. Tuy nhiên, việc tận dụng bộ `PDFFindController` của Mozilla giúp giảm thời gian triển khai xuống mức hoàn toàn kiểm soát được.

---

## 8. Hợp đồng Backend & Hệ Điều hành (Backend & OS Integration)

### 8.1. Cập nhật Bộ quét Tệp Rust (`src-tauri/src/commands/fs_scan.rs`)
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

### 8.2. Cấu hình Đăng ký Đuôi Tệp Hệ điều hành (`tauri.conf.json`)
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

## 9. Tiêu chuẩn Nghiệm thu QA (Acceptance Criteria)

- **AC-PDF-01 (Mở tệp đơn lẻ):** Mở ứng dụng với tham số đường dẫn file `.pdf`, ứng dụng tự động hiển thị tab đọc PDF và render trang 1 sắc nét.
- **AC-PDF-02 (Duyệt thư mục hỗn hợp):** Mở một thư mục chứa cả ảnh, video, nhạc và PDF; Sidebar hiển thị đầy đủ icon màu đỏ phân biệt cho các tệp PDF; click vào tệp PDF nào sẽ hoán đổi giao diện sang chế độ đọc PDF của tệp đó.
- **AC-PDF-03 (Âm thanh nền bền vững):** Đang phát một tệp âm thanh ở tab A, chuyển sang xem tệp PDF ở tab B, âm thanh tiếp tục phát bình thường không vấp giật; thanh `MiniAudioPill` phản hồi chính xác.
- **AC-PDF-04 (Cuộn dọc & Nhảy trang):** Cuộn dọc liên tục mượt mà; nhập số trang trực tiếp và bấm Enter lập tức nhảy đến đúng trang đó.
- **AC-PDF-05 (Thu phóng & Vừa màn hình):** Zoom tự do, `Fit Width`, `Fit Page` hoạt động chuẩn xác, chữ không bị vỡ trên màn hình Retina/HiDPI.
- **AC-PDF-06 (Bôi đen & Sao chép chữ):** Người dùng có thể quét chuột chọn văn bản trên trang PDF và bấm `Cmd+C` / `Ctrl+C` sao chép nội dung vào Clipboard hệ thống.
- **AC-PDF-07 (Chế độ Ban đêm Invert):** Bật chế độ Invert biến nền trắng thành nền tối dễ chịu, chống mỏi mắt.
- **AC-PDF-08 (Thanh Thumbnails bên trái):** Bấm phím `T` bật/tắt ngăn kéo ảnh thu nhỏ; click vào thumbnail bất kỳ cuộn ngay đến trang tương ứng; trang đang đọc có viền sáng viền Cyan.
- **AC-PDF-09 (In ấn chuẩn OS):** Bấm `Cmd+P` / `Ctrl+P` mở hộp thoại Print chuẩn của hệ điều hành; trang in sạch sẽ không dính thanh công cụ hay HUD.
- **AC-PDF-10 (Tìm kiếm Văn bản):** Bấm `Cmd+F` / `Ctrl+F` mở thanh tìm kiếm; gõ từ khóa tự động highlight kết quả và nhảy đến vị trí kết quả đầu tiên; bấm Enter chuyển sang kết quả tiếp theo.
- **AC-PDF-11 (Giải phóng Bộ nhớ):** Đóng tab PDF hoặc thoát app giải phóng toàn bộ Worker và bộ nhớ đệm Canvas, không rò rỉ RAM (Zero Leak).

---

## 10. Ranh giới Phạm vi Triển khai (Scope Boundary)

### Trong phạm vi V1.2.0 (In-Scope):
* Hiển thị tài liệu PDF với hiệu năng cao theo cơ chế cuộn dọc liên tục (Continuous Scroll).
* Zoom mượt Retina, Fit Width, Fit Page, xoay trang 90°.
* Text Selection & Copy to Clipboard.
* Bộ điều hướng trang, nhảy trang bằng số.
* Ngăn kéo ảnh thu nhỏ bên trái (Left Sidebar Thumbnails) có thể bật/tắt.
* Tìm kiếm văn bản nổi (Floating Text Search Bar) với điều hướng Next/Prev.
* In ấn tài liệu qua Print Dialog chuẩn của OS (`Cmd+P` / `Ctrl+P`).
* Tích hợp thanh Sidebar danh sách tệp và thanh MiniAudioPill phát nhạc toàn cục.
* Hỗ trợ đầy đủ phím tắt trên macOS và Windows 11.

### Ngoài phạm vi V1.2.0 (Out-of-Scope / Để lại tương lai):
* Chỉnh sửa nội dung PDF, thêm chú thích (Annotation), vẽ bút màu, thêm chữ ký số.
* Điền biểu mẫu PDF Form tương tác (Interactive Form Filling).
* Chuyển đổi định dạng PDF sang Word/Excel.
* Mã hóa hoặc gỡ mật khẩu file PDF bảo vệ bản quyền phức tạp.
