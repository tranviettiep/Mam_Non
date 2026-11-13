import { LessonConfig } from '../types/lesson';
import { IllustrationId } from '../components/VocabIllustration';

export type StrokePieceId =
  | 'net-ngang'
  | 'cong-ho-phai'
  | 'cong-kin'
  | 'dau-mu'
  | 'dau-moc'
  | 'dau-trang'
  | 'so-thang-phai'
  | 'so-thang-trai'
  | 'cong-phai'
  | 'moc-nguoc'
  | 'gach-ngang-d'
  | 'net-co-ban';

export interface StrokePieceMeta {
  id: StrokePieceId;
  label: string;
  shortLabel: string;
  svgPath: string;
}

export const STROKE_PIECES: Record<StrokePieceId, StrokePieceMeta> = {
  'net-ngang': {
    id: 'net-ngang',
    label: 'Nét ngang',
    shortLabel: 'Nét ngang',
    svgPath: 'M 20 52 L 80 52',
  },
  'cong-ho-phai': {
    id: 'cong-ho-phai',
    label: 'Nét cong hở phải',
    shortLabel: 'Cong hở phải',
    svgPath: 'M 74 36 C 58 16, 24 24, 24 52 C 24 80, 58 86, 76 68',
  },
  'cong-kin': {
    id: 'cong-kin',
    label: 'Nét cong tròn khép kín',
    shortLabel: 'Cong tròn kín',
    svgPath: 'M 50 20 C 74 20, 78 80, 50 80 C 22 80, 26 20, 50 20 Z',
  },
  'dau-mu': {
    id: 'dau-mu',
    label: 'Dấu mũ nhọn',
    shortLabel: 'Dấu mũ',
    svgPath: 'M 26 64 L 50 30 L 74 64',
  },
  'dau-moc': {
    id: 'dau-moc',
    label: 'Dấu móc bên phải',
    shortLabel: 'Dấu móc',
    svgPath: 'M 42 26 C 68 32, 68 58, 40 70',
  },
  'dau-trang': {
    id: 'dau-trang',
    label: 'Dấu á trăng khuyết',
    shortLabel: 'Dấu trăng ă',
    svgPath: 'M 24 34 Q 50 68 76 34',
  },
  'so-thang-phai': {
    id: 'so-thang-phai',
    label: 'Nét sổ thẳng bên phải',
    shortLabel: 'Nét sổ phải',
    svgPath: 'M 56 18 L 56 82',
  },
  'so-thang-trai': {
    id: 'so-thang-trai',
    label: 'Nét sổ thẳng bên trái',
    shortLabel: 'Nét sổ trái',
    svgPath: 'M 42 16 L 42 84',
  },
  'cong-phai': {
    id: 'cong-phai',
    label: 'Nét cong phải',
    shortLabel: 'Cong phải',
    svgPath: 'M 30 24 C 74 22, 74 78, 30 76',
  },
  'moc-nguoc': {
    id: 'moc-nguoc',
    label: 'Nét móc ngược',
    shortLabel: 'Móc ngược',
    svgPath: 'M 30 22 L 30 58 C 30 80, 68 80, 70 58',
  },
  'gach-ngang-d': {
    id: 'gach-ngang-d',
    label: 'Nét gạch ngang trên thân',
    shortLabel: 'Nét gạch ngang',
    svgPath: 'M 24 42 L 76 42',
  },
  'net-co-ban': {
    id: 'net-co-ban',
    label: 'Nét chữ cơ bản',
    shortLabel: 'Nét cơ bản',
    svgPath: 'M 28 72 Q 50 24 72 72',
  },
};

export interface LetterAnatomyInfo {
  letter: string;
  upper: string;
  pronounce: string;
  structureSummary: string;
  pieces: StrokePieceId[];
}

export const LETTER_ANATOMY_MAP: Record<string, LetterAnatomyInfo> = {
  e: {
    letter: 'e',
    upper: 'E',
    pronounce: 'chữ e',
    structureSummary: 'Chữ e gồm 1 nét ngang và 1 nét cong hở phải.',
    pieces: ['net-ngang', 'cong-ho-phai'],
  },
  ê: {
    letter: 'ê',
    upper: 'Ê',
    pronounce: 'chữ ê',
    structureSummary: 'Chữ ê gồm 1 nét ngang, 1 nét cong hở phải và dấu mũ ở trên đầu.',
    pieces: ['net-ngang', 'cong-ho-phai', 'dau-mu'],
  },
  o: {
    letter: 'o',
    upper: 'O',
    pronounce: 'chữ o',
    structureSummary: 'Chữ o là 1 nét cong tròn khép kín giống quả trứng gà.',
    pieces: ['cong-kin'],
  },
  ô: {
    letter: 'ô',
    upper: 'Ô',
    pronounce: 'chữ ô',
    structureSummary: 'Chữ ô gồm 1 nét cong tròn khép kín và đội thêm dấu mũ trên đầu.',
    pieces: ['cong-kin', 'dau-mu'],
  },
  ơ: {
    letter: 'ơ',
    upper: 'Ơ',
    pronounce: 'chữ ơ',
    structureSummary: 'Chữ ơ gồm 1 nét cong tròn khép kín và thêm dấu móc bên phải.',
    pieces: ['cong-kin', 'dau-moc'],
  },
  a: {
    letter: 'a',
    upper: 'A',
    pronounce: 'chữ a',
    structureSummary: 'Chữ a gồm 1 nét cong tròn khép kín bên trái và 1 nét sổ thẳng bên phải.',
    pieces: ['cong-kin', 'so-thang-phai'],
  },
  ă: {
    letter: 'ă',
    upper: 'Ă',
    pronounce: 'chữ á',
    structureSummary: 'Chữ ă gồm nét cong kín, nét sổ thẳng và dấu á cong như vầng trăng khuyết.',
    pieces: ['cong-kin', 'so-thang-phai', 'dau-trang'],
  },
  â: {
    letter: 'â',
    upper: 'Â',
    pronounce: 'chữ ớ',
    structureSummary: 'Chữ â gồm nét cong kín, nét sổ thẳng và đội thêm dấu mũ trên đầu.',
    pieces: ['cong-kin', 'so-thang-phai', 'dau-mu'],
  },
  u: {
    letter: 'u',
    upper: 'U',
    pronounce: 'chữ u',
    structureSummary: 'Chữ u gồm 1 nét móc ngược bên trái và 1 nét sổ thẳng bên phải.',
    pieces: ['moc-nguoc', 'so-thang-phai'],
  },
  ư: {
    letter: 'ư',
    upper: 'Ư',
    pronounce: 'chữ ư',
    structureSummary: 'Chữ ư gồm nét móc ngược, nét sổ thẳng và thêm dấu móc nhỏ bên phải.',
    pieces: ['moc-nguoc', 'so-thang-phai', 'dau-moc'],
  },
  b: {
    letter: 'b',
    upper: 'B',
    pronounce: 'chữ bờ',
    structureSummary: 'Chữ b gồm 1 nét sổ thẳng dài bên trái và 1 nét cong phải ở dưới.',
    pieces: ['so-thang-trai', 'cong-phai'],
  },
  d: {
    letter: 'd',
    upper: 'D',
    pronounce: 'chữ giờ',
    structureSummary: 'Chữ d gồm 1 nét cong tròn khép kín bên trái và 1 nét sổ thẳng dài bên phải.',
    pieces: ['cong-kin', 'so-thang-phai'],
  },
  đ: {
    letter: 'đ',
    upper: 'Đ',
    pronounce: 'chữ đờ',
    structureSummary: 'Chữ đ gồm nét cong kín bên trái, nét sổ thẳng bên phải và 1 nét gạch ngang trên thân.',
    pieces: ['cong-kin', 'so-thang-phai', 'gach-ngang-d'],
  },
};

export function getLetterAnatomy(rawLetter: string): LetterAnatomyInfo {
  const lower = rawLetter.toLocaleLowerCase('vi-VN');
  const found = LETTER_ANATOMY_MAP[lower];
  if (found) return found;
  return {
    letter: lower,
    upper: lower.toLocaleUpperCase('vi-VN'),
    pronounce: `chữ ${lower}`,
    structureSummary: `Chữ ${lower} in thường và chữ ${lower.toLocaleUpperCase('vi-VN')} in hoa.`,
    pieces: ['net-co-ban'],
  };
}

export interface GroupComparisonInfo {
  similarity: string;
  difference: string;
}

export function getGroupComparison(targetLetters: string[]): GroupComparisonInfo {
  const key = targetLetters.map((c) => c.toLocaleLowerCase('vi-VN')).join(',');
  if (key === 'e,ê' || key === 'ê,e') {
    return {
      similarity: 'Chữ e và chữ ê đều có 1 nét ngang và 1 nét cong tròn hở phải.',
      difference: 'Chữ e không có dấu, còn chữ ê đội thêm một dấu mũ nhọn ở phía trên đầu.',
    };
  }
  if (key === 'o,ô,ơ') {
    return {
      similarity: 'Ba chữ o, ô, ơ đều có 1 nét cong tròn khép kín.',
      difference: 'Chữ o không có dấu, chữ ô đội dấu mũ trên đầu, còn chữ ơ có thêm dấu móc bên phải.',
    };
  }
  if (key === 'a,ă,â') {
    return {
      similarity: 'Ba chữ a, ă, â đều có 1 nét cong kín bên trái và 1 nét sổ thẳng bên phải.',
      difference: 'Chữ a không có dấu, chữ ă có dấu trăng khuyết ngửa lên, còn chữ â đội dấu mũ nhọn.',
    };
  }
  if (key === 'u,ư' || key === 'ư,u') {
    return {
      similarity: 'Chữ u và chữ ư đều có 1 nét móc ngược và 1 nét sổ thẳng bên phải.',
      difference: 'Chữ u không có dấu, còn chữ ư có thêm 1 dấu móc nhỏ phía trên bên phải.',
    };
  }
  if (key === 'b,d,đ') {
    return {
      similarity: 'Ba chữ b, d, đ đều có 1 nét sổ thẳng dài kết hợp với 1 nét cong tròn.',
      difference: 'Chữ b có nét sổ bên trái, chữ d có nét sổ bên phải, còn chữ đ có thêm nét gạch ngang trên thân.',
    };
  }
  const names = targetLetters.map((c) => `chữ ${c}`).join(', ');
  return {
    similarity: `Các bạn ${names} đều là những chữ cái Tiếng Việt thân thương của lớp mình.`,
    difference: `Mỗi chữ cái có hình dáng nét viết và cách phát âm riêng biệt, bé nhìn kỹ để phân biệt nhé!`,
  };
}

export interface VocabCardItem {
  id: string;
  word: string;
  targetLetter: string;
  illustration: IllustrationId;
}

export const VOCAB_CARDS_BY_LETTER: Record<string, VocabCardItem[]> = {
  e: [
    { id: 'v-e-1', word: 'em bé', targetLetter: 'e', illustration: 'em-be' },
    { id: 'v-e-2', word: 'xe đạp', targetLetter: 'e', illustration: 'xe-dap' },
    { id: 'v-e-3', word: 'hoa sen', targetLetter: 'e', illustration: 'hoa-sen' },
    { id: 'v-e-4', word: 'que kem', targetLetter: 'e', illustration: 'que-kem' },
    { id: 'v-e-5', word: 'cái kèn', targetLetter: 'e', illustration: 'cai-ken' },
  ],
  ê: [
    { id: 'v-eh-1', word: 'con dê', targetLetter: 'ê', illustration: 'con-de' },
    { id: 'v-eh-2', word: 'búp bê', targetLetter: 'ê', illustration: 'bup-be' },
    { id: 'v-eh-3', word: 'quả khế', targetLetter: 'ê', illustration: 'qua-khe' },
    { id: 'v-eh-4', word: 'cái ghế', targetLetter: 'ê', illustration: 'cai-ghe' },
    { id: 'v-eh-5', word: 'con ếch', targetLetter: 'ê', illustration: 'con-ech' },
  ],
  o: [
    { id: 'v-o-1', word: 'con cò', targetLetter: 'o', illustration: 'con-co' },
    { id: 'v-o-2', word: 'quả nho', targetLetter: 'o', illustration: 'qua-nho' },
    { id: 'v-o-3', word: 'con thỏ', targetLetter: 'o', illustration: 'con-tho' },
    { id: 'v-o-4', word: 'chong chóng', targetLetter: 'o', illustration: 'chong-chong' },
  ],
  ô: [
    { id: 'v-oh-1', word: 'cái ô', targetLetter: 'ô', illustration: 'cai-o' },
    { id: 'v-oh-2', word: 'bắp ngô', targetLetter: 'ô', illustration: 'bap-ngo' },
    { id: 'v-oh-3', word: 'ô tô', targetLetter: 'ô', illustration: 'o-to' },
    { id: 'v-oh-4', word: 'hộp quà', targetLetter: 'ô', illustration: 'hop-qua' },
  ],
  ơ: [
    { id: 'v-ow-1', word: 'lá cờ', targetLetter: 'ơ', illustration: 'la-co' },
    { id: 'v-ow-2', word: 'cái nơ', targetLetter: 'ơ', illustration: 'cai-no' },
    { id: 'v-ow-3', word: 'quả bơ', targetLetter: 'ơ', illustration: 'qua-bo' },
    { id: 'v-ow-4', word: 'quả mơ', targetLetter: 'ơ', illustration: 'qua-mo' },
  ],
  a: [
    { id: 'v-a-1', word: 'con cá', targetLetter: 'a', illustration: 'con-ca' },
    { id: 'v-a-2', word: 'cái ca', targetLetter: 'a', illustration: 'cai-ca' },
    { id: 'v-a-3', word: 'bông hoa', targetLetter: 'a', illustration: 'bong-hoa' },
    { id: 'v-a-4', word: 'ngôi nhà', targetLetter: 'a', illustration: 'ngoi-nha' },
  ],
  ă: [
    { id: 'v-aw-1', word: 'mặt trăng', targetLetter: 'ă', illustration: 'mat-trang' },
    { id: 'v-aw-2', word: 'con rắn', targetLetter: 'ă', illustration: 'con-ran' },
    { id: 'v-aw-3', word: 'khăn len', targetLetter: 'ă', illustration: 'khan-quang' },
    { id: 'v-aw-4', word: 'măng tre', targetLetter: 'ă', illustration: 'mang-tre' },
  ],
  â: [
    { id: 'v-aa-1', word: 'mây hồng', targetLetter: 'â', illustration: 'dam-may' },
    { id: 'v-aa-2', word: 'con gấu', targetLetter: 'â', illustration: 'con-gau' },
    { id: 'v-aa-3', word: 'cây nấm', targetLetter: 'â', illustration: 'cay-nam' },
    { id: 'v-aa-4', word: 'dâu tây', targetLetter: 'â', illustration: 'qua-dau' },
  ],
  u: [
    { id: 'v-u-1', word: 'đu đủ', targetLetter: 'u', illustration: 'du-du' },
    { id: 'v-u-2', word: 'cái mũ', targetLetter: 'u', illustration: 'cai-mu' },
    { id: 'v-u-3', word: 'con cú', targetLetter: 'u', illustration: 'con-cu' },
    { id: 'v-u-4', word: 'bút chì', targetLetter: 'u', illustration: 'but-chi' },
  ],
  ư: [
    { id: 'v-uw-1', word: 'sư tử', targetLetter: 'ư', illustration: 'su-tu' },
    { id: 'v-uw-2', word: 'lá thư', targetLetter: 'ư', illustration: 'la-thu' },
    { id: 'v-uw-3', word: 'khoai từ', targetLetter: 'ư', illustration: 'cu-tu' },
    { id: 'v-uw-4', word: 'ngọn lửa', targetLetter: 'ư', illustration: 'ngon-lua' },
  ],
  b: [
    { id: 'v-b-1', word: 'quả bóng', targetLetter: 'b', illustration: 'qua-bong' },
    { id: 'v-b-2', word: 'con bò', targetLetter: 'b', illustration: 'con-bo' },
    { id: 'v-b-3', word: 'con bướm', targetLetter: 'b', illustration: 'con-buom' },
    { id: 'v-b-4', word: 'bánh kem', targetLetter: 'b', illustration: 'banh-kem' },
  ],
  d: [
    { id: 'v-d-1', word: 'cánh diều', targetLetter: 'd', illustration: 'canh-dieu' },
    { id: 'v-d-2', word: 'dưa hấu', targetLetter: 'd', illustration: 'dua-hau' },
    { id: 'v-d-3', word: 'con dê', targetLetter: 'd', illustration: 'con-de' },
    { id: 'v-d-4', word: 'dâu tây', targetLetter: 'd', illustration: 'qua-dau' },
  ],
  đ: [
    { id: 'v-dd-1', word: 'đèn lồng', targetLetter: 'đ', illustration: 'den-long' },
    { id: 'v-dd-2', word: 'đồng hồ', targetLetter: 'đ', illustration: 'dong-ho' },
    { id: 'v-dd-3', word: 'đàn gỗ', targetLetter: 'đ', illustration: 'dan-guitar' },
    { id: 'v-dd-4', word: 'đám mây', targetLetter: 'đ', illustration: 'dam-may' },
  ],
};

/**
 * Tách bỏ 5 thanh điệu Tiếng Việt (huyền, sắc, ngã, hỏi, nặng) nhưng GIỮ NGUYÊN
 * dấu phụ nguyên âm/phụ âm (ă, â, ê, ô, ơ, ư, đ) để tô màu đúng chữ cái trong từ!
 */
export function stripVietnameseToneKeepBase(ch: string): string {
  return ch
    .normalize('NFD')
    .replace(/[\u0300\u0301\u0303\u0309\u0323]/g, '')
    .normalize('NFC')
    .toLocaleLowerCase('vi-VN');
}

export function maskLetterInWord(word: string, targetLetter: string): string {
  const target = targetLetter.toLocaleLowerCase('vi-VN');
  let replaced = false;
  return Array.from(word)
    .map((ch) => {
      if (!replaced && stripVietnameseToneKeepBase(ch) === target) {
        replaced = true;
        return '_';
      }
      return ch;
    })
    .join('');
}

export function getVocabCardsForLetters(targetLetters: string[]): VocabCardItem[] {
  const normalizedTargets = targetLetters.map((c) => c.toLocaleLowerCase('vi-VN'));
  const perLetter = normalizedTargets.length <= 2 ? 4 : 3;
  const result: VocabCardItem[] = [];

  for (const ch of normalizedTargets) {
    const bank = VOCAB_CARDS_BY_LETTER[ch];
    if (bank && bank.length > 0) {
      result.push(...bank.slice(0, perLetter));
    } else {
      for (let i = 1; i <= perLetter; i++) {
        result.push({
          id: `v-fallback-${ch}-${i}`,
          word: `chữ ${ch}`,
          targetLetter: ch,
          illustration: 'ngoi-sao',
        });
      }
    }
  }
  return result;
}

export interface QuizizzChallengeItem {
  id: string;
  prompt: string;
  options: [string, string, string, string];
  correctIndex: number;
  illustration?: IllustrationId;
  wordHint?: string;
}

const ALL_COMMON_LETTERS = ['e', 'ê', 'o', 'ô', 'ơ', 'a', 'ă', 'â', 'u', 'ư', 'b', 'd', 'đ'];

function buildFourChoices(
  correct: string,
  preferredDistractors: string[],
  fallbackPool: string[]
): { options: [string, string, string, string]; correctIndex: number; seedShift: number } {
  const chosen: string[] = [correct];
  for (const item of [...preferredDistractors, ...fallbackPool]) {
    if (chosen.length >= 4) break;
    if (item && !chosen.includes(item)) {
      chosen.push(item);
    }
  }
  while (chosen.length < 4) {
    chosen.push(`Phương án ${chosen.length + 1}`);
  }
  // Deterministic rotation based on string charCodes so options look balanced
  const hash = Array.from(correct + chosen.join('')).reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const targetIdx = hash % 4;
  const rotated = [...chosen];
  const tmp = rotated[targetIdx];
  rotated[targetIdx] = correct;
  rotated[0] = tmp;
  return {
    options: [rotated[0], rotated[1], rotated[2], rotated[3]],
    correctIndex: targetIdx,
    seedShift: hash,
  };
}

export function buildQuizizzQuestionsForLesson(lesson: LessonConfig): QuizizzChallengeItem[] {
  const targets = (lesson.targetLetters.length > 0 ? lesson.targetLetters : ['e', 'ê']).map((c) =>
    c.toLocaleLowerCase('vi-VN')
  );
  const nonTargets = ALL_COMMON_LETTERS.filter((c) => !targets.includes(c));
  const items: QuizizzChallengeItem[] = [];

  // 1. Câu hỏi cấu tạo nét cho từng chữ mục tiêu (đúng trọng tâm Quizizz trong video!)
  targets.forEach((ch, idx) => {
    const info = getLetterAnatomy(ch);
    const pieceNames = info.pieces.map((pid) => STROKE_PIECES[pid].label.toLocaleLowerCase('vi-VN'));
    const desc =
      pieceNames.length === 1
        ? pieceNames[0]
        : `${pieceNames.slice(0, -1).join(', ')} và ${pieceNames[pieceNames.length - 1]}`;
    const siblings = targets.filter((t) => t !== ch);
    const { options, correctIndex } = buildFourChoices(ch, siblings, nonTargets);
    items.push({
      id: `qz-anat-${idx}`,
      prompt: `Chữ cái nào gồm ${desc}?`,
      options,
      correctIndex,
    });
  });

  // 2. Câu hỏi tìm chữ còn thiếu trong từ kèm hình vẽ minh họa
  targets.forEach((ch, idx) => {
    const vocabList = VOCAB_CARDS_BY_LETTER[ch];
    if (vocabList && vocabList.length > 0) {
      const pick = vocabList[idx % vocabList.length];
      const masked = maskLetterInWord(pick.word, ch);
      const siblings = targets.filter((t) => t !== ch);
      const { options, correctIndex } = buildFourChoices(ch, siblings, nonTargets);
      items.push({
        id: `qz-word-${idx}`,
        prompt: `Trong từ "${pick.word}", chữ cái nào còn thiếu ở chỗ trống?`,
        options,
        correctIndex,
        illustration: pick.illustration,
        wordHint: masked,
      });
    }
  });

  // 3. Câu hỏi nhận biết chữ IN HOA tương ứng
  targets.forEach((ch, idx) => {
    const upper = ch.toLocaleUpperCase('vi-VN');
    const upperSiblings = targets
      .filter((t) => t !== ch)
      .map((t) => t.toLocaleUpperCase('vi-VN'));
    const upperPool = nonTargets.map((t) => t.toLocaleUpperCase('vi-VN'));
    const { options, correctIndex } = buildFourChoices(upper, [ch, ...upperSiblings], upperPool);
    items.push({
      id: `qz-upper-${idx}`,
      prompt: `Đâu là chữ ${ch} viết in hoa?`,
      options,
      correctIndex,
    });
  });

  // 4. Bổ sung câu hỏi đố nhanh phân biệt nét đặc trưng để tròn 8 câu
  const extraCardList = targets.flatMap((ch) => (VOCAB_CARDS_BY_LETTER[ch] ?? []).slice(1, 3));
  let exIdx = 0;
  while (items.length < 8 && exIdx < extraCardList.length) {
    const v = extraCardList[exIdx];
    const ch = v.targetLetter;
    const otherWords = nonTargets
      .flatMap((nt) => VOCAB_CARDS_BY_LETTER[nt]?.slice(0, 1) ?? [])
      .map((item) => item.word);
    const siblingWords = targets
      .filter((t) => t !== ch)
      .flatMap((st) => VOCAB_CARDS_BY_LETTER[st]?.slice(0, 1) ?? [])
      .map((item) => item.word);
    const { options, correctIndex } = buildFourChoices(v.word, siblingWords, otherWords);
    items.push({
      id: `qz-findword-${exIdx}`,
      prompt: `Từ nào dưới đây có chứa chữ ${ch}?`,
      options,
      correctIndex,
    });
    exIdx++;
  }

  return items.slice(0, 8);
}

export const ORIGINAL_10_VOWELS = ['o', 'ô', 'ơ', 'a', 'ă', 'â', 'e', 'ê', 'u', 'ư'] as const;

export const PRONUNCIATION_TIPS: Record<string, string> = {
  e: 'Mở miệng vừa tự nhiên, hai khóe môi hơi kéo nhẹ sang hai bên rồi phát âm tròn tiếng: e.',
  ê: 'Miệng mở hẹp hơn chữ e một chút, lưỡi hơi nâng lên nhẹ và đọc rõ tiếng: ê.',
  o: 'Tròn môi thật tự nhiên như hình quả trứng gà rồi đẩy hơi nhẹ ra: o.',
  ô: 'Chụm tròn môi gọn và hơi đẩy môi ra phía trước rồi đọc vang: ô.',
  ơ: 'Mở miệng nhẹ nhàng, thả lỏng môi tự nhiên không cần chu tròn rồi đọc: ơ.',
  a: 'Mở rộng khuôn miệng thật thoải mái, hạ nhẹ hàm dưới và đọc to rõ: a.',
  ă: 'Mở miệng nhanh và gọn hơn chữ a, đọc dứt khoát âm ngắn: á.',
  â: 'Mở miệng vừa phải, âm phát ngắn gọn nhẹ nhàng từ giữa khoang miệng: ớ.',
  u: 'Chu tròn môi nhỏ ra phía trước, đẩy hơi đều nhẹ nhàng và đọc rõ: u.',
  ư: 'Hơi mỉm nhẹ hai khóe miệng không chu môi, giữ hơi nhẹ trong cổ họng rồi đọc: ư.',
  b: 'Mím nhẹ hai môi lại rồi bật hơi nhẹ nhàng ra ngoài: bờ.',
  d: 'Đưa nhẹ đầu lưỡi chạm gần hàm trên, bật âm nhẹ nhàng rõ ràng: giờ.',
  đ: 'Đặt đầu lưỡi chạm nhẹ mặt sau răng trên rồi bật dứt khoát: đờ.',
};

export function getPronunciationTip(rawLetter: string): string {
  const lower = rawLetter.toLocaleLowerCase('vi-VN');
  return (
    PRONUNCIATION_TIPS[lower] ??
    `Bé nhìn kỹ mặt chữ ${lower}, mở khẩu hình miệng tự nhiên và đọc thật to, tròn vành rõ chữ nhé!`
  );
}
