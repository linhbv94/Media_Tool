# QA Acceptance & Edge Cases Specification: Media Tool (`_spec5_qa_acceptance`)

> **Phiên bản:** 1.0.0  
> **Ngày cập nhật:** 2026-10-01  
> **Phân loại đặc tả:** Tiêu chí Nghiệm thu Gherkin, Ma trận Trường hợp Biên & Checklist Kiểm thử Khói  
> **Tài liệu tham chiếu:** [00_system_overview.md](00_system_overview.md), [02_feature_flow.md](02_feature_flow.md)  

---

## 1. Tiêu chí Nghiệm thu Chuẩn Hóa (Gherkin Acceptance Criteria)

### AC-01: Khởi động Đa Nền tảng (Cross-platform launch)
```gherkin
Kịch bản: Người dùng mở ứng dụng độc lập trên macOS hoặc Windows
  Giả sử môi trường máy là Windows 11 (x64) hoặc macOS (Apple Silicon)
  Khi người dùng khởi chạy ứng dụng Media Tool từ tệp thực thi / shortcut
  Thì ứng dụng phải hiển thị cửa sổ chính thành công trong vòng dưới 1 giây
  Và không đòi hỏi môi trường phát triển (Node.js/Rust) phải cài đặt trên máy người dùng.
```

### AC-02: Mở và Hiển thị Ảnh (Open Image & Context Detection)
```gherkin
Kịch bản: Người dùng mở một tệp ảnh từ File Explorer / Finder
  Giả sử trong thư mục có các file: "01.jpg", "02.png", "doc.pdf", "03.webp"
  Khi người dùng click đúp mở tệp "02.png" bằng Media Tool
  Thì phân hệ Viewer kích hoạt và hiển thị trọn vẹn bức ảnh "02.png"
  Và danh sách lân cận được nhận diện gồm 3 ảnh: "01.jpg", "02.png", "03.webp" (bỏ qua "doc.pdf")
  Và chỉ số vị trí trên HUD hiển thị chính xác "[ 2 / 3 ]".
```

### AC-03: Điều hướng Ảnh Sắp xếp Tự nhiên (Natural Sort Navigation)
```gherkin
Kịch bản: Duyệt danh sách ảnh có tên chứa số thứ tự không đồng đều
  Giả sử trong thư mục có các file: "img1.jpg", "img2.jpg", "img10.jpg", "img20.jpg"
  Khi người dùng đang xem "img2.jpg" và nhấn phím Mũi tên Phải (Right Arrow)
  Thì ảnh tiếp theo hiển thị phải là "img10.jpg" (không phải "img20.jpg" hay "img1.jpg")
  Khi người dùng nhấn Mũi tên Trái (Left Arrow)
  Thì ảnh hiển thị quay trở lại là "img2.jpg".
```

### AC-04: Đánh dấu và Bỏ đánh dấu Tệp (Mark / Unmark)
```gherkin
Kịch bản: Đánh dấu tệp trong phiên làm việc
  Giả sử người dùng đang xem một bức ảnh hoặc nghe một bài hát bất kỳ
  Khi người dùng nhấn phím "M" lần thứ nhất
  Thì tệp được thêm vào danh sách marked, huy hiệu "[MARKED]" sáng lên, số lượng tăng lên 1
  Khi người dùng nhấn phím "M" lần thứ hai trên cùng tệp đó
  Thì tệp được xóa khỏi danh sách marked, huy hiệu biến mất, số lượng giảm đi 1.
```

### AC-05: Sao chép Tham chiếu Tệp ra Clipboard OS (Copy Marked Files)
```gherkin
Kịch bản: Sao chép 3 ảnh đã đánh dấu và dán vào thư mục ngoài hệ điều hành
  Giả sử người dùng đã đánh dấu 3 ảnh: "a.jpg", "c.png", "f.jpg"
  Khi người dùng nhấn tổ hợp phím "Ctrl+C" (trên Windows) hoặc "Cmd+C" (trên macOS)
  Thì ứng dụng hiển thị thông báo "Đã sao chép 3 tệp vào Clipboard"
  Và khi người dùng chuyển sang cửa sổ Finder/File Explorer và nhấn "Paste" (Ctrl/Cmd+V)
  Thì hệ điều hành thực hiện sao chép 3 tệp vật lý "a.jpg", "c.png", "f.jpg" vào thư mục đó.
```

### AC-06: Phát Video và Âm thanh Cơ bản (Media Playback)
```gherkin
Kịch bản: Phát và tạm dừng media
  Giả sử người dùng mở một tệp video "clip.mp4" hoặc âm thanh "song.mp3"
  Khi người dùng nhấn phím "Space"
  Thì media chuyển đổi nhịp nhàng giữa trạng thái Play và Pause.
```

### AC-07: Tua Dòng thời gian Chính xác & Chặn biên (Timeline Seek)
```gherkin
Kịch bản: Tua video bằng phím tắt và kiểm tra giới hạn biên
  Giả sử video có độ dài 60 giây và thời điểm hiện tại là 0.5 giây
  Khi người dùng nhấn Mũi tên Trái (lùi 1 giây)
  Thì thời gian phát dừng tại đúng 0.0 giây (không sinh số âm)
  Khi người dùng nhấn phím "5"
  Thì video nhảy tức thì đến mốc 30.0 giây (50% thời lượng)
  Khi người dùng nhấn phím "0"
  Thì video quay về đúng 0.0 giây.
```

### AC-08: Chuyển đổi File trong Trình phát Player (Player File Navigation)
```gherkin
Kịch bản: Chuyển bài hát tiếp theo trong thư mục
  Giả sử thư mục có 5 bài hát từ "track01.mp3" đến "track05.mp3"
  Khi đang phát "track02.mp3" và người dùng nhấn "Ctrl/Cmd + Mũi tên Phải"
  Thì trình phát chuyển sang "track03.mp3" và bắt đầu phát nhạc tự động
  Và toàn bộ mốc A-B Loop của bài cũ được reset về mặc định.
```

### AC-09: Kích hoạt Vòng lặp Phân đoạn A–B (A-B Loop)
```gherkin
Kịch bản: Thiết lập đoạn lặp từ giây thứ 10 đến giây thứ 25
  Giả sử người dùng đang phát video tại giây thứ 10 và nhấn phím "["
  Thì điểm A được xác lập tại 10.0s và hiển thị mốc trên timeline
  Khi video chạy đến giây thứ 25 và người dùng nhấn phím "]"
  Thì điểm B được xác lập tại 25.0s, chế độ A-B Loop được kích hoạt
  Và khi video chạy chạm mốc 25.0s, con trỏ tự động quay về mốc 10.0s để lặp lại.
```

### AC-10: Hạ và Nâng Âm Thích ứng (Adaptive Audio Fade)
```gherkin
Kịch bản: Lặp phân đoạn âm thanh với độ dài trên 500 mili-giây
  Giả sử đoạn lặp A–B có độ dài 2.0 giây (lớn hơn 500ms)
  Thì thời lượng fade tính toán là 40 mili-giây (2.0s × 0.02)
  Khi phát đến vị trí cách điểm B đúng 40ms, âm lượng hạ đều đặn về 0
  Khi vừa nhảy về điểm A, âm lượng được nâng đều đặn từ 0 về mức gốc trong 40ms
  Và tệp âm thanh gốc trên ổ đĩa hoàn toàn không bị chỉnh sửa.
```

### AC-11: Hiển thị Thẻ Metadata Âm thanh (Audio Metadata)
```gherkin
Kịch bản: Mở tệp MP3 có đầy đủ thẻ ID3 và bìa đĩa
  Giả sử tệp "song.mp3" chứa thẻ Title, Artist, Album và ảnh cover JPEG
  Khi tệp được mở trong Media Tool
  Thì giao diện hiển thị đúng Tên bài hát, Nghệ sĩ, Tên Album và Bìa đĩa tương ứng.
```

### AC-12: Xử lý Tệp Lỗi & Khả năng Phục hồi (Graceful Error Recovery)
```gherkin
Kịch bản: Người dùng mở một tệp ảnh hoặc video bị hỏng dữ liệu
  Khi nạp tệp media bị hỏng hoặc thiếu codec
  Thì màn hình hiển thị thông báo lỗi "Không thể hiển thị định dạng này"
  Và ứng dụng không bị đóng băng (freeze) hoặc văng app (crash)
  Và người dùng vẫn nhấn được phím Mũi tên để chuyển sang các tệp bình thường khác.
```

---

### AC-13: Điều Khiển Âm Lượng & Huy Hiệu OSD (Volume & Mute Control)
```gherkin
Kịch bản: Tăng giảm âm lượng và bật tắt tiếng nhanh
  Giả sử video đang phát ở mức âm lượng 80%
  Khi người dùng nhấn phím Mũi tên Lên (hoặc cuộn con lăn chuột lên)
  Thì âm lượng tăng lên 85%, GainNode cập nhật và huy hiệu Volume OSD hiện trên màn hình video
  Và huy hiệu tự động biến mất sau 1 giây
  Khi người dùng nhấn Cmd+M (Mac) hoặc Ctrl+M (Win) hoặc click icon Loa
  Thì âm lượng chuyển về 0% (Mute) và icon chuyển thành VolumeX
  Khi bấm Cmd/Ctrl+M lần nữa, âm lượng khôi phục lại 85%.
```

### AC-14: Xáo Trộn & Chế Độ Lặp Tệp (Shuffle & Loop File Modes)
```gherkin
Kịch bản: Chuyển đổi giữa các chế độ Lặp tệp và Bật Shuffle
  Giả sử danh sách có 10 bài hát và người dùng đang phát bài cuối cùng (số 10)
  Khi chế độ Loop File là "All" và bài số 10 phát hết
  Thì trình phát tự động chuyển về bài số 1 và tiếp tục phát
  Khi chuyển sang chế độ Loop File "1" và bài hát phát hết
  Thì trình phát lặp lại chính bài đó từ 00:00
  Khi bật chế độ Shuffle (phím S)
  Thì thứ tự phát kế tiếp tuân theo mảng Fisher-Yates ngẫu nhiên nhưng danh sách Sidebar vẫn giữ thứ tự Natural Sort.
```

### AC-15: Thoát Sạch Ứng Dụng Khi Bấm Nút Đỏ [X] trên macOS (Zero-Residue Quit)
```gherkin
Kịch bản: Người dùng click nút đỏ [X] trên cửa sổ macOS
  Giả sử ứng dụng đang mở ảnh hoặc video
  Khi người dùng click vào nút đỏ [X] ở góc trên bên trái cửa sổ
  Thì cửa sổ lập tức đóng lại, bộ nhớ RAM được giải phóng
  Và dấu chấm tròn bên dưới icon media_tool trên thanh Dock biến mất ngay lập tức
  Và không có bất kỳ tiến trình nào chạy ngầm trong Activity Monitor.
```

### AC-16: Chế Độ Mini PiP Responsive (Breakpoint < 500px)
```gherkin
Kịch bản: Người dùng co nhỏ cửa sổ về góc màn hình làm việc
  Khi người dùng kéo co chiều rộng cửa sổ nhỏ hơn 500px hoặc chiều cao nhỏ hơn 320px
  Thì giao diện tự động chuyển sang chế độ Mini PiP
  Và cụm nút bấm thu gọn chỉ còn 3 nút lõi: [◀ Trước] [▶/⏸] [Tiếp ▶]
  Và timeline co lại thành vạch siêu mảnh 3px sát đáy
  Và cụm nút mặc định ẩn 100%, chỉ hiện mờ khi con trỏ chuột hover vào cửa sổ mini.
```

### AC-17: Menu Ngữ Cảnh Chuột Phải (Context Menu)
```gherkin
Kịch bản: Click chuột phải vào vùng media
  Khi người dùng click chuột phải lên khung ảnh hoặc video
  Thì menu ngữ cảnh kính mờ tối màu xuất hiện ngay tại vị trí con trỏ chuột
  Và nếu đang xem video, menu hiển thị các mục Playback, Shuffle, Loop File, Loop AB, Volume
  Và nếu đang xem ảnh, menu hiển thị các mục Xoay ảnh, Lật ảnh, Sao chép tệp.
```

### AC-18: Ghim Cửa Sổ Luôn Nổi Trên Cùng (Always on Top Pinning)
```gherkin
Kịch bản: Bật chế độ ghim cửa sổ
  Khi người dùng nhấn phím P hoặc bấm nút [📌 Ghim] trên Window Bar
  Thì cửa sổ ứng dụng chuyển sang trạng thái Always-on-Top
  Và khi người dùng click tương tác với các ứng dụng khác (Browser, VS Code), cửa sổ media_tool vẫn luôn nổi trên cùng không bị che mất.
```

---

## 2. Ma trận Trường hợp Biên (Edge Cases Matrix)

| STT | Trường hợp Biên (Edge Case) | Hành vi Dự kiến của Hệ thống | Mức độ Ưu tiên |
| :---: | :--- | :--- | :---: |
| **E-01** | Người dùng nhấn phím `]` khi điểm A chưa được đặt. | Không kích hoạt loop; hoặc tự động gán điểm A = `0.0s` rồi mới nhận điểm B. | Cao |
| **E-02** | Người dùng đặt điểm B nhỏ hơn hoặc bằng điểm A (`B <= A`). | Từ chối nhận điểm B hoặc tự động đẩy B = `min(duration, A + 1.0s)`. Không crash. | Cao |
| **E-03** | Đoạn lặp A–B có độ dài dưới 500 mili-giây (`duration < 500ms`). | Tắt hoàn toàn fade (`fadeDuration = 0ms`) để tránh mất tiếng hoàn toàn. | Cao |
| **E-04** | File media đang mở bị đổi tên hoặc bị xóa ngoài ổ đĩa. | Giữ nguyên khung hình hiện tại; khi người dùng nhấn Next/Prev thì quét lại và nạp file còn tồn tại. | Trung bình |
| **E-05** | Nhấn phím Mũi tên duyệt ảnh siêu tốc liên tục (Rapid Key Presses). | Áp dụng debounce nhẹ hoặc bỏ qua các request trung gian, chỉ nạp ảnh cuối cùng. | Cao |
| **E-06** | File MP3 hoàn toàn không có bất kỳ thẻ ID3 nào. | Lấy tên file làm tiêu đề hiển thị, hiển thị icon đĩa than mặc định thay cho bìa đĩa. | Cao |
| **E-07** | Nhấn `Ctrl/Cmd+C` khi danh sách `markedFiles` đang trống (`size == 0`). | Tự động coi file hiện tại đang xem là tệp được sao chép vào Clipboard. | Cao |
| **E-08** | Thư mục chỉ chứa duy nhất 1 bức ảnh. | Bấm Mũi tên Trái/Phải không đổi ảnh, không gây lỗi index out of bounds. | Trung bình |
| **E-09** | Thư mục chứa 3.000 file ảnh. | Chỉ nạp ảnh kế tiếp và ảnh trước đó vào RAM (Lazy/Lightweight cache), không tải hàng loạt. | Rất cao |
| **E-10** | Người dùng tua thời gian (`Seek`) ra ngoài phân đoạn A–B khi đang bật Loop. | Tự động kéo playback quay trở về mốc điểm A để tiếp tục chu kỳ lặp. | Trung bình |
| **E-11** | Người dùng cuộn chuột điều chỉnh âm lượng vượt quá 100% hoặc dưới 0%. | Chặn biên an toàn: `clamp(vol, 0.0, 1.0)`, không phát sinh lỗi Web Audio API. | Cao |
| **E-12** | Mở video dọc có chiều ngang hẹp hơn 400px. | Cụm Control Bar neo theo độ rộng cửa sổ (`min-width: 520px`), không bị bóp nghẹt. | Cao |

---

## 3. Danh mục Kiểm tra Kiểm thử Khói (22-Step Smoke Test Checklist)

Quy trình kiểm thử khói bắt buộc thực hiện trên cả **Windows 11 (x64)** và **macOS (Apple Silicon)** trước khi bàn giao:

- [ ] **Bước 1:** Khởi chạy ứng dụng từ file nhị phân độc lập (không bật terminal phát triển).
- [ ] **Bước 2:** Mở ảnh JPEG thành công bằng thao tác kéo thả hoặc Open With.
- [ ] **Bước 3:** Nhấn phím Mũi tên Phải để chuyển sang ảnh PNG tiếp theo; kiểm tra thứ tự sắp xếp tự nhiên.
- [ ] **Bước 4:** Nhấn phím Mũi tên Trái để quay lại ảnh trước đó.
- [ ] **Bước 5:** Nhấn phím `M` trên 3 ảnh khác nhau để đánh dấu; kiểm tra HUD hiển thị `Marked: 3`.
- [ ] **Bước 6:** Nhấn `Ctrl+C` (Win) hoặc `Cmd+C` (Mac); xác nhận Toast thông báo xuất hiện.
- [ ] **Bước 7:** Mở File Explorer / Finder, nhấn `Paste` vào một folder mới; kiểm tra 3 tệp vật lý xuất hiện đầy đủ.
- [ ] **Bước 8:** Mở một video MP4; kiểm tra video tự động phát hoặc phát khi bấm `Space`.
- [ ] **Bước 9:** Nhấn phím `Space` để Tạm dừng (Pause) và Phát lại (Play).
- [ ] **Bước 10:** Nhấn phím `1`, `5`, `9` để kiểm tra nhảy timeline tới 10%, 50%, 90%.
- [ ] **Bước 11:** Nhấn Mũi tên Trái/Phải để tua lùi/tới 1 giây; kiểm tra không bị lỗi khi tua về 0 giây.
- [ ] **Bước 12:** Nhấn Shift + Mũi tên Trái/Phải để tua 5 giây.
- [ ] **Bước 13:** Nhấn `[` để đặt điểm A, cho video chạy tiếp rồi nhấn `]` để đặt điểm B.
- [ ] **Bước 14:** Xác nhận video tự động lặp lại giữa A và B mà không bị dừng hình.
- [ ] **Bước 15:** Nhấn phím `↑` / `↓` hoặc cuộn chuột trên video; xác nhận huy hiệu Volume OSD hiện mượt mà.
- [ ] **Bước 16:** Bật / Tắt Shuffle (`S`) và Loop File (`R`); kiểm tra logic chuyển bài khi hết file.
- [ ] **Bước 17:** Click chuột phải lên video; xác nhận Context Menu hiển thị đầy đủ tính năng.
- [ ] **Bước 18:** Thu nhỏ cửa sổ dưới 500px; xác nhận giao diện chuyển sang Mini PiP 3 nút gọn gàng.
- [ ] **Bước 19:** Nhấn phím `P` ghim cửa sổ; click app khác xác nhận cửa sổ vẫn luôn nổi trên cùng.
- [ ] **Bước 20:** Mở bài hát MP3 có thẻ ID3 và bìa đĩa; xác nhận Title, Artist và Artwork hiển thị đẹp mắt.
- [ ] **Bước 21:** Mở thử một file văn bản `.txt` hoặc file hỏng; kiểm tra thông báo lỗi hiển thị an toàn, app không crash.
- [ ] **Bước 22:** Click nút đỏ `[X]` trên macOS; xác nhận cửa sổ đóng và dấu chấm tròn trên thanh Dock biến mất hoàn toàn.

