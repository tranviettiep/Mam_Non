import { LetterStrokeDef, Point2D, StrokeDef } from '../types/lesson';

function resamplePoints(raw: Point2D[], step = 6): Point2D[] {
  if (raw.length <= 1) return raw;
  const out: Point2D[] = [raw[0]];
  let accum = 0;

  for (let i = 1; i < raw.length; i++) {
    let p0 = raw[i - 1];
    const p1 = raw[i];
    let segLen = Math.hypot(p1.x - p0.x, p1.y - p0.y);
    if (segLen < 1e-4) continue;

    while (accum + segLen >= step) {
      const t = (step - accum) / segLen;
      const nx = p0.x + (p1.x - p0.x) * t;
      const ny = p0.y + (p1.y - p0.y) * t;
      const np = { x: Math.round(nx * 10) / 10, y: Math.round(ny * 10) / 10 };
      out.push(np);
      p0 = np;
      segLen = Math.hypot(p1.x - p0.x, p1.y - p0.y);
      accum = 0;
    }
    accum += segLen;
  }

  const last = raw[raw.length - 1];
  const tail = out[out.length - 1];
  if (Math.hypot(last.x - tail.x, last.y - tail.y) > 1.5) {
    out.push({ x: Math.round(last.x * 10) / 10, y: Math.round(last.y * 10) / 10 });
  }
  return out;
}

function pointsToSvgPath(pts: Point2D[]): string {
  if (pts.length === 0) return '';
  return pts.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
}

function buildStroke(instruction: string, rawPoints: Point2D[]): StrokeDef {
  const waypoints = resamplePoints(rawPoints, 6);
  return {
    instruction,
    svgPath: pointsToSvgPath(waypoints),
    waypoints,
  };
}

function linePoints(x1: number, y1: number, x2: number, y2: number): Point2D[] {
  return [
    { x: x1, y: y1 },
    { x: x2, y: y2 },
  ];
}

function ellipseArcPoints(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  startDeg: number,
  endDeg: number,
  samples = 72
): Point2D[] {
  const pts: Point2D[] = [];
  for (let i = 0; i <= samples; i++) {
    const deg = startDeg + ((endDeg - startDeg) * i) / samples;
    const rad = (deg * Math.PI) / 180;
    pts.push({
      x: cx + rx * Math.cos(rad),
      y: cy + ry * Math.sin(rad),
    });
  }
  return pts;
}

function quadBezierPoints(p0: Point2D, p1: Point2D, p2: Point2D, samples = 36): Point2D[] {
  const pts: Point2D[] = [];
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const mt = 1 - t;
    pts.push({
      x: mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x,
      y: mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y,
    });
  }
  return pts;
}

const STROKE_E_1 = buildStroke('Bé kéo nét ngang từ trái sang phải', linePoints(128, 226, 272, 226));
const STROKE_E_2 = buildStroke(
  'Bé viết tiếp nét cong hở phải',
  ellipseArcPoints(200, 226, 72, 80, 0, -318, 80)
);

const STROKE_O_MAIN = buildStroke(
  'Bé viết nét cong tròn khép kín',
  ellipseArcPoints(200, 226, 74, 80, -90, -450, 84)
);

const STROKE_CIRCUMFLEX_LEFT = (cx = 200) =>
  buildStroke('Bé viết nét xiên trái của dấu mũ', linePoints(cx - 36, 112, cx, 72));
const STROKE_CIRCUMFLEX_RIGHT = (cx = 200) =>
  buildStroke('Bé viết nét xiên phải của dấu mũ', linePoints(cx, 72, cx + 36, 112));

const STROKE_HORN = (sx: number, sy: number) =>
  buildStroke(
    'Bé viết dấu móc nhỏ phía trên bên phải',
    quadBezierPoints({ x: sx, y: sy }, { x: sx + 26, y: sy + 20 }, { x: sx - 4, y: sy + 42 }, 32)
  );

const STROKE_A_BOWL = buildStroke(
  'Bé viết nét cong kín bên trái',
  ellipseArcPoints(186, 226, 66, 80, -35, -395, 80)
);
const STROKE_A_STEM = buildStroke('Bé kéo nét sổ thẳng từ trên xuống', linePoints(254, 146, 254, 306));

const STROKE_U_CUP = buildStroke('Bé kéo nét móc ngược từ trên xuống rồi uốn đáy tròn', [
  ...linePoints(138, 148, 138, 244),
  ...ellipseArcPoints(196, 244, 58, 62, 180, 18, 52).slice(1),
]);
const STROKE_U_STEM = buildStroke('Bé kéo nét sổ thẳng bên phải từ trên xuống', linePoints(254, 148, 254, 306));

export const LETTER_STROKES: Record<string, LetterStrokeDef> = {
  e: {
    letter: 'e',
    upper: 'E',
    pronounce: 'chữ e',
    strokes: [STROKE_E_1, STROKE_E_2],
  },
  ê: {
    letter: 'ê',
    upper: 'Ê',
    pronounce: 'chữ ê',
    strokes: [STROKE_E_1, STROKE_E_2, STROKE_CIRCUMFLEX_LEFT(200), STROKE_CIRCUMFLEX_RIGHT(200)],
  },
  o: {
    letter: 'o',
    upper: 'O',
    pronounce: 'chữ o',
    strokes: [STROKE_O_MAIN],
  },
  ô: {
    letter: 'ô',
    upper: 'Ô',
    pronounce: 'chữ ô',
    strokes: [STROKE_O_MAIN, STROKE_CIRCUMFLEX_LEFT(200), STROKE_CIRCUMFLEX_RIGHT(200)],
  },
  ơ: {
    letter: 'ơ',
    upper: 'Ơ',
    pronounce: 'chữ ơ',
    strokes: [STROKE_O_MAIN, STROKE_HORN(258, 122)],
  },
  a: {
    letter: 'a',
    upper: 'A',
    pronounce: 'chữ a',
    strokes: [STROKE_A_BOWL, STROKE_A_STEM],
  },
  ă: {
    letter: 'ă',
    upper: 'Ă',
    pronounce: 'chữ á',
    strokes: [
      STROKE_A_BOWL,
      STROKE_A_STEM,
      buildStroke(
        'Bé thêm dấu á cong ngửa phía trên',
        quadBezierPoints({ x: 156, y: 78 }, { x: 196, y: 114 }, { x: 236, y: 78 }, 36)
      ),
    ],
  },
  â: {
    letter: 'â',
    upper: 'Â',
    pronounce: 'chữ ớ',
    strokes: [STROKE_A_BOWL, STROKE_A_STEM, STROKE_CIRCUMFLEX_LEFT(196), STROKE_CIRCUMFLEX_RIGHT(196)],
  },
  u: {
    letter: 'u',
    upper: 'U',
    pronounce: 'chữ u',
    strokes: [STROKE_U_CUP, STROKE_U_STEM],
  },
  ư: {
    letter: 'ư',
    upper: 'Ư',
    pronounce: 'chữ ư',
    strokes: [STROKE_U_CUP, STROKE_U_STEM, STROKE_HORN(258, 118)],
  },
  b: {
    letter: 'b',
    upper: 'B',
    pronounce: 'chữ bờ',
    strokes: [
      buildStroke('Bé kéo nét sổ thẳng dài từ trên xuống', linePoints(138, 76, 138, 306)),
      buildStroke(
        'Bé viết nét cong phải khép bụng chữ b',
        ellipseArcPoints(196, 228, 70, 78, -145, 145, 72)
      ),
    ],
  },
  d: {
    letter: 'd',
    upper: 'D',
    pronounce: 'chữ giờ',
    strokes: [
      buildStroke(
        'Bé viết nét cong kín bên trái chữ d',
        ellipseArcPoints(188, 228, 68, 78, -35, -395, 80)
      ),
      buildStroke('Bé kéo nét sổ thẳng dài bên phải từ trên xuống', linePoints(256, 76, 256, 306)),
    ],
  },
  đ: {
    letter: 'đ',
    upper: 'Đ',
    pronounce: 'chữ đờ',
    strokes: [
      buildStroke(
        'Bé viết nét cong kín bên trái chữ đ',
        ellipseArcPoints(188, 228, 68, 78, -35, -395, 80)
      ),
      buildStroke('Bé kéo nét sổ thẳng dài bên phải từ trên xuống', linePoints(256, 76, 256, 306)),
      buildStroke('Bé kéo nét gạch ngang trên thân chữ đ', linePoints(218, 118, 294, 118)),
    ],
  },
};

export const AVAILABLE_TRACING_LETTERS = Object.keys(LETTER_STROKES);
