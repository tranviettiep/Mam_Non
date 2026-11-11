---
name: create-letter-lesson
description: >-
  Quy trình tự động khởi tạo một gói bài học chữ cái Tiếng Việt mới hoàn chỉnh
  (gồm lời chào cuộc gọi bí mật, cổng chữ Chặng 1, 10 câu hỏi Chặng 2 và nét
  chấm tô chữ Chặng 3). Gọi qua /create-letter-lesson hoặc khi người dùng yêu
  cầu thêm bài học chữ cái mới.
---

# Workflow: Tạo Gói Bài Học Chữ Cái Mới (`/create-letter-lesson`)

Thực hiện tuần tự các bước sau khi cần bổ sung một nhóm chữ cái mới vào kho học liệu của dự án:

## Các bước thực hiện

1. **Xác định nhóm chữ mục tiêu**:
   - Xác nhận các chữ cái thường và in hoa của bài học (ví dụ: `l, m, n` → `L, M, N`).
2. **Kiểm tra & bổ sung dữ liệu nét viết (Chặng 3)**:
   - Mở file định nghĩa nét viết chữ cái trong `src/data/strokes.ts`.
   - Nếu có chữ cái chưa có định nghĩa `strokes`, tham chiếu quy tắc chuẩn trong `.agents/skills/vietnamese-letter-tracing/references/vn-stroke-rules.md` để dựng các nét tuần tự trên hệ tọa độ `400×400`.
3. **Sinh kịch bản mở đầu & Chặng 1**:
   - Tạo lời chào cho màn hình *"Cuộc gọi bí mật"* xưng tên các bạn chữ cái mới và nhắc tên lớp/cô giáo từ cấu hình chung.
   - Sinh danh sách cổng chữ cái xen kẽ in thường và in hoa cho Level 1 & Level 2 của Chặng 1.
4. **Thiết kế bộ 10 câu hỏi phân hóa cho Chặng 2**:
   - Đảm bảo phân bổ cân bằng đáp án đúng giữa bên Trái (`left`) và bên Phải (`right`) (tỷ lệ 5–5 hoặc 6–4, không lặp quá 2 câu liên tiếp cùng một bên):
     - Câu 1–4: Nhận diện mặt chữ in thường và in hoa của từng chữ trong nhóm.
     - Câu 5–6: Tìm từ vựng quen thuộc với trẻ mầm non có chứa chữ cái đó (ví dụ: *hoa sen, con dê, quả cam, cái ca...*).
     - Câu 7–8: Hỏi đặc điểm cấu tạo nét cơ bản (số nét hoặc dấu phụ như dấu mũ, dấu móc, nét ngang).
     - Câu 9–10: Câu hỏi tổng hợp củng cố phân biệt cặp chữ dễ nhầm trong nhóm.
5. **Cập nhật giọng Nữ AI Thuần Việt & Kiểm chứng (`Verify`)**:
   - Đăng ký gói bài học vào `LESSON_PRESETS` trong `src/data/lessons.ts`.
   - Chạy `python scripts/generate_voice_bank.py` để tự động tổng hợp giọng nữ `vi-VN-HoaiMyNeural` cho lời chào, câu hỏi và hướng dẫn nét viết mới vào `src/data/voiceBank.ts`.
   - Chạy `npm.cmd run build` (hoặc `npx.cmd tsc --noEmit`) đảm bảo khớp 100% kiểu dữ liệu `LessonConfig` và mọi chữ trong `targetLetters` đều tồn tại trong bảng `LETTER_STROKES`.
