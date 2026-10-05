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

Giao diện xem ảnh tối giản, hiện đại và tập trung tối đa vào bức ảnh. Thanh thông tin tệp chuyển xuống dưới cùng, thanh công cụ gộp thành 1 hàng duy nhất và Toast phản hồi nổi ngay phía trên thanh công cụ.

```text
┌────────────────────────────────────────────────────────────────────────┐
│ [●][▲][▼] media_tool                   [📌 Ghim] [👁️ Ẩn HUD] [📑 DS]│ ◄─ Window Bar (Chuẩn cả 3 phân hệ)
│                                                                        │
│                                                                        │
│                             [ BỨC ẢNH ]                                │
│                   (Tự căn giữa, fit khít cửa sổ)                       │
│                                                                        │
│                                                                        │
│                 ┌────────────────────────────────────┐                 │
│                 │  ✓ Đã sao chép 4 tệp vào Clipboard │                 │ ◄─ Toast Feedback (Tự biến mất sau 2s)
│                 └────────────────────────────────────┘                 │    (Nổi lơ lửng phía trên Action Bar)
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ [◀ Trước] [Tiếp ▶]  [☆ Đánh dấu (M)]  [📦 Copy Mark (4)] [✂️ Cut] [⛶]│  │ ◄─ Bottom Action Bar (Gộp 1 hàng duy nhất)
│  └──────────────────────────────────────────────────────────────────┘  │
│  🏷️ DSC_0842.JPG                                            [ 14 / 120 ]│ ◄─ Footer Dưới cùng: Tên file + Số thứ tự
└────────────────────────────────────────────────────────────────────────┘
```

### Thành phần Giao diện & Nút bấm Viewer:
1. **Window Bar (Thanh cửa sổ trên cùng — Thống nhất cho cả 3 phân hệ):**
   - Góc trái: Cụm điều khiển cửa sổ OS `[●][▲][▼]` và tên ứng dụng `media_tool`.
   - Góc phải: Nút ghim cửa sổ `[📌 Ghim]` và nút mở danh sách `[📑 DS]`.
2. **Toast Feedback:**
   - Đặt lơ lửng ngay **phía trên** Action Bar.
   - Khi bấm Copy / Cut, Toast hiện ra thông báo kết quả trong 2 giây rồi tự mờ và biến mất, không chiếm diện tích cố định.
3. **Bottom Action Bar (Gộp thành 1 hàng duy nhất):**
   - **Nút điều hướng:** `[◀ Trước]` và `[Tiếp ▶]` chuyển file trực tiếp.
   - **Nút Đánh dấu trực quan:** 
     - Trạng thái chưa đánh dấu: Icon **outline** viền rỗng `☆ Đánh dấu (M)`.
     - Trạng thái đã đánh dấu: Icon tự chuyển thành **fill** tô đặc màu vàng cam `★ Đã đánh dấu (M)`.
   - **Nút `[📦 Copy Mark (N)]`:** Sao chép danh sách file đã đánh dấu ra OS Clipboard.
   - **Nút `[✂️ Cut Mark (N)]`:** Cắt danh sách file đã đánh dấu để di chuyển (Move).
   - **Nút `[⛶ Toàn màn hình]`:** Bật/tắt chế độ Fullscreen.
   *(Nút sao chép ảnh hiện tại đã được loại bỏ trên giao diện để tránh rườm rà, người dùng chỉ cần nhấn phím tắt `Cmd+C` / `Ctrl+C`).*
4. **Footer Dưới cùng (Thanh trạng thái tối giản):**
   - Đặt ở đáy màn hình: Góc trái là **Tên tệp** (`DSC_0842.JPG`), góc phải là **Số thứ tự trong folder** (`[ 14 / 120 ]`).

---

## 3. Wireframe Phân hệ Player — Chế độ Video

Tương tự phân hệ Viewer: Thanh cửa sổ trên cùng giữ chuẩn thống nhất, thanh điều khiển phát gộp tinh gọn và Footer đáy hiển thị tên video kèm số thứ tự.

```text
┌────────────────────────────────────────────────────────────────────────┐
│ [●][▲][▼] media_tool                   [📌 Ghim] [👁️ Ẩn HUD] [📑 DS]│ ◄─ Window Bar
│                                                                        │
│                                                                        │
│                           [ VIDEO CONTENT ]                            │
│                        (Khung hiển thị Video)                          │
│                                                                        │
│                                                                        │
│                 ┌────────────────────────────────────┐                 │
│                 │  ✓ Đã sao chép 3 tệp vào Clipboard │                 │ ◄─ Toast Feedback
│                 └────────────────────────────────────┘                 │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │ 01:14 ────────────────●───────[════════════════]──────── 04:32                   │  │ ◄─ Timeline với mốc [A] và [B]
│  │                               ▲                ▲                                 │  │
│  │ ──────────────────────────────────────────────────────────────────────────────── │  │
│  │ [⏪ -5s] [◀ -1s] [▶/⏸] [+1s ▶] [+5s ⏩] │ [🔀 Shuffle] [🔁 File: Tắt] │ [Set A] [Set B] [🔁 AB: 45ms] │  │ ◄─ Hàng 1: Tua, Play, Shuffle, Loop File & Loop AB
│  │ ──────────────────────────────────────────────────────────────────────────────── │  │
│  │ [◀ Trước] [Tiếp ▶]  │  [☆ Đánh dấu (M)]  │  [📦 Copy Mark (3)]  [✂️ Cut Mark (3)]  │  [⛶] │  │ ◄─ Hàng 2: Chuyển File, Đánh dấu, Copy/Cut & Fullscreen
│  └──────────────────────────────────────────────────────────────────────────────────┘  │ ◄─ Control Bar (Mặc định HIỆN)
│  🏷️ action_clip_02.mp4                                       [ 15 / 120 ]│ ◄─ Footer Dưới cùng: Tên file + Số thứ tự
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Wireframe Phân hệ Player — Chế độ Audio (Âm nhạc & Podcast)

Khi mở file audio, giao diện giữ nguyên cấu trúc chuẩn: Window Bar phía trên, Card âm nhạc ở giữa, thanh điều khiển bên dưới và Footer đáy hiển thị tên file kèm số thứ tự.

```text
┌────────────────────────────────────────────────────────────────────────┐
│ [●][▲][▼] media_tool                                  [📌 Ghim] [📑 DS]│ ◄─ Window Bar
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
│                 ┌────────────────────────────────────┐                 │
│                 │  ✓ Đã sao chép 4 tệp vào Clipboard │                 │ ◄─ Toast Feedback
│                 └────────────────────────────────────┘                 │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │ 00:45 ─────────────●──────────[═════════════]─────────── 04:17                   │  │ ◄─ Timeline
│  │ [⏪ -5s] [◀ -1s] [▶/⏸] [+1s ▶] [+5s ⏩] │ [🔀 Shuffle] [🔁 File: Tắt] │ [Set A] [Set B] [🔁 AB: 60ms] │  │ ◄─ Hàng 1: Tua, Play, Shuffle & Loop
│  │ [◀ Trước] [Tiếp ▶]  │  [☆ Đánh dấu (M)]  │  [📦 Copy Mark (4)]  [✂️ Cut Mark (4)]  │  [⛶] │  │ ◄─ Hàng 2: Chuyển File & Copy/Cut
│  └──────────────────────────────────────────────────────────────────────────────────┘  │ ◄─ Control Bar
│  🏷️ track_03_counting_stars.mp3                              [ 16 / 120 ]│ ◄─ Footer Dưới cùng: Tên file + Số thứ tự
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
| **Đánh dấu / Bỏ đánh dấu file này** | Phím `M` | Phím `M` | Nút `[☆ Đánh dấu]` / `[★ Đã mark]` (Outline ↔ Fill) |
| **Copy DUY NHẤT file đang xem** | `Cmd + C` | `Ctrl + C` | Phím tắt nhanh (Đã bỏ nút để tối giản UI) |
| **Copy TẤT CẢ các file Đã Mark** | `Cmd + Shift + C` | `Ctrl + Shift + C` | Nút `[📦 Copy Mark (N)]` |
| **Cut (Cắt/Move) các file Đã Mark** | `Cmd + X` | `Ctrl + X` | Nút `[✂️ Cut Mark (N)]` |
| **Đặt điểm lặp A / Điểm B** | Phím `[` / Phím `]` | Phím `[` / Phím `]` | Nút `[Set Điểm A]` / `[Set Điểm B]` |
| **Bật / Tắt Vòng lặp A–B** | Phím `L` | Phím `L` | Nút `[🔁 AB: BẬT/TẮT]` |
| **Bật / Tắt Xáo trộn (Shuffle)** | Phím `S` | Phím `S` | Nút `[🔀 Shuffle: BẬT/TẮT]` |
| **Chế độ Lặp Tệp (Loop File)** | Phím `R` | Phím `R` | Nút `[🔁 File: Tắt ↔ 1 ↔ All]` |
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

---

## 9. Đặc tả Quy chuẩn Khung hình, Tỉ lệ & Cửa sổ Hiển thị (Viewport & Scaling Standards)

Nhằm đảm bảo giao diện luôn **đẹp mắt, không méo hình, không vỡ hạt và không bị che khuất thanh công cụ**, hệ thống quy chuẩn xử lý mặc định (Default Behavior) cho 4 trường hợp kích thước media như sau:

### Nguyên tắc Bất biến:
1. **Giữ nguyên 100% Tỉ lệ Khung hình Gốc (Strict Aspect Ratio):** Tuyệt đối không bao giờ kéo giãn (stretch) làm méo hình ảnh hay video.
2. **Căn giữa Tuyệt đối (Absolute Center Alignment):** Mọi media luôn được căn giữa trục ngang và trục dọc trong vùng hiển thị (Viewport).
3. **Cửa sổ Ổn định (Stable Window Geometry):** Kích thước cửa sổ ứng dụng không tự động nhảy giật co rúm mỗi khi Next qua lại giữa ảnh ngang và ảnh dọc. Kích thước cửa sổ giữ nguyên theo lựa chọn của người dùng hoặc phiên mở trước.

---

### Bốn Trường hợp Kích thước & Quy chuẩn Hiển thị Mặc định:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        MA TRẬN QUY CHUẨN HIỂN THỊ MEDIA V1                             │
├─────────────────────┬─────────────────────────────────┬────────────────────────────────┤
│ Kích thước Media    │ Khổ Ngang (Landscape - 16:9, 4:3)│ Khổ Dọc (Portrait - 9:16, 3:4) │
├─────────────────────┼─────────────────────────────────┼────────────────────────────────┤
│ 1. Size TO HƠN      │ Scale Down / Fit Window:        │ Fit Height / Pillarbox:        │
│    Cửa sổ / Màn hình│ Tự động thu nhỏ vừa khít chiều  │ Thu nhỏ vừa khít chiều cao vùng│
│    (4K, 8K, RAW...) │ ngang, không tràn viền, nhìn    │ xem, để trống nền xám đen 2 bên│
│                     │ trọn vẹn 100% không mất góc.    │ trái/phải, không cần cuộn dọc. │
├─────────────────────┼─────────────────────────────────┼────────────────────────────────┤
│ 2. Size BÉ HƠN      │ 1:1 Actual Size (Center):       │ 1:1 Actual Size (Center):      │
│    Cửa sổ / Màn hình│ Giữ nguyên kích thước gốc 100%, │ Giữ nguyên kích thước gốc 100%,│
│    (Icon, 360p...)  │ căn giữa nền tối trầm `#0f1117`,│ căn giữa, KHÔNG kéo dãn to để  │
│                     │ KHÔNG tự phóng to (Tránh vỡ hạt)│ tránh nhòe hình (Tránh blur).  │
└─────────────────────┴─────────────────────────────────┴────────────────────────────────┘
```

#### Chi tiết Quy chuẩn cho từng Case:

* **Case 1: Khổ ngang, size TO HƠN màn hình (ví dụ ảnh 4K/8K 6000x4000, video 4K mở trên màn Full HD hoặc cửa sổ 1200x800):**
  - *Hành vi mặc định:* **Fit to Window (Scale Down)**.
  - Ảnh/video tự động thu nhỏ theo tỉ lệ chuẩn sao cho cạnh dài nhất vừa chạm mép khung hiển thị. Người dùng nhìn thấy trọn vẹn 100% bố cục mà không bị che mất bất kỳ chi tiết nào.
  - Vùng hiển thị được chừa khoảng đệm an toàn (safe-area padding) phía dưới để không bị thanh Action Bar / Control Bar đè lên nội dung.

* **Case 2: Khổ ngang, size BÉ HƠN màn hình (ví dụ icon 256x256, ảnh 400x300, video 360p trên màn 2K/4K):**
  - *Hành vi mặc định:* **Hiển thị 1:1 (Actual Size 100%) tại trung tâm**.
  - **Quy tắc quan trọng: Tuyệt đối KHÔNG tự động phóng to (No Forced Upscale)**. Nếu phóng to một bức ảnh 200px ra toàn màn hình 4K, ảnh sẽ bị nhòe mờ, vỡ pixel và biến dạng hạt rất xấu.
  - Không gian xung quanh hiển thị nền màu tối trầm `#0f1117` sang trọng và tạo chiều sâu.

* **Case 3: Khổ dọc, size TO HƠN màn hình (ví dụ ảnh chụp chân dung điện thoại 1080x1920, video TikTok/Reels/Shorts):**
  - *Hành vi mặc định:* **Fit Height (Vừa khít chiều cao)**.
  - Cạnh đứng (chiều cao) tự động thu nhỏ vừa đúng chiều cao khung hiển thị (đã trừ đi Action Bar), cạnh ngang tự động co theo đúng tỉ lệ. Hai bên trái và phải hiển thị dải nền đen xám tự nhiên (Pillarbox).
  - Đảm bảo người dùng xem được trọn vẹn từ đầu đến chân bức ảnh/video dọc mà không phải kéo thanh cuộn.

* **Case 4: Khổ dọc, size BÉ HƠN màn hình (ví dụ ảnh screenshot điện thoại cũ 360x640):**
  - *Hành vi mặc định:* **Hiển thị 1:1 (Actual Size) ở chính giữa**. Không upscale cưỡng bức để giữ nguyên độ sắc nét nguyên bản của tệp.

### Triển khai Kỹ thuật trên CSS / React:
```css
/* Container vùng hiển thị */
.media-viewport {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #0f1117;
}

/* Phần tử Image / Video: Vừa khít nếu to, giữ nguyên 1:1 nếu bé */
.media-content {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain; /* Đảm bảo không méo hình, không tràn viền */
  margin: auto;
}
```

---

## 10. Đặc tả Chi tiết: Khổ Dọc Hẹp, Cơ chế HUD Floating & Responsive Mini PiP Mode

Phần này quy định chi tiết 4 trường hợp đặc thù về hành vi hiển thị và layout nhằm đảm bảo trải nghiệm người dùng luôn mượt mà, không giật lag và không bị vỡ giao diện ở mọi kích thước cửa sổ.

### 10.1. Case Media Khổ Dọc có Chiều Rộng Bé Hơn Cụm Tính Năng

**Vấn đề:** Khi mở ảnh/video dọc (ví dụ tỉ lệ 9:16 như Reels/TikTok hoặc ảnh chân dung), chiều rộng thực tế của video có thể chỉ đạt 320px - 420px, trong khi cụm Control Bar / Action Bar đầy đủ cần tối thiểu 620px - 700px để hiển thị các nút bấm.

**Quy chuẩn thiết kế:**
1. **Neo vào Cửa sổ (Window-docked), KHÔNG neo vào Media Element:**
   - Cụm Control Bar / Action Bar được định vị neo theo **Cửa sổ ứng dụng (Application Window)** chứ KHÔNG bám theo kích thước của thẻ `<video>` hay `<img>`.
   - Cửa sổ ứng dụng luôn có kích thước tối thiểu an toàn (`min-width: 520px; min-height: 380px`).
2. **Căn giữa và Dải đệm hai bên (Pillarbox):**
   - Video/Ảnh khổ dọc đứng gọn gàng ở chính giữa màn hình.
   - Hai khoảng trống hai bên hiển thị nền tối trầm `#0f1117`.
   - Thanh Control Bar dạng kính mờ (Glassmorphism) nằm nổi ngang ở đáy cửa sổ, căn giữa theo chiều rộng cửa sổ (`max-width: 760px; width: calc(100% - 32px)`). Nhờ đó, các nút bấm không bao giờ bị bóp méo, co rúm hay tràn viền bất kể video dọc có hẹp đến đâu.

```text
┌────────────────────────────────────────────────────────────────────────┐
│ [●][▲][▼] media_tool                   [📌 Ghim] [👁️ Ẩn HUD] [📑 DS]│
│                                                                        │
│   Khoảng đệm        ┌──────────────────────┐        Khoảng đệm         │
│   nền tối đen       │                      │        nền tối đen        │
│   (Pillarbox)       │      VIDEO DỌC       │        (Pillarbox)        │
│                     │       (9 : 16)       │                           │
│                     │                      │                           │
│                     │                      │                           │
│  ┌──────────────────┴──────────────────────┴────────────────────────┐  │
│  │ 00:15 ──────●────────────────────────────── 00:58                │  │ ◄─ Control Bar nổi đè nhẹ
│  │ [⏪] [◀] [▶/⏸] [▶] [⏩] │ [🔀] [🔁 File] │ [Set A] [Set B] [🔁 AB] │  │    ngang đáy cửa sổ,
│  │ [◀ Trước] [Tiếp ▶]  │  [☆ Đánh dấu]  │  [📦 Copy]  [✂️ Cut]  │ [⛶]│  │    không bị bó hẹp theo video
│  └──────────────────────────────────────────────────────────────────┘  │
│  🏷️ tiktok_dance_trend.mp4                                   [ 5 / 120 ]│
└────────────────────────────────────────────────────────────────────────┘
```

---

### 10.2. Định nghĩa Toàn diện về Ẩn / Hiện HUD (Áp dụng Đồng nhất cho Cả Viewer & Player)

**Vấn đề:** Nhiều ứng dụng chỉ ẩn thanh timeline mà quên mất thanh điều hướng hoặc thanh trạng thái, gây mất tập trung. Cần định nghĩa rạch ròi các thành phần cấu thành HUD.

**Quy chuẩn Thành phần thuộc HUD:**
HUD (Heads-Up Display) là **toàn bộ lớp giao diện điều khiển phủ lên trên nội dung media**. Khi thực hiện thao tác **Ẩn HUD** (nhấn phím tắt `H`, click nút `[👁️ Ẩn HUD]` trên Window Bar, hoặc tự động ẩn sau 2 giây người dùng không di chuột), **toàn bộ các thành phần sau sẽ mờ dần (Fade Out 250ms) và biến mất 100%**:
1. **Window Bar:** Thanh tiêu đề phía trên cùng (bao gồm cả nút Ghim, Danh sách, Ẩn HUD).
2. **Control Bar / Action Bar:** 
   - Với **Player:** Ẩn toàn bộ Timeline, Hàng 1 (Tua, Play, Shuffle, Loop File, Loop AB) và Hàng 2 (Chuyển File, Mark, Copy, Cut, Fullscreen).
   - Với **Viewer:** Ẩn toàn bộ Bottom Action Bar (Chuyển File, Mark, Copy, Cut, Fullscreen).
3. **Footer Đáy:** Ẩn dòng thông tin Tên tệp và Bộ đếm số thứ tự `[ 14 / 120 ]`.
4. **Toast Feedback:** Nếu đang hiển thị cũng tự động mờ ẩn.
5. **Con trỏ chuột (Mouse Cursor):** Tự động chuyển thành `cursor: none` để không chắn tầm nhìn.

**Kích hoạt Hiện HUD trở lại:**
- Chỉ cần người dùng **di chuyển chuột** trong phạm vi cửa sổ, hoặc **nhấn phím bất kỳ** (như `Space`, `H`, mũi tên), hoặc click chuột, toàn bộ HUD sẽ lập tức mờ hiện trở lại (`opacity: 1`, transition `150ms ease-out`).
- Khi chuột dừng di chuyển quá 2 giây, HUD lại tự động mờ ẩn.

---

### 10.3. Cơ chế Nổi Độc lập (Floating Overlay) — Không Đẩy / Không Co Giật Video

**Vấn đề:** Nếu thanh HUD nằm theo luồng tài liệu thông thường (Document Flow) dạng Block/Flex, mỗi khi HUD hiện ra hay ẩn đi sẽ khiến khung video bị co lại hoặc dãn ra đột ngột (Layout Shift), gây hiện tượng giật hình, méo khung hình hoặc chớp nháy rất khó chịu.

**Giải pháp Kỹ thuật: Floating Overlay (Lớp phủ bán trong suốt):**
1. **Viewport Media chiếm 100% cố định:**
   - Khung chứa Video/Ảnh luôn chiếm trọn **100% chiều rộng và 100% chiều cao** của cửa sổ (`width: 100%; height: 100%; position: absolute; inset: 0; z-index: 1`).
   - Kích thước hiển thị của video được tính toán cố định dựa trên kích thước cửa sổ hiện tại, **hoàn toàn độc lập** với trạng thái ẩn hay hiện của HUD.
2. **HUD là Lớp Nổi Lơ Lửng (z-index: 10):**
   - Window Bar: `position: absolute; top: 0; left: 0; width: 100%;` với nền dốc mờ đen nhẹ `linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)`.
   - Control Bar: `position: absolute; bottom: 36px; left: 50%; transform: translateX(-50%);` sử dụng phong cách Glassmorphism (`background: rgba(22, 27, 34, 0.75); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px;`).
   - Footer: `position: absolute; bottom: 8px; left: 0; width: 100%;`.
3. **Kết luận Trực quan:**
   - **Khi HUD hiện:** HUD chỉ nhẹ nhàng phủ lên phía trên mép dưới của video dưới dạng kính mờ xuyên thấu, **tuyệt đối KHÔNG đẩy video bé lại**.
   - **Khi HUD ẩn:** HUD mờ dần biến mất, video đã và đang hiển thị ở kích thước tối ưu nhất từ trước, **không gian không bị kéo giật hay thay đổi kích thước đột ngột**. Trải nghiệm xem liền mạch 100%.

---

### 10.4. Cơ chế Responsive Mini PiP Mode khi Người dùng Thu nhỏ Cửa sổ

**Vấn đề:** Người dùng thường có thói quen thu nhỏ cửa sổ video về một góc màn hình (dạng Picture-in-Picture - kích thước rất bé, ví dụ 320x180 hoặc 400x250) để vừa làm việc khác vừa theo dõi video/nghe nhạc. Nếu để nguyên 2 hàng nút bấm với hơn 10 nút thì giao diện sẽ che kín 90% diện tích video.

**Quy chuẩn Chuyển đổi Tự động (Responsive Breakpoints):**
Hệ thống sử dụng CSS Container Queries hoặc Window Resize Listener để tự động chuyển sang **Chế độ Mini PiP** khi kích thước cửa sổ rơi vào ngưỡng:
* **Ngưỡng Breakpoint Mini:** Chiều rộng `width < 500px` HOẶC chiều cao `height < 320px`.

```text
┌─────────────────────────────────────────────────────────┐
│ [●][▲][▼]                                     [📌 Ghim] │ ◄─ Top Bar tinh giản (Chỉ giữ nút đóng/ghim)
│                                                         │
│                                                         │
│                      [ VIDEO PiP ]                      │
│                                                         │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ 01:14 ──────────────●─────────────────── 04:32    │  │ ◄─ Micro Timeline thanh mảnh (cao 3px)
│  │           [◀ Trước]   [ ▶ / ⏸ ]   [Tiếp ▶]         │  │ ◄─ Control Bar rút gọn về 1 hàng duy nhất
│  └───────────────────────────────────────────────────┘  │    (Chỉ hiện khi Hover chuột)
└─────────────────────────────────────────────────────────┘
```

**Chi tiết Thích ứng trong Chế độ Mini PiP:**
1. **Rút gọn Thanh điều khiển về 3 Nút Cốt lõi Nhất:**
   - Tạm ẩn toàn bộ các nút nâng cao: Shuffle, Loop AB, Copy Mark, Cut Mark, Fullscreen, Footer tên file.
   - Chỉ giữ lại duy nhất 3 nút điều khiển cơ bản:
     * `[◀ Trước]` (hoặc phím tắt `Cmd+←` / `Ctrl+←`): Lùi về file trước.
     * `[ ▶ / ⏸ ]` (hoặc phím tắt `Space`): Tạm dừng / Tiếp tục phát.
     * `[Tiếp ▶]` (hoặc phím tắt `Cmd+→` / `Ctrl+→`): Chuyển sang file tiếp theo.
2. **Timeline Thu gọn (Micro Progress Bar):**
   - Biến thành một đường mảnh 3px sát phía trên cụm 3 nút hoặc sát đáy cửa sổ, có màu xanh nổi bật để người dùng vẫn nhìn rõ tiến độ mà không che mất video.
3. **Ưu tiên Tối đa cho Nội dung (Hover-Only Visibility):**
   - Trong chế độ Mini PiP, thanh điều khiển mặc định **ẨN HOÀN TOÀN** để nhường 100% diện tích cửa sổ cho video.
   - Chỉ khi con trỏ chuột hover vào trong cửa sổ mini thì cụm 3 nút mới hiện mờ lên.
   - Thời gian tự động ẩn HUD được rút ngắn xuống **1 giây** (thay vì 2 giây như cửa sổ lớn).
4. **Giữ lại Nút Ghim Cửa sổ `[📌 Ghim (P)]`:**
   - Nút ghim trên Window Bar vẫn được ưu tiên giữ lại để người dùng có thể kích hoạt nhanh tính năng Ghim luôn nổi trên các ứng dụng khác (Always-on-Top), biến cửa sổ thành PiP thực thụ của hệ điều hành.
5. **Phím tắt Toàn năng Vẫn Hoạt động 100%:**
   - Dù các nút Copy, Cut, Mark, Loop AB bị ẩn trên UI Mini PiP, người dùng vẫn có thể bấm phím tắt (`M` để đánh dấu, `Cmd+C` / `Ctrl+C` để copy, `[` / `]` để set A-B) hoàn toàn bình thường mà không gặp bất kỳ trở ngại nào.

