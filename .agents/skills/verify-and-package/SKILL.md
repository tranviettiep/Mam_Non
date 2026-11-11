---
name: verify-and-package
description: >-
  Quy trình kiểm định chất lượng mã nguồn, rà soát giải phóng tài nguyên phần
  cứng (Webcam, Canvas, Audio) và đóng gói thành 1 file HTML độc lập chạy
  offline cho lớp học. Gọi qua /verify-and-package hoặc trước khi bàn giao.
---

# Workflow: Kiểm Định & Đóng Gói Bản Học Liệu Offline (`/verify-and-package`)

Thực hiện tuần tự quy trình kiểm tra trước khi xuất giao bộ ứng dụng cho giáo viên sử dụng trên lớp:

## Các bước thực hiện

1. **Kiểm tra kiểu tĩnh & cú pháp (`Typecheck`)**:
   - Chạy `npx.cmd tsc --noEmit` tại thư mục `f:\Projects\Mam_Non` và xử lý triệt để mọi cảnh báo/lỗi kiểu dữ liệu.
2. **Kiểm toán an toàn tài nguyên phần cứng (Checklist bắt buộc)**:
   - **Chặng 1 (`Stage1Runner`)**: Xác nhận `cancelAnimationFrame` được gọi trong cleanup khi thoát chặng hoặc chuyển Level.
   - **Chặng 2 (`Stage2HeadTilt`)**: Xác nhận mọi `MediaStreamTrack` đều gọi `.stop()`, `FaceLandmarker` được giải phóng, và phím mũi tên `ArrowLeft`/`ArrowRight` hoạt động đầy đủ khi không bật camera.
   - **Chặng 3 (`Stage3Tracing`)**: Xác nhận vùng vẽ có `touch-action: none` và mọi chữ cái trong `LESSON_PRESETS` đều có đầy đủ mảng `strokes` hợp lệ.
   - **Âm thanh**: Xác nhận `speechSynthesis.cancel()` được gọi khi chuyển màn hình.
3. **Đóng gói bản Web & Bản Single-File HTML Offline**:
   - Chạy `npm.cmd run build` để đóng gói ứng dụng thành file HTML tự chứa qua `vite-plugin-singlefile` trong thư mục `dist/index.html`.
   - Kiểm tra file `dist/index.html` đã tồn tại, kích thước hợp lý và nhúng đầy đủ CSS/JS nội tuyến để nút **`⬇ Tải game`** trong ứng dụng hoặc file `dist/index.html` mở trực tiếp được trên trình duyệt không cần server.
