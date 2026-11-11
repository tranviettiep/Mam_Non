---
name: webcam-head-tilt-engine
description: >-
  Thiết kế, triển khai và gỡ lỗi trò chơi tương tác nghiêng đầu qua Webcam AI
  (MediaPipe FaceLandmarker) trong môi trường lớp học đông học sinh. Kích hoạt
  khi làm việc với Chặng 2, camera nhận diện khuôn mặt hoặc điều khiển nghiêng đầu.
---

# Webcam Head-Tilt Engine (Chuẩn Lớp Học Mầm Non)

Quy chuẩn kỹ thuật khi xây dựng hoặc chỉnh sửa bộ nhận diện nghiêng đầu qua Webcam cho trẻ mầm non.

## 1. Lọc Khuôn Mặt Chính Giữa Đám Đông (Anti-Crowd Filter)
Trong lớp học thực tế, có 15–25 học sinh ngồi/xếp hàng phía sau bé đang chơi.
1. Cấu hình `FaceLandmarker` với `runningMode: 'VIDEO'` và `numFaces: 4`.
2. Với mỗi khung hình có nhiều khuôn mặt, tính bounding box từ tập điểm mốc và chọn duy nhất khuôn mặt có điểm ưu tiên cao nhất:
   - `area = width * height` (bé đứng gần laptop nhất sẽ có diện tích lớn nhất).
   - `centerDist = hypot(centerX - 0.5, centerY - 0.5)` (ưu tiên bé đứng chính diện khung camera).
   - `score = area * (1 - 0.5 * centerDist)`. Bỏ qua các khuôn mặt quá nhỏ (`width < 0.10`).

## 2. Đồng Bộ Gương Lật & Công Thức Góc Nghiêng
1. Thẻ `<video>` hiển thị cho trẻ bắt buộc lật gương CSS `transform: scaleX(-1)` để bé nghiêng sang bên nào ngoài đời thì hình trên Tivi nghiêng về đúng thẻ đáp án bên đó.
2. Quy đổi tọa độ mắt sang hệ quy chiếu màn hình đã lật gương (`screenX = 1 - rawLandmark.x`, `screenY = rawLandmark.y`) với hai điểm khóe mắt ngoài (`#33` và `#263`):
   - Sắp xếp điểm có `screenX` nhỏ hơn là `leftOnScreen`, điểm có `screenX` lớn hơn là `rightOnScreen`.
   - `angleDeg = Math.atan2(rightOnScreen.y - leftOnScreen.y, rightOnScreen.x - leftOnScreen.x) * (180 / Math.PI)`
   - Làm mượt góc bằng bộ lọc EMA (`smoothed = smoothed * 0.65 + rawAngle * 0.35`) để chống rung khung hình:
     - `smoothed <= -15°` → **NGHIÊNG TRÁI** (chọn thẻ bên trái).
     - `smoothed >= +15°` → **NGHIÊNG PHẢI** (chọn thẻ bên phải).

## 3. Máy Trạng Thái 4 Bước Chống Nhảy Câu Liên Tiếp
Không chốt đáp án tức thì ở 1 frame để tránh chọn nhầm khi trẻ nhún nhảy ăn mừng:
1. `READY`: Đang nghe câu hỏi và chờ đầu nghiêng vượt ngưỡng `±15°`.
2. `DWELLING`: Giữ nghiêng liên tục đủ `600ms` (hiển thị vòng/thanh tiến trình xác nhận). Nếu góc giảm về `< 11°` trước `600ms` thì hủy về `READY`.
3. `LOCKED`: Chốt đáp án:
   - Nếu **SAI**: Phát âm báo nhẹ + *"Chưa đúng, chọn lại nhé!"*, khóa `900ms` rồi về `READY`.
   - Nếu **ĐÚNG**: Cộng sao + pháo giấy + *"Chính xác!"*, chuyển sang `WAIT_NEUTRAL`.
4. `WAIT_NEUTRAL`: Chuyển sang câu tiếp theo nhưng **chỉ mở khóa về `READY`** sau tối thiểu `1100ms` **VÀ** đầu bé đã trở lại tư thế thẳng (`|smoothed| <= 8°` trong ít nhất `250ms`).

## 4. Fallback & Giải Phóng Phần Cứng
- Luôn lắng nghe phím `ArrowLeft` / `ArrowRight` và sự kiện click/tap trên 2 thẻ đáp án.
- Trong cleanup của `useEffect`, bắt buộc dừng mọi `MediaStreamTrack`, hủy `requestAnimationFrame` và gọi `faceLandmarker.close()`.
