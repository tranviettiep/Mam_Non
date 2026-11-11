# Quy Tắc Dự Án: Sân Chơi Chữ Cái Mầm Non (AGENTS.md)

Tài liệu quy định các nguyên tắc kỹ thuật, sư phạm mầm non (5–6 tuổi) và điều kiện phần cứng lớp học bắt buộc tuân thủ trong toàn bộ workspace `f:\Projects\Mam_Non`.

## 1. Nền Tảng Công Nghệ & Môi Trường Thực Thi
- **Stack chính**: `Vite` + `React` + `TypeScript` + `Tailwind CSS` + `lucide-react` + `@mediapipe/tasks-vision` + `vite-plugin-singlefile`.
- **Lệnh PowerShell trên Windows**: Môi trường Windows chặn `npm.ps1` theo ExecutionPolicy; luôn gọi `npm.cmd` và `npx.cmd` khi chạy lệnh trong terminal.
- **Tách biệt dữ liệu & engine**: Không hardcode chữ cái cụ thể (`e`, `ê`...) vào component trò chơi. Toàn bộ chữ cái, câu hỏi, lời chào và nét viết phải đi qua schema `LessonConfig`.

## 2. Quy Chuẩn Sư Phạm & Giao Diện Mầm Non (5–6 Tuổi)
- **Hiển thị chuẩn Tivi lớp học (`16:9`)**:
  - Khóa bố cục trong khung nhìn `100vw × 100vh` (`overflow-hidden`), tối ưu cho độ phân giải máy chiếu / Smart TV `1366×768` và `1920×1080`.
  - Phong cách **Claymorphism** tươi sáng (bo góc `16px–24px`, viền dày `3px–4px`, đổ bóng nổi khối mềm, độ tương phản chữ tối thiểu `4.5:1`).
  - Không dùng emoji thô làm icon điều hướng — luôn dùng icon SVG (`lucide-react`).
- **Chuẩn chữ cái Tiếng Việt**:
  - Các thẻ chữ cái dạy trẻ (`a, ă, â, e, ê, o, ô, ơ, u, ư, b, d, đ...`) bắt buộc dùng font chữ học đường rõ nét (`Lexend` / `Quicksand` cho mặt chữ cái, `Baloo 2` cho tiêu đề), đảm bảo dấu mũ (`â, ê, ô`), dấu trăng (`ă`), dấu móc (`ơ, ư`) và nét ngang (`đ`) không bị cắt xén hay biến dạng.
- **Tương tác cảm ứng & Chuột đồng nhất**:
  - Mọi nút bấm cho trẻ có kích thước tối thiểu `64×64px` (nút thanh công cụ giáo viên tối thiểu `44×44px`).
  - Mọi vùng vẽ / tương tác kéo thả bắt buộc đặt `touch-action: none` và `select-none` để trẻ tì tay lên màn hình laptop cảm ứng không gây cuộn hay zoom trang.
- **Phản hồi tích cực**:
  - Khi trẻ chọn sai hoặc tô lệch nét, chỉ nhắc khích lệ nhẹ nhàng (*"Chưa đúng, bé chọn lại nhé!"*), không trừ âm điểm và không dùng hiệu ứng giật/chói gây sợ.

## 3. Quy Chuẩn An Toàn Tài Nguyên Phần Cứng (Bắt Buộc)
- **Dọn sạch tài nguyên khi chuyển màn (`unmount`)**:
  - **Webcam**: Phải gọi `stream.getTracks().forEach(track => track.stop())`, xóa `video.srcObject = null` và đóng `FaceLandmarker` ngay khi rời Chặng 2 (đèn báo camera trên laptop phải tắt ngay).
  - **Vòng lặp đồ họa**: Mọi `requestAnimationFrame`, `setTimeout`, `setInterval` trong `useEffect` phải có hàm cleanup tương ứng.
  - **Âm thanh & Giọng đọc**: Gọi `window.speechSynthesis.cancel()` ngay khi chuyển câu hoặc thoát chặng để không đọc chồng chéo câu cũ.
- **Phương án dự phòng phần cứng (Fallback)**:
  - Chặng dùng Webcam bắt buộc hỗ trợ song song phím mũi tên (`ArrowLeft` / `ArrowRight`) và click/chạm trực tiếp vào thẻ đáp án phòng trường hợp lớp học thiếu sáng hoặc hỏng camera.
  - Âm thanh hiệu ứng dùng `Web Audio API` tổng hợp trực tiếp (không phụ thuộc mạng); giọng đọc `Web Speech API` (`vi-VN`) phải có cơ chế không treo game nếu máy Windows thiếu gói giọng đọc Tiếng Việt.
