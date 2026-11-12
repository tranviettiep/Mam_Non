import { CustomStrokeInstruction, LessonConfig } from '../types/lesson';
import { LETTER_STROKES } from './strokes';

const DEFAULT_PUBLIC_SHARE_BASE = 'https://tranviettiep.github.io/Mam_Non/';

export const LESSON_PRESETS: LessonConfig[] = [
  {
    id: 'lesson-e-ehat',
    title: 'Sân Chơi Chữ Cái',
    schoolName: 'TRƯỜNG MẦM NON THÀNH LỢI',
    className: 'Lớp 5 Tuổi',
    teacherNames: 'cô Mơ',
    targetLetters: ['e', 'ê'],
    secretCallGreeting:
      'Xin chào cô Mơ và các bạn nhỏ lớp 5 Tuổi! Chúng tớ là chữ e và chữ ê đây! Hôm nay chúng tớ mang đến ba chặng thử thách siêu vui, các bạn nhỏ đã sẵn sàng chinh phục cùng chúng tớ chưa nào?',
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
    schoolName: 'TRƯỜNG MẦM NON THÀNH LỢI',
    className: 'Lớp 5 Tuổi',
    teacherNames: 'cô Mơ',
    targetLetters: ['o', 'ô', 'ơ'],
    secretCallGreeting:
      'Xin chào cô Mơ và các bạn nhỏ lớp 5 Tuổi! Gia đình chữ tròn o, ô, ơ xin chào cả lớp! Các bạn đã sẵn sàng vượt qua ba chặng thử thách hôm nay chưa nào?',
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
    schoolName: 'TRƯỜNG MẦM NON THÀNH LỢI',
    className: 'Lớp 5 Tuổi',
    teacherNames: 'cô Mơ',
    targetLetters: ['a', 'ă', 'â'],
    secretCallGreeting:
      'Xin chào cô Mơ và các bạn nhỏ lớp 5 Tuổi! Ba anh em chữ a, ă, â rất vui được gặp lớp mình hôm nay. Cả lớp cùng sẵn sàng tham gia sân chơi chữ cái nhé!',
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
    schoolName: 'TRƯỜNG MẦM NON THÀNH LỢI',
    className: 'Lớp 5 Tuổi',
    teacherNames: 'cô Mơ',
    targetLetters: ['u', 'ư'],
    secretCallGreeting:
      'Xin chào cô Mơ và các bạn nhỏ lớp 5 Tuổi! Đôi bạn chữ u và chữ ư đã tới lớp mình rồi đây! Chúng mình cùng bắt đầu thử thách ngay nhé!',
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
    schoolName: 'TRƯỜNG MẦM NON THÀNH LỢI',
    className: 'Lớp 5 Tuổi',
    teacherNames: 'cô Mơ',
    targetLetters: ['b', 'd', 'đ'],
    secretCallGreeting:
      'Xin chào cô Mơ và các bạn nhỏ lớp 5 Tuổi! Nhóm bạn chữ b, d, đ rất háo hức được vui học cùng lớp mình hôm nay. Các bạn đã sẵn sàng chưa?',
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

const STORAGE_KEY = 'mam_non_active_lesson_v2';
const LEGACY_STORAGE_KEY = 'mam_non_active_lesson_v1';

export function buildGreetingSalutation(teacherNames: string, className: string): string {
  const teacher = teacherNames.trim() || 'cô giáo';
  const rawClass = className.trim();
  if (!rawClass) {
    return `Xin chào ${teacher} và các bạn nhỏ đáng yêu!`;
  }
  const normalizedClass = /^lớp\b/i.test(rawClass)
    ? `lớp${rawClass.slice(3)}`
    : `lớp ${rawClass}`;
  return `Xin chào ${teacher} và các bạn nhỏ ${normalizedClass}!`;
}

export function syncGreetingWithClassInfo(
  greeting: string,
  teacherNames: string,
  className: string,
  updatedLetters?: string[]
): string {
  const salutation = buildGreetingSalutation(teacherNames, className);
  const trimmed = (greeting || '').trim();

  if (!trimmed) {
    const lettersLabel =
      updatedLetters && updatedLetters.length > 0
        ? updatedLetters.map((c) => `chữ ${c}`).join(' và ')
        : 'các bạn chữ cái';
    return `${salutation} Chúng tớ là ${lettersLabel} đây! Hôm nay chúng tớ mang đến ba chặng thử thách siêu vui, các bạn nhỏ đã sẵn sàng chinh phục cùng chúng tớ chưa nào?`;
  }

  let next = trimmed;
  if (/^Xin chào [^!.?]+[!?.]/i.test(next)) {
    next = next.replace(/^Xin chào [^!.?]+[!?.]/i, salutation);
  }

  if (updatedLetters && updatedLetters.length > 0) {
    const lettersText =
      updatedLetters.length <= 2
        ? updatedLetters.map((c) => `chữ ${c}`).join(' và ')
        : `nhóm chữ ${updatedLetters.join(', ')}`;
    next = next.replace(
      /(Chúng tớ là |Gia đình chữ tròn |Ba anh em chữ |Đôi bạn chữ |Nhóm bạn chữ )[^!.?]+( đây!| xin chào cả lớp!)/i,
      `Chúng tớ là ${lettersText} đây!`
    );
  }

  return next;
}

function encodeUtf8Base64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function decodeUtf8Base64Url(b64url: string): string {
  const padded = b64url.replace(/-/g, '+').replace(/_/g, '/');
  const padLen = (4 - (padded.length % 4)) % 4;
  const binary = atob(padded + '='.repeat(padLen));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

export function stripDuplicateStrokePrefix(text: string): string {
  return (text || '').replace(/^\s*Nét\s*\d+(?:\s*\/\s*\d+)?\s*:\s*/i, '');
}

export function getEffectiveStrokeInstruction(
  lesson: LessonConfig,
  letterKey: string,
  strokeIdx: number
): {
  instruction: string;
  defaultInstruction: string;
  customAudioUrl?: string;
  isModified: boolean;
} {
  const defaultInstruction = LETTER_STROKES[letterKey]?.strokes[strokeIdx]?.instruction ?? '';
  const override = lesson.tracingOverrides?.[letterKey]?.[strokeIdx];
  const rawOverride =
    override && typeof override.instruction === 'string'
      ? stripDuplicateStrokePrefix(override.instruction)
      : undefined;
  const instruction =
    rawOverride !== undefined && rawOverride.trim().length > 0
      ? rawOverride
      : defaultInstruction;
  const customAudioUrl = override?.customAudioUrl;
  const isModified = instruction.trim() !== defaultInstruction.trim() || Boolean(customAudioUrl);
  return { instruction, defaultInstruction, customAudioUrl, isModified };
}

export function hasCustomTracingInstructions(lesson: LessonConfig): boolean {
  if (!lesson.tracingOverrides) return false;
  for (const [letterKey, list] of Object.entries(lesson.tracingOverrides)) {
    const defStrokes = LETTER_STROKES[letterKey]?.strokes;
    if (!defStrokes || !Array.isArray(list)) continue;
    for (let i = 0; i < Math.min(defStrokes.length, list.length); i++) {
      const item = list[i];
      if (!item) continue;
      const cleaned = stripDuplicateStrokePrefix(item.instruction || '').trim();
      if (cleaned && cleaned !== defStrokes[i].instruction.trim()) {
        return true;
      }
    }
  }
  return false;
}

function sanitizeTracingOverridesForShare(
  overrides?: Record<string, CustomStrokeInstruction[]>
): Record<string, CustomStrokeInstruction[]> | undefined {
  if (!overrides) return undefined;
  const out: Record<string, CustomStrokeInstruction[]> = {};
  let hasAny = false;

  for (const [letterKey, list] of Object.entries(overrides)) {
    const defStrokes = LETTER_STROKES[letterKey]?.strokes;
    if (!defStrokes || !Array.isArray(list)) continue;

    let letterModified = false;
    const sanitizedList: CustomStrokeInstruction[] = defStrokes.map((st, idx) => {
      const cleaned = stripDuplicateStrokePrefix(list[idx]?.instruction || '').trim();
      if (cleaned && cleaned !== st.instruction.trim()) {
        letterModified = true;
        return { instruction: cleaned };
      }
      return { instruction: st.instruction };
    });

    if (letterModified) {
      out[letterKey] = sanitizedList;
      hasAny = true;
    }
  }

  return hasAny ? out : undefined;
}

function findMatchingPresetIfQuestionsUnchanged(lesson: LessonConfig): LessonConfig | undefined {
  if (hasCustomTracingInstructions(lesson)) return undefined;

  const candidate =
    LESSON_PRESETS.find((p) => p.id === lesson.id) ??
    LESSON_PRESETS.find((p) => p.targetLetters.join(',') === lesson.targetLetters.join(','));
  if (!candidate) return undefined;
  if (lesson.targetLetters.join(',') !== candidate.targetLetters.join(',')) return undefined;
  if (lesson.questions.length !== candidate.questions.length) return undefined;

  for (let i = 0; i < candidate.questions.length; i++) {
    const a = lesson.questions[i];
    const b = candidate.questions[i];
    if (
      a.prompt !== b.prompt ||
      a.leftOption !== b.leftOption ||
      a.rightOption !== b.rightOption ||
      a.correctSide !== b.correctSide
    ) {
      return undefined;
    }
  }

  const expectedGreeting = syncGreetingWithClassInfo(
    candidate.secretCallGreeting,
    lesson.teacherNames,
    lesson.className
  );
  if (lesson.secretCallGreeting.trim() !== expectedGreeting.trim()) {
    return undefined;
  }

  return candidate;
}

function getShareBaseUrl(): string {
  if (typeof window === 'undefined' || window.location.protocol === 'file:') {
    return DEFAULT_PUBLIC_SHARE_BASE;
  }
  const cleanPath = window.location.pathname.replace(/\/San_Choi_Chu_Cai\.html$/i, '/');
  return `${window.location.origin}${cleanPath}`;
}

export function buildShareableLessonUrl(lesson: LessonConfig): string {
  const url = new URL(getShareBaseUrl());
  const matchedPreset = findMatchingPresetIfQuestionsUnchanged(lesson);
  const def = LESSON_PRESETS[0];

  if (matchedPreset) {
    if (matchedPreset.id !== def.id) {
      url.searchParams.set('p', matchedPreset.id);
    }
    if (lesson.schoolName.trim() !== def.schoolName) {
      url.searchParams.set('truong', lesson.schoolName.trim());
    }
    if (lesson.className.trim() !== def.className) {
      url.searchParams.set('lop', lesson.className.trim());
    }
    if (lesson.teacherNames.trim() !== def.teacherNames) {
      url.searchParams.set('co', lesson.teacherNames.trim());
    }
    return url.toString();
  }

  // Trường hợp cô giáo đã tự sửa bộ câu hỏi, lời chào hoặc hướng dẫn viết Chặng 3 -> nén toàn bộ cấu hình lên link
  const stripped: LessonConfig = {
    ...lesson,
    secretCallCustomAudioUrl: undefined,
    questions: lesson.questions.map(({ customAudioUrl: _omit, ...rest }) => rest),
    tracingOverrides: sanitizeTracingOverridesForShare(lesson.tracingOverrides),
  };
  url.searchParams.set('bai', encodeUtf8Base64Url(JSON.stringify(stripped)));
  return url.toString();
}

export async function copyShareableLessonUrl(lesson: LessonConfig): Promise<string> {
  const shareUrl = buildShareableLessonUrl(lesson);
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(shareUrl);
      return shareUrl;
    } catch {
      // fallback below
    }
  }
  if (typeof document !== 'undefined') {
    const ta = document.createElement('textarea');
    ta.value = shareUrl;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
  return shareUrl;
}

function tryLoadLessonFromUrl(): LessonConfig | null {
  if (typeof window === 'undefined' || !window.location.search) return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const encodedBai = params.get('bai');
    if (encodedBai) {
      const parsed = JSON.parse(decodeUtf8Base64Url(encodedBai));
      if (parsed && parsed.id && Array.isArray(parsed.questions)) {
        return normalizeLoadedLesson(parsed as LessonConfig);
      }
    }

    const hasQuickParams =
      params.has('p') || params.has('truong') || params.has('lop') || params.has('co');
    if (hasQuickParams) {
      const presetId = params.get('p');
      const base = structuredClone(
        LESSON_PRESETS.find((p) => p.id === presetId) ?? LESSON_PRESETS[0]
      );
      if (params.has('truong')) base.schoolName = params.get('truong') || base.schoolName;
      if (params.has('lop')) base.className = params.get('lop') || base.className;
      if (params.has('co')) base.teacherNames = params.get('co') || base.teacherNames;
      base.secretCallGreeting = syncGreetingWithClassInfo(
        base.secretCallGreeting,
        base.teacherNames,
        base.className
      );
      return base;
    }
  } catch {
    // ignore malformed URL params
  }
  return null;
}

function normalizeLoadedLesson(lesson: LessonConfig): LessonConfig {
  if (!lesson.secretCallCustomAudioUrl) {
    return {
      ...lesson,
      secretCallGreeting: syncGreetingWithClassInfo(
        lesson.secretCallGreeting,
        lesson.teacherNames,
        lesson.className
      ),
    };
  }
  return lesson;
}

export function loadInitialLesson(): LessonConfig {
  // 1. Ưu tiên cao nhất: Cấu hình được chia sẻ qua đường link URL (?bai=... hoặc ?truong=...&lop=...&co=...)
  const fromUrl = tryLoadLessonFromUrl();
  if (fromUrl) {
    saveLessonToStorage(fromUrl);
    if (
      typeof window !== 'undefined' &&
      window.location.protocol.startsWith('http') &&
      window.history?.replaceState
    ) {
      window.history.replaceState(null, '', window.location.pathname + window.location.hash);
    }
    return fromUrl;
  }

  // 2. File .html độc lập đã nhúng sẵn bài học
  if (typeof document !== 'undefined') {
    const embeddedEl = document.getElementById('embedded-lesson-config');
    if (embeddedEl && embeddedEl.textContent) {
      try {
        const parsed = JSON.parse(embeddedEl.textContent.trim());
        if (parsed && parsed.id && Array.isArray(parsed.questions)) {
          return normalizeLoadedLesson(parsed as LessonConfig);
        }
      } catch {
        // ignore invalid embedded JSON
      }
    }
  }

  // 3. Bộ nhớ trình duyệt trên máy hiện tại
  if (typeof localStorage !== 'undefined') {
    try {
      const rawV2 = localStorage.getItem(STORAGE_KEY);
      if (rawV2) {
        const parsed = JSON.parse(rawV2);
        if (parsed && parsed.id && Array.isArray(parsed.questions)) {
          return normalizeLoadedLesson(parsed as LessonConfig);
        }
      }

      // Di chuyển dữ liệu tự chỉnh sửa từ v1 sang v2 (bỏ qua nếu v1 chỉ là mặc định cũ Liên Minh)
      const rawV1 = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (rawV1) {
        const parsedV1 = JSON.parse(rawV1) as LessonConfig;
        if (
          parsedV1 &&
          parsedV1.id &&
          Array.isArray(parsedV1.questions) &&
          parsedV1.schoolName !== 'TRƯỜNG MẦM NON LIÊN MINH'
        ) {
          const migrated = normalizeLoadedLesson(parsedV1);
          saveLessonToStorage(migrated);
          return migrated;
        }
      }
    } catch {
      // ignore storage error
    }
  }

  // 4. Mặc định gốc: TRƯỜNG MẦM NON THÀNH LỢI - Lớp 5 Tuổi - cô Mơ
  return structuredClone(LESSON_PRESETS[0]);
}

export function saveLessonToStorage(lesson: LessonConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lesson));
  } catch {
    // ignore quota errors
  }
}
