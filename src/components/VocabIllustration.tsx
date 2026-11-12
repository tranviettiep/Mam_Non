import React from 'react';

export type IllustrationId =
  | 'em-be'
  | 'xe-dap'
  | 'hoa-sen'
  | 'que-kem'
  | 'cai-ken'
  | 'con-de'
  | 'bup-be'
  | 'qua-khe'
  | 'cai-ghe'
  | 'con-ech'
  | 'con-co'
  | 'qua-nho'
  | 'con-tho'
  | 'chong-chong'
  | 'cai-o'
  | 'bap-ngo'
  | 'o-to'
  | 'hop-qua'
  | 'la-co'
  | 'cai-no'
  | 'qua-bo'
  | 'qua-mo'
  | 'con-ca'
  | 'cai-ca'
  | 'bong-hoa'
  | 'ngoi-nha'
  | 'mat-trang'
  | 'con-ran'
  | 'khan-quang'
  | 'mang-tre'
  | 'dam-may'
  | 'con-gau'
  | 'cay-nam'
  | 'qua-dau'
  | 'du-du'
  | 'cai-mu'
  | 'con-cu'
  | 'but-chi'
  | 'su-tu'
  | 'la-thu'
  | 'cu-tu'
  | 'ngon-lua'
  | 'qua-bong'
  | 'con-bo'
  | 'con-buom'
  | 'banh-kem'
  | 'canh-dieu'
  | 'dua-hau'
  | 'den-long'
  | 'dong-ho'
  | 'dan-guitar'
  | 'ngoi-sao';

interface VocabIllustrationProps {
  id: IllustrationId;
  className?: string;
}

export const VocabIllustration: React.FC<VocabIllustrationProps> = ({
  id,
  className = 'h-full w-full',
}) => {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      {renderArt(id)}
    </svg>
  );
};

function renderArt(id: IllustrationId): React.ReactNode {
  switch (id) {
    // === NHÓM E ===
    case 'em-be':
      return (
        <g>
          <circle cx="22" cy="54" r="8" fill="#FDBA74" stroke="#C2410C" strokeWidth="2.5" />
          <circle cx="78" cy="54" r="8" fill="#FDBA74" stroke="#C2410C" strokeWidth="2.5" />
          <circle cx="50" cy="52" r="28" fill="#FED7AA" stroke="#C2410C" strokeWidth="3" />
          <path d="M44 24 C50 14, 60 18, 53 28" fill="none" stroke="#78350F" strokeWidth="4.5" strokeLinecap="round" />
          <circle cx="39" cy="49" r="3.8" fill="#1E293B" />
          <circle cx="61" cy="49" r="3.8" fill="#1E293B" />
          <circle cx="33" cy="58" r="5" fill="#FDA4AF" opacity="0.7" />
          <circle cx="67" cy="58" r="5" fill="#FDA4AF" opacity="0.7" />
          <path d="M41 62 Q50 71 59 62" fill="none" stroke="#E11D48" strokeWidth="3.5" strokeLinecap="round" />
        </g>
      );

    case 'xe-dap':
      return (
        <g>
          <circle cx="25" cy="68" r="15" fill="#E0F2FE" stroke="#1E40AF" strokeWidth="4.5" />
          <circle cx="75" cy="68" r="15" fill="#E0F2FE" stroke="#1E40AF" strokeWidth="4.5" />
          <circle cx="25" cy="68" r="4" fill="#1E40AF" />
          <circle cx="75" cy="68" r="4" fill="#1E40AF" />
          <path d="M25 68 L44 44 L68 44 L50 68 Z" fill="none" stroke="#EF4444" strokeWidth="4.5" strokeLinejoin="round" />
          <path d="M68 44 L75 68 M63 32 L72 32 M68 44 L66 32" fill="none" stroke="#EF4444" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M38 37 L49 37" stroke="#0F172A" strokeWidth="5" strokeLinecap="round" />
        </g>
      );

    case 'hoa-sen':
      return (
        <g>
          <ellipse cx="50" cy="78" rx="32" ry="9" fill="#22C55E" stroke="#15803D" strokeWidth="2.5" />
          <path d="M50 74 C30 68, 20 48, 32 34 C40 44, 46 56, 50 74 Z" fill="#F472B6" stroke="#BE185D" strokeWidth="2.5" />
          <path d="M50 74 C70 68, 80 48, 68 34 C60 44, 54 56, 50 74 Z" fill="#F472B6" stroke="#BE185D" strokeWidth="2.5" />
          <path d="M50 74 C35 58, 36 30, 50 18 C64 30, 65 58, 50 74 Z" fill="#FB7185" stroke="#BE185D" strokeWidth="2.8" />
          <circle cx="50" cy="54" r="6" fill="#FACC15" />
        </g>
      );

    case 'que-kem':
      return (
        <g>
          <rect x="44" y="64" width="12" height="24" rx="6" fill="#FBBF24" stroke="#B45309" strokeWidth="2.8" />
          <path d="M28 42 C28 20, 72 20, 72 42 L72 65 L28 65 Z" fill="#F472B6" stroke="#BE185D" strokeWidth="3" />
          <path d="M28 40 C36 48, 44 36, 50 44 C56 50, 64 38, 72 44 L72 36 C72 19, 28 19, 28 36 Z" fill="#FEF08A" stroke="#CA8A04" strokeWidth="2.5" />
          <circle cx="50" cy="18" r="6" fill="#EF4444" stroke="#991B1B" strokeWidth="2" />
        </g>
      );

    case 'cai-ken':
      return (
        <g>
          <path d="M18 56 L48 48 L78 28 L78 78 L48 58 L18 56 Z" fill="#FACC15" stroke="#B45309" strokeWidth="3" strokeLinejoin="round" />
          <ellipse cx="78" cy="53" rx="6" ry="25" fill="#F59E0B" stroke="#92400E" strokeWidth="3" />
          <rect x="34" y="38" width="5" height="12" rx="2" fill="#FFFBEB" stroke="#92400E" strokeWidth="2" />
          <rect x="43" y="36" width="5" height="12" rx="2" fill="#FFFBEB" stroke="#92400E" strokeWidth="2" />
          <circle cx="16" cy="56" r="5" fill="#EF4444" />
        </g>
      );

    // === NHÓM Ê ===
    case 'con-de':
      return (
        <g>
          <path d="M35 28 C28 14, 18 18, 24 30" fill="none" stroke="#92400E" strokeWidth="5" strokeLinecap="round" />
          <path d="M65 28 C72 14, 82 18, 76 30" fill="none" stroke="#92400E" strokeWidth="5" strokeLinecap="round" />
          <ellipse cx="24" cy="44" rx="9" ry="5" transform="rotate(-20 24 44)" fill="#FDE68A" stroke="#92400E" strokeWidth="2.5" />
          <ellipse cx="76" cy="44" rx="9" ry="5" transform="rotate(20 76 44)" fill="#FDE68A" stroke="#92400E" strokeWidth="2.5" />
          <ellipse cx="50" cy="50" rx="24" ry="26" fill="#FFFBEB" stroke="#78350F" strokeWidth="3" />
          <circle cx="41" cy="46" r="3.6" fill="#1E293B" />
          <circle cx="59" cy="46" r="3.6" fill="#1E293B" />
          <ellipse cx="50" cy="60" rx="9" ry="6" fill="#FDE68A" />
          <path d="M46 62 Q50 66 54 62" fill="none" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M46 75 L50 88 L54 75 Z" fill="#D97706" stroke="#78350F" strokeWidth="2" />
        </g>
      );

    case 'bup-be':
      return (
        <g>
          <circle cx="26" cy="34" r="9" fill="#78350F" />
          <circle cx="74" cy="34" r="9" fill="#78350F" />
          <circle cx="33" cy="32" r="4" fill="#EC4899" />
          <circle cx="67" cy="32" r="4" fill="#EC4899" />
          <circle cx="50" cy="36" r="18" fill="#FED7AA" stroke="#9A3412" strokeWidth="2.8" />
          <path d="M32 33 C36 18, 64 18, 68 33" fill="#78350F" />
          <circle cx="44" cy="38" r="2.8" fill="#1E293B" />
          <circle cx="56" cy="38" r="2.8" fill="#1E293B" />
          <path d="M45 45 Q50 50 55 45" fill="none" stroke="#E11D48" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M38 54 L62 54 L74 84 L26 84 Z" fill="#EC4899" stroke="#9D174D" strokeWidth="3" strokeLinejoin="round" />
          <circle cx="50" cy="68" r="4" fill="#FEF08A" />
        </g>
      );

    case 'qua-khe':
      return (
        <g>
          <polygon
            points="50,14 61,36 86,39 67,56 72,81 50,69 28,81 33,56 14,39 39,36"
            fill="#FACC15"
            stroke="#CA8A04"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <polygon points="50,24 57,39 74,41 61,53 64,70 50,61 36,70 39,53 26,41 43,39" fill="#FEF08A" opacity="0.65" />
          <path d="M50 14 C54 8, 64 8, 66 15 C59 18, 53 17, 50 14 Z" fill="#22C55E" stroke="#15803D" strokeWidth="2" />
        </g>
      );

    case 'cai-ghe':
      return (
        <g>
          <rect x="30" y="18" width="40" height="32" rx="5" fill="#F59E0B" stroke="#92400E" strokeWidth="3" />
          <rect x="36" y="24" width="28" height="8" rx="3" fill="#FEF3C7" />
          <polygon points="24,52 76,52 82,62 18,62" fill="#D97706" stroke="#78350F" strokeWidth="3" strokeLinejoin="round" />
          <line x1="26" y1="62" x2="26" y2="86" stroke="#78350F" strokeWidth="6" strokeLinecap="round" />
          <line x1="74" y1="62" x2="74" y2="86" stroke="#78350F" strokeWidth="6" strokeLinecap="round" />
          <line x1="36" y1="62" x2="36" y2="80" stroke="#92400E" strokeWidth="4.5" strokeLinecap="round" />
          <line x1="64" y1="62" x2="64" y2="80" stroke="#92400E" strokeWidth="4.5" strokeLinecap="round" />
        </g>
      );

    case 'con-ech':
      return (
        <g>
          <circle cx="34" cy="30" r="11" fill="#4ADE80" stroke="#15803D" strokeWidth="3" />
          <circle cx="66" cy="30" r="11" fill="#4ADE80" stroke="#15803D" strokeWidth="3" />
          <circle cx="34" cy="29" r="5" fill="#FFFFFF" />
          <circle cx="66" cy="29" r="5" fill="#FFFFFF" />
          <circle cx="34" cy="29" r="2.8" fill="#0F172A" />
          <circle cx="66" cy="29" r="2.8" fill="#0F172A" />
          <ellipse cx="50" cy="56" rx="30" ry="24" fill="#22C55E" stroke="#15803D" strokeWidth="3" />
          <ellipse cx="50" cy="63" rx="20" ry="12" fill="#BBF7D0" />
          <path d="M34 54 Q50 66 66 54" fill="none" stroke="#14532D" strokeWidth="3.5" strokeLinecap="round" />
        </g>
      );

    // === NHÓM O ===
    case 'con-co':
      return (
        <g>
          <line x1="48" y1="64" x2="44" y2="88" stroke="#EA580C" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="56" y1="64" x2="60" y2="88" stroke="#EA580C" strokeWidth="3.5" strokeLinecap="round" />
          <ellipse cx="52" cy="56" rx="22" ry="14" fill="#FFFFFF" stroke="#475569" strokeWidth="3" />
          <path d="M36 52 C32 34, 42 20, 50 22 C56 24, 46 38, 46 50" fill="none" stroke="#FFFFFF" strokeWidth="9" strokeLinecap="round" />
          <path d="M36 52 C32 34, 42 20, 50 22" fill="none" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
          <circle cx="50" cy="23" r="8" fill="#FFFFFF" stroke="#475569" strokeWidth="2.8" />
          <polygon points="57,21 78,25 57,27" fill="#F97316" stroke="#C2410C" strokeWidth="2" />
          <circle cx="51" cy="22" r="2.2" fill="#0F172A" />
        </g>
      );

    case 'qua-nho':
      return (
        <g>
          <path d="M50 22 L50 12" stroke="#78350F" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M50 18 C62 10, 74 14, 72 24 C62 26, 54 22, 50 18 Z" fill="#22C55E" stroke="#15803D" strokeWidth="2" />
          {[
            [36, 36], [50, 36], [64, 36],
            [30, 50], [44, 50], [58, 50], [70, 50],
            [38, 64], [52, 64], [64, 64],
            [45, 77], [57, 77],
          ].map(([cx, cy], idx) => (
            <circle key={idx} cx={cx} cy={cy} r="9.5" fill="#9333EA" stroke="#581C87" strokeWidth="2.4" />
          ))}
        </g>
      );

    case 'con-tho':
      return (
        <g>
          <ellipse cx="38" cy="26" rx="8" ry="20" transform="rotate(-10 38 26)" fill="#FFF1F2" stroke="#DB2777" strokeWidth="2.8" />
          <ellipse cx="62" cy="26" rx="8" ry="20" transform="rotate(10 62 26)" fill="#FFF1F2" stroke="#DB2777" strokeWidth="2.8" />
          <ellipse cx="38" cy="27" rx="4" ry="12" transform="rotate(-10 38 27)" fill="#FBCFE8" />
          <ellipse cx="62" cy="27" rx="4" ry="12" transform="rotate(10 62 27)" fill="#FBCFE8" />
          <circle cx="50" cy="60" r="24" fill="#FFFFFF" stroke="#DB2777" strokeWidth="3" />
          <circle cx="41" cy="56" r="3.5" fill="#BE185D" />
          <circle cx="59" cy="56" r="3.5" fill="#BE185D" />
          <polygon points="46,64 54,64 50,69" fill="#FB7185" />
          <path d="M44 71 Q50 76 56 71" fill="none" stroke="#BE185D" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      );

    case 'chong-chong':
      return (
        <g>
          <line x1="50" y1="48" x2="50" y2="88" stroke="#92400E" strokeWidth="5" strokeLinecap="round" />
          <path d="M50 48 L24 24 L50 20 Z" fill="#EF4444" stroke="#991B1B" strokeWidth="2.5" />
          <path d="M50 48 L76 24 L80 50 Z" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="2.5" />
          <path d="M50 48 L76 72 L50 76 Z" fill="#FACC15" stroke="#CA8A04" strokeWidth="2.5" />
          <path d="M50 48 L24 72 L20 46 Z" fill="#22C55E" stroke="#15803D" strokeWidth="2.5" />
          <circle cx="50" cy="48" r="6" fill="#FFFFFF" stroke="#334155" strokeWidth="2.5" />
        </g>
      );

    // === NHÓM Ô ===
    case 'cai-o':
      return (
        <g>
          <path d="M50 20 L50 78 C50 86, 38 86, 38 78" fill="none" stroke="#78350F" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M14 52 C14 22, 86 22, 86 52 Z" fill="#38BDF8" stroke="#0369A1" strokeWidth="3" />
          <path d="M36 52 C36 24, 64 24, 64 52 Z" fill="#F472B6" stroke="#BE185D" strokeWidth="2.5" />
          <circle cx="50" cy="18" r="4" fill="#F59E0B" />
        </g>
      );

    case 'bap-ngo':
      return (
        <g>
          <ellipse cx="50" cy="48" rx="16" ry="28" fill="#FACC15" stroke="#CA8A04" strokeWidth="3" />
          <line x1="42" y1="24" x2="42" y2="70" stroke="#EAB308" strokeWidth="2" />
          <line x1="50" y1="22" x2="50" y2="72" stroke="#EAB308" strokeWidth="2" />
          <line x1="58" y1="24" x2="58" y2="70" stroke="#EAB308" strokeWidth="2" />
          <path d="M50 84 C30 80, 22 58, 30 42 C36 56, 42 70, 50 84 Z" fill="#22C55E" stroke="#15803D" strokeWidth="2.8" />
          <path d="M50 84 C70 80, 78 58, 70 42 C64 56, 58 70, 50 84 Z" fill="#22C55E" stroke="#15803D" strokeWidth="2.8" />
        </g>
      );

    case 'o-to':
      return (
        <g>
          <path d="M22 54 L32 34 L66 34 L78 54 Z" fill="#93C5FD" stroke="#1D4ED8" strokeWidth="3" strokeLinejoin="round" />
          <rect x="14" y="52" width="72" height="20" rx="8" fill="#2563EB" stroke="#1E3A8A" strokeWidth="3" />
          <circle cx="30" cy="74" r="10" fill="#1E293B" stroke="#CBD5E1" strokeWidth="3" />
          <circle cx="70" cy="74" r="10" fill="#1E293B" stroke="#CBD5E1" strokeWidth="3" />
          <circle cx="82" cy="60" r="3.5" fill="#FEF08A" />
        </g>
      );

    case 'hop-qua':
      return (
        <g>
          <rect x="24" y="42" width="52" height="42" rx="5" fill="#F43F5E" stroke="#9F1239" strokeWidth="3" />
          <rect x="20" y="32" width="60" height="13" rx="4" fill="#FB7185" stroke="#9F1239" strokeWidth="3" />
          <rect x="45" y="32" width="10" height="52" fill="#FACC15" />
          <path d="M50 32 C34 14, 24 26, 44 32" fill="#FACC15" stroke="#B45309" strokeWidth="2.8" />
          <path d="M50 32 C66 14, 76 26, 56 32" fill="#FACC15" stroke="#B45309" strokeWidth="2.8" />
        </g>
      );

    // === NHÓM Ơ ===
    case 'la-co':
      return (
        <g>
          <line x1="24" y1="16" x2="24" y2="86" stroke="#78350F" strokeWidth="5" strokeLinecap="round" />
          <rect x="26" y="20" width="56" height="38" rx="4" fill="#EF4444" stroke="#991B1B" strokeWidth="2.8" />
          <polygon
            points="54,26 57,35 67,35 59,41 62,50 54,44 46,50 49,41 41,35 51,35"
            fill="#FACC15"
          />
        </g>
      );

    case 'cai-no':
      return (
        <g>
          <path d="M50 50 L20 30 L20 70 Z" fill="#EC4899" stroke="#9D174D" strokeWidth="3" strokeLinejoin="round" />
          <path d="M50 50 L80 30 L80 70 Z" fill="#EC4899" stroke="#9D174D" strokeWidth="3" strokeLinejoin="round" />
          <path d="M44 56 L34 84 L48 78 Z" fill="#F472B6" stroke="#9D174D" strokeWidth="2.5" />
          <path d="M56 56 L66 84 L52 78 Z" fill="#F472B6" stroke="#9D174D" strokeWidth="2.5" />
          <circle cx="50" cy="50" r="9" fill="#FBBF24" stroke="#9D174D" strokeWidth="3" />
        </g>
      );

    case 'qua-bo':
      return (
        <g>
          <path d="M50 16 C36 16, 26 44, 26 62 C26 80, 38 88, 50 88 C62 88, 74 80, 74 62 C74 44, 64 16, 50 16 Z" fill="#16A34A" stroke="#14532D" strokeWidth="3" />
          <path d="M50 22 C40 22, 32 46, 32 62 C32 75, 40 82, 50 82 C60 82, 68 75, 68 62 C68 46, 60 22, 50 22 Z" fill="#BEF264" />
          <circle cx="50" cy="62" r="12" fill="#92400E" stroke="#451A03" strokeWidth="2.5" />
        </g>
      );

    case 'qua-mo':
      return (
        <g>
          <circle cx="50" cy="56" r="26" fill="#FB923C" stroke="#C2410C" strokeWidth="3" />
          <path d="M50 30 C44 44, 44 68, 50 82" fill="none" stroke="#EA580C" strokeWidth="2.5" />
          <path d="M50 30 L52 18" stroke="#78350F" strokeWidth="4" strokeLinecap="round" />
          <path d="M52 22 C64 14, 76 18, 72 28 C62 30, 56 26, 52 22 Z" fill="#22C55E" stroke="#15803D" strokeWidth="2" />
        </g>
      );

    // === NHÓM A ===
    case 'con-ca':
      return (
        <g>
          <polygon points="70,50 88,32 88,68" fill="#F97316" stroke="#C2410C" strokeWidth="3" strokeLinejoin="round" />
          <ellipse cx="46" cy="50" rx="28" ry="20" fill="#FB923C" stroke="#C2410C" strokeWidth="3" />
          <path d="M40 30 L52 20 L56 32 Z" fill="#FACC15" stroke="#C2410C" strokeWidth="2.5" />
          <circle cx="30" cy="46" r="4" fill="#FFFFFF" />
          <circle cx="29" cy="46" r="2.2" fill="#0F172A" />
          <path d="M44 38 Q52 50 44 62" fill="none" stroke="#FED7AA" strokeWidth="3" strokeLinecap="round" />
        </g>
      );

    case 'cai-ca':
      return (
        <g>
          <path d="M66 38 C82 38, 82 68, 66 68" fill="none" stroke="#0284C7" strokeWidth="6" strokeLinecap="round" />
          <rect x="24" y="28" width="42" height="52" rx="8" fill="#38BDF8" stroke="#0369A1" strokeWidth="3" />
          <ellipse cx="45" cy="28" rx="21" ry="5" fill="#BAE6FD" stroke="#0369A1" strokeWidth="2.5" />
        </g>
      );

    case 'bong-hoa':
      return (
        <g>
          <line x1="50" y1="54" x2="50" y2="88" stroke="#16A34A" strokeWidth="5" strokeLinecap="round" />
          {[0, 72, 144, 216, 288].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            const cx = 50 + Math.cos(rad) * 18;
            const cy = 44 + Math.sin(rad) * 18;
            return <circle key={deg} cx={cx} cy={cy} r="12" fill="#F472B6" stroke="#BE185D" strokeWidth="2.5" />;
          })}
          <circle cx="50" cy="44" r="11" fill="#FACC15" stroke="#CA8A04" strokeWidth="2.5" />
        </g>
      );

    case 'ngoi-nha':
      return (
        <g>
          <rect x="24" y="46" width="52" height="38" rx="4" fill="#FEF3C7" stroke="#B45309" strokeWidth="3" />
          <polygon points="16,48 50,18 84,48" fill="#EF4444" stroke="#991B1B" strokeWidth="3" strokeLinejoin="round" />
          <rect x="43" y="60" width="14" height="24" rx="3" fill="#92400E" />
          <rect x="29" y="54" width="10" height="10" rx="2" fill="#38BDF8" stroke="#0369A1" strokeWidth="2" />
        </g>
      );

    // === NHÓM Ă ===
    case 'mat-trang':
      return (
        <g>
          <path
            d="M62 18 C36 20, 22 44, 32 68 C40 84, 62 88, 76 76 C56 78, 44 62, 46 44 C48 30, 54 22, 62 18 Z"
            fill="#FACC15"
            stroke="#CA8A04"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <circle cx="72" cy="34" r="3.5" fill="#FDE047" />
          <circle cx="80" cy="50" r="2.5" fill="#FDE047" />
        </g>
      );

    case 'con-ran':
      return (
        <g>
          <path
            d="M24 74 C24 56, 72 64, 72 46 C72 32, 38 38, 44 24"
            fill="none"
            stroke="#22C55E"
            strokeWidth="13"
            strokeLinecap="round"
          />
          <circle cx="48" cy="24" r="10" fill="#4ADE80" stroke="#15803D" strokeWidth="2.8" />
          <circle cx="46" cy="22" r="2.5" fill="#0F172A" />
          <path d="M58 24 L67 21 M58 24 L67 27" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      );

    case 'khan-quang':
      return (
        <g>
          <path d="M18 38 Q50 52 82 38 L76 52 Q50 64 24 52 Z" fill="#EF4444" stroke="#991B1B" strokeWidth="3" />
          <path d="M44 54 L34 84 L48 80 L50 58 Z" fill="#F87171" stroke="#991B1B" strokeWidth="2.5" />
          <path d="M56 54 L66 84 L52 80 L50 58 Z" fill="#EF4444" stroke="#991B1B" strokeWidth="2.5" />
        </g>
      );

    case 'mang-tre':
      return (
        <g>
          <path d="M50 16 C36 38, 30 62, 32 84 L68 84 C70 62, 64 38, 50 16 Z" fill="#84CC16" stroke="#3F6212" strokeWidth="3" />
          <path d="M34 62 L64 48 M33 74 L67 62" stroke="#3F6212" strokeWidth="2.8" />
        </g>
      );

    // === NHÓM Â ===
    case 'dam-may':
      return (
        <g>
          <path
            d="M26 68 C14 68, 12 50, 24 46 C26 30, 46 24, 56 34 C66 28, 82 36, 80 50 C88 54, 86 68, 74 68 Z"
            fill="#E0F2FE"
            stroke="#0284C7"
            strokeWidth="3.2"
          />
        </g>
      );

    case 'con-gau':
      return (
        <g>
          <circle cx="28" cy="28" r="10" fill="#B45309" stroke="#78350F" strokeWidth="2.8" />
          <circle cx="72" cy="28" r="10" fill="#B45309" stroke="#78350F" strokeWidth="2.8" />
          <circle cx="50" cy="54" r="27" fill="#D97706" stroke="#78350F" strokeWidth="3" />
          <ellipse cx="50" cy="61" rx="12" ry="9" fill="#FDE68A" />
          <circle cx="40" cy="48" r="3.5" fill="#1E293B" />
          <circle cx="60" cy="48" r="3.5" fill="#1E293B" />
          <ellipse cx="50" cy="58" rx="4.5" ry="3" fill="#451A03" />
        </g>
      );

    case 'cay-nam':
      return (
        <g>
          <rect x="40" y="50" width="20" height="34" rx="8" fill="#FEF3C7" stroke="#B45309" strokeWidth="3" />
          <path d="M16 54 C16 20, 84 20, 84 54 Z" fill="#EF4444" stroke="#991B1B" strokeWidth="3" />
          <circle cx="36" cy="38" r="5" fill="#FFFFFF" />
          <circle cx="54" cy="32" r="6" fill="#FFFFFF" />
          <circle cx="66" cy="43" r="4.5" fill="#FFFFFF" />
        </g>
      );

    case 'qua-dau':
      return (
        <g>
          <path d="M50 84 C28 72, 22 44, 34 32 C42 26, 58 26, 66 32 C78 44, 72 72, 50 84 Z" fill="#F43F5E" stroke="#9F1239" strokeWidth="3" />
          <path d="M36 28 L50 18 L64 28 L54 34 L46 34 Z" fill="#22C55E" stroke="#15803D" strokeWidth="2.5" />
          <circle cx="42" cy="48" r="2" fill="#FEF08A" />
          <circle cx="58" cy="48" r="2" fill="#FEF08A" />
          <circle cx="50" cy="60" r="2" fill="#FEF08A" />
          <circle cx="44" cy="70" r="2" fill="#FEF08A" />
          <circle cx="56" cy="70" r="2" fill="#FEF08A" />
        </g>
      );

    // === NHÓM U ===
    case 'du-du':
      return (
        <g>
          <path d="M50 18 C36 22, 26 48, 28 66 C30 82, 40 86, 50 86 C60 86, 70 82, 72 66 C74 48, 64 22, 50 18 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="3" />
          <ellipse cx="50" cy="58" rx="11" ry="18" fill="#FDBA74" />
          <circle cx="48" cy="52" r="2.2" fill="#1E293B" />
          <circle cx="53" cy="58" r="2.2" fill="#1E293B" />
          <circle cx="49" cy="65" r="2.2" fill="#1E293B" />
        </g>
      );

    case 'cai-mu':
      return (
        <g>
          <ellipse cx="50" cy="64" rx="38" ry="11" fill="#FACC15" stroke="#CA8A04" strokeWidth="3" />
          <path d="M26 62 C26 32, 74 32, 74 62 Z" fill="#FDE047" stroke="#CA8A04" strokeWidth="3" />
          <path d="M26 56 Q50 62 74 56" fill="none" stroke="#EC4899" strokeWidth="5" />
        </g>
      );

    case 'con-cu':
      return (
        <g>
          <ellipse cx="50" cy="56" rx="25" ry="28" fill="#A16207" stroke="#713F12" strokeWidth="3" />
          <circle cx="39" cy="46" r="10" fill="#FEF9C3" stroke="#713F12" strokeWidth="2.5" />
          <circle cx="61" cy="46" r="10" fill="#FEF9C3" stroke="#713F12" strokeWidth="2.5" />
          <circle cx="39" cy="46" r="4.5" fill="#0F172A" />
          <circle cx="61" cy="46" r="4.5" fill="#0F172A" />
          <polygon points="46,54 54,54 50,62" fill="#F97316" />
        </g>
      );

    case 'but-chi':
      return (
        <g>
          <polygon points="26,74 36,52 48,64" fill="#FDE68A" stroke="#92400E" strokeWidth="2.5" />
          <polygon points="26,74 30,65 35,70" fill="#1E293B" />
          <polygon points="36,52 68,20 80,32 48,64" fill="#FACC15" stroke="#CA8A04" strokeWidth="3" />
          <polygon points="68,20 74,14 86,26 80,32" fill="#FB7185" stroke="#BE185D" strokeWidth="2.5" />
        </g>
      );

    // === NHÓM Ư ===
    case 'su-tu':
      return (
        <g>
          <circle cx="50" cy="52" r="31" fill="#D97706" stroke="#92400E" strokeWidth="3" />
          <circle cx="50" cy="52" r="21" fill="#FBBF24" stroke="#B45309" strokeWidth="2.5" />
          <circle cx="42" cy="48" r="3.2" fill="#1E293B" />
          <circle cx="58" cy="48" r="3.2" fill="#1E293B" />
          <polygon points="46,55 54,55 50,60" fill="#78350F" />
          <path d="M44 63 Q50 67 56 63" fill="none" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      );

    case 'la-thu':
      return (
        <g>
          <rect x="16" y="28" width="68" height="46" rx="6" fill="#FEF9C3" stroke="#CA8A04" strokeWidth="3" />
          <polyline points="18,30 50,56 82,30" fill="none" stroke="#CA8A04" strokeWidth="3" strokeLinejoin="round" />
          <circle cx="50" cy="53" r="6" fill="#EF4444" />
        </g>
      );

    case 'cu-tu':
      return (
        <g>
          <ellipse cx="50" cy="58" rx="22" ry="24" fill="#A855F7" stroke="#6B21A8" strokeWidth="3" />
          <path d="M50 34 L50 18 M50 26 L38 18 M50 26 L62 18" stroke="#16A34A" strokeWidth="4" strokeLinecap="round" />
        </g>
      );

    case 'ngon-lua':
      return (
        <g>
          <path d="M50 14 C68 34, 78 52, 70 72 C64 84, 36 84, 30 72 C22 52, 34 36, 50 14 Z" fill="#F97316" stroke="#C2410C" strokeWidth="3" />
          <path d="M50 36 C60 48, 64 60, 58 72 C54 78, 46 78, 42 72 C36 60, 40 48, 50 36 Z" fill="#FACC15" />
        </g>
      );

    // === NHÓM B / D / Đ ===
    case 'qua-bong':
      return (
        <g>
          <circle cx="50" cy="50" r="28" fill="#38BDF8" stroke="#0369A1" strokeWidth="3" />
          <path d="M24 42 Q50 56 76 42" fill="none" stroke="#FACC15" strokeWidth="5" />
          <path d="M28 62 Q50 72 72 62" fill="none" stroke="#F43F5E" strokeWidth="5" />
        </g>
      );

    case 'con-bo':
      return (
        <g>
          <path d="M28 28 L22 18 M72 28 L78 18" stroke="#F59E0B" strokeWidth="5" strokeLinecap="round" />
          <circle cx="50" cy="50" r="24" fill="#FFFFFF" stroke="#334155" strokeWidth="3" />
          <circle cx="38" cy="40" r="6" fill="#334155" />
          <ellipse cx="50" cy="62" rx="16" ry="10" fill="#FDA4AF" stroke="#BE185D" strokeWidth="2.2" />
          <circle cx="44" cy="62" r="2.2" fill="#881337" />
          <circle cx="56" cy="62" r="2.2" fill="#881337" />
        </g>
      );

    case 'con-buom':
      return (
        <g>
          <ellipse cx="32" cy="40" rx="16" ry="14" fill="#F472B6" stroke="#9D174D" strokeWidth="2.8" />
          <ellipse cx="68" cy="40" rx="16" ry="14" fill="#F472B6" stroke="#9D174D" strokeWidth="2.8" />
          <ellipse cx="34" cy="64" rx="12" ry="11" fill="#FBBF24" stroke="#B45309" strokeWidth="2.8" />
          <ellipse cx="66" cy="64" rx="12" ry="11" fill="#FBBF24" stroke="#B45309" strokeWidth="2.8" />
          <rect x="46" y="30" width="8" height="44" rx="4" fill="#451A03" />
        </g>
      );

    case 'banh-kem':
      return (
        <g>
          <rect x="22" y="48" width="56" height="32" rx="6" fill="#FBCFE8" stroke="#BE185D" strokeWidth="3" />
          <path d="M22 56 Q32 64 42 56 T62 56 T78 56" fill="none" stroke="#FFFFFF" strokeWidth="5" />
          <rect x="47" y="28" width="6" height="20" fill="#38BDF8" />
          <circle cx="50" cy="22" r="5" fill="#FACC15" />
        </g>
      );

    case 'canh-dieu':
      return (
        <g>
          <polygon points="50,14 78,44 50,76 22,44" fill="#A855F7" stroke="#6B21A8" strokeWidth="3" />
          <line x1="50" y1="14" x2="50" y2="76" stroke="#FDE047" strokeWidth="2.5" />
          <line x1="22" y1="44" x2="78" y2="44" stroke="#FDE047" strokeWidth="2.5" />
          <path d="M50 76 Q60 84 52 92" fill="none" stroke="#EC4899" strokeWidth="3" strokeLinecap="round" />
        </g>
      );

    case 'dua-hau':
      return (
        <g>
          <path d="M16 40 C16 74, 84 74, 84 40 Z" fill="#16A34A" stroke="#14532D" strokeWidth="3" />
          <path d="M22 40 C22 66, 78 66, 78 40 Z" fill="#F43F5E" />
          <circle cx="40" cy="50" r="2.2" fill="#0F172A" />
          <circle cx="50" cy="54" r="2.2" fill="#0F172A" />
          <circle cx="60" cy="50" r="2.2" fill="#0F172A" />
        </g>
      );

    case 'den-long':
      return (
        <g>
          <line x1="50" y1="12" x2="50" y2="24" stroke="#CA8A04" strokeWidth="4" />
          <ellipse cx="50" cy="50" rx="26" ry="24" fill="#EF4444" stroke="#991B1B" strokeWidth="3" />
          <rect x="38" y="22" width="24" height="6" rx="2" fill="#FACC15" />
          <rect x="38" y="72" width="24" height="6" rx="2" fill="#FACC15" />
          <line x1="50" y1="78" x2="50" y2="90" stroke="#FACC15" strokeWidth="4" />
        </g>
      );

    case 'dong-ho':
      return (
        <g>
          <circle cx="50" cy="52" r="28" fill="#FEF9C3" stroke="#2563EB" strokeWidth="4" />
          <line x1="50" y1="52" x2="50" y2="34" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
          <line x1="50" y1="52" x2="64" y2="52" stroke="#EF4444" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="50" cy="52" r="3.5" fill="#1E293B" />
        </g>
      );

    case 'dan-guitar':
      return (
        <g>
          <line x1="54" y1="46" x2="78" y2="22" stroke="#78350F" strokeWidth="8" strokeLinecap="round" />
          <circle cx="38" cy="62" r="20" fill="#F59E0B" stroke="#92400E" strokeWidth="3" />
          <circle cx="40" cy="60" r="6" fill="#451A03" />
        </g>
      );

    default:
      return (
        <g>
          <polygon
            points="50,14 61,36 86,39 67,56 72,81 50,69 28,81 33,56 14,39 39,36"
            fill="#FACC15"
            stroke="#CA8A04"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
        </g>
      );
  }
}
