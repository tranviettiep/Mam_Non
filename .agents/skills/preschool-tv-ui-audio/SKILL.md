---
name: preschool-tv-ui-audio
description: >-
  Hệ thống thiết kế giao diện Claymorphism chiếu Tivi 16:9 cho lớp học mầm non
  và bộ xử lý âm thanh 3 lớp (Web Audio Synthesizer + Ngân hàng giọng Nữ AI
  Thuần Việt HoaiMyNeural nhúng sẵn Offline + Chuẩn hóa âm đọc mầm non Tiếng Việt).
  Kích hoạt khi làm UI các màn hình hoặc xử lý âm thanh/TTS/cài đặt giọng nói.
---

# Preschool TV UI & Pure Vietnamese Female Audio System

Quy chuẩn giao diện trực quan và hệ thống giọng đọc Nữ Tiếng Việt dễ thương, không phụ thuộc mạng cho ứng dụng mầm non 5–6 tuổi.

## 1. Hệ Token Giao Diện Claymorphism (Tối Ưu Tivi Lớp Học)
- **Bảng màu chủ đạo**:
  - Xanh học tập (`Primary`): `#2563EB` (thẻ đáp án Trái, nét chữ hoàn thành)
  - Vàng nắng (`Secondary`): `#F59E0B` (khung camera, huy hiệu sao, nút nhấn phụ)
  - Hồng vui nhộn (`Accent`): `#EC4899` (thẻ đáp án Phải, nút Cài đặt giọng nói)
  - Xanh lá khích lệ (`Success`): `#10B981` (nút Bắt đầu, thông báo Chính xác)
  - Nền bầu trời dịu mắt: Gradient `#DBEAFE → #EFF6FF → #DCFCE7` (tránh nền trắng chói hoàn toàn trên Tivi 65 inch).
- **Hiệu ứng nổi khối Claymorphism**:
  - Thẻ lớn dùng `rounded-3xl`, viền dày `border-4`, bóng kép (`shadow-[0_8px_0_rgba(0,0,0,0.12)]`) và hiệu ứng nhấn lún `active:translate-y-1`.
- **Biểu tượng**: Chỉ dùng SVG từ `lucide-react` hoặc hình vẽ SVG minh họa rõ nét, không dùng ký tự emoji thay thế icon nút bấm.

## 2. Hệ Thống Âm Thanh & Giọng Đọc Nữ Thuần Việt 3 Lớp
1. **Lớp 1 – Web Audio API Synthesizer (`AudioContext`)**:
   - Mở khóa `audioCtx.resume()` ngay ở cú click đầu tiên của giáo viên, điều chỉnh theo `VoiceSettings.sfxVolume`.
   - Tổng hợp âm thanh tức thì (dung lượng 0 KB, chạy 100% offline): `playClick()`, `playCountdownBeep()`, `playRingtone()`, `playCorrect()`, `playRetry()`, `playStrokeComplete()`, `playCelebration()`.
2. **Lớp 2 – Ngân Hàng Giọng Nữ AI Thuần Việt Nhúng Sẵn (`src/data/voiceBank.ts`)**:
   - Sinh tự động bằng `python scripts/generate_voice_bank.py` từ giọng nữ **`vi-VN-HoaiMyNeural`** với 2 sắc thái:
     - `VOICE_BANK_CUTE` (`pitch="+18Hz", rate="+2%"`): Giọng bạn nhỏ hoạt hình nhí nhảnh cho màn Cuộc gọi bí mật & lời khen.
     - `VOICE_BANK_TEACHER` (`pitch="+8Hz", rate="-5%"`): Giọng cô giáo mầm non dịu dàng, tròn vành rõ chữ cho Chặng 1, 2, 3.
   - Chạy lại `python scripts/generate_voice_bank.py` mỗi khi thêm gói bài học chữ cái mới trong `src/data/lessons.ts` hoặc `src/data/strokes.ts`.
3. **Lớp 3 – Bộ Chuẩn Hóa Âm Mầm Non (`src/utils/vnPhonetics.ts`) & Cài Đặt Giọng Nói Chung (`VoiceSettingsModal`)**:
   - Hàm `normalizeVietnameseForSpeech(rawText)` chuyển đổi mọi mã lớp (`5C5` → `"năm xê năm"`) và chữ cái đơn lẻ (`b` → `"bờ"`, `d` → `"giờ"`, `đ` → `"đờ"`, `ă` → `"á"`, `â` → `"ớ"`, chữ hoa `E/A/O/U` → chữ thường) để không bao giờ đọc lẫn tiếng Anh.
   - Nếu giáo viên tự gõ câu hỏi mới chưa có bản thu, bộ lọc tự ưu tiên giọng Nữ (`HoaiMy`, `Google Tiếng Việt`, `Linh`) và loại trừ giọng Nam mặc định (`Microsoft An`, `NamMinh`).
   - Hỗ trợ **Cài đặt giọng nói chung** (`mam_non_voice_settings_v1`): chọn phong cách (`auto_role`, `teacher_sweet`, `cartoon_cute`, `slow_clear`), tốc độ đọc (`0.75×–1.25×` giữ nguyên `preservesPitch` khi đọc chậm), âm lượng giọng nói & hiệu ứng độc lập.
