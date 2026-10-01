# System Specification Overview: Media Tool (`_spec0_system`)

> **Tên sản phẩm:** Cross-Platform Personal Media Viewer & Player (`media_tool`)  
> **Phiên bản tài liệu:** 1.0.0 (V1 Planning & Architecture)  
> **Ngày cập nhật:** 2026-10-01  
> **Nền tảng mục tiêu:** Windows 11+ (x64) & macOS (Apple Silicon ưu tiên)  
> **Đối tượng tài liệu:** Lead Developer, Dev Agents, Test Agents, Product Owner  

---

## 1. Tôn chỉ & Tầm nhìn Sản phẩm (Product Vision)

**Media Tool** là ứng dụng desktop cá nhân siêu nhẹ, đa nền tảng, được xây dựng với nguyên tắc: **Một ứng dụng, một kho mã nguồn duy nhất (One App, One Codebase), hai phân hệ logic độc lập: Viewer và Player trên nền Shared Core.**

Ứng dụng sinh ra nhằm phục vụ nhu cầu làm việc hàng ngày của Owner:
1. **Trải nghiệm tương tác đồng nhất:** Hành vi duyệt, phím tắt và phản hồi nhất quán giữa Windows và macOS (thay vì phụ thuộc vào sự khác biệt giữa Windows Photos/Media Player và macOS Preview/QuickTime).
2. **Kiểm soát hoàn toàn phím tắt & luồng công việc (Workflow):** Tối ưu hóa tối đa cho thao tác bằng bàn phím (Keyboard-first), loại bỏ các thanh công cụ cồng kềnh.
3. **Tiện ích siêu nhẹ (Lightweight Utility):** Tốc độ mở file tức thì, chuyển file liền mạch, tiêu tốn ít tài nguyên khi chạy nền.
4. **Hợp nhất ảnh, video và âm thanh trong một công cụ:** Không cần chuyển đổi qua lại giữa nhiều ứng dụng rời rạc khi duyệt tài nguyên media trong thư mục.

> **Tôn chỉ cốt lõi:**  
> *"Định dạng media có thể thay đổi, nhưng trải nghiệm tương tác cốt lõi phải luôn luôn nhất quán và đoán định trước được."*

Ứng dụng **KHÔNG** cạnh tranh với các phần mềm chuyên sâu như VLC, IINA, Photos, hay phần mềm biên tập chuyên nghiệp. V1 tập trung giải quyết triệt để bài toán: **Duyệt nhanh → Chọn lọc nhanh → Phát media mượt mà với độ chính xác cao.**

---

## 2. Bản đồ Hồ sơ Đặc tả (Specification Index)

Toàn bộ các tài liệu đặc tả kỹ thuật chi tiết được kết nối bằng đường dẫn tương đối:

- 📋 [01_business_process.md](01_business_process.md): Sơ đồ Swimlane vĩ mô, luồng Open-With từ OS & Ma trận Quyết định Điều phối Media (`_spec1_business_process`)
- 🔄 [02_feature_flow.md](02_feature_flow.md): Chi tiết Luồng Logic, Cơ chế Sắp xếp Tự nhiên (Natural Sort), State Machine cho Mark, Timeline Seek & A-B Loop (`_spec2_feature_flow`)
- 🎨 [03_ui_wireframe.md](03_ui_wireframe.md): Đặc tả Giao diện Tối giản (Minimalist HUD), Layout Viewer, Layout Player & Bảng Hợp đồng Phím tắt Chuẩn (`_spec3_ui_wireframe`)
- 🗄️ [04_api_data.md](04_api_data.md): Hợp đồng Dữ liệu, Schema IPC Commands giữa Tauri Rust và Frontend TypeScript, Native OS Clipboard Specs (`_spec4_api_data`)
- 🧪 [05_qa_acceptance.md](05_qa_acceptance.md): Tiêu chuẩn Nghiệm thu Gherkin (AC-01 → AC-12), Ma trận Edge Cases & Checklist Kiểm thử Khói (`_spec5_qa_acceptance`)
- 🎬 [06_demo_presentation.md](06_demo_presentation.md): Kịch bản Trình diễn Demo (DoD Playbook) & Hướng dẫn Thiết lập Bộ Dữ liệu Mẫu Fixtures (`_spec6_demo_presentation`)

---

## 3. Kiến trúc Tổng thể Hệ thống (System Architecture)

Hệ thống được thiết kế theo mô hình 3 tầng phân định ranh giới rõ ràng:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        Media Tool Desktop App                          │
├──────────────────────────────────┬─────────────────────────────────────┤
│      Phân hệ Viewer (Ảnh)        │    Phân hệ Player (Audio / Video)   │
│  - Render hình ảnh tối ưu        │  - Trình phát Video / Audio         │
│  - Duyệt lùi / tới siêu tốc      │  - Seek theo tỉ lệ 0–9 & ±1s, ±5s   │
│  - Đánh dấu file (Mark / Unmark) │  - Thiết lập vòng lặp A–B Loop      │
│  - Copy file references ra OS    │  - Adaptive Audio Fade khi lặp đoạn │
│                                  │  - Đọc & hiển thị Audio Metadata    │
├──────────────────────────────────┴─────────────────────────────────────┤
│                    Shared Core (Lõi dùng chung)                        │
│  - Điều hướng thư mục cục bộ (File navigation & Enumeration)           │
│  - Thuật toán sắp xếp tên file tự nhiên (Natural Sorting)              │
│  - Trạng thái đánh dấu phiên làm việc (Session Mark State: Set<Path>)  │
│  - Hệ thống xử lý phím tắt thống nhất (Keyboard Dispatcher)            │
│  - Quản lý vòng đời ứng dụng & sự kiện mở file từ OS (Open-with)       │
├────────────────────────────────────────────────────────────────────────┤
│                 Platform Adapters (Ranh giới Hệ điều hành)             │
│  - Windows Adapter: Win32 Clipboard (CF_HDROP), Explorer Association   │
│  - macOS Adapter: NSPasteboard (NSURL / Filenames), Finder Integration │
└────────────────────────────────────────────────────────────────────────┘
```

### Chi tiết Stack Công nghệ Được Chọn:
1. **Desktop Framework:** **Tauri 2.x** (Rust Core + Web Frontend).
   - Siêu nhẹ, chiếm dụng RAM và dung lượng cài đặt thấp hơn Electron rất nhiều.
   - Rust đảm nhiệm tầng truy cập hệ thống tệp cục bộ, quản lý clipboard native và tương tác OS.
2. **Frontend UI:** **TypeScript + React + Vite**.
   - Giao diện phản hồi cực nhanh, quản lý state trực quan.
   - Styling: Sử dụng Plain CSS / CSS Modules hoặc Tailwind CSS tinh gọn, không kéo các thư viện UI component nặng nề.
3. **Media Engine (Audio / Video):**
   - Nghiên cứu tích hợp **libmpv** hoặc tận dụng khả năng giải mã media bản địa (HTML5 Media / Native Webview / GStreamer bindings) thông qua giai đoạn Technical Spike (Phase 0).
   - **Quy tắc tuyệt đối:** Không tự viết bộ giải mã (codec/demuxer). Tái sử dụng các engine truyền thông hoàn thiện.
4. **Image Rendering:**
   - Sử dụng cơ chế giải mã hình ảnh của Webview nền tảng (hỗ trợ JPG, PNG, WebP, GIF, AVIF). Nếu định dạng nào gặp rào cản sẽ bổ sung adapter giải mã ở Rust.

---

## 4. Định dạng Media Hỗ trợ (V1 Scope)

| Nhóm Media | Định dạng Được Hỗ trợ | Cơ chế Xử lý V1 |
| :--- | :--- | :--- |
| **Hình ảnh (Images)** | `JPEG`, `JPG`, `PNG`, `WebP`, `GIF`, `AVIF` *(nếu webview hỗ trợ ổn định)* | Giải mã trực tiếp trên Webview / Rust Image pipeline. Hỗ trợ duyệt tới/lui và đánh dấu. |
| **Video** | `MP4`, `MOV`, `WebM`, `MKV` | Phát qua Media Engine. Hỗ trợ Play/Pause, Seek phím tắt, A–B Loop. |
| **Âm thanh (Audio)** | `MP3`, `WAV`, `FLAC`, `M4A` | Phát âm thanh, đọc thẻ ID3/Metadata (Title, Artist, Album, Year, Track, Artwork), A–B Loop và Adaptive Fade. |

---

## 5. Ranh giới Nghiệp vụ & Phạm vi (Scope Matrix)

| Hạng mục | Trong phạm vi V1 (In-Scope) | Tuyệt đối Ngoài phạm vi V1 (Out-of-Scope) |
| :--- | :--- | :--- |
| **Tích hợp YouTube** | Hoàn toàn không có trong V1. | Cấm tích hợp yt-dlp, cấm tải video stream YouTube, cấm nhúng YouTube player ở V1. |
| **Thư viện / Cơ sở dữ liệu** | Trạng thái Session tạm thời trong RAM (Đóng app là xóa mark). | Không lưu database (SQLite), không tạo Media Library, không Favorites vĩnh viễn, không Tagging/Rating. |
| **Chỉnh sửa Media** | Chỉ đọc (Read-only). | Không crop, xoay vĩnh viễn, chỉnh màu, render subtitle, cắt ghép video/audio, convert định dạng. |
| **Quét Thư mục** | Quét các file cùng cấp trong thư mục chứa file đang mở. | Không quét đệ quy (recursive scan) cây thư mục con ở V1. |
| **Đám mây & Tài khoản** | Chạy Offline 100% trên máy cục bộ. | Không tài khoản, không login, không Cloud Sync, không Tracking Analytics từ xa, không mạng xã hội. |
| **Tính năng Nâng cao** | Adaptive Audio Fade cho vòng lặp A–B (thuần thuật toán volume). | Không crossfade trộn âm thanh 2 bài, không EQ, không DSP chuyên sâu, không DLNA/AirPlay. |

---

## 6. Lộ trình Triển khai Chuẩn (8 Implementation Phases)

Toàn bộ quá trình hiện thực hóa công cụ được chia làm 8 giai đoạn tuần tự:

```text
Phase 0 ──► Phase 1 ──► Phase 2 ──► Phase 3 ──► Phase 4 ──► Phase 5 ──► Phase 6 ──► Phase 7
(Spike)     (Core)      (Viewer)    (Player)    (A-B Loop)  (Audio)     (Platform)  (Polish/QA)
```

1. **Phase 0 — Technical Spike (Kiểm định Kiến trúc):**
   - Dựng prototype tối giản kiểm tra khả năng build Tauri 2 trên macOS Apple Silicon và Windows 11.
   - Thử nghiệm việc phát video, audio, lệnh tua và cơ chế đưa file references vào clipboard native của OS.
   - Kiểm định giải pháp Web Audio API GainNode cho Adaptive Audio Fade (0–100ms) để xác nhận độ trơn tru và không độ trễ.
2. **Phase 1 — Shared Core (Lõi dùng chung):**
   - Xây dựng module Rust quét thư mục, phân loại đuôi file, sắp xếp tự nhiên (`natural_sort`).
   - Xây dựng state in-memory quản lý danh sách file đã đánh dấu (`MarkSession`).
   - Thiết lập khung điều hướng sự kiện phím tắt (Keyboard Dispatcher).
   - Tích hợp cơ chế Single-Instance bắt sự kiện click đúp file từ hệ điều hành.
3. **Phase 2 — Phân hệ Viewer (Trình xem ảnh hoàn thiện):**
   - Dựng giao diện xem ảnh tối giản, hiển thị ảnh chất lượng cao.
   - Điều hướng Previous/Next qua mũi tên trái/phải.
   - Thao tác nhấn `M` để Mark/Unmark, hiển thị số lượng đã mark.
   - Nhấn `Ctrl+C` (Win) hoặc `Cmd+C` (Mac) sao chép danh sách file đã mark vào OS clipboard. Người dùng có thể dán ngay vào Explorer / Finder.
4. **Phase 3 — Phân hệ Player Core (Trình phát cơ bản):**
   - Tích hợp playback video/audio: Play / Pause bằng `Space`.
   - Tua dòng thời gian: `0–9` (nhảy theo 0% → 90% timeline), Mũi tên trái/phải (±1s), Shift + Mũi tên (±5s).
   - Chuyển file media trước/sau: `Ctrl/Cmd + Left/Right`.
5. **Phase 4 — Vòng lặp A–B Loop & Adaptive Audio Fade:**
   - Phím tắt `[` đặt điểm A, `]` đặt điểm B. Phím tắt/Nút bấm bật tắt chế độ lặp.
   - Xử lý mượt mà chuyển đoạn: Tính toán thời lượng fade thích ứng dựa trên độ dài đoạn lặp để chống giật âm lượng.
6. **Phase 5 — Trải nghiệm Âm thanh & Metadata:**
   - Đọc metadata bài hát (Title, Artist, Album, Year, Track) và nhúng bìa đĩa (Album Art).
   - Thiết kế giao diện nghe nhạc thanh lịch, thông tin hiển thị dạng read-only.
7. **Phase 6 — Tích hợp Sâu Nền tảng (Platform Integration):**
   - Cấu hình File Association (Open With) cho các định dạng mục tiêu trên Windows và macOS.
   - Đóng gói ứng dụng thành file cài đặt độc lập (.msi / .exe trên Win, .dmg / .app trên Mac).
8. **Phase 7 — Đánh bóng & Kiểm thử Nghiệm thu (Polish / QA):**
   - Kiểm thử toàn diện 12 tiêu chí nghiệm thu (AC-01 → AC-12).
   - Kiểm tra các trường hợp biên: file hỏng, thư mục rỗng, file bị xóa khi đang mở.

---

## 7. Bốn Quyết định Kỹ thuật Chiến lược & Lý do Đề xuất (Strategic Decisions & Rationale)

Nhằm đảm bảo sản phẩm đạt đúng tiêu chí **"Siêu nhẹ, Tốc độ cao, Không cồng kềnh và Dễ bảo trì"**, 4 quyết định kỹ thuật nền tảng sau đây đã được chuẩn hóa vào kiến trúc:

### Quyết định 1: Ưu tiên HTML5 Media + Web Audio API thay vì nhúng trực tiếp `libmpv`
* **Đề xuất:** Sử dụng pipeline Media bản địa của Webview (AVFoundation trên macOS, Media Foundation trên Windows) kết hợp **Web Audio API (`GainNode`)** để xử lý âm lượng và vòng lặp. Chỉ sử dụng Rust stream/remux cục bộ khi gặp định dạng container hiếm như `.mkv`.
* **Lý do đề xuất:**
  1. *Tránh xung đột giao diện Webview:* Tauri 2 render qua Webview. Việc ép một cửa sổ đồ họa bản địa bên ngoài của `libmpv` (OpenGL/Metal) lồng vào trong Webview rất dễ gây giật khung hình, nhấp nháy khi phóng to/thu nhỏ cửa sổ và xung đột lớp hiển thị (Z-Index).
  2. *Dung lượng siêu nhẹ:* Nhúng `libmpv` sẽ buộc phải kèm theo hàng chục MB thư viện liên kết động (`.dylib`/`.dll`), làm phình to kích thước bộ cài và dễ bị hệ điều hành chặn chữ ký số (Gatekeeper / SmartScreen). Trong khi đó, HTML5 Media tận dụng 100% phần cứng giải mã có sẵn của macOS/Windows nên ứng dụng chỉ nặng vài Megabytes.
  3. *Adaptive Fade hoàn hảo 0ms:* Web Audio API `GainNode` cho phép điều khiển đường cong âm lượng chính xác đến từng mili-giây với độ trễ bằng 0, không phụ thuộc vào độ trễ giao tiếp IPC của engine ngoài.

### Quyết định 2: Tách biệt Native OS Clipboard Adapters (`CF_HDROP` & `NSPasteboard`)
* **Đề xuất:** Triển khai độc lập trong `src/platform/windows.rs` (dùng `CF_HDROP` qua Win32 API) và `src/platform/macos.rs` (dùng `NSPasteboardTypeFileURL` qua Cocoa API).
* **Lý do đề xuất:**
  - Clipboard mặc định của trình duyệt/Webview chỉ hỗ trợ copy văn bản hoặc dữ liệu ảnh dạng pixel blob. Nó không thể tạo ra "tệp vật lý ảo" để Windows Explorer hoặc macOS Finder hiểu được lệnh `Paste` tệp.
  - Việc đưa logic này xuống tầng Rust cấp thấp giúp ứng dụng tương tác trực tiếp với API của hệ điều hành, vượt qua rào cản bảo mật (Sandbox) của Webview và đảm bảo việc dán file diễn ra trơn tru 100%.

### Quyết định 3: Triển khai Single-Instance & Đồng bộ Sự kiện Open-With
* **Đề xuất:** Tích hợp `tauri-plugin-single-instance` để chỉ duy trì duy nhất một tiến trình ứng dụng; bắt sự kiện Apple Event `kAEOpenDocuments` trên macOS và tham số dòng lệnh trên Windows.
* **Lý do đề xuất:**
  - Thói quen của người dùng là click đúp liên tục vào nhiều ảnh hoặc video khác nhau trong thư mục để xem. Nếu không có cơ chế Single-Instance, hệ điều hành sẽ khởi tạo hàng chục cửa sổ Media Tool chạy song song, gây ngốn RAM và làm đơ máy.
  - Cơ chế Single-Instance giúp chuyển đổi tệp media tức thì trên chính cửa sổ đang mở và tự động đẩy cửa sổ lên phía trước (Focus Window).

### Quyết định 4: Chiến lược Phát triển & Xác thực Đa Nền tảng (macOS Local + CI Cross-Build)
* **Đề xuất:** Phát triển và kiểm thử tương tác trực tiếp (Hot-reload, Browser Subagent, Video Demo) trên môi trường **macOS Apple Silicon** hiện tại; cô lập logic Windows trong `src/platform/windows.rs` và thiết lập kịch bản build tự động (GitHub Actions) để xuất bộ cài Windows 11.
* **Lý do đề xuất:**
  - Giúp tốc độ phát triển và kiểm thử vòng lặp diễn ra tức thì tại máy của Owner mà không bị gián đoạn.
  - Đảm bảo tính tương thích và sự đồng nhất 1:1 trên Windows 11 thông qua quy trình kiểm thử khói chuẩn hóa (18-step smoke test).

---

## 7. Tiêu chuẩn Thực thi cho AI Execution Agent

Khi Dev Agent nhận lệnh triển khai mã nguồn, bắt buộc tuân thủ:
1. **Phân tách Module rõ ràng:** Tuyệt đối không viết lẫn lộn logic của Viewer vào Player. Mọi hàm logic chung phải chuyển về `src/core`.
2. **Không phân mảnh OS Logic:** Tuyệt đối không rải rác các câu lệnh kiểm tra điều kiện hệ điều hành (`if windows ... if macos ...`) trong giao diện hoặc logic nghiệp vụ. Toàn bộ khác biệt nền tảng phải được đóng gói bên trong thư mục `src/platform/`.
3. **Không tự ý mở rộng Scope:** Khi gặp câu hỏi "Liệu có nên thêm tính năng này không?", mặc định câu trả lời là **KHÔNG** trừ khi có chỉ thị trực tiếp từ Product Owner.
4. **Không phụ thuộc thư viện rác:** Giữ số lượng dependencies ở mức tối thiểu.
5. **Tiêu chuẩn đặt tên & Đường dẫn:** Tuân thủ chuẩn **snake_case** cho tên file, thư mục; không dùng dấu gạch ngang `-`; sử dụng relative links cho tài liệu.
