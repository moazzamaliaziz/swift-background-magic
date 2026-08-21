import { useCallback, useEffect, useRef, useState } from "react";

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/heic"];

const SWATCHES = [
  { id: "transparent", label: "Transparent", css: "transparent" },
  { id: "white", label: "White", css: "#ffffff" },
  { id: "black", label: "Black", css: "#0a0a0a" },
  { id: "amber", label: "Amber", css: "#fcbb00" },
  { id: "emerald", label: "Emerald", css: "#00bb7f" },
  { id: "studio", label: "Studio grey", css: "#f2f1ee" },
] as const;

type Status = "idle" | "loading" | "done" | "error";

// ponytail: singleton loader + WebGPU pick — keeps model consistent and fast
let bgModulePromise: Promise<typeof import("@imgly/background-removal")> | null = null;
function loadBgModule() {
  if (typeof window === "undefined") return Promise.reject(new Error("browser-only"));
  if (!bgModulePromise) bgModulePromise = import("@imgly/background-removal");
  return bgModulePromise;
}
function pickDevice(): "gpu" | "cpu" {
  try {
    if (typeof navigator !== "undefined" && (navigator as unknown as { gpu?: unknown }).gpu) return "gpu";
  } catch {}
  return "cpu";
}
function preloadModel() {
  if (typeof window === "undefined") return;
  loadBgModule().catch(() => {});
}

// color helpers — HEX/RGB instant parsing
function isValidHex(v: string): boolean {
  return /^#([0-9A-F]{3}){1,2}$/i.test(v.trim());
}
function parseRgbInput(v: string): string | null {
  const s = v.trim();
  // rgb(255, 0, 128) or 255,0,128 or 255 0 128
  const m1 = s.match(/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i);
  if (m1) {
    const [r, g, b] = [Number(m1[1]), Number(m1[2]), Number(m1[3])];
    if ([r, g, b].every((n) => n >= 0 && n <= 255)) return `#${[r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
  }
  const m2 = s.match(/^(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})$/);
  if (m2) {
    const [r, g, b] = [Number(m2[1]), Number(m2[2]), Number(m2[3])];
    if ([r, g, b].every((n) => n >= 0 && n <= 255)) return `#${[r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
  }
  const m3 = s.match(/^(\d{1,3})\s+(\d{1,3})\s+(\d{1,3})$/);
  if (m3) {
    const [r, g, b] = [Number(m3[1]), Number(m3[2]), Number(m3[3])];
    if ([r, g, b].every((n) => n >= 0 && n <= 255)) return `#${[r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
  }
  return null;
}
function normalizeColorInput(v: string): string | null {
  const s = v.trim();
  if (!s) return null;
  if (isValidHex(s)) {
    // expand #abc -> #aabbcc
    if (s.length === 4) return `#${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}`.toLowerCase();
    return s.toLowerCase();
  }
  const rgbHex = parseRgbInput(s);
  if (rgbHex) return rgbHex;
  return null;
}

export function BackgroundRemoverTool() {
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [cutoutUrl, setCutoutUrl] = useState<string | null>(null);
  const [cutoutBlob, setCutoutBlob] = useState<Blob | null>(null);
  const [fileName, setFileName] = useState("image");
  const [bg, setBg] = useState<string>("transparent");
  const [customColor, setCustomColor] = useState<string>("#fcbb00");
  const [colorInput, setColorInput] = useState<string>("");
  const [colorError, setColorError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const originalUrlRef = useRef<string | null>(null);
  const cutoutUrlRef = useRef<string | null>(null);

  // fast: warm model on mount
  useEffect(() => { preloadModel(); }, []);

  // cleanup blob URLs on unmount or change
  useEffect(() => {
    originalUrlRef.current = originalUrl;
    cutoutUrlRef.current = cutoutUrl;
  }, [originalUrl, cutoutUrl]);
  useEffect(() => {
    return () => {
      if (originalUrlRef.current) URL.revokeObjectURL(originalUrlRef.current);
      if (cutoutUrlRef.current) URL.revokeObjectURL(cutoutUrlRef.current);
    };
  }, []);

  const reset = useCallback(() => {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (cutoutUrl) URL.revokeObjectURL(cutoutUrl);
    setStatus("idle");
    setError(null);
    setOriginalUrl(null);
    setCutoutUrl(null);
    setCutoutBlob(null);
    setElapsed(null);
    setProgress(0);
    setStage("");
    setBg("transparent");
    setCustomColor("#fcbb00");
    setColorInput("");
    setColorError(null);
  }, [originalUrl, cutoutUrl]);

  const run = useCallback(async (file: File) => {
    if (!ACCEPTED.includes(file.type) && !/\.(jpe?g|png|webp|avif|heic)$/i.test(file.name)) {
      setStatus("error");
      setError("That file type isn't supported. Use JPG, PNG, WebP, AVIF or HEIC.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setStatus("error");
      setError(`That file is ${(file.size / 1048576).toFixed(1)}MB. The limit is 10MB.`);
      return;
    }

    // revoke previous URLs to avoid leaks and ensure state consistency
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (cutoutUrl) URL.revokeObjectURL(cutoutUrl);
    setError(null);
    setCutoutUrl(null);
    setCutoutBlob(null);
    setElapsed(null);
    setProgress(0);
    setStage("Warming up the model…");
    setStatus("loading");
    setFileName(file.name.replace(/\.[^.]+$/, ""));
    const url = URL.createObjectURL(file);
    setOriginalUrl(url);

    const started = performance.now();
    try {
      const mod = await loadBgModule();
      const device = pickDevice();
      const blob = await mod.removeBackground(file, {
        device,
        output: { format: "image/png", quality: 1 },
        progress: (key: string, current: number, total: number) => {
          const pct = total ? Math.round((current / total) * 100) : 0;
          setProgress(pct);
          setStage(
            key.startsWith("fetch")
              ? `Downloading model — ${pct}% (one time only)`
              : `Separating subject — ${pct}%`,
          );
        },
      });
      const outUrl = URL.createObjectURL(blob);
      setCutoutBlob(blob);
      setCutoutUrl(outUrl);
      setElapsed((performance.now() - started) / 1000);
      setStatus("done");
    } catch (e) {
      console.error(e);
      setStatus("error");
      setError("The cutout failed on this image. Try a smaller file or a different photo.");
    }
  }, [originalUrl, cutoutUrl]);

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const file = Array.from(e.clipboardData?.files ?? [])[0];
      if (file) void run(file);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [run]);

  // instant preview: resolve display color without re-running model
  const previewBgCss = (() => {
    if (bg === "transparent") return "transparent";
    if (bg === "custom") return customColor;
    return SWATCHES.find((s) => s.id === bg)?.css ?? "#ffffff";
  })();
  const isCustom = bg === "custom";

  const handleColorInput = (val: string) => {
    setColorInput(val);
    const norm = normalizeColorInput(val);
    if (!val.trim()) {
      setColorError(null);
      return;
    }
    if (norm) {
      setCustomColor(norm);
      setBg("custom");
      setColorError(null);
    } else {
      setColorError("Use HEX #fcbb00 or RGB 255, 0, 128");
    }
  };

  const download = async () => {
    if (!cutoutUrl || !cutoutBlob) return;
    // preserve original dimensions: use naturalWidth/Height from decoded image, no scaling
    if (bg === "transparent" && !isCustom) {
      // fastest path — no canvas, no recompression, original pixels preserved
      triggerDownload(cutoutUrl, `${fileName}-cutout.png`);
      return;
    }
    const colorCss = isCustom ? customColor : previewBgCss;
    const img = new Image();
    // ponytail: decode() is faster than onload and avoids layout thrash
    img.src = cutoutUrl;
    await img.decode();
    const canvas = document.createElement("canvas");
    // preserve original dimensions exactly — no upscaling/downscaling
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d", { alpha: false })!;
    // fill background first, then draw cutout — preserves every pixel of subject
    ctx.fillStyle = colorCss;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    // use toBlob with quality 1 for lossless PNG — no compression loss
    const blob: Blob | null = await new Promise((r) => canvas.toBlob((b) => r(b), "image/png", 1));
    if (!blob) {
      setError("Export failed — try PNG transparent.");
      return;
    }
    triggerDownload(URL.createObjectURL(blob), `${fileName}-cutout.png`);
  };

  const activeBg = bg === "custom" ? { id: "custom", css: customColor } as const : SWATCHES.find((s) => s.id === bg)!;

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-float">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-success" />
          <span className="label-mono">On-device engine ready</span>
        </div>
        <span className="label-mono">JPG · PNG · WebP · AVIF · HEIC · max 10MB</span>
      </div>

      <div className="grid gap-0 lg:grid-cols-[1.35fr_1fr]">
        {/* Canvas */}
        <div className="relative min-h-[420px] border-b border-border p-5 lg:border-r lg:border-b-0">
          {status === "idle" && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onMouseEnter={preloadModel}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const file = e.dataTransfer.files?.[0];
                if (file) void run(file);
              }}
              className={`grid h-full min-h-[380px] w-full place-items-center rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
                dragOver ? "border-accent bg-accent/10" : "border-border bg-surface hover:border-foreground"
              }`}
            >
              <span>
                <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-background text-xl shadow-lift">
                  ↑
                </span>
                <span className="block font-display text-xl font-semibold">
                  Drop an image, or click to browse
                </span>
                <span className="mt-2 block text-sm text-muted-foreground">
                  You can also paste from the clipboard with ⌘V. Nothing is uploaded — the cutout
                  happens inside this tab.
                </span>
              </span>
            </button>
          )}

          {status === "loading" && (
            <div className="grid h-full min-h-[380px] place-items-center rounded-2xl bg-surface p-8 text-center">
              <div className="w-full max-w-sm">
                {originalUrl && (
                  <img
                    src={originalUrl}
                    alt="Image being processed"
                    className="mx-auto mb-6 h-40 w-40 animate-pulse rounded-xl object-cover"
                    width={160}
                    height={160}
                  />
                )}
                <p className="font-display text-lg font-semibold">{stage}</p>
                <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-foreground transition-all duration-200"
                    style={{ width: `${Math.max(6, progress)}%` }}
                  />
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  First run downloads the model once. Every image after that is near-instant.
                </p>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="grid h-full min-h-[380px] place-items-center rounded-2xl bg-surface p-8 text-center">
              <div>
                <p className="font-display text-lg font-semibold text-destructive">{error}</p>
                <button type="button" onClick={reset} className="btn-ink mt-5">
                  Try another image
                </button>
              </div>
            </div>
          )}

          {status === "done" && cutoutUrl && (
            <div
              className={`relative grid h-full min-h-[380px] place-items-center overflow-hidden rounded-2xl ${
                bg === "transparent" ? "checkerboard" : ""
              }`}
              style={bg === "transparent" ? undefined : { backgroundColor: previewBgCss }}
            >
              <img
                src={showOriginal ? originalUrl! : cutoutUrl}
                alt={showOriginal ? "Original image" : "Image with the background removed"}
                className="max-h-[420px] w-auto max-w-full object-contain p-4"
                width={800}
                height={600}
              />
              <button
                type="button"
                onPointerDown={() => setShowOriginal(true)}
                onPointerUp={() => setShowOriginal(false)}
                onPointerLeave={() => setShowOriginal(false)}
                className="absolute bottom-3 left-3 rounded-full border border-border bg-background/90 px-3 py-1.5 text-xs font-semibold backdrop-blur"
              >
                Hold to compare
              </button>
              {elapsed !== null && (
                <span className="absolute top-3 right-3 rounded-full bg-success/20 px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] uppercase">
                  Done in {elapsed.toFixed(1)}s
                </span>
              )}
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif,image/heic,image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void run(file);
              e.target.value = "";
            }}
          />
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6 p-5">
          <div>
            <p className="label-mono">Background</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {SWATCHES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  title={s.label}
                  aria-label={s.label}
                  onClick={() => {
                    setBg(s.id);
                    setColorError(null);
                  }}
                  className={`h-9 w-9 rounded-full border transition-transform ${
                    bg === s.id ? "scale-110 border-foreground" : "border-border"
                  } ${s.id === "transparent" ? "checkerboard" : ""}`}
                  style={s.id === "transparent" ? undefined : { backgroundColor: s.css }}
                />
              ))}
              <label className={`h-9 w-9 rounded-full border flex items-center justify-center cursor-pointer transition-transform ${bg === "custom" ? "scale-110 border-foreground" : "border-border bg-background"}`} title="Custom color">
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => {
                    setCustomColor(e.target.value);
                    setBg("custom");
                    setColorInput(e.target.value);
                    setColorError(null);
                  }}
                  className="sr-only"
                  aria-label="Pick custom color"
                />
                <span className="w-5 h-5 rounded-full border border-border" style={{ backgroundColor: customColor }} />
              </label>
            </div>

            {/* instant HEX/RGB input */}
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={colorInput}
                onChange={(e) => handleColorInput(e.target.value)}
                placeholder="#fcbb00 or 255, 187, 0"
                aria-label="Custom background color (HEX or RGB)"
                className="flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm font-mono placeholder:text-muted-foreground/50 focus:border-foreground focus:outline-none"
              />
              <input
                type="color"
                value={customColor}
                onChange={(e) => {
                  setCustomColor(e.target.value);
                  setColorInput(e.target.value);
                  setBg("custom");
                  setColorError(null);
                }}
                aria-label="Color picker"
                className="h-9 w-9 rounded-full border border-border p-1 bg-background cursor-pointer"
              />
            </div>
            {colorError ? <p className="mt-2 text-xs text-destructive" role="alert">{colorError}</p> : <p className="mt-2 text-xs text-muted-foreground">Instant preview — type HEX #fcbb00 or RGB 252, 187, 0</p>}
          </div>

          <div className="flex flex-col gap-2">
            <button type="button" onClick={download} disabled={status !== "done"} className="btn-accent">
              Download PNG
            </button>
            <button type="button" onClick={() => inputRef.current?.click()} className="btn-ghost">
              {status === "done" ? "Remove another" : "Choose a file"}
            </button>
          </div>

          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border">
            {[
              ["Runs on", "Your device"],
              ["Uploads", "None"],
              ["Watermark", "Never"],
              ["Cost", "Free"],
            ].map(([k, v]) => (
              <div key={k} className="bg-card p-3">
                <dt className="label-mono">{k}</dt>
                <dd className="mt-1 text-sm font-semibold">{v}</dd>
              </div>
            ))}
          </dl>

          <p className="text-xs leading-relaxed text-muted-foreground">
            Tip: photos with a clear subject and even lighting give the crispest edges. For long
            flyaway hair, export transparent and feather in your editor.
          </p>
        </div>
      </div>
    </div>
  );
}

function triggerDownload(href: string, name: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = name;
  a.click();
  // revoke after delay to allow download to start
  setTimeout(() => {
    try { URL.revokeObjectURL(href); } catch {}
  }, 4000);
}
