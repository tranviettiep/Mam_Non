---
name: vietnamese-letter-tracing
description: >-
  Chuẩn hóa dữ liệu nét viết chữ cái Tiếng Việt và thuật toán dẫn nét từng bước
  (Guided Stroke Tracing) hỗ trợ cả chuột và màn hình cảm ứng cho trẻ 5–6 tuổi.
  Kích hoạt khi xây dựng Chặng 3 hoặc thêm/chỉnh sửa nét chữ cái mới.
---

# Vietnamese Letter Tracing (Tập Tô Chữ Cái Chuẩn Mầm Non)

Quy chuẩn dựng hình học nét chữ và thuật toán bắt điểm tô chữ cho tay trẻ 5–6 tuổi.

## 1. Cấu Trúc Hình Học Từng Nét (`LetterStrokeDef`)
- Hệ tọa độ chuẩn của bảng vẽ: `viewBox="0 0 400 400"` (tâm chữ quanh `(200, 220)`, chiều cao thân chữ thường `150px–170px`, phần dấu mũ/móc nằm ở vùng `y: 45..115`).
- Mỗi chữ cái gồm danh sách các nét `strokes` tách biệt theo đúng thứ tự viết chuẩn mầm non Việt Nam. Xem chi tiết quy tắc từng nhóm chữ tại [vn-stroke-rules.md](./references/vn-stroke-rules.md).
- Mỗi nét được lấy mẫu thành mảng điểm mốc cách đều (`step ≈ 6px` trên không gian `400×400`).

## 2. Thuật Toán Dẫn Nét Đơn Điệu (`Monotonic Waypoint Corridor`)
Trẻ 5 tuổi điều khiển chuột rời hoặc ngón tay trên màn hình cảm ứng thường rung tay:
1. Dùng thống nhất **Pointer Events** (`onPointerDown`, `onPointerMove`, `onPointerUp`, `onPointerCancel`) kèm `setPointerCapture(e.pointerId)` và CSS `touch-action: none`.
2. Quy đổi tọa độ con trỏ màn hình về hệ tọa độ `400×400` qua `svgElement.getBoundingClientRect()`.
3. Tại nét hiện tại `strokeIdx` với tiến độ `progressIdx` (`0 .. points.length - 1`):
   - Khi bắt đầu nhấn xuống (`pointerdown`), cho phép bắt đầu nếu con trỏ nằm trong bán kính `R_start = 42` quanh điểm `points[progressIdx]`.
   - Khi kéo (`pointermove`), xét cửa sổ điểm phía trước từ `progressIdx + 1` đến `min(progressIdx + 10, lastIdx)`. Nếu khoảng cách nhỏ hơn `R_move = 44`, cập nhật `progressIdx` tiến lên điểm xa nhất thỏa mãn.
   - Khi `progressIdx >= lastIdx - 2`, tự động hoàn thành trọn vẹn nét đó (`100%`), phát âm hiệu ứng "ting" và chuyển sang nét kế tiếp.
4. **Không xóa tiến độ giữa chừng**: Nếu trẻ nhấc tay (`pointerup`) khi mới tô được nửa nét, giữ nguyên `progressIdx` hiện tại để trẻ đặt tay xuống tô tiếp từ điểm đang dở.

## 3. Hiển Thị Trực Quan & Gợi Ý (`💡 Gợi ý`)
- Nét chưa tô: Nét đứt chấm tròn xám xanh nhạt (`strokeDasharray="2 22"`, `strokeLinecap="round"`).
- Điểm đặt bút hiện tại: Vòng tròn đỏ/cam nhấp nháy tại `points[progressIdx]` + mũi tên chỉ hướng tiếp tuyến tới điểm kế tiếp.
- Phần nét đã tô: Nét liền xanh dương đậm (`#1D4ED8`, độ dày `26px`, bo tròn hai đầu) nối mượt từ `points[0]` đến `points[progressIdx]`.
- Nút **`Gợi ý`**: Chạy một ngôi sao/bàn tay phát sáng dọc theo các điểm mốc của nét hiện tại trong `1.2s` để trẻ nhìn rõ chiều kéo tay.
