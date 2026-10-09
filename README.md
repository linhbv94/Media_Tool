# Cross-Platform Personal Media Viewer & Player (`media_tool`)

Ứng dụng desktop cá nhân siêu nhẹ, đa nền tảng (Windows 11+ & macOS Apple Silicon), phục vụ duyệt và chọn lọc ảnh tốc độ cao, đồng thời phát video và âm thanh với khả năng kiểm soát phím tắt chuẩn xác và tính năng lặp đoạn A–B Loop kèm hạ/tăng âm thích ứng (Adaptive Audio Fade).

> **Tôn chỉ:** *One App, One Codebase, Two Modules: Viewer + Player trên Shared Core thống nhất.*  
> **Phiên bản:** `v1.2.4` — Xem chi tiết tại [docs/version_management.md](docs/version_management.md)

---

## 📂 Bộ Tài liệu Đặc tả Kỹ thuật Toàn diện (Vietnamese Specs)

Toàn bộ tài liệu đặc tả chuẩn hóa phục vụ việc triển khai (Execution Ground Truth) nằm tại thư mục [docs/spec/](docs/spec/):

1. 📋 [00_system_overview.md](docs/spec/00_system_overview.md) (`_spec0_system`):  
   **Tổng quan Hệ thống & Tầm nhìn:** Kiến trúc 3 tầng (Tauri 2 Rust Backend + React Frontend + Native OS Adapters), danh mục định dạng hỗ trợ V1, ranh giới phạm vi nghiêm ngặt và 8 pha triển khai (Phase 0 đến Phase 7).
2. 🔄 [01_business_process.md](docs/spec/01_business_process.md) (`_spec1_business_process`):  
   **Quy trình Nghiệp vụ & Swimlane:** Sơ đồ tương tác vĩ mô giữa Người dùng, Hệ điều hành (Finder/Explorer), Tauri Host và Frontend; 3 quy trình nghiệp vụ lõi (Open-With, Viewer Batch Copy, Player A-B Loop) và Ma trận Quyết định Điều phối Media.
3. ⚙️ [02_feature_flow.md](docs/spec/02_feature_flow.md) (`_spec2_feature_flow`):  
   **Luồng Tính năng, Thuật toán & State Machine:** Thuật toán sắp xếp tự nhiên (Natural Sort), máy trạng thái Đánh dấu file (Mark State: `Set<FilePath>`), Hợp đồng tua thời gian (Seek Clamping), và Thuật toán Adaptive Audio Fade chống giật tiếng.
4. 🎨 [03_ui_wireframe.md](docs/spec/03_ui_wireframe.md) (`_spec3_ui_wireframe`):  
   **Bố cục Giao diện & Hợp đồng Phím tắt:** Wireframe Viewer (Minimalist Floating Top HUD), Wireframe Video Player (Auto-hide Bottom Controls), Wireframe Audio Player (Album Art & Metadata Card) và Bảng phím tắt đối chiếu 1:1 giữa Windows và macOS.
5. 🗄️ [04_api_data.md](docs/spec/04_api_data.md) (`_spec4_api_data`):  
   **Hợp đồng Dữ liệu & Tauri IPC Commands:** Đặc tả chi tiết các lệnh gọi bất đồng bộ (`get_directory_media`, `copy_files_to_clipboard`, `read_audio_metadata`), kiểu dữ liệu TypeScript và giải pháp kỹ thuật đưa file references vào Native Clipboard OS (`CF_HDROP` trên Windows, `NSPasteboard` trên macOS).
6. 🧪 [05_qa_acceptance.md](docs/spec/05_qa_acceptance.md) (`_spec5_qa_acceptance`):  
   **Tiêu chuẩn Nghiệm thu & Kiểm thử Khói:** Tiêu chí nghiệm thu Gherkin đến AC-25 (gồm phát nền video/audio), Ma trận trường hợp biên (Edge Cases) và Checklist kiểm thử khói trên Windows 11 và macOS.
7. 🎬 [06_demo_presentation.md](docs/spec/06_demo_presentation.md) (`_spec6_demo_presentation`):  
   **Kịch bản Trình diễn Nghiệm thu (DoD Playbook):** Hướng dẫn thiết lập bộ file mẫu `fixtures/` và kịch bản demo 3 hồi tuần tự chứng minh đáp ứng 100% Definition of Done trước khi bàn giao.
8. 📑 [07_folder_tabs_multi_window.md](docs/spec/07_folder_tabs_multi_window.md) (`_spec7_folder_tabs_multi_window`):  
   **Quản lý Tab Thư mục & Đa Cửa sổ (v1.1.0):** Mô hình App → Windows → Tabs → Folder Sessions, phát âm thanh ngầm toàn cục (Global Playback), tái sử dụng tab cùng thư mục, di chuyển session sang cửa sổ mới (Move to New Window) phục vụ so sánh media side-by-side, và danh mục Backlog Detachable Tabs.
9. 📖 [08_pdf_reader_module.md](docs/spec/08_pdf_reader_module.md) (`_spec8_pdf_reader_module`):  
   **Module Đọc PDF - Media Type thứ tư (v1.2.0):** Đặc tả tích hợp PDF thành định dạng thứ 4 bên cạnh Image, Video, Audio. Kiến trúc render Mozilla `pdfjs-dist` Retina Canvas, cơ chế phát nhạc ngầm khi đọc sách, HUD điều hướng trang, zoom mượt, Dark Mode Invert và tiêu chuẩn nghiệm thu QA.

---

## 🛠️ Stack Công nghệ Được Chọn (V1)

- **Desktop Framework:** [Tauri 2.x](https://v2.tauri.app/) (Rust Backend)
- **Frontend UI:** TypeScript + React + Vite (Plain CSS / Tailwind CSS tinh gọn)
- **Media Engine:** Tích hợp `libmpv` hoặc Native Media Engine (kiểm định qua Phase 0 Technical Spike)
- **Native OS Integration:** Win32 API (`windows-sys` / `CF_HDROP`) & macOS Cocoa (`NSPasteboard` / `NSURL`)


## Phát hành Windows/macOS và tự cập nhật

Phiên bản `1.2.1` thêm kiểm tra cập nhật khi mở app và nút cập nhật trong Cài đặt → Cập nhật. GitHub Actions build bộ cài Windows x64, macOS Apple Silicon và Intel bằng runner tiêu chuẩn cho repo public. Xem [hướng dẫn cấu hình khóa ký, phát hành và cài đặt](docs/release_guide.md).

## Phát nền khi duyệt ảnh

Từ v1.2.4, file nhạc và video có tiếng giữ tiến độ khi mở ảnh/PDF hoặc đổi tab. Thanh phát nền điều khiển nguồn vừa nghe; phát một nguồn khác tạm dừng nguồn trước, đóng tab nguồn dừng phát. Xem [luồng playback](docs/spec/02_feature_flow.md), [QA native](docs/spec/05_qa_acceptance.md) và [quyền sở hữu nguồn](docs/spec/07_folder_tabs_multi_window.md).

Kiểm tra tự động: `npm run test:playback` (cài Chromium bằng `npx playwright install chromium`, hoặc đặt `BROWSER_EXECUTABLE_PATH`). Bài test dùng App/Player và media thật, mô phỏng bridge mở file; vẫn cần nghiệm thu Explorer/Finder trên app Tauri đã đóng gói.
