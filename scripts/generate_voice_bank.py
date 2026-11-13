#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Tạo ngân hàng giọng đọc Nữ Thuần Việt (vi-VN-HoaiMyNeural) nhúng sẵn Offline
cho ứng dụng "Sân Chơi Chữ Cái Mầm Non".

Chạy lại lệnh này mỗi khi thêm gói bài học chữ cái mới:
    python scripts/generate_voice_bank.py
"""

import asyncio
import base64
import json
import pathlib
import re
import ssl
import unicodedata
from typing import Dict, List, Set, Tuple

import aiohttp
import certifi
import edge_tts
from edge_tts.communicate import connect_id, date_to_string, mkssml, ssml_headers_plus_data
from edge_tts.constants import SEC_MS_GEC_VERSION, WSS_HEADERS, WSS_URL
from edge_tts.data_classes import TTSConfig
from edge_tts.drm import DRM
from xml.sax.saxutils import escape

_SSL_CTX = ssl.create_default_context(cafile=certifi.where())

ROOT = pathlib.Path(__file__).resolve().parents[1]
LESSONS_TS = ROOT / "src" / "data" / "lessons.ts"
STROKES_TS = ROOT / "src" / "data" / "strokes.ts"
GAMES_DATA_TS = ROOT / "src" / "data" / "letterGamesData.ts"
OUT_TS = ROOT / "src" / "data" / "voiceBank.ts"

VOICE_NAME = "vi-VN-HoaiMyNeural"
TEACHER_PROSODY = {"pitch": "+8Hz", "rate": "-5%"}
CUTE_PROSODY = {"pitch": "+18Hz", "rate": "+2%"}

CLASS_CODE_LETTER_MAP: Dict[str, str] = {
    "a": "a",
    "b": "bê",
    "c": "xê",
    "d": "dê",
    "đ": "đê",
    "e": "e",
    "g": "giê",
    "h": "hát",
    "i": "i",
    "k": "ca",
    "l": "lờ",
    "m": "mờ",
    "n": "nờ",
}

PRESCHOOL_LETTER_PHONETICS: Dict[str, str] = {
    "a": "a",
    "ă": "á",
    "â": "ớ",
    "b": "bờ",
    "c": "cờ",
    "d": "giờ",
    "đ": "đờ",
    "e": "e",
    "ê": "ê",
    "g": "gờ",
    "h": "hờ",
    "i": "i",
    "k": "ca",
    "l": "lờ",
    "m": "mờ",
    "n": "nờ",
    "o": "o",
    "ô": "ô",
    "ơ": "ơ",
    "p": "pờ",
    "q": "cu",
    "r": "rờ",
    "s": "sờ",
    "t": "tờ",
    "u": "u",
    "ư": "ư",
    "v": "vờ",
    "x": "xờ",
    "y": "i",
}

DIGIT_VI: Dict[str, str] = {
    "0": "không",
    "1": "một",
    "2": "hai",
    "3": "ba",
    "4": "bốn",
    "5": "năm",
    "6": "sáu",
    "7": "bảy",
    "8": "tám",
    "9": "chín",
}


def normalize_vietnamese_for_speech(raw_text: str) -> str:
    if not raw_text:
        return ""
    text = unicodedata.normalize("NFC", raw_text).strip()

    # 1. Mã lớp học (5C5 -> năm xê năm, 5A1 -> năm a một, 4B -> bốn bê)
    def repl_class(m: re.Match) -> str:
        prefix = m.group(1)
        d1 = m.group(2)
        letter = m.group(3)
        d2 = m.group(4)
        w1 = DIGIT_VI.get(d1, d1)
        w_letter = CLASS_CODE_LETTER_MAP.get(letter.lower(), letter.lower())
        w2 = f" {DIGIT_VI.get(d2, d2)}" if d2 else ""
        return f"{prefix}{w1} {w_letter}{w2}"

    text = re.sub(
        r"(^|[^\w])(\d)([A-Za-zĐđ])(\d)?(?=$|[^\w])",
        repl_class,
        text,
    )

    # 2. Level -> cấp độ
    text = re.sub(r"\blevel\s*(\d+)\b", r"cấp độ \1", text, flags=re.IGNORECASE)

    # 3. Chữ cái đơn lẻ đứng độc lập -> âm đọc mầm non Tiếng Việt
    out_chars: List[str] = []
    n = len(text)
    for i, ch in enumerate(text):
        prev_alnum = i > 0 and (text[i - 1].isalpha() or text[i - 1].isdigit())
        next_alnum = (i + 1 < n) and (text[i + 1].isalpha() or text[i + 1].isdigit())
        if ch.isalpha() and not prev_alnum and not next_alnum:
            mapped = PRESCHOOL_LETTER_PHONETICS.get(ch.lower())
            if mapped:
                out_chars.append(mapped)
                continue
        out_chars.append(ch)

    text = "".join(out_chars)
    return re.sub(r"\s+", " ", text).strip()


def get_speech_lookup_key(raw_text: str) -> str:
    return normalize_vietnamese_for_speech(raw_text).lower()


def collect_phrases() -> Tuple[Set[str], Set[str]]:
    """Trả về (teacher_phrases, cute_phrases) dạng chuỗi gốc trước chuẩn hóa."""
    teacher_phrases: Set[str] = set()
    cute_phrases: Set[str] = set()

    lessons_src = LESSONS_TS.read_text(encoding="utf-8")
    strokes_src = STROKES_TS.read_text(encoding="utf-8")

    # 1. Trích xuất secretCallGreeting từ lessons.ts (kèm bản đồng bộ cho Lớp 5 Tuổi - cô Mơ)
    for m in re.finditer(r"secretCallGreeting:\s*\n?\s*'([^']+)'", lessons_src):
        greeting = m.group(1)
        cute_phrases.add(greeting)
        teacher_phrases.add(greeting)
        synced_mo = re.sub(
            r"^Xin chào [^!.?]+[!?.]",
            "Xin chào cô Mơ và các bạn nhỏ lớp 5 Tuổi!",
            greeting,
        )
        cute_phrases.add(synced_mo)
        teacher_phrases.add(synced_mo)

    # 2. Trích xuất toàn bộ prompt câu hỏi từ lessons.ts
    for m in re.finditer(r"prompt:\s*'([^']+)'", lessons_src):
        teacher_phrases.add(m.group(1))

    teacher_phrases.add("Đâu là chữ cái đúng?")

    # 3. Chặng 1: khẩu lệnh vận động + toàn bộ 29 chữ cái Tiếng Việt
    runner_actions = [
        "Nhảy lên nào!",
        "Cúi xuống nào!",
        "Sang trái!",
        "Sang phải!",
        "Lắc hông vui nhộn!",
    ]
    for act in runner_actions:
        teacher_phrases.add(act)
        cute_phrases.add(act)

    for ch in PRESCHOOL_LETTER_PHONETICS.keys():
        phrase = f"Chữ {ch}"
        teacher_phrases.add(phrase)

    # 4. Chặng 2: câu khen & khích lệ
    feedbacks = [
        "Chính xác!",
        "Chính xác! Bé giỏi quá!",
        "Chưa đúng, chọn lại nhé!",
        "Chưa đúng, bé chọn lại nhé!",
    ]
    for fb in feedbacks:
        teacher_phrases.add(fb)
        cute_phrases.add(fb)

    # 5. Chặng 3: trích xuất các nét viết & lời khen hoàn thành từ strokes.ts
    stroke_instructions: Set[str] = set()
    for m in re.finditer(r"buildStroke\(\s*'([^']+)'", strokes_src):
        stroke_instructions.add(m.group(1))
    for inst in stroke_instructions:
        teacher_phrases.add(inst)

    # Ghép câu giới thiệu chữ + nét đầu tiên cho từng chữ cái trong LETTER_STROKES
    # Map các hằng số STROKE_* dùng chung
    const_first_inst: Dict[str, str] = {}
    for m in re.finditer(
        r"const\s+(STROKE_[A-Z0-9_]+)\s*=\s*(?:\([^)]*\)\s*=>\s*)?buildStroke\(\s*'([^']+)'",
        strokes_src,
    ):
        const_first_inst[m.group(1)] = m.group(2)

    # Duyệt từng khối chữ cái trong LETTER_STROKES
    letter_blocks = re.finditer(
        r"pronounce:\s*'([^']+)',\s*strokes:\s*\[([\s\S]*?)\]\s*,?\s*\}",
        strokes_src,
    )
    for blk in letter_blocks:
        pronounce = blk.group(1)
        strokes_body = blk.group(2).strip()
        teacher_phrases.add(f"Hoan hô! Bé viết {pronounce} giỏi lắm!")
        cute_phrases.add(f"Hoan hô! Bé viết {pronounce} giỏi lắm!")

        first_inst = None
        inline_m = re.match(r"buildStroke\(\s*'([^']+)'", strokes_body)
        if inline_m:
            first_inst = inline_m.group(1)
        else:
            const_m = re.match(r"(STROKE_[A-Z0-9_]+)", strokes_body)
            if const_m and const_m.group(1) in const_first_inst:
                first_inst = const_first_inst[const_m.group(1)]

        if first_inst:
            teacher_phrases.add(f"Bé tập viết {pronounce}. {first_inst}")

    # 6. Câu mẫu nghe thử trong cửa sổ Cài đặt giọng nói chung
    preview_sentences = [
        "Xin chào các bạn nhỏ đáng yêu! Hôm nay cô và các con cùng khám phá sân chơi chữ cái Tiếng Việt thật vui nhé!",
        "Xin chào các bạn nhỏ! Mình là bạn chữ cái tí hon đây, chúng mình cùng thi tài xem ai tinh mắt nhất nào!",
    ]
    for pv in preview_sentences:
        teacher_phrases.add(pv)
        cute_phrases.add(pv)

    # 7. Chặng 4: Bé vui hái táo (hướng dẫn, phản hồi tích cực & lời khen hoàn thành)
    apple_feedbacks = [
        "Quả táo này không có chữ cần tìm, bé chọn quả khác nhé!",
        "Nhầm giỏ rồi, bé nhìn kỹ chữ trên giỏ nhé!",
    ]
    for af in apple_feedbacks:
        teacher_phrases.add(af)
        cute_phrases.add(af)

    for ch in PRESCHOOL_LETTER_PHONETICS.keys():
        teacher_phrases.add(f"Giỏ chữ {ch}")

    for m in re.finditer(r"targetLetters:\s*\[([^\]]+)\]", lessons_src):
        raw_items = [
            x.strip().strip("'").strip('"').lower()
            for x in m.group(1).split(",")
            if x.strip()
        ]
        if not raw_items:
            continue
        comma_join = ", ".join(raw_items)
        if len(raw_items) == 1:
            and_join = raw_items[0]
        elif len(raw_items) == 2:
            and_join = f"{raw_items[0]} và {raw_items[1]}"
        else:
            and_join = f"{', '.join(raw_items[:-1])} và {raw_items[-1]}"

        inst_phrase = f"Bé vui hái táo! Bé hãy kéo thả táo có chữ {comma_join} vào đúng giỏ nhé!"
        win_phrase = f"Bé giỏi quá! Em đã hái đủ táo chữ {and_join}!"
        teacher_phrases.add(inst_phrase)
        teacher_phrases.add(win_phrase)
        cute_phrases.add(win_phrase)

        # Chặng 5, 6, 7, 8 theo từng nhóm chữ cái
        teacher_phrases.add(
            f"Cuốn sách kì diệu! Cô và các bé cùng khám phá cấu tạo chữ {comma_join} nhé!"
        )
        win5 = f"Hoan hô! Bé đã giải mã xong cuốn sách kì diệu chữ {and_join}!"
        teacher_phrases.add(win5)
        cute_phrases.add(win5)

        teacher_phrases.add(
            f"Tìm chữ trong hình ảnh! Bé hãy xếp các thẻ tranh có chứa chữ {comma_join} vào đúng cột nhé!"
        )
        teacher_phrases.add(
            f"Bé hãy kéo hoặc chạm thẻ hình ảnh xếp vào đúng cột chữ {comma_join} nhé!"
        )
        win7 = f"Hoan hô! Cả lớp đã tìm đúng tất cả hình ảnh chứa chữ {and_join}!"
        teacher_phrases.add(win7)
        cute_phrases.add(win7)

        win8 = f"Đôi bàn tay vàng xuất sắc! Bé đã ghi nhớ và viết đẹp tất cả các thẻ chữ {and_join}!"
        teacher_phrases.add(win8)
        cute_phrases.add(win8)

        # Thẻ bí ẩn Chặng 8 cho từng nhóm chữ
        card_seq = []
        for ch_item in raw_items:
            card_seq.append((ch_item, False))
            card_seq.append((ch_item, True))
        for card_idx, (ch_low, is_up) in enumerate(card_seq[:6], start=1):
            lbl = f"Chữ {ch_low} in hoa" if is_up else f"Chữ {ch_low} in thường"
            teacher_phrases.add(
                f"Thẻ số {card_idx}: {lbl}! Bé hãy ghi nhớ rồi viết từ chấm đỏ trên bảng nhé!"
            )

    # 8. Chặng 5, 6, 7, 8 dùng chung (từ letterGamesData.ts)
    if GAMES_DATA_TS.exists():
        games_src = GAMES_DATA_TS.read_text(encoding="utf-8")

        # Tên các nét rời
        piece_labels: Dict[str, str] = {}
        for pm in re.finditer(
            r"'([a-z0-9-]+)':\s*\{\s*id:\s*'[^']+',\s*label:\s*'([^']+)'", games_src
        ):
            piece_labels[pm.group(1)] = pm.group(2)
            teacher_phrases.add(pm.group(2))

        # Cấu tạo từng chữ & câu hỏi Quizizz cấu tạo nét
        for lm in re.finditer(
            r"([a-zăâêôơưđ]):\s*\{\s*letter:\s*'([^']+)',[\s\S]*?structureSummary:\s*'([^']+)',\s*pieces:\s*\[([^\]]+)\]",
            games_src,
        ):
            ch_key = lm.group(2)
            summary = lm.group(3)
            raw_pids = [
                p.strip().strip("'").strip('"')
                for p in lm.group(4).split(",")
                if p.strip()
            ]
            teacher_phrases.add(summary)
            teacher_phrases.add(f"Chữ {ch_key} in thường")
            teacher_phrases.add(f"Chữ {ch_key} in hoa")
            teacher_phrases.add(f"Chữ {ch_key} viết thường")
            teacher_phrases.add(f"Bé hãy chọn các nét đúng để ghép thành chữ {ch_key} nhé!")
            teacher_phrases.add(f"Đâu là chữ {ch_key} viết in hoa?")
            teacher_phrases.add(f"Từ nào dưới đây có chứa chữ {ch_key}?")
            teacher_phrases.add(f"Cột chữ {ch_key}")
            praise8 = f"Hoan hô đôi bàn tay vàng! Chữ {ch_key} của bé đẹp lắm!"
            teacher_phrases.add(praise8)
            cute_phrases.add(praise8)

            p_names = [
                piece_labels[pid].lower() for pid in raw_pids if pid in piece_labels
            ]
            if p_names:
                desc = (
                    p_names[0]
                    if len(p_names) == 1
                    else f"{', '.join(p_names[:-1])} và {p_names[-1]}"
                )
                teacher_phrases.add(f"Chữ cái nào gồm {desc}?")

        # So sánh giống & khác nhau giữa các chữ
        for cm in re.finditer(
            r"similarity:\s*'([^']+)',\s*difference:\s*'([^']+)'", games_src
        ):
            teacher_phrases.add(f"{cm.group(1)} {cm.group(2)}")

        # Từ vựng tranh Wordwall & câu hỏi điền chữ Quizizz
        for wm in re.finditer(r"word:\s*'([^']+)',\s*targetLetter:\s*'([^']+)'", games_src):
            w_text = wm.group(1)
            teacher_phrases.add(w_text)
            teacher_phrases.add(
                f'Trong từ "{w_text}", chữ cái nào còn thiếu ở chỗ trống?'
            )

    extra_stage_phrases = [
        "Tuyệt vời! Cả lớp đã giải mã xuất sắc tất cả câu hỏi!",
        "Nhầm cột rồi, bé nhìn kỹ chữ cái trong từ nhé!",
        "Đôi bàn tay vàng! Bé hãy bấm lật một thẻ bí ẩn để ghi nhớ chữ cái, rồi đặt bút từ chấm đỏ để viết lại nhé!",
        "Bé hãy viết chữ lên bảng trắng trước khi khoe bài nhé!",
    ]
    for ep in extra_stage_phrases:
        teacher_phrases.add(ep)
    cute_phrases.add("Tuyệt vời! Cả lớp đã giải mã xuất sắc tất cả câu hỏi!")

    # 9. Chặng 9, 10, 11 (Vườn Hoa Chữ Cái, Vũ Điệu Bạn Chữ, Bảng Vàng Phát Âm)
    stage9_11_teacher = [
        "Vườn hoa chữ cái! Bé hãy chọn một bông hoa mang số để khám phá chữ cái bí mật nhé!",
        "Hoan hô! Vườn hoa chữ cái đã nở rộ rực rỡ rồi, cả lớp giỏi quá!",
        "Vũ điệu bạn chữ! Bé hãy chọn các điệu nhảy vui nhộn và đọc vang cùng bạn chữ cái nhé!",
        "Tuyệt vời! Cả lớp đọc to và rõ quá, tớ khen cả lớp mình nhé!",
        "Tạm biệt các bạn nhỏ đáng yêu! Nhớ gọi đúng tên tớ nhé!",
        "Bảng vàng phát âm! Các bé nhìn lên bảng và phát âm thật to, tròn vành rõ chữ cùng cô nhé!",
        "Giỏi quá! Cả lớp phát âm chuẩn và to rõ lắm!",
    ]
    stage9_11_cute = [
        "Hoan hô! Vườn hoa chữ cái đã nở rộ rực rỡ rồi, cả lớp giỏi quá!",
        "Tuyệt vời! Cả lớp đọc to và rõ quá, tớ khen cả lớp mình nhé!",
        "Tạm biệt các bạn nhỏ đáng yêu! Nhớ gọi đúng tên tớ nhé!",
        "Giỏi quá! Cả lớp phát âm chuẩn và to rõ lắm!",
    ]
    for p in stage9_11_teacher:
        teacher_phrases.add(p)
    for p in stage9_11_cute:
        cute_phrases.add(p)

    preset_letters_13 = ["e", "ê", "o", "ô", "ơ", "a", "ă", "â", "u", "ư", "b", "d", "đ"]
    for ch in preset_letters_13:
        hi_line = f"Xin chào các bạn nhỏ! Tớ là chữ {ch} đây!"
        hooray_line = f"Cùng dang hai tay và đọc vang chữ {ch} với tớ nào!"
        model_line = f"Phát âm chữ {ch}: {ch}!"
        choral_line = f"Cả lớp đọc to: Chữ {ch}!"
        teacher_phrases.add(hi_line)
        cute_phrases.add(hi_line)
        teacher_phrases.add(hooray_line)
        cute_phrases.add(hooray_line)
        teacher_phrases.add(model_line)
        teacher_phrases.add(choral_line)
        cute_phrases.add(choral_line)

    if GAMES_DATA_TS.exists():
        games_src = GAMES_DATA_TS.read_text(encoding="utf-8")
        tips_block = re.search(
            r"PRONUNCIATION_TIPS:\s*Record<string,\s*string>\s*=\s*\{([\s\S]*?)\};",
            games_src,
        )
        if tips_block:
            for tm in re.finditer(r":\s*'([^']+)'", tips_block.group(1)):
                teacher_phrases.add(tm.group(1))

    return teacher_phrases, cute_phrases


async def synth_to_data_url(
    sem: asyncio.Semaphore, spoken_text: str, pitch: str, rate: str
) -> str:
    tc = TTSConfig(VOICE_NAME, rate, "+0%", pitch, "SentenceBoundary")
    escaped = escape(spoken_text)
    async with sem:
        for attempt in range(25):
            try:
                timeout = aiohttp.ClientTimeout(total=20, sock_connect=8, sock_read=12)
                async with aiohttp.ClientSession(timeout=timeout) as session:
                    ws_url = (
                        f"{WSS_URL}&ConnectionId={connect_id()}"
                        f"&Sec-MS-GEC={DRM.generate_sec_ms_gec()}"
                        f"&Sec-MS-GEC-Version={SEC_MS_GEC_VERSION}"
                    )
                    async with session.ws_connect(
                        ws_url,
                        compress=0,
                        headers=DRM.headers_with_muid(WSS_HEADERS),
                        ssl=_SSL_CTX,
                    ) as ws:
                        await ws.send_str(
                            f"X-Timestamp:{date_to_string()}\r\n"
                            "Content-Type:application/json; charset=utf-8\r\n"
                            "Path:speech.config\r\n\r\n"
                            '{"context":{"synthesis":{"audio":{"metadataoptions":{'
                            '"sentenceBoundaryEnabled":"true","wordBoundaryEnabled":"false"'
                            '},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}\r\n'
                        )
                        ssml = mkssml(tc, escaped)
                        await ws.send_str(
                            ssml_headers_plus_data(connect_id(), date_to_string(), ssml)
                        )

                        audio_bytes = bytearray()
                        async for msg in ws:
                            if msg.type == aiohttp.WSMsgType.BINARY and len(msg.data) > 2:
                                hdr_len = int.from_bytes(msg.data[:2], "big")
                                if hdr_len + 2 < len(msg.data):
                                    audio_bytes.extend(msg.data[hdr_len + 2 :])
                            elif (
                                msg.type == aiohttp.WSMsgType.TEXT
                                and "Path:turn.end" in msg.data
                            ):
                                break

                        if not audio_bytes:
                            raise RuntimeError(
                                f"Empty audio buffer (close_code={ws.close_code})"
                            )
                        b64 = base64.b64encode(bytes(audio_bytes)).decode("ascii")
                        return f"data:audio/mp3;base64,{b64}"
            except aiohttp.ClientResponseError as http_err:
                if http_err.status == 403:
                    DRM.handle_client_response_error(http_err)
                if attempt == 24:
                    raise
                await asyncio.sleep(0.25)
            except Exception as exc:
                if attempt == 24:
                    raise RuntimeError(
                        f"Failed TTS after 25 attempts for '{spoken_text}': {exc}"
                    ) from exc
                await asyncio.sleep(0.15)
    raise RuntimeError("Unreachable")


def load_existing_banks() -> Tuple[Dict[str, str], Dict[str, str]]:
    if not OUT_TS.exists():
        return {}, {}
    try:
        src = OUT_TS.read_text(encoding="utf-8")
        m_t = re.search(
            r"VOICE_BANK_TEACHER:\s*Record<string,\s*string>\s*=\s*(\{[\s\S]*?\});",
            src,
        )
        m_c = re.search(
            r"VOICE_BANK_CUTE:\s*Record<string,\s*string>\s*=\s*(\{[\s\S]*?\});",
            src,
        )
        t_bank = json.loads(m_t.group(1)) if m_t else {}
        c_bank = json.loads(m_c.group(1)) if m_c else {}
        return t_bank, c_bank
    except Exception:
        return {}, {}


async def main() -> None:
    teacher_raw, cute_raw = collect_phrases()
    existing_teacher, existing_cute = load_existing_banks()

    # Gom theo khóa chuẩn hóa để không tạo trùng lặp (VD: 'Chữ e' và 'Chữ E')
    teacher_map_norm: Dict[str, str] = {}
    for raw in sorted(teacher_raw):
        norm = normalize_vietnamese_for_speech(raw)
        key = norm.lower()
        teacher_map_norm[key] = norm

    cute_map_norm: Dict[str, str] = {}
    for raw in sorted(cute_raw):
        norm = normalize_vietnamese_for_speech(raw)
        key = norm.lower()
        cute_map_norm[key] = norm

    print(
        f"Generating {len(teacher_map_norm)} teacher clips + {len(cute_map_norm)} cute clips "
        f"using {VOICE_NAME}..."
    )

    sem = asyncio.Semaphore(8)

    async def build_bank(
        label: str,
        norm_dict: Dict[str, str],
        prosody: Dict[str, str],
        existing: Dict[str, str],
    ) -> Dict[str, str]:
        keys = list(norm_dict.keys())
        missing_keys = [k for k in keys if k not in existing]
        if not missing_keys:
            print(f"  [{label}] All {len(keys)} clips cached!")
            return {k: existing[k] for k in keys}

        print(
            f"  [{label}] Synthesizing {len(missing_keys)} new clips "
            f"(reusing {len(keys) - len(missing_keys)} cached)..."
        )
        done_count = 0

        async def worker(k: str) -> Tuple[str, str]:
            nonlocal done_count
            url = await synth_to_data_url(
                sem, norm_dict[k], prosody["pitch"], prosody["rate"]
            )
            done_count += 1
            if done_count % 25 == 0 or done_count == len(missing_keys):
                print(f"  [{label}] {done_count}/{len(missing_keys)} new clips ready...")
            return k, url

        new_pairs = dict(await asyncio.gather(*(worker(k) for k in missing_keys)))
        return {k: (new_pairs[k] if k in new_pairs else existing[k]) for k in keys}

    teacher_bank = await build_bank(
        "teacher", teacher_map_norm, TEACHER_PROSODY, existing_teacher
    )
    cute_bank = await build_bank("cute", cute_map_norm, CUTE_PROSODY, existing_cute)

    lines = [
        "// AUTO-GENERATED BY scripts/generate_voice_bank.py — DO NOT EDIT MANUALLY.",
        f"// Voice Model: {VOICE_NAME} (100% Pure Vietnamese Female Neural TTS)",
        "",
        "export const VOICE_BANK_TEACHER: Record<string, string> = "
        + json.dumps(teacher_bank, ensure_ascii=False, indent=2)
        + ";",
        "",
        "export const VOICE_BANK_CUTE: Record<string, string> = "
        + json.dumps(cute_bank, ensure_ascii=False, indent=2)
        + ";",
        "",
    ]

    content = "\n".join(lines)
    OUT_TS.write_text(content, encoding="utf-8")
    size_kb = OUT_TS.stat().st_size / 1024
    print(
        f"Done! Wrote {OUT_TS} ({size_kb:.1f} KB) with "
        f"{len(teacher_bank)} teacher + {len(cute_bank)} cute clips."
    )


if __name__ == "__main__":
    asyncio.run(main())
