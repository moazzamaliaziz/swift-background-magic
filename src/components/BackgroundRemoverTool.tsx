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
];

type Status = "idle" | "loading" | "done" | "error";

export function BackgroundRemoverTool() {
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [cutoutUrl, setCutoutUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("image");
  const [bg, setBg] = useState("transparent");
  const [elapsed, setElapsed] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStatus("idle");
    setError(null);
    setOriginalUrl(null);
    setCutoutUrl(null);
    setElapsed(null);
    setProgress(0);
    setBg("transparent");
  };

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

    setError(null);
    setCutoutUrl(null);
    setElapsed(null);
    setProgress(0);
    setStage("Warming up the model…");
    setStatus("loading");
    setFileName(file.name.replace(/\.[^.]+$/, ""));
    setOriginalUrl(URL.createObjectURL(file));

    const started = performance.now();
    try {
      const { removeBackground } = await import("@imgly/background-removal");
      const blob = await removeBackground(file, {
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
      setCutoutUrl(URL.createObjectURL(blob));
      setElapsed((performance.now() - started) / 1000);
      setStatus("done");
    } catch (e) {
      console.error(e);
      setStatus("error");
      setError("The cutout failed on this image. Try a smaller file or a different photo.");
    }
  }, []);

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const file = Array.from(e.clipboardData?.files ?? [])[0];
      if (file) void run(file);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [run]);

  const download = async () => {
    if (!cutoutUrl) return;
    if (bg === "transparent") {
      triggerDownload(cutoutUrl, `${fileName}-cutout.png`);
      return;
    }
    const img = new Image();
    img.src = cutoutUrl;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = SWATCHES.find((s) => s.id === bg)?.css ?? "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    triggerDownload(canvas.toDataURL("image/png"), `${fileName}-cutout.png`);
  };

  const activeBg = SWATCHES.find((s) => s.id === bg)!;

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
              style={bg === "transparent" ? undefined : { backgroundColor: activeBg.css }}
            >
              <img
                src={showOriginal ? originalUrl! : cutoutUrl}
                alt={showOriginal ? "Original image" : "Image with the background removed"}
                className="max-h-[420px] w-auto max-w-full object-contain p-4"
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
            accept="image/*"
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
                  onClick={() => setBg(s.id)}
                  className={`h-9 w-9 rounded-full border transition-transform ${
                    bg === s.id ? "scale-110 border-foreground" : "border-border"
                  } ${s.id === "transparent" ? "checkerboard" : ""}`}
                  style={s.id === "transparent" ? undefined : { backgroundColor: s.css }}
                />
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Applied on download. Transparent exports a clean alpha-channel PNG.
            </p>
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
}
