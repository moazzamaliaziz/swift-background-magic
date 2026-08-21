# Motionix — Background Remover, Design System

Editorial monochrome with a single amber signal colour. Built to read as a premium
SaaS tool page (remove.bg / Pixelcut / Adobe Express) without the purple-gradient
sameness: black ink on paper, tight display type, hairline rules, one accent.

## 1. Colour tokens

All tokens live in `src/styles.css` (`:root` + `@theme inline`) in `oklch`.
Components never hardcode colours — always semantic classes (`bg-surface`,
`text-muted-foreground`, `btn-accent`).

| Token | Value (hex ref) | Use |
| --- | --- | --- |
| `--background` | `#ffffff` | Page paper |
| `--foreground` | `#0a0a0a` | Ink, headings, primary button fill |
| `--surface` | `#f8f7f4` | Alternating section bands, cards on white |
| `--muted-foreground` | `#7a7873` | Body copy, mono labels, table secondary column |
| `--accent` | `#fcbb00` | Primary CTA gradient, step numbers, drag-over state |
| `--success` | `#00bb7f` | Privacy / "ready" indicators, pros checkmarks |
| `--destructive` | `#e40014` | Upload + processing errors |
| `--border` | `#e5e3df` | Hairline rules, 1px grid gaps |

Kept identical to the live Motionix palette (near-black `#0a0a0a`, white, amber
`#fcbb00`, emerald `#00bb7f`).

## 2. Typography

- Display: **Inter Tight**, 700, `-0.03em` tracking — h1–h3.
- Body: **Inter**, 400/500 — paragraphs, UI.
- Labels: **JetBrains Mono**, 11px, `0.14em`, uppercase (`.label-mono` utility) —
  section eyebrows and meta rows.
- Scale: h1 `text-5xl → text-7xl`, h2 `text-4xl`, h3 `text-lg/2xl`, body `text-base`,
  meta `text-sm/xs`.

Fonts are loaded with a `<link>` in `src/routes/__root.tsx` (never `@import` in CSS).

## 3. Layout

- Container `max-w-6xl`, side padding `px-5`.
- Sections alternate `bg-background` / `bg-surface`, separated by `border-y`.
- Card grids use a 1px `bg-border` gap trick (`grid gap-px bg-border` + `bg-card`
  children) instead of shadows — the hairline grid is the signature.
- Radius: `--radius: 0.75rem`; tool shell `rounded-3xl`, media `rounded-2xl`,
  buttons fully rounded.
- Elevation: only two shadows — `shadow-lift` (resting) and `shadow-float`
  (tool shell, hover).

## 4. Components

| Utility / component | Purpose |
| --- | --- |
| `.btn-ink` | Primary dark pill (nav CTA, retry) |
| `.btn-accent` | Amber gradient pill — the single hero/download CTA |
| `.btn-ghost` | Outlined pill, secondary actions |
| `.checkerboard` | Transparency chequer for canvas and swatch |
| `.grid-paper` | Faint 48px grid behind the hero |
| `.label-mono` | Mono uppercase eyebrow |
| `BeforeAfterSlider` | Pointer-driven clip-path comparison, drag handle |
| `BackgroundRemoverTool` | Full tool: dropzone → progress → canvas → export |

## 5. Motion

Restrained. 180ms ease transforms on buttons (`translateY(-1px)`), 200ms width
transition on the progress bar, pulse on the processing thumbnail, `group-open`
rotation on FAQ toggles. No scroll-triggered fades.

## 6. Page structure

1. Sticky hairline header
2. Hero — badge, two-tone h1, dual CTA, trust row (grid-paper background)
3. **The tool** (highest on the page, above all marketing)
4. Examples — two before/after sliders
5. Guide — 3 zig-zag steps with illustrations
6. Key features — 6-card hairline grid
7. Pros + comparison table
8. Use cases — 4-card row
9. FAQ — native `<details>`
10. Ink CTA band + minimal footer

## 7. Tool behaviour

- Engine: `@imgly/background-removal`, dynamically imported client-side so SSR
  never loads WASM. Model is fetched once, then cached — first run shows a
  "downloading model" progress state, subsequent runs are sub-second.
- Input: click, drag-drop, or clipboard paste. Validates type
  (JPG/PNG/WebP/AVIF/HEIC) and 10MB size before doing any work.
- Output: transparent PNG by default; coloured backgrounds are composited on a
  canvas at download time so the original alpha is never destroyed.
- "Hold to compare" swaps the cutout for the original while pressed.

## 8. Accessibility

- Ink-on-paper contrast ≥ 12:1; amber is only ever used behind `#0a0a0a` text.
- Every swatch and icon button carries `aria-label` / `title`.
- Single `h1`, sequential headings, descriptive `alt` on all imagery, `loading="lazy"`
  on everything below the fold.
