import { LessonConfig } from '../types/lesson';

export const LESSON_PRESETS: LessonConfig[] = [
  {
    id: 'lesson-e-ehat',
    title: 'Sân Chơi Chữ Cái',
    schoolName: 'TRƯỜNG MẦM NON LIÊN MINH',
    className: 'Lớp 5C5',
    teacherNames: 'cô Thương và cô Thùy',
    targetLetters: ['e', 'ê'],
    secretCallGreeting:
      'Xin chào cô Thương, cô Thùy và các bạn nhỏ lớp 5C5! Chúng tớ là chữ e và chữ ê đây! Hôm nay chúng tớ mang đến ba chặng thử thách siêu vui, các bạn nhỏ đã sẵn sàng chinh phục cùng chúng tớ chưa nào?',
    runnerLetters: ['e', 'ê', 'E', 'Ê'],
    questions: [
      { id: 'q1', prompt: 'Đâu là chữ e in thường?', leftOption: 'e', rightOption: 'ê', correctSide: 'left' },
      { id: 'q2', prompt: 'Đâu là chữ e in hoa?', leftOption: 'e', rightOption: 'E', correctSide: 'right' },
      { id: 'q3', prompt: 'Đâu là chữ ê in thường?', leftOption: 'ê', rightOption: 'e', correctSide: 'left' },
      { id: 'q4', prompt: 'Đâu là chữ ê in hoa?', leftOption: 'ê', rightOption: 'Ê', correctSide: 'right' },
      { id: 'q5', prompt: 'Từ nào dưới đây có chứa chữ e?', leftOption: 'sen', rightOption: 'dê', correctSide: 'left' },
      { id: 'q6', prompt: 'Từ nào có chứa chữ ê?', leftOption: 'dê', rightOption: 'xe', correctSide: 'left' },
      { id: 'q7', prompt: 'Chữ e in thường có mấy nét?', leftOption: '2', rightOption: '3', correctSide: 'left' },
      { id: 'q8', prompt: 'Có mấy cách viết chữ e?', leftOption: '2', rightOption: '3', correctSide: 'right' },
      { id: 'q9', prompt: 'Có mấy cách viết chữ ê?', leftOption: '3', rightOption: '2', correctSide: 'left' },
      { id: 'q10', prompt: 'Đâu là chữ ê in hoa?', leftOption: 'Ê', rightOption: 'ê', correctSide: 'left' },
    ],
  },
  {
    id: 'lesson-o-group',
    title: 'Sân Chơi Chữ Cái',
    schoolName: 'TRƯỜNG MẦM NON LIÊN MINH',
    className: 'Lớp 5C5',
    teacherNames: 'cô giáo',
    targetLetters: ['o', 'ô', 'ơ'],
    secretCallGreeting:
      'Xin chào cô giáo và các bạn nhỏ đáng yêu! Gia đình chữ tròn o, ô, ơ xin chào cả lớp! Các bạn đã sẵn sàng vượt qua ba chặng thử thách hôm nay chưa nào?',
    runnerLetters: ['o', 'ô', 'ơ', 'O', 'Ô', 'Ơ'],
    questions: [
      { id: 'o1', prompt: 'Đâu là chữ o in thường?', leftOption: 'o', rightOption: 'ô', correctSide: 'left' },
      { id: 'o2', prompt: 'Chữ nào có đội mũ trên đầu?', leftOption: 'ơ', rightOption: 'ô', correctSide: 'right' },
      { id: 'o3', prompt: 'Chữ nào có thêm dấu móc bên phải?', leftOption: 'ơ', rightOption: 'o', correctSide: 'left' },
      { id: 'o4', prompt: 'Đâu là chữ Ô in hoa?', leftOption: 'O', rightOption: 'Ô', correctSide: 'right' },
      { id: 'o5', prompt: 'Từ nào có chứa chữ o?', leftOption: 'con cò', rightOption: 'cái ô', correctSide: 'left' },
      { id: 'o6', prompt: 'Từ nào có chứa chữ ô?', leftOption: 'lá cờ', rightOption: 'bắp ngô', correctSide: 'right' },
      { id: 'o7', prompt: 'Từ nào có chứa chữ ơ?', leftOption: 'lá cờ', rightOption: 'quả nho', correctSide: 'left' },
      { id: 'o8', prompt: 'Đâu là chữ Ơ in hoa?', leftOption: 'Ô', rightOption: 'Ơ', correctSide: 'right' },
      { id: 'o9', prompt: 'Chữ o tròn khép kín có mấy nét?', leftOption: '1', rightOption: '2', correctSide: 'left' },
      { id: 'o10', prompt: 'Đâu là chữ o in hoa?', leftOption: 'O', rightOption: 'o', correctSide: 'left' },
    ],
  },
  {
    id: 'lesson-a-group',
    title: 'Sân Chơi Chữ Cái',
    schoolName: 'TRƯỜNG MẦM NON LIÊN MINH',
    className: 'Lớp 5C5',
    teacherNames: 'cô giáo',
    targetLetters: ['a', 'ă', 'â'],
    secretCallGreeting:
      'Xin chào cô giáo và các bạn nhỏ! Ba anh em chữ a, ă, â rất vui được gặp lớp mình hôm nay. Cả lớp cùng sẵn sàng tham gia sân chơi chữ cái nhé!',
    runnerLetters: ['a', 'ă', 'â', 'A', 'Ă', 'Â'],
    questions: [
      { id: 'a1', prompt: 'Đâu là chữ a in thường?', leftOption: 'a', rightOption: 'ă', correctSide: 'left' },
      { id: 'a2', prompt: 'Đâu là chữ ă có dấu trăng khuyết?', leftOption: 'â', rightOption: 'ă', correctSide: 'right' },
      { id: 'a3', prompt: 'Đâu là chữ â có dấu mũ?', leftOption: 'â', rightOption: 'a', correctSide: 'left' },
      { id: 'a4', prompt: 'Đâu là chữ A in hoa?', leftOption: 'a', rightOption: 'A', correctSide: 'right' },
      { id: 'a5', prompt: 'Từ nào có chứa chữ a?', leftOption: 'con cá', rightOption: 'con gấu', correctSide: 'left' },
      { id: 'a6', prompt: 'Từ nào có chứa chữ ă?', leftOption: 'cái ca', rightOption: 'mặt trăng', correctSide: 'right' },
      { id: 'a7', prompt: 'Từ nào có chứa chữ â?', leftOption: 'đám mây', rightOption: 'bông hoa', correctSide: 'left' },
      { id: 'a8', prompt: 'Chữ a in thường gồm mấy nét cơ bản?', leftOption: '3', rightOption: '2', correctSide: 'right' },
      { id: 'a9', prompt: 'Đâu là chữ Ă in hoa?', leftOption: 'Ă', rightOption: 'Â', correctSide: 'left' },
      { id: 'a10', prompt: 'Đâu là chữ Â in hoa?', leftOption: 'A', rightOption: 'Â', correctSide: 'right' },
    ],
  },
  {
    id: 'lesson-u-group',
    title: 'Sân Chơi Chữ Cái',
    schoolName: 'TRƯỜNG MẦM NON LIÊN MINH',
    className: 'Lớp 5C5',
    teacherNames: 'cô giáo',
    targetLetters: ['u', 'ư'],
    secretCallGreeting:
      'Xin chào cô giáo và các bạn nhỏ! Đôi bạn chữ u và chữ ư đã tới lớp mình rồi đây! Chúng mình cùng bắt đầu thử thách ngay nhé!',
    runnerLetters: ['u', 'ư', 'U', 'Ư'],
    questions: [
      { id: 'u1', prompt: 'Đâu là chữ u in thường?', leftOption: 'u', rightOption: 'ư', correctSide: 'left' },
      { id: 'u2', prompt: 'Chữ nào có thêm dấu móc bên phải?', leftOption: 'u', rightOption: 'ư', correctSide: 'right' },
      { id: 'u3', prompt: 'Đâu là chữ U in hoa?', leftOption: 'U', rightOption: 'u', correctSide: 'left' },
      { id: 'u4', prompt: 'Đâu là chữ Ư in hoa?', leftOption: 'U', rightOption: 'Ư', correctSide: 'right' },
      { id: 'u5', prompt: 'Từ nào có chứa chữ u?', leftOption: 'quả đu đủ', rightOption: 'sư tử', correctSide: 'left' },
      { id: 'u6', prompt: 'Từ nào có chứa chữ ư?', leftOption: 'cái mũ', rightOption: 'lá thư', correctSide: 'right' },
      { id: 'u7', prompt: 'Chữ u in thường có mấy nét?', leftOption: '2', rightOption: '4', correctSide: 'left' },
      { id: 'u8', prompt: 'Từ nào có chứa chữ ư?', leftOption: 'sư tử', rightOption: 'con cú', correctSide: 'left' },
      { id: 'u9', prompt: 'Chữ ư khác chữ u ở điểm nào?', leftOption: 'Dấu mũ', rightOption: 'Dấu móc', correctSide: 'right' },
      { id: 'u10', prompt: 'Đâu là chữ ư in thường?', leftOption: 'ư', rightOption: 'Ư', correctSide: 'left' },
    ],
  },
  {
    id: 'lesson-bdd-group',
    title: 'Sân Chơi Chữ Cái',
    schoolName: 'TRƯỜNG MẦM NON LIÊN MINH',
    className: 'Lớp 5C5',
    teacherNames: 'cô giáo',
    targetLetters: ['b', 'd', 'đ'],
    secretCallGreeting:
      'Xin chào cô giáo và các bạn nhỏ! Nhóm bạn chữ b, d, đ rất háo hức được vui học cùng lớp mình hôm nay. Các bạn đã sẵn sàng chưa?',
    runnerLetters: ['b', 'd', 'đ', 'B', 'D', 'Đ'],
    questions: [
      { id: 'b1', prompt: 'Chữ nào có nét sổ thẳng bên trái?', leftOption: 'b', rightOption: 'd', correctSide: 'left' },
      { id: 'b2', prompt: 'Chữ nào có nét sổ thẳng bên phải?', leftOption: 'b', rightOption: 'd', correctSide: 'right' },
      { id: 'b3', prompt: 'Chữ nào có thêm nét gạch ngang?', leftOption: 'đ', rightOption: 'd', correctSide: 'left' },
      { id: 'b4', prompt: 'Đâu là chữ B in hoa?', leftOption: 'b', rightOption: 'B', correctSide: 'right' },
      { id: 'b5', prompt: 'Từ nào có chứa chữ b?', leftOption: 'con bò', rightOption: 'con dê', correctSide: 'left' },
      { id: 'b6', prompt: 'Từ nào có chứa chữ d?', leftOption: 'quả bóng', rightOption: 'cánh diều', correctSide: 'right' },
      { id: 'b7', prompt: 'Từ nào có chứa chữ đ?', leftOption: 'đèn lồng', rightOption: 'búp bê', correctSide: 'left' },
      { id: 'b8', prompt: 'Đâu là chữ Đ in hoa?', leftOption: 'D', rightOption: 'Đ', correctSide: 'right' },
      { id: 'b9', prompt: 'Chữ đ có mấy nét viết?', leftOption: '3', rightOption: '1', correctSide: 'left' },
      { id: 'b10', prompt: 'Đâu là chữ D in hoa?', leftOption: 'D', rightOption: 'B', correctSide: 'left' },
    ],
  },
];

const STORAGE_KEY = 'mam_non_active_lesson_v1';

export function loadInitialLesson(): LessonConfig {
  if (typeof document !== 'undefined') {
    const embeddedEl = document.getElementById('embedded-lesson-config');
    if (embeddedEl && embeddedEl.textContent) {
      try {
        const parsed = JSON.parse(embeddedEl.textContent.trim());
        if (parsed && parsed.id && Array.isArray(parsed.questions)) {
          return parsed as LessonConfig;
        }
      } catch {
        // ignore invalid embedded JSON
      }
    }
  }

  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.id && Array.isArray(parsed.questions)) {
          return parsed as LessonConfig;
        }
      }
    } catch {
      // ignore storage error
    }
  }

  return structuredClone(LESSON_PRESETS[0]);
}

export function saveLessonToStorage(lesson: LessonConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lesson));
  } catch {
    // ignore quota errors
  }
}
