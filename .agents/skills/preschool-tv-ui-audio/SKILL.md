---
name: preschool-tv-ui-audio
description: >-
  Hệ thống thiết kế giao diện Claymorphism chiếu Tivi 16:9 cho lớp học mầm non
  và bộ xử lý âm thanh 2 lớp (Web Audio Synthesizer + Giọng đọc Tiếng Việt có
  ghi âm dự phòng). Kích hoạt khi làm UI các màn hình hoặc xử lý âm thanh/TTS.
---

# Preschool TV UI & Dual-Layer Audio

Quy chuẩn giao diện trực quan và âm thanh không phụ thuộc mạng cho ứng dụng mầm non.

## 1. Hệ Token Giao Diện Claymorphism (Tối Ưu Tivi Lớp Học)
- **Bảng màu chủ đạo**:
  - Xanh học tập (`Primary`): `#2563EB` (thẻ đáp án Trái, nét chữ hoàn thành)
  - Vàng nắng (`Secondary`): `#F59E0B` (khung camera, huy hiệu sao, nút nhấn phụ)
  - Hồng vui nhộn (`Accent`): `#EC4899` (thẻ đáp án Phải, điểm nhấn chuyển tiếp)
  - Xanh lá khích lệ (`Success`): `#10B981` (nút Bắt đầu, thông báo Chính xác)
  - Nền bầu trời dịu mắt: Gradient `#DBEAFE → #EFF6FF → #DCFCE7` (tránh nền trắng chói hoàn toàn trên Tivi 65 inch).
- **Hiệu ứng nổi khối Claymorphism**:
  - Thẻ lớn dùng `rounded-3xl`, viền dày `border-4`, bóng kép (`shadow-[0_8px_0_rgba(0,0,0,0.12)]`) và hiệu ứng nhấn lún `active:translate-y-1`.
- **Biểu tượng**: Chỉ dùng SVG từ `lucide-react` hoặc hình vẽ SVG minh họa rõ nét, không dùng ký tự emoji thay thế icon nút bấm.

## 2. Hệ Thống Âm Thanh 2 Lớp (Zero-External-File SFX + Safe TTS)
1. **Lớp 1 – Web Audio API Synthesizer (`AudioContext`)**:
   - Mở khóa `audioCtx.resume()` ngay ở cú click đầu tiên của giáo viên (ví dụ nút "Nghe máy" hoặc "Bắt đầu").
   - Cung cấp sẵn các hàm tổng hợp âm thanh tức thì (dung lượng 0 KB, chạy 100% offline):
     - `playTick()`: Tiếng đếm ngược `3-2-1` / bước chuyển nhịp.
     - `playRingtone()`: Tiếng chuông điện thoại vui nhộn cho màn "Cuộc gọi bí mật".
     - `playCorrect()`: Hợp âm rải đi lên (`C5 - E5 - G5 - C6`) tươi sáng.
     - `playRetry()`: Hai nốt trầm nhẹ nhàng (`E4 - C4`), không gây giật mình.
     - `playCelebration()`: Chuỗi fanfare chiến thắng khi hoàn thành chặng / tô xong chữ.
2. **Lớp 2 – Giọng Đọc Tiếng Việt An Toàn (`speakVi`)**:
   - Nếu câu hỏi/lời chào có bản ghi âm giọng cô giáo (`customAudioDataUrl` dạng Base64), ưu tiên phát qua `HTMLAudioElement`.
   - Ngược lại, dùng `window.speechSynthesis` tìm giọng có `lang.startsWith('vi')`, tốc độ `rate = 0.92`, `pitch = 1.08`.
   - Luôn gắn bộ hẹn giờ an toàn (`timeout`) để luồng trò chơi không bao giờ bị treo nếu trình duyệt/Windows không cài gói giọng đọc `vi-VN` hoặc sự kiện `onend` không bắn.
