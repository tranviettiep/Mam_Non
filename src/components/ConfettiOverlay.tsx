import React, { useMemo } from 'react';

interface ConfettiOverlayProps {
  active: boolean;
}

const COLORS = ['#2563EB', '#F59E0B', '#EC4899', '#10B981', '#8B5CF6', '#EF4444'];

export const ConfettiOverlay: React.FC<ConfettiOverlayProps> = ({ active }) => {
  const pieces = useMemo(
    () =>
      Array.from({ length: 42 }, (_, idx) => ({
        id: idx,
        left: `${(idx * 2.4 + (idx % 5) * 3) % 98}%`,
        delay: `${(idx % 9) * 0.08}s`,
        duration: `${1.8 + (idx % 5) * 0.3}s`,
        color: COLORS[idx % COLORS.length],
        size: 10 + (idx % 4) * 4,
      })),
    []
  );

  if (!active) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          style={{
            left: p.left,
            width: `${p.size}px`,
            height: `${p.size * 0.65}px`,
            backgroundColor: p.color,
            animation: `confettiFall ${p.duration} linear ${p.delay} forwards`,
          }}
          className="absolute -top-6 rounded-sm shadow-sm"
        />
      ))}
    </div>
  );
};
