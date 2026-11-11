import { LessonConfig } from '../types/lesson';

function serializeLessonSafe(lesson: LessonConfig): string {
  return JSON.stringify(lesson).replace(/</g, '\\u003c');
}

function bakeLessonIntoDocument(docRoot: HTMLElement, lesson: LessonConfig): string {
  const embeddedEl = docRoot.querySelector('#embedded-lesson-config');
  if (embeddedEl) {
    embeddedEl.textContent = serializeLessonSafe(lesson);
  }
  const rootEl = docRoot.querySelector('#root');
  if (rootEl) {
    rootEl.innerHTML = '';
  }
  return '<!doctype html>\n' + docRoot.outerHTML;
}

export function exportStandaloneGameHtml(lesson: LessonConfig): void {
  const safeSlug = lesson.targetLetters.join('-') || 'bai-hoc';
  const fileName = `san-choi-chu-cai-${safeSlug}.html`;

  const isDevServer = Boolean(document.querySelector('script[src*="/@vite/client"]'));
  if (isDevServer) {
    fetch('/standalone-template.html')
      .then((res) => {
        if (!res.ok) throw new Error('No prebuilt standalone template');
        return res.text();
      })
      .then((templateHtml) => {
        const parser = new DOMParser();
        const parsedDoc = parser.parseFromString(templateHtml, 'text/html');
        const bakedHtml = bakeLessonIntoDocument(parsedDoc.documentElement, lesson);
        triggerDownload(bakedHtml, fileName, 'text/html;charset=utf-8');
      })
      .catch(() => {
        const jsonName = `cau-hinh-bai-hoc-${safeSlug}.json`;
        triggerDownload(JSON.stringify(lesson, null, 2), jsonName, 'application/json;charset=utf-8');
      });
    return;
  }

  const clone = document.documentElement.cloneNode(true) as HTMLElement;
  const fullHtml = bakeLessonIntoDocument(clone, lesson);
  triggerDownload(fullHtml, fileName, 'text/html;charset=utf-8');
}

function triggerDownload(content: string, fileName: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}
