import { useCallback, useRef, useState } from "react";

type Props = {
  before: string;
  after: string;
  beforeAlt: string;
  afterAlt: string;
};

export function BeforeAfterSlider({ before, after, beforeAlt, afterAlt }: Props) {
  const [pos, setPos] = useState(52);
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const move = useCallback((clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const next = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(100, Math.max(0, next)));
  }, []);

  return (
    <div
      ref={ref}
      className="relative aspect-square w-full cursor-ew-resize overflow-hidden rounded-2xl border border-border select-none checkerboard"
      onPointerDown={(e) => {
        dragging.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        move(e.clientX);
      }}
      onPointerMove={(e) => dragging.current && move(e.clientX)}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
    >
      <img
        src={after}
        alt={afterAlt}
        loading="lazy"
        width={800}
        height={800}
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      >
        <img
          src={before}
          alt={beforeAlt}
          loading="lazy"
          width={800}
          height={800}
          className="h-full w-full object-cover"
          draggable={false}
        />
      </div>

      <div
        className="pointer-events-none absolute inset-y-0 w-px bg-background"
        style={{ left: `${pos}%` }}
      >
        <div className="absolute top-1/2 left-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-background text-foreground shadow-float">
          <span className="text-xs font-bold tracking-tighter">⇆</span>
        </div>
      </div>

      <span className="pointer-events-none absolute top-3 left-3 rounded-full bg-foreground/85 px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] text-background uppercase">
        Before
      </span>
      <span className="pointer-events-none absolute top-3 right-3 rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] text-foreground uppercase">
        After
      </span>
    </div>
  );
}
