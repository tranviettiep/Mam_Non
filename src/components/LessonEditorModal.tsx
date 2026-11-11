import React, { useEffect, useRef, useState } from 'react';
import { Check, Download, Mic, Plus, RotateCcw, Square, Trash2, Volume2, X } from 'lucide-react';
import { LessonConfig, QuizQuestion } from '../types/lesson';
import { AVAILABLE_TRACING_LETTERS } from '../data/strokes';
import { LESSON_PRESETS, syncGreetingWithClassInfo } from '../data/lessons';
import { audioManager } from '../utils/audio';

interface LessonEditorModalProps {
  open: boolean;
  lesson: LessonConfig;
  onClose: () => void;
  onSave: (updated: LessonConfig) => void;
  onExportHtml: (updated: LessonConfig) => void;
}

export const LessonEditorModal: React.FC<LessonEditorModalProps> = ({
  open,
  lesson,
  onClose,
  onSave,
  onExportHtml,
}) => {
  const [draft, setDraft] = useState<LessonConfig>(() => structuredClone(lesson));
  const [tab, setTab] = useState<'general' | 'questions'>('general');
  const [recordingKey, setRecordingKey] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (open) {
      setDraft(structuredClone(lesson));
    }
    return () => {
      stopActiveRecording();
    };
  }, [open, lesson]);

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
              Tùy chỉnh trường lớp, nhóm chữ cái, bộ câu hỏi hoặc ghi âm giọng đọc của cô giáo
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              stopActiveRecording();
              onClose();
            }}
            aria-label="Đóng cửa sổ chỉnh sửa"
            className="cursor-pointer rounded-xl bg-white p-2 text-slate-600 shadow-xs hover:bg-rose-50 hover:text-rose-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-6 py-2.5">
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
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-6 py-3.5">
          <button
            type="button"
            onClick={() => setDraft(structuredClone(LESSON_PRESETS[0]))}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100"
          >
            <RotateCcw className="h-4 w-4" />
            Khôi phục bài mẫu 5C5 (e, ê)
          </button>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                stopActiveRecording();
                onSave(draft);
                onExportHtml(draft);
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
                onSave(draft);
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
