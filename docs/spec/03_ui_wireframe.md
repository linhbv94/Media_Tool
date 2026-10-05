# UI & Wireframe Specification: Media Tool (`_spec3_ui_wireframe`)

> **Phiên bản:** 1.0.0  
> **Ngày cập nhật:** 2026-10-01  
> **Phân loại đặc tả:** Bố cục Giao diện (Layout Wireframe), Bảng màu & Hợp đồng Phím tắt  
> **Tài liệu tham chiếu:** [00_system_overview.md](00_system_overview.md), [02_feature_flow.md](02_feature_flow.md)  

---

## 1. Tôn chỉ Thiết kế (Design Philosophy)

1. **Content-First (Ưu tiên Tuyệt đối cho Nội dung):**
   - 95% diện tích màn hình dành trọn cho media (ảnh, video hoặc thông tin âm nhạc).
   - Tuyệt đối không sử dụng thanh điều hướng bên lề (sidebar) hoặc thanh công cụ cố định (fixed toolbar) gây lãng phí không gian hiển thị.
2. **Minimalist Floating HUD (Màn hình Phủ Tối giản):**
   - Các chỉ số trạng thái hiển thị dưới dạng lớp phủ trong suốt (Semi-transparent Floating Overlays) và tự động ẩn khi không có tương tác chuột để tránh làm phiền mắt nhìn.
3. **Bảng màu Tối Hiện đại (Modern Dark Aesthetic):**
   - Nền cửa sổ: Màu tối trầm `#0f1117` tạo chiều sâu và độ tương phản tối đa cho ảnh và video.
   - Thẻ nổi / HUD: Nền kính mờ `rgba(20, 24, 33, 0.85)` với viền mảnh `rgba(255, 255, 255, 0.08)`.
   - Màu nhấn Trạng thái (Accents):
     - **Active Mark:** Màu đỏ cam nổi bật `#f43f5e` (hoặc Vàng hổ phách `#f59e0b`).
     - **A-B Loop Active:** Màu xanh Cyan `#06b6d4` hoặc Emerald `#10b981`.
     - **Văn bản chính:** Trắng sáng `#f8fafc`; Văn bản phụ: Xám `#94a3b8`.

---

## 2. Wireframe Phân hệ Viewer (Image Viewer)

Giao diện xem ảnh tập trung tối đa vào bức ảnh, đi kèm thanh công cụ điều khiển đầy đủ các nút bấm thao tác bằng chuột hoặc phím tắt.

```text
┌────────────────────────────────────────────────────────────────────────┐
│ [●][▲][▼]  (media_tool)                                                │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ 🏷️ DSC_0842.JPG   [ 14 / 120 ]   [◀ File] [File ▶]  ⭐ [ĐÃ ĐÁNH DẤU]│  │ ◄─ Top Bar (Thông tin & Điều hướng)
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│                                                                        │
│                             [ BỨC ẢNH ]                                │
│                   (Tự căn giữa, fit khít cửa sổ)                       │
│                                                                        │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ [⭐ Đánh dấu (M)]  [📋 Copy Ảnh này (Cmd+C)]                       │  │
│  │ ──────────────────────────────────────────────────────────────── │  │ ◄─ Bottom Action Bar
│  │ [📦 Copy Đã Mark (4)]   [✂️ Cut Đã Mark (4)]   [⛶ Toàn màn hình]  │  │    (Đầy đủ nút bấm cho chuột)
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│                 ┌────────────────────────────────────┐                 │
│                 │  ✓ Đã sao chép 4 tệp vào Clipboard │                 │ ◄─ Toast Feedback
│                 └────────────────────────────────────┘                 │
└────────────────────────────────────────────────────────────────────────┘
```

### Thành phần Giao diện & Nút bấm Viewer:
1. **Top Bar (Thanh thông tin & Điều hướng):**
   - **Tên tệp (File Name):** Tên file ảnh đang mở (`DSC_0842.JPG`).
   - **Chỉ số Vị trí (Index Counter):** `[ 14 / 120 ]` (vị trí hiện tại trên tổng file).
   - **Nút điều hướng file:** Nút bấm `[◀ File Trước]` và `[File Tiếp ▶]` giúp bấm chuột chuyển file ngay lập tức.
   - **Huy hiệu Đánh dấu:** Trạng thái `⭐ [ĐÃ ĐÁNH DẤU]` hoặc `[Chưa đánh dấu]`.
2. **Bottom Action Bar (Thanh nút bấm hành động đầy đủ):**
   - **Nút `[⭐ Đánh dấu (M)]`:** Bấm chuột để bật/tắt đánh dấu ảnh hiện tại.
   - **Nút `[📋 Copy Ảnh này (Cmd+C)]`:** Chỉ sao chép duy nhất file ảnh hiện tại vào OS Clipboard.
   - **Nút `[📦 Copy Đã Mark (N)]`:** Sao chép toàn bộ danh sách N file đã đánh dấu vào OS Clipboard.
   - **Nút `[✂️ Cut Đã Mark (N)]`:** Đưa toàn bộ danh sách N file đã đánh dấu vào OS Clipboard với cờ Cut (Move) để di chuyển tệp khi paste ra ngoài Finder / Explorer.
   - **Nút `[⛶ Toàn màn hình]`:** Bật/tắt chế độ full screen.

---

## 3. Wireframe Phân hệ Player — Chế độ Video

Mặc định hiển thị **Thanh điều khiển Đầy đủ (Full Persistent Control Bar)**. Người dùng có nút bấm hoặc phím tắt để bật/tắt (Toggle) ẩn hiện thanh điều khiển này khi muốn xem video thoáng mắt.

```text
┌────────────────────────────────────────────────────────────────────────┐
│ [●][▲][▼]   action_clip_02.mp4                        [👁️ Ẩn/Hiện HUD] │
│                                                                        │
│                                                                        │
│                           [ VIDEO CONTENT ]                            │
│                        (Khung hiển thị Video)                          │
│                                                                        │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ 01:14 ────────────────●───────[════════════════]──────── 04:32   │  │ ◄─ Timeline với mốc [A] và [B]
│  │                               ▲                ▲                 │  │
│  │                            Điểm A           Điểm B               │  │
│  │ ──────────────────────────────────────────────────────────────── │  │
│  │ [◀ File]  [⏪ -5s]  [◀ -1s]  [▶ Phát / ⏸ Dừng]  [+1s ▶]  [+5s ⏩]  [File ▶] │  │ ◄─ Cụm nút Play/Seek/File
│  │ ──────────────────────────────────────────────────────────────── │  │
│  │ [Set Điểm A]  [Set Điểm B]  [🔁 Loop: BẬT (Fade: 45ms)]           │  │ ◄─ Cụm nút A-B Loop
│  │ [⭐ Đánh dấu (M)]  [📦 Copy Đã Mark (3)]  [✂️ Cut Đã Mark (3)]     │  │ ◄─ Cụm nút Quản lý File
│  └──────────────────────────────────────────────────────────────────┘  │ ◄─ Full Control Bar (Mặc định HIỆN)
└────────────────────────────────────────────────────────────────────────┘
```

### Thành phần Giao diện & Tùy chọn Ẩn/Hiện Controls:
1. **Nút `[👁️ Ẩn/Hiện HUD]` (Góc trên phải hoặc phím tắt `H`):**
   - Chuyển đổi giữa 2 chế độ: **Luôn hiện thanh điều khiển (Persistent Full Control)** hoặc **Tự động ẩn sau 2 giây (Auto-hide)** khi xem phim.
2. **Thanh Timeline Thông minh:** Hiển thị thời gian chạy, mốc A, mốc B và phân đoạn highlight lặp lại.
3. **Cụm Nút bấm Đầy đủ trên UI (Full Mouse Controls):**
   - **Điều hướng File:** `[◀ File Trước]`, `[File Tiếp ▶]`.
   - **Tua thời gian:** `[⏪ -5s]`, `[◀ -1s]`, `[▶/⏸]`, `[+1s ▶]`, `[+5s ⏩]`.
   - **Vòng lặp A-B:** Nút bấm `[Set Điểm A]`, `[Set Điểm B]`, nút bật/tắt `[🔁 Loop: BẬT/TẮT]`.
   - **Đánh dấu & Xuất file:** Nút `[⭐ Đánh dấu]`, `[📦 Copy Đã Mark]`, `[✂️ Cut Đã Mark]`.

---

## 4. Wireframe Phân hệ Player — Chế độ Audio (Âm nhạc & Podcast)

Khi mở file audio, giao diện giữ nguyên thanh điều khiển đầy đủ bên dưới, đồng thời trung tâm hiển thị Card âm nhạc với bìa đĩa (Album Art) và thông tin bài hát.

```text
┌────────────────────────────────────────────────────────────────────────┐
│ [●][▲][▼]                                                              │
│                                                                        │
│                 ┌───────────────────────────────────┐                  │
│                 │          ┌─────────────┐          │                  │
│                 │          │  BÌA ALBUM  │          │                  │
│                 │          │ (Album Art) │          │                  │
│                 │          └─────────────┘          │                  │
│                 │      Counting Stars               │                  │
│                 │      OneRepublic • Native (2013)  │                  │
│                 └───────────────────────────────────┘                  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ 00:45 ─────────────●──────────[═════════════]─────────── 04:17   │  │ ◄─ Timeline
│  │                                                                  │  │
│  │ [◀ File]  [⏪ -5s]  [◀ -1s]  [▶/⏸]  [+1s ▶]  [+5s ⏩]  [File ▶]    │  │ ◄─ Nút bấm Player
│  │ [Set Điểm A]  [Set Điểm B]  [🔁 Loop: BẬT (Fade: 60ms)]          │  │ ◄─ Nút bấm A-B Loop
│  │ [⭐ Đánh dấu (M)]  [📦 Copy Đã Mark (4)]  [✂️ Cut Đã Mark (4)]    │  │ ◄─ Nút bấm Copy/Cut
│  └──────────────────────────────────────────────────────────────────┘  │ ◄─ Full Control Bar
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Wireframe Thanh Bên Phải — Danh sách Tệp Thư mục (Toggle Right Sidebar)

Người dùng có thể bật/tắt thanh bên phải bằng nút bấm **`[📑 Danh sách (B)]`** trên Top Bar hoặc phím tắt **`B`** (hoặc `Cmd/Ctrl + B`). Thanh bên trượt ra mượt mà từ cạnh phải, chiếm khoảng 260px - 280px chiều rộng mà không làm gián đoạn phát video hay xem ảnh.

```text
┌───────────────────────────────────────────────────────────┬──────────────┐
│ [●][▲][▼]                                                 │ 📁 Thư mục   │
│ 🏷️ DSC_0842.JPG   [ 14 / 120 ]   [◀][▶]   [📌 Ghim (P)]   │ 120 tệp [✕]  │
│                                                           ├──────────────┤
│                                                           │ 🔍 Lọc nhanh │
│                                                           ├──────────────┤
│                                                           │ 🖼️ 01_raw.jpg│
│                                                           │ 🖼️ 02_cam.png│
│                   [ VÙNG XEM MEDIA ]                      │ ⭐ 03_sky.jpg│ ◄─ Tệp đã mark
│                (Tự động co giãn theo khung)               │ ▶ 04_act.mp4 │
│                                                           │ 🖼️ DSC_0842 ●│ ◄─ Tệp đang xem
│                                                           │ 🎵 06_rec.mp3│
│ ───────────────────────────────────────────────────────── │ 🖼️ 07_res.jpg│
│ [▶ Phát]  [⏪ -5s]  [+5s ⏩]  [⭐ Đánh dấu]  [📦 Copy Đã Mark] │ 🖼️ 08_end.png│
└───────────────────────────────────────────────────────────┴──────────────┘
```

### Các Đặc điểm & Tính năng của Right Sidebar:
1. **Dữ liệu Sẵn có Tức thì (Zero Latency):** Danh sách tệp này đã nằm sẵn trong bộ nhớ RAM từ lệnh quét thư mục khởi tạo (`items: MediaItem[]`). Việc bật/tắt hoàn toàn là chuyển đổi hiển thị giao diện, không tốn thời gian quét lại đĩa.
2. **Nhảy Tệp 1-Click (Instant File Jump):** Bấm chuột vào bất kỳ dòng nào trong danh sách sẽ lập tức chuyển ngay đến tệp đó (tự động đổi chế độ Viewer ↔ Player tương ứng).
3. **Chỉ báo Trực quan Rõ nét:**
   - **Tệp đang xem:** Được tô sáng nền màu xanh đậm kèm dấu chấm `●`.
   - **Tệp đã đánh dấu:** Hiển thị biểu tượng ngôi sao vàng cam `⭐`.
   - **Icon định dạng:** Phân biệt rõ ràng icon ảnh `🖼️`, video `▶`, audio `🎵`.
4. **Ô Tìm kiếm & Lọc nhanh (Quick Search/Filter):** Cho phép gõ tên file để lọc nhanh danh sách khi thư mục có hàng trăm/hàng nghìn tệp.

---

## 6. Bảng Hợp đồng Phím tắt & Đối chiếu Nút bấm UI

Mọi chức năng đều hỗ trợ song song cả **Phím tắt nhanh** lẫn **Nút bấm trực quan (Button UI)**:

| Chức năng Thao tác | Phím tắt macOS | Phím tắt Windows | Nút bấm Trực quan trên UI |
| :--- | :--- | :--- | :--- |
| **Ảnh trước / Ảnh sau** *(Khi đang xem Ảnh)* | `Mũi tên Trái` / `Phải` | `Mũi tên Trái` / `Phải` | Nút `[◀ File]` / `[File ▶]` |
| **File Media trước / sau** *(Ở Video/Audio)* | `Cmd + Trái` / `Phải` | `Ctrl + Trái` / `Phải` | Nút `[◀ File]` / `[File ▶]` |
| **Phát / Tạm dừng** | `Space` | `Space` | Nút `[▶ Phát / ⏸ Dừng]` |
| **Tua chính xác ±1 giây** | `Mũi tên Trái` / `Phải` | `Mũi tên Trái` / `Phải` | Nút `[◀ -1s]` / `[+1s ▶]` |
| **Tua nhanh ±5 giây** | `Shift + Trái` / `Phải` | `Shift + Trái` / `Phải` | Nút `[⏪ -5s]` / `[+5s ⏩]` |
| **Nhảy mốc timeline 0% → 90%** | Phím số `0` đến `9` | Phím số `0` đến `9` | Click trực tiếp vào vị trí trên Timeline |
| **Đánh dấu / Bỏ đánh dấu file này** | Phím `M` | Phím `M` | Nút `[⭐ Đánh dấu (M)]` |
| **Copy DUY NHẤT file đang xem** | `Cmd + C` | `Ctrl + C` | Nút `[📋 Copy Ảnh này]` |
| **Copy TẤT CẢ các file Đã Mark** | `Cmd + Shift + C` | `Ctrl + Shift + C` | Nút `[📦 Copy Đã Mark (N)]` |
| **Cut (Cắt/Move) các file Đã Mark** | `Cmd + X` | `Ctrl + X` | Nút `[✂️ Cut Đã Mark (N)]` |
| **Đặt điểm lặp A / Điểm B** | Phím `[` / Phím `]` | Phím `[` / Phím `]` | Nút `[Set Điểm A]` / `[Set Điểm B]` |
| **Bật / Tắt Vòng lặp A–B** | Phím `L` | Phím `L` | Nút `[🔁 Loop: BẬT/TẮT]` |
| **Ghim cửa sổ trên cùng (Pin on Top)** | Phím `P` | Phím `P` | Nút `[📌 Ghim / Unpin]` |
| **Bật/Tắt Danh sách Thư mục (Sidebar)**| Phím `B` | Phím `B` | Nút `[📑 Danh sách (B)]` |
| **Ẩn / Hiện thanh điều khiển** | Phím `H` | Phím `H` | Nút `[👁️ Ẩn/Hiện HUD]` |
| **Toàn màn hình (Fullscreen)** | `Cmd + Ctrl + F` | `F11` | Nút `[⛶ Toàn màn hình]` |
| **Đóng / Thoát ứng dụng** | `Cmd + W` / `Esc` | `Alt + F4` / `Esc` | Nút tắt cửa sổ OS |

---

## 7. Định dạng Icon Hệ thống (Icon System Standards)

Toàn bộ icon hiển thị trên các nút bấm (Buttons) và thanh công cụ của ứng dụng thống nhất sử dụng **chuẩn định dạng SVG (Scalable Vector Graphics)** kết hợp thư viện **Lucide Icons** (`lucide-react`):
- **Ưu điểm tuyệt đối:**
  1. *Độ sắc nét vô hạn (Vector):* Hiển thị sắc nét 100% trên mọi loại màn hình từ Full HD thông thường đến màn hình Retina độ phân giải cao của Mac hay 4K Windows, không bao giờ bị vỡ hạt như PNG.
  2. *Dung lượng siêu nhẹ:* Mỗi icon SVG chỉ nặng vài trăm bytes, không làm tăng dung lượng bundle.
  3. *Tự động biến đổi màu theo trạng thái:* Kế thừa thuộc tính `currentColor` của CSS, tự động chuyển màu sáng/tối khi hover, click, disabled hoặc chuyển Dark Mode mượt mà.
  4. *Không dùng PNG cho nút bấm:* Định dạng PNG/WebP chỉ dùng cho dữ liệu media nội dung (bìa album, ảnh người dùng), tuyệt đối không dùng làm icon nút bấm.

---

## 8. Logic Điều phối Thư mục Hỗn hợp (Mixed Folder Dynamic Switching)

Một thư mục làm việc thực tế thường chứa lẫn lộn cả ảnh (`.jpg`, `.png`), video (`.mp4`, `.mov`) và âm thanh (`.mp3`).

### Cơ chế Tự động Chuyển đổi Linh hoạt (Dynamic Mode Switching):
1. **Danh sách Duyệt Thống nhất (Unified Playlist):**
   - Khi mở thư mục, ứng dụng liệt kê **tất cả** các tệp media được hỗ trợ (ảnh, video, audio) thành một danh sách tuần tự duy nhất theo thuật toán Sắp xếp Tự nhiên (`natural_sort`).
   - Ví dụ: `01.jpg` → `02.mp4` → `03.jpg` → `04.mp3`.
2. **Quy tắc Chuyển Đổi Giao diện Tức thì (Hot-swap UI):**
   - Đang ở `01.jpg` (Viewer Mode) → Next sang `02.mp4` → Ứng dụng **tự động chuyển ngay sang Player Mode**, nạp video và hiện thanh playback.
   - Đang ở `02.mp4` (Player Mode) → Next sang `03.jpg` → Ứng dụng **tự động tắt video engine và chuyển về Viewer Mode** hiển thị ảnh.
3. **Quy tắc Phím tắt Điều hướng khi qua lại giữa Ảnh và Video:**
   - **Khi đang xem Ảnh:** Bấm `Mũi tên Phải (→)` hoặc `Cmd/Ctrl + →` đều chuyển sang file tiếp theo (`02.mp4`) vì ảnh không có dòng thời gian tua.
   - **Khi đã chuyển sang Video:** Mũi tên đơn lẻ `←` / `→` được ưu tiên làm nhiệm vụ **Tua thời gian (Seek ±1s)**. Do đó, để chuyển sang file tiếp theo (`03.jpg`), người dùng dùng tổ hợp phím **`Cmd + →` (macOS)** hoặc **`Ctrl + →` (Windows)**.
   - **Thao tác Chuột:** Nút bấm **`[File Tiếp ▶]`** và **`[◀ File Trước]`** trên thanh công cụ luôn luôn thực hiện chuyển file bất kể đang xem ảnh hay video, đảm bảo trải nghiệm bằng chuột liền mạch 100%.
