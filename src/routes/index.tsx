import { createFileRoute } from "@tanstack/react-router";
import { BackgroundRemoverTool } from "@/components/BackgroundRemoverTool";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import productBefore from "@/assets/example-product-before.jpg";
import productAfter from "@/assets/example-product-after.png";
import portraitBefore from "@/assets/example-portrait-before.jpg";
import portraitAfter from "@/assets/example-portrait-after.png";
import step1 from "@/assets/guide-step-1.jpg";
import step2 from "@/assets/guide-step-2.jpg";
import step3 from "@/assets/guide-step-3.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "Free Background Remover — Instant Transparent PNGs | Motionix",
      },
      {
        name: "description",
        content:
          "Remove image backgrounds in seconds, free and private. The AI runs on your device, exports transparent PNGs with no watermark, no signup, no uploads.",
      },
      { property: "og:title", content: "Free Background Remover — Motionix" },
      {
        property: "og:description",
        content:
          "Drop a photo, get a clean transparent PNG in under a second. On-device AI, no uploads, no watermark, unlimited and free.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

const FEATURES = [
  {
    k: "01",
    t: "On-device AI",
    d: "The segmentation model downloads once and then runs on your CPU or GPU. Your photos never touch a server.",
  },
  {
    k: "02",
    t: "Sub-second cutouts",
    d: "After the first warm-up, each image is separated in well under a second — no upload wait, no queue.",
  },
  {
    k: "03",
    t: "True alpha edges",
    d: "Soft matting keeps hair, fur and semi-transparent edges intact instead of hard-clipping the mask.",
  },
  {
    k: "04",
    t: "Any background",
    d: "Export transparent, or drop the subject onto white, black, studio grey, or a brand colour before download.",
  },
  {
    k: "05",
    t: "No watermark, no limits",
    d: "Full resolution out, no credits, no signup, no export cap. What you drop in is what you get back.",
  },
  {
    k: "06",
    t: "Works offline",
    d: "Once the model is cached, the tool keeps working on a plane, in a basement, or behind a firewall.",
  },
];

const PROS = [
  "Free forever — no credits, no paywalled resolutions",
  "Private by design: zero uploads, nothing retained",
  "No signup, no email, no watermark",
  "Full-resolution PNG with a real alpha channel",
  "Batch-friendly: every image after the first is instant",
  "Works on product shots, portraits, pets and graphics",
];

const STEPS = [
  {
    n: "01",
    t: "Drop your image",
    d: "Drag a JPG, PNG, WebP, AVIF or HEIC up to 10MB into the canvas — or paste it straight from your clipboard with ⌘V. The model downloads the very first time you do this, once.",
    img: step1,
    alt: "Illustration of a photo being dragged into a dashed upload area",
  },
  {
    n: "02",
    t: "Pick your background",
    d: "The subject is separated automatically. Keep it transparent, or choose white for marketplaces, black for dark decks, or a brand colour for social posts. Hold the compare button to check the edges against the original.",
    img: step2,
    alt: "Illustration of a cutout on a transparent checkerboard with colour swatches",
  },
  {
    n: "03",
    t: "Download the PNG",
    d: "One click gives you a full-resolution PNG. No watermark, no recompression, no account. Drop the next image straight in — it will finish in under a second.",
    img: step3,
    alt: "Illustration of a download button next to a transparent PNG file",
  },
];

const USE_CASES = [
  ["Product listings", "Clean white or transparent backdrops for Shopify, Etsy and Amazon."],
  ["Profile photos", "Sharp headshots for LinkedIn, Slack, Discord and press kits."],
  ["Pet portraits", "Fur is handled properly — cats included, dogs slightly easier."],
  ["Decks & thumbnails", "Cut a subject out and drop it into a slide, banner or YouTube thumbnail."],
];

const FAQ = [
  [
    "Is it really free?",
    "Yes. There is no paid tier for the background remover, no credit system and no ads layered over your work.",
  ],
  [
    "Where do my photos go?",
    "Nowhere. The AI model is fetched from our CDN once and then runs entirely in your browser. The image bytes never leave your device.",
  ],
  [
    "How big can an image be?",
    "Up to 10MB and 4096px on the long side. Larger images are downscaled before processing.",
  ],
  [
    "How well does it handle hair?",
    "About as well as the paid tools. Short hair and fur are excellent; very fine flyaway strands can get slightly soft edges.",
  ],
  [
    "Can I export with a coloured background?",
    "Yes — pick a swatch before downloading. The default is a transparent PNG with a real alpha channel.",
  ],
  [
    "Does it work on video or GIFs?",
    "Not here. Video background removal needs server-side processing and is a separate tool.",
  ],
];

function Page() {
  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <a href="/" className="font-display text-lg font-bold tracking-tight">
            motion<span className="text-muted-foreground">ix</span>
          </a>
          <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex">
            <a href="#tool" className="hover:text-foreground">Tool</a>
            <a href="#guide" className="hover:text-foreground">Guide</a>
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#faq" className="hover:text-foreground">FAQ</a>
          </nav>
          <a href="#tool" className="btn-ink px-4 py-2 text-sm">
            Remove a background
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="grid-paper border-b border-border">
        <div className="mx-auto max-w-6xl px-5 pt-16 pb-12 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            <span className="label-mono">100% in-browser · nothing uploaded</span>
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl font-display text-5xl leading-[0.95] font-bold md:text-7xl">
            Remove any background
            <span className="block text-muted-foreground">in about one second.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
            Drop a portrait, product shot or pet photo and get a full-resolution transparent PNG.
            Free, unlimited, watermark-free — and the image never leaves your tab.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <a href="#tool" className="btn-accent">Upload an image</a>
            <a href="#guide" className="btn-ghost">See how it works</a>
          </div>
          <div className="mx-auto mt-8 flex max-w-2xl flex-wrap items-center justify-center gap-x-8 gap-y-2">
            {["No signup", "No watermark", "No upload", "Unlimited"].map((t) => (
              <span key={t} className="label-mono">✓ {t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Tool */}
      <section id="tool" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-14">
        <BackgroundRemoverTool />
      </section>

      {/* Examples */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <p className="label-mono">Examples</p>
          <h2 className="mt-2 max-w-xl font-display text-4xl font-bold">
            Drag the handle. Same pixels, no background.
          </h2>
          <div className="mt-9 grid gap-8 md:grid-cols-2">
            <figure>
              <BeforeAfterSlider
                before={productBefore}
                after={productAfter}
                beforeAlt="White sneakers photographed on a cluttered wooden desk"
                afterAlt="The same sneakers cut out with a transparent background"
              />
              <figcaption className="mt-3 text-sm text-muted-foreground">
                Product photo → marketplace-ready cutout, edges and shadows intact.
              </figcaption>
            </figure>
            <figure>
              <BeforeAfterSlider
                before={portraitBefore}
                after={portraitAfter}
                beforeAlt="Portrait of a woman on a busy city street"
                afterAlt="The same portrait cut out with a transparent background"
              />
              <figcaption className="mt-3 text-sm text-muted-foreground">
                Busy street portrait → clean headshot, curly hair preserved.
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* Guide */}
      <section id="guide" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20">
        <p className="label-mono">The guide</p>
        <h2 className="mt-2 max-w-2xl font-display text-4xl font-bold">
          Three steps, about a minute end to end.
        </h2>
        <div className="mt-12 flex flex-col gap-14">
          {STEPS.map((s, i) => (
            <div
              key={s.n}
              className={`grid items-center gap-8 md:grid-cols-2 ${i % 2 ? "md:[&>figure]:order-2" : ""}`}
            >
              <div>
                <span className="font-mono text-sm font-semibold text-accent">{s.n}</span>
                <h3 className="mt-2 font-display text-2xl font-bold">{s.t}</h3>
                <p className="mt-3 max-w-md leading-relaxed text-muted-foreground">{s.d}</p>
              </div>
              <figure className="overflow-hidden rounded-2xl border border-border bg-surface">
                <img
                  src={s.img}
                  alt={s.alt}
                  loading="lazy"
                  width={992}
                  height={672}
                  className="h-full w-full object-cover"
                />
              </figure>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-y border-border bg-surface">
        <div className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20">
          <p className="label-mono">Key features</p>
          <h2 className="mt-2 max-w-2xl font-display text-4xl font-bold">
            Everything the paid removers charge for.
          </h2>
          <div className="mt-10 grid gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <article key={f.k} className="bg-card p-7">
                <span className="font-mono text-xs text-accent">{f.k}</span>
                <h3 className="mt-3 font-display text-lg font-bold">{f.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Pros */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <p className="label-mono">Pros</p>
            <h2 className="mt-2 font-display text-4xl font-bold">Why people switch to this one.</h2>
            <p className="mt-4 max-w-md text-muted-foreground">
              Most removers ask you to sign up, upload your photo to their servers, then hand back a
              downscaled preview until you pay. This one skips all three.
            </p>
            <ul className="mt-6 flex flex-col gap-3">
              {PROS.map((p) => (
                <li key={p} className="flex gap-3 text-sm">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/25 text-[11px] font-bold">
                    ✓
                  </span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="overflow-hidden rounded-3xl border border-border">
            <div className="grid grid-cols-3 gap-px bg-border">
              {["", "Motionix", "Typical tool"].map((h, i) => (
                <div key={i} className="bg-surface px-4 py-3">
                  <span className="label-mono">{h}</span>
                </div>
              ))}
              {[
                ["Price", "Free", "Credits"],
                ["Uploads photo", "No", "Yes"],
                ["Watermark", "No", "Sometimes"],
                ["Full resolution", "Always", "Paid tier"],
                ["Signup", "None", "Required"],
                ["Speed", "< 1s", "3–10s"],
              ].map((row) => (
                <div key={row[0]} className="contents">
                  <div className="bg-card px-4 py-3 text-sm text-muted-foreground">{row[0]}</div>
                  <div className="bg-card px-4 py-3 text-sm font-semibold">{row[1]}</div>
                  <div className="bg-card px-4 py-3 text-sm text-muted-foreground">{row[2]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <p className="label-mono">Use cases</p>
          <h2 className="mt-2 font-display text-4xl font-bold">People use it for…</h2>
          <div className="mt-8 grid gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {USE_CASES.map(([t, d]) => (
              <article key={t} className="bg-card p-6">
                <h3 className="font-display text-base font-bold">{t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-5 py-20">
        <p className="label-mono">FAQ</p>
        <h2 className="mt-2 font-display text-4xl font-bold">Frequently asked.</h2>
        <div className="mt-8 divide-y divide-border border-y border-border">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                {q}
                <span className="text-muted-foreground transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-primary text-primary-foreground">
        <div className="mx-auto max-w-6xl px-5 py-16 text-center">
          <h2 className="font-display text-4xl font-bold">Got an image? It takes a second.</h2>
          <p className="mx-auto mt-3 max-w-md opacity-70">
            Free, private, unlimited. No account, no watermark, no upload.
          </p>
          <a href="#tool" className="btn-accent mt-7">Remove a background</a>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-5 py-8">
        <p className="label-mono">Motionix · tools · background remover</p>
      </footer>
    </main>
  );
}
