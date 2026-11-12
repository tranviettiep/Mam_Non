import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, ChevronUp, Download, Mic, PenTool, Plus, RotateCcw, Share2, Square, Trash2, Volume2, X } from 'lucide-react';
import { CustomStrokeInstruction, EditorTab, LessonConfig, QuizQuestion } from '../types/lesson';
import { AVAILABLE_TRACING_LETTERS, LETTER_STROKES } from '../data/strokes';
import {
  copyShareableLessonUrl,
  LESSON_PRESETS,
  stripDuplicateStrokePrefix,
  syncGreetingWithClassInfo,
} from '../data/lessons';
import { audioManager } from '../utils/audio';

interface LessonEditorModalProps {
  open: boolean;
  lesson: LessonConfig;
  initialTab?: EditorTab;
  onClose: () => void;
  onSave: (updated: LessonConfig) => void;
  onExportHtml: (updated: LessonConfig) => void;
}

export const LessonEditorModal: React.FC<LessonEditorModalProps> = ({
  open,
  lesson,
  initialTab = 'general',
  onClose,
  onSave,
  onExportHtml,
}) => {
  const [draft, setDraft] = useState<LessonConfig>(() => structuredClone(lesson));
  const [tab, setTab] = useState<EditorTab>(initialTab);
  const [showAllLibraryLetters, setShowAllLibraryLetters] = useState(false);
  const [recordingKey, setRecordingKey] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (open) {
      setDraft(structuredClone(lesson));
      setTab(initialTab);
      setShowAllLibraryLetters(false);
    }
    return () => {
      stopActiveRecording();
      audioManager.stopSpeaking();
    };
  }, [open, lesson, initialTab]);

  const stopActiveRecording = () => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
    recorderRef.current = null;
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    setRecordingKey(null);
  };

  const startVoiceRecording = async (targetKey: string, onRecorded: (dataUrl: string) => void) => {
    if (recordingKey) {
      stopActiveRecording();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) chunks.push(ev.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            onRecorded(reader.result);
          }
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach((t) => t.stop());
        micStreamRef.current = null;
        setRecordingKey(null);
      };

      recorderRef.current = recorder;
      setRecordingKey(targetKey);
      recorder.start();
    } catch {
      alert('Không mở được microphone để ghi âm. Vui lòng kiểm tra quyền truy cập micro của trình duyệt.');
    }
  };

  if (!open) return null;

  const toggleTargetLetter = (ch: string) => {
    setDraft((prev) => {
      const exists = prev.targetLetters.includes(ch);
      const nextLetters = exists
        ? prev.targetLetters.filter((x) => x !== ch)
        : [...prev.targetLetters, ch];
      if (nextLetters.length === 0) return prev;
      const runner = [...nextLetters, ...nextLetters.map((x) => x.toUpperCase())];
      return {
        ...prev,
        targetLetters: nextLetters,
        runnerLetters: runner,
        secretCallGreeting: syncGreetingWithClassInfo(
          prev.secretCallGreeting,
          prev.teacherNames,
          prev.className,
          nextLetters
        ),
      };
    });
  };

  const updateQuestion = (idx: number, patch: Partial<QuizQuestion>) => {
    setDraft((prev) => {
      const nextQ = [...prev.questions];
      nextQ[idx] = { ...nextQ[idx], ...patch };
      return { ...prev, questions: nextQ };
    });
  };

  const addQuestion = () => {
    setDraft((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          id: `custom-${Date.now()}`,
          prompt: 'Đâu là chữ cái đúng?',
          leftOption: prev.targetLetters[0] ?? 'e',
          rightOption: prev.targetLetters[1] ?? 'ê',
          correctSide: 'left',
        },
      ],
    }));
  };

  const removeQuestion = (idx: number) => {
    if (draft.questions.length <= 1) return;
    setDraft((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== idx),
    }));
  };

  const updateStrokeOverride = (
    letterKey: string,
    strokeIdx: number,
    patch: Partial<CustomStrokeInstruction>
  ) => {
    const defStrokes = LETTER_STROKES[letterKey]?.strokes;
    if (!defStrokes) return;
    setDraft((prev) => {
      const prevMap = prev.tracingOverrides ? { ...prev.tracingOverrides } : {};
      const prevArr = prevMap[letterKey]
        ? [...prevMap[letterKey]]
        : defStrokes.map((s) => ({ instruction: s.instruction }));
      while (prevArr.length < defStrokes.length) {
        const idx = prevArr.length;
        prevArr.push({ instruction: defStrokes[idx].instruction });
      }
      prevArr[strokeIdx] = {
        ...prevArr[strokeIdx],
        ...patch,
      };
      prevMap[letterKey] = prevArr;
      return {
        ...prev,
        tracingOverrides: prevMap,
      };
    });
  };

  const resetSingleStrokeOverride = (letterKey: string, strokeIdx: number) => {
    const defInst = LETTER_STROKES[letterKey]?.strokes[strokeIdx]?.instruction ?? '';
    updateStrokeOverride(letterKey, strokeIdx, {
      instruction: defInst,
      customAudioUrl: undefined,
    });
  };

  const finalizeDraft = (raw: LessonConfig): LessonConfig => {
    if (!raw.tracingOverrides) return raw;
    const cleanedMap: Record<string, CustomStrokeInstruction[]> = {};
    let hasAny = false;

    for (const [letterKey, list] of Object.entries(raw.tracingOverrides)) {
      const defStrokes = LETTER_STROKES[letterKey]?.strokes;
      if (!defStrokes || !Array.isArray(list)) continue;

      let letterHasChange = false;
      const normalized = defStrokes.map((st, idx) => {
        const item = list[idx];
        const cleanedText = stripDuplicateStrokePrefix(item?.instruction ?? '').trim();
        const finalInstruction = cleanedText || st.instruction;
        const customAudioUrl = item?.customAudioUrl;
        if (finalInstruction !== st.instruction || customAudioUrl) {
          letterHasChange = true;
        }
        return {
          instruction: finalInstruction,
          ...(customAudioUrl ? { customAudioUrl } : {}),
        };
      });

      if (letterHasChange) {
        cleanedMap[letterKey] = normalized;
        hasAny = true;
      }
    }

    return {
      ...raw,
      tracingOverrides: hasAny ? cleanedMap : undefined,
    };
  };

  const targetTracingLetters = draft.targetLetters.filter((ch) => Boolean(LETTER_STROKES[ch]));
  const extraTracingLetters = AVAILABLE_TRACING_LETTERS.filter(
    (ch) => !targetTracingLetters.includes(ch)
  );
  const visibleTracingLetters = showAllLibraryLetters
    ? [...targetTracingLetters, ...extraTracingLetters]
    : targetTracingLetters.length > 0
      ? targetTracingLetters
      : ['e', 'ê'];

  const hasAnyStrokeDraftChange = Boolean(
    draft.tracingOverrides &&
      Object.entries(draft.tracingOverrides).some(([letterKey, arr]) => {
        const defs = LETTER_STROKES[letterKey]?.strokes;
        if (!defs || !Array.isArray(arr)) return false;
        return defs.some((st, idx) => {
          const item = arr[idx];
          if (!item) return false;
          const cleaned = stripDuplicateStrokePrefix(item.instruction ?? '').trim();
          return (cleaned !== '' && cleaned !== st.instruction) || Boolean(item.customAudioUrl);
        });
      })
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 p-4 backdrop-blur-xs">
      <div className="flex h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border-4 border-blue-500 bg-white shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-blue-50 px-6 py-4">
          <div>
            <h2 className="font-heading text-2xl font-extrabold text-blue-950">
              Chỉnh Sửa Bài Học & Câu Hỏi
            </h2>
            <p className="text-xs font-semibold text-slate-600">
              Tùy chỉnh trường lớp, nhóm chữ cái, bộ câu hỏi Chặng 2, lời hướng dẫn viết Chặng 3 và ghi âm giọng cô
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              stopActiveRecording();
              audioManager.stopSpeaking();
              onClose();
            }}
            aria-label="Đóng cửa sổ chỉnh sửa"
            className="cursor-pointer rounded-xl bg-white p-2 text-slate-600 shadow-xs hover:bg-rose-50 hover:text-rose-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50 px-6 py-2.5">
          <button
            type="button"
            onClick={() => setTab('general')}
            className={`cursor-pointer rounded-xl px-4 py-2 font-heading text-base font-bold transition ${
              tab === 'general' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            1. Trường lớp & Chữ cái
          </button>
          <button
            type="button"
            onClick={() => setTab('questions')}
            className={`cursor-pointer rounded-xl px-4 py-2 font-heading text-base font-bold transition ${
              tab === 'questions' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            2. Bộ câu hỏi Chặng 2 ({draft.questions.length} câu)
          </button>
          <button
            type="button"
            onClick={() => setTab('tracing')}
            className={`flex cursor-pointer items-center gap-1.5 rounded-xl px-4 py-2 font-heading text-base font-bold transition ${
              tab === 'tracing' ? 'bg-pink-600 text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            <PenTool className="h-4 w-4" />
            3. Hướng dẫn viết Chặng 3 ({targetTracingLetters.join(', ')})
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 select-text">
          {tab === 'general' && (
            <div className="space-y-5">
              {/* Quick Preset Loader */}
              <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4">
                <label className="block text-sm font-extrabold text-blue-900">
                  Nạp nhanh gói bài học mẫu có sẵn:
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {LESSON_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() =>
                        setDraft({
                          ...structuredClone(p),
                          schoolName: draft.schoolName,
                          className: draft.className,
                          teacherNames: draft.teacherNames,
                          tracingOverrides: draft.tracingOverrides,
                          secretCallGreeting: syncGreetingWithClassInfo(
                            p.secretCallGreeting,
                            draft.teacherNames,
                            draft.className
                          ),
                        })
                      }
                      className="font-letter cursor-pointer rounded-xl border-2 border-blue-300 bg-white px-3.5 py-1.5 text-sm font-extrabold text-blue-800 hover:bg-blue-600 hover:text-white"
                    >
                      Nhóm {p.targetLetters.join(', ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="block text-sm font-bold text-slate-700">Tên trường</label>
                  <input
                    type="text"
                    value={draft.schoolName}
                    onChange={(e) => setDraft({ ...draft, schoolName: e.target.value })}
                    className="mt-1 w-full rounded-xl border-2 border-slate-300 px-3 py-2 font-semibold focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700">Tên lớp</label>
                  <input
                    type="text"
                    value={draft.className}
                    onChange={(e) => {
                      const nextClass = e.target.value;
                      setDraft((prev) => ({
                        ...prev,
                        className: nextClass,
                        secretCallGreeting: syncGreetingWithClassInfo(
                          prev.secretCallGreeting,
                          prev.teacherNames,
                          nextClass
                        ),
                      }));
                    }}
                    className="mt-1 w-full rounded-xl border-2 border-slate-300 px-3 py-2 font-semibold focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700">Tên cô giáo</label>
                  <input
                    type="text"
                    value={draft.teacherNames}
                    onChange={(e) => {
                      const nextTeacher = e.target.value;
                      setDraft((prev) => ({
                        ...prev,
                        teacherNames: nextTeacher,
                        secretCallGreeting: syncGreetingWithClassInfo(
                          prev.secretCallGreeting,
                          nextTeacher,
                          prev.className
                        ),
                      }));
                    }}
                    className="mt-1 w-full rounded-xl border-2 border-slate-300 px-3 py-2 font-semibold focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700">
                  Chọn các chữ cái mục tiêu của bài học (Chặng 1 & Chặng 3):
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {AVAILABLE_TRACING_LETTERS.map((ch) => {
                    const active = draft.targetLetters.includes(ch);
                    return (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => toggleTargetLetter(ch)}
                        className={`font-letter h-12 w-12 cursor-pointer rounded-2xl border-2 text-xl font-extrabold transition ${
                          active
                            ? 'border-blue-800 bg-blue-600 text-white shadow-sm'
                            : 'border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {ch}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-bold text-slate-700">
                    Lời chào trong màn hình “Cuộc gọi bí mật”:
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setDraft((prev) => ({
                          ...prev,
                          secretCallGreeting: syncGreetingWithClassInfo(
                            '',
                            prev.teacherNames,
                            prev.className,
                            prev.targetLetters
                          ),
                        }))
                      }
                      className="flex cursor-pointer items-center gap-1 rounded-lg border border-blue-300 bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-800 hover:bg-blue-100"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Tạo theo tên lớp/cô
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        startVoiceRecording('greeting', (url) =>
                          setDraft((d) => ({ ...d, secretCallCustomAudioUrl: url }))
                        )
                      }
                      className={`flex cursor-pointer items-center gap-1 rounded-lg px-3 py-1 text-xs font-bold text-white ${
                        recordingKey === 'greeting' ? 'animate-pulse bg-rose-600' : 'bg-indigo-600 hover:bg-indigo-500'
                      }`}
                    >
                      {recordingKey === 'greeting' ? <Square className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                      {recordingKey === 'greeting' ? 'Dừng ghi âm' : 'Ghi âm giọng cô'}
                    </button>
                    {draft.secretCallCustomAudioUrl && (
                      <>
                        <button
                          type="button"
                          onClick={() => audioManager.speakVi(draft.secretCallGreeting, draft.secretCallCustomAudioUrl)}
                          className="flex cursor-pointer items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white"
                        >
                          <Volume2 className="h-3.5 w-3.5" />
                          Nghe thử
                        </button>
                        <button
                          type="button"
                          onClick={() => setDraft({ ...draft, secretCallCustomAudioUrl: undefined })}
                          className="cursor-pointer rounded-lg bg-slate-200 px-2 py-1 text-xs font-bold text-slate-700"
                        >
                          Xóa ghi âm
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <textarea
                  rows={3}
                  value={draft.secretCallGreeting}
                  onChange={(e) => setDraft({ ...draft, secretCallGreeting: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border-2 border-slate-300 p-3 font-semibold focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {tab === 'questions' && (
            <div className="space-y-4">
              {draft.questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="rounded-2xl border-2 border-slate-200 bg-slate-50/75 p-4 shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-heading text-lg font-extrabold text-blue-900">
                      Câu {idx + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          startVoiceRecording(`q-${q.id}`, (url) => updateQuestion(idx, { customAudioUrl: url }))
                        }
                        className={`flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold text-white ${
                          recordingKey === `q-${q.id}` ? 'animate-pulse bg-rose-600' : 'bg-indigo-600 hover:bg-indigo-500'
                        }`}
                      >
                        {recordingKey === `q-${q.id}` ? <Square className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
                        {recordingKey === `q-${q.id}` ? 'Dừng' : q.customAudioUrl ? 'Ghi lại' : 'Ghi âm'}
                      </button>
                      {q.customAudioUrl && (
                        <button
                          type="button"
                          onClick={() => audioManager.speakVi(q.prompt, q.customAudioUrl)}
                          className="cursor-pointer rounded-lg bg-emerald-600 p-1.5 text-white"
                          title="Nghe bản ghi âm"
                        >
                          <Volume2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeQuestion(idx)}
                        aria-label={`Xóa câu ${idx + 1}`}
                        className="cursor-pointer rounded-lg bg-rose-100 p-1.5 text-rose-700 hover:bg-rose-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={q.prompt}
                    onChange={(e) => updateQuestion(idx, { prompt: e.target.value })}
                    placeholder="Nhập câu hỏi..."
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-semibold"
                  />

                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <label className="text-xs font-bold text-blue-700">Đáp án TRÁI (Thẻ xanh)</label>
                      <input
                        type="text"
                        value={q.leftOption}
                        onChange={(e) => updateQuestion(idx, { leftOption: e.target.value })}
                        className="font-letter mt-1 w-full rounded-xl border border-blue-300 bg-white px-3 py-1.5 text-lg font-bold text-blue-800"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-pink-700">Đáp án PHẢI (Thẻ hồng)</label>
                      <input
                        type="text"
                        value={q.rightOption}
                        onChange={(e) => updateQuestion(idx, { rightOption: e.target.value })}
                        className="font-letter mt-1 w-full rounded-xl border border-pink-300 bg-white px-3 py-1.5 text-lg font-bold text-pink-800"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-emerald-700">Bên đáp án ĐÚNG</label>
                      <select
                        value={q.correctSide}
                        onChange={(e) =>
                          updateQuestion(idx, { correctSide: e.target.value as 'left' | 'right' })
                        }
                        className="mt-1 w-full rounded-xl border border-emerald-400 bg-white px-3 py-2 font-bold text-emerald-800"
                      >
                        <option value="left">Nghiêng TRÁI ({q.leftOption})</option>
                        <option value="right">Nghiêng PHẢI ({q.rightOption})</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addQuestion}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-blue-400 bg-blue-50 py-3 font-heading text-lg font-bold text-blue-800 hover:bg-blue-100"
              >
                <Plus className="h-5 w-5" />
                Thêm câu hỏi mới
              </button>
            </div>
          )}

          {tab === 'tracing' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-pink-200 bg-pink-50/70 p-4">
                <div className="max-w-xl">
                  <p className="font-heading text-base font-extrabold text-pink-950">
                    Chỉnh sửa lời hướng dẫn từng nét viết ở Chặng 3
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-slate-600">
                    Tiền tố <strong>“Nét 1/2:”</strong> sẽ tự động đánh số trên bảng viết. Cô nhập nội dung hướng dẫn phía sau hoặc bấm <strong>Ghi âm</strong> giọng thật của cô cho từng nét.
                  </p>
                </div>
                {hasAnyStrokeDraftChange && (
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        tracingOverrides: undefined,
                      }))
                    }
                    className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-pink-300 bg-white px-3 py-1.5 text-xs font-bold text-pink-800 hover:bg-pink-100"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Khôi phục tất cả nét mặc định
                  </button>
                )}
              </div>

              {visibleTracingLetters.map((ch) => {
                const def = LETTER_STROKES[ch];
                if (!def) return null;
                const isTarget = targetTracingLetters.includes(ch);
                return (
                  <div
                    key={ch}
                    className="rounded-2xl border-2 border-slate-200 bg-slate-50/80 p-4 shadow-2xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-letter flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-blue-700 bg-blue-600 text-2xl font-extrabold text-white shadow-2xs">
                          {def.letter}
                        </span>
                        <div>
                          <h3 className="font-heading text-lg font-extrabold text-blue-950">
                            Chữ {def.letter} ({def.upper}) — {def.strokes.length} nét viết
                          </h3>
                          <p className="text-xs font-semibold text-slate-500">
                            Phát âm chuẩn: “{def.pronounce}”
                          </p>
                        </div>
                      </div>

                      {isTarget ? (
                        <span className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-800">
                          Chữ trong bài học hiện tại
                        </span>
                      ) : (
                        <span className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-bold text-slate-600">
                          Chữ mở rộng trong thư viện
                        </span>
                      )}
                    </div>

                    <div className="mt-3 space-y-3">
                      {def.strokes.map((st, sIdx) => {
                        const ov = draft.tracingOverrides?.[ch]?.[sIdx];
                        const inputVal = ov?.instruction !== undefined ? ov.instruction : st.instruction;
                        const cleanedPreview = stripDuplicateStrokePrefix(inputVal).trim() || st.instruction;
                        const isChanged =
                          (stripDuplicateStrokePrefix(inputVal).trim() !== '' &&
                            stripDuplicateStrokePrefix(inputVal).trim() !== st.instruction) ||
                          Boolean(ov?.customAudioUrl);
                        const recKey = `trace-${ch}-${sIdx}`;

                        return (
                          <div
                            key={recKey}
                            className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-0.5 font-heading text-sm font-extrabold text-blue-900">
                                Nét {sIdx + 1}/{def.strokes.length}:
                              </span>

                              <div className="flex flex-wrap items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => audioManager.speakVi(cleanedPreview, ov?.customAudioUrl)}
                                  className="flex cursor-pointer items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-emerald-500"
                                  title="Nghe thử lời hướng dẫn nét này"
                                >
                                  <Volume2 className="h-3.5 w-3.5" />
                                  Nghe thử
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    startVoiceRecording(recKey, (url) =>
                                      updateStrokeOverride(ch, sIdx, { customAudioUrl: url })
                                    )
                                  }
                                  className={`flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold text-white ${
                                    recordingKey === recKey
                                      ? 'animate-pulse bg-rose-600'
                                      : 'bg-indigo-600 hover:bg-indigo-500'
                                  }`}
                                >
                                  {recordingKey === recKey ? (
                                    <Square className="h-3 w-3" />
                                  ) : (
                                    <Mic className="h-3 w-3" />
                                  )}
                                  {recordingKey === recKey
                                    ? 'Dừng'
                                    : ov?.customAudioUrl
                                      ? 'Ghi lại'
                                      : 'Ghi âm'}
                                </button>

                                {ov?.customAudioUrl && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateStrokeOverride(ch, sIdx, { customAudioUrl: undefined })
                                    }
                                    className="cursor-pointer rounded-lg bg-slate-200 px-2 py-1 text-xs font-bold text-slate-700 hover:bg-slate-300"
                                  >
                                    Xóa ghi âm
                                  </button>
                                )}

                                {isChanged && (
                                  <button
                                    type="button"
                                    onClick={() => resetSingleStrokeOverride(ch, sIdx)}
                                    className="flex cursor-pointer items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-2 py-1 text-xs font-bold text-amber-900 hover:bg-amber-100"
                                    title="Khôi phục câu mặc định của nét này"
                                  >
                                    <RotateCcw className="h-3 w-3" />
                                    Mặc định
                                  </button>
                                )}
                              </div>
                            </div>

                            <input
                              type="text"
                              value={inputVal}
                              onChange={(e) =>
                                updateStrokeOverride(ch, sIdx, { instruction: e.target.value })
                              }
                              placeholder={st.instruction}
                              className="mt-2 w-full rounded-xl border-2 border-slate-300 bg-white px-3 py-2 font-semibold text-slate-900 focus:border-blue-500 focus:outline-none"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {extraTracingLetters.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowAllLibraryLetters((v) => !v)}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 py-3 font-heading text-base font-bold text-slate-700 hover:bg-slate-100"
                >
                  {showAllLibraryLetters ? (
                    <>
                      <ChevronUp className="h-5 w-5" />
                      Thu gọn các chữ cái ngoài bài học
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-5 w-5" />
                      Hiển thị thêm {extraTracingLetters.length} chữ cái khác trong thư viện ({extraTracingLetters.join(', ')})
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-6 py-3.5">
          <button
            type="button"
            onClick={() => setDraft(structuredClone(LESSON_PRESETS[0]))}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100"
          >
            <RotateCcw className="h-4 w-4" />
            Khôi phục mặc định (e, ê)
          </button>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={async () => {
                stopActiveRecording();
                audioManager.stopSpeaking();
                const finalLesson = finalizeDraft(draft);
                setDraft(finalLesson);
                onSave(finalLesson);
                await copyShareableLessonUrl(finalLesson);
                setCopiedLink(true);
                window.setTimeout(() => setCopiedLink(false), 2500);
              }}
              className={`flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 font-heading text-base font-bold text-white shadow transition ${
                copiedLink ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-sky-600 hover:bg-sky-500'
              }`}
            >
              {copiedLink ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
              {copiedLink ? 'Đã sao chép link!' : 'Lưu & Chép link chia sẻ'}
            </button>

            <button
              type="button"
              onClick={() => {
                stopActiveRecording();
                audioManager.stopSpeaking();
                const finalLesson = finalizeDraft(draft);
                setDraft(finalLesson);
                onSave(finalLesson);
                onExportHtml(finalLesson);
              }}
              className="flex cursor-pointer items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 font-heading text-base font-bold text-white shadow hover:bg-orange-400"
            >
              <Download className="h-4 w-4" />
              Lưu & Tải file .html
            </button>

            <button
              type="button"
              onClick={() => {
                stopActiveRecording();
                audioManager.stopSpeaking();
                const finalLesson = finalizeDraft(draft);
                onSave(finalLesson);
                onClose();
              }}
              className="flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 font-heading text-lg font-extrabold text-white shadow hover:bg-emerald-500"
            >
              <Check className="h-5 w-5" />
              Lưu áp dụng ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
