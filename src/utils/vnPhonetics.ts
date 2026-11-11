/**
 * Bộ chuẩn hóa phát âm Tiếng Việt thuần Mầm non (5–6 tuổi).
 * Ngăn chặn triệt để lỗi đọc lẫn tên chữ cái Tiếng Anh (A="ây", E="i", B="bi", D="đi", 5C5="five C five")
 * cả khi tạo ngân hàng giọng đọc Neural lẫn khi đọc fallback qua Web Speech API.
 */

const CLASS_CODE_LETTER_MAP: Record<string, string> = {
  a: 'a',
  b: 'bê',
  c: 'xê',
  d: 'dê',
  đ: 'đê',
  e: 'e',
  g: 'giê',
  h: 'hát',
  i: 'i',
  k: 'ca',
  l: 'lờ',
  m: 'mờ',
  n: 'nờ',
};

const PRESCHOOL_LETTER_PHONETICS: Record<string, string> = {
  a: 'a',
  ă: 'á',
  â: 'ớ',
  b: 'bờ',
  c: 'cờ',
  d: 'giờ',
  đ: 'đờ',
  e: 'e',
  ê: 'ê',
  g: 'gờ',
  h: 'hờ',
  i: 'i',
  k: 'ca',
  l: 'lờ',
  m: 'mờ',
  n: 'nờ',
  o: 'o',
  ô: 'ô',
  ơ: 'ơ',
  p: 'pờ',
  q: 'cu',
  r: 'rờ',
  s: 'sờ',
  t: 'tờ',
  u: 'u',
  ư: 'ư',
  v: 'vờ',
  x: 'xờ',
  y: 'i',
};

const DIGIT_VI: Record<string, string> = {
  '0': 'không',
  '1': 'một',
  '2': 'hai',
  '3': 'ba',
  '4': 'bốn',
  '5': 'năm',
  '6': 'sáu',
  '7': 'bảy',
  '8': 'tám',
  '9': 'chín',
};

export function normalizeVietnameseForSpeech(rawText: string): string {
  if (!rawText) return '';

  let text = rawText.normalize('NFC').trim();

  // 1. Chuẩn hóa mã lớp học viết liền (VD: 5C5 -> năm xê năm, 5A1 -> năm a một, 4B -> bốn bê)
  text = text.replace(
    /(^|[^\p{L}\p{N}])(\d)([A-Za-zĐđ])(\d)?(?=$|[^\p{L}\p{N}])/gu,
    (_match, prefix: string, d1: string, letter: string, d2?: string) => {
      const w1 = DIGIT_VI[d1] ?? d1;
      const wLetter = CLASS_CODE_LETTER_MAP[letter.toLowerCase()] ?? letter.toLowerCase();
      const w2 = d2 ? ` ${DIGIT_VI[d2] ?? d2}` : '';
      return `${prefix}${w1} ${wLetter}${w2}`;
    }
  );

  // 2. Chuẩn hóa một số từ tiếng Anh nếu giáo viên lỡ nhập vào câu hỏi
  text = text.replace(/\blevel\s*(\d+)\b/gi, 'cấp độ $1');

  // 3. Chuẩn hóa mọi chữ cái đơn lẻ đứng độc lập thành âm đọc chuẩn mầm non Tiếng Việt
  // Dùng ranh giới không phải chữ cái/số Unicode để bắt chính xác token 1 ký tự (kể cả sau dấu phẩy, ngoặc kép, dấu chấm hỏi)
  text = text.replace(
    /(^|[^\p{L}\p{N}])([\p{L}])(?=$|[^\p{L}\p{N}])/gu,
    (full, prefix: string, ch: string) => {
      const lower = ch.toLocaleLowerCase('vi-VN');
      const mapped = PRESCHOOL_LETTER_PHONETICS[lower];
      if (!mapped) return full;
      return `${prefix}${mapped}`;
    }
  );

  // 4. Gom khoảng trắng thừa
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Tạo khóa tra cứu chuẩn hóa cho ngân hàng giọng đọc (VOICE_BANK).
 */
export function getSpeechLookupKey(rawText: string): string {
  return normalizeVietnameseForSpeech(rawText).toLocaleLowerCase('vi-VN');
}
