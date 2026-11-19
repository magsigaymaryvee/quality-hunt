"use client"; // the studio reacts to taps, so it runs in the browser

import { useState } from "react";
import Disclosure from "@/components/Disclosure";
import type { BodyShape, StudioItem } from "@/lib/studio";

// Bottom to top, same order as the layer frames in your Figma model
const LAYER_ORDER = [
  "bottom", "top", "belt", "necklace", "outerwear", "scarf",
  "shoes", "bag", "wrist", "earrings", "eyewear", "hat",
];

const SHAPES: { value: BodyShape; label: string }[] = [
  { value: "hourglass", label: "Hourglass" },
  { value: "pear", label: "Pear" },
];

const HAIRS = ["long", "bob", "bun", "curly", "ponytail", "pixie"];

export default function StudioClient({ items }: { items: StudioItem[] }) {
  const [shape, setShape] = useState<BodyShape>("hourglass");
  const [hair, setHair] = useState("long");
  const [wearing, setWearing] = useState<Record<string, number>>({}); // slot → item id

  // Tap once to wear. Tap again to take off. A new top replaces the old top.
  function toggle(item: StudioItem) {
    setWearing((prev) => {
      const next = { ...prev };
      if (next[item.slot] === item.id) delete next[item.slot];
      else next[item.slot] = item.id;
      return next;
    });
  }

  const available = items.filter((item) => item.drawings[shape]); // has a drawing for this shape
  const worn = LAYER_ORDER.map((slot) => available.find((item) => item.id === wearing[slot])).filter(
    (item): item is StudioItem => item !== undefined
  );
  const wornNames = worn.map((item) => item.name).join(", ");

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(260px,380px)_1fr]">
      {/* The model: layers stacked on top of each other */}
      <div className="h-fit rounded-3xl bg-wall p-3 md:sticky md:top-4">
        <div
          className="relative mx-auto aspect-[2/5] w-full max-w-[320px]"
          role="img"
          aria-label={`Model wearing ${wornNames || "the base outfit"}`}
        >
          <Layer src={`/studio/hair-back-${hair}.svg`} />
          <Layer src={`/studio/model-${shape}.svg`} />
          {worn.map((item) => (
            <Layer key={item.id} src={item.drawings[shape]!} />
          ))}
          <Layer src={`/studio/hair-front-${hair}.svg`} />
        </div>
      </div>

      <div className="grid content-start gap-6 rounded-3xl bg-white p-5">
        <ChipGroup label="Body shape">
          {SHAPES.map((s) => (
            <Chip key={s.value} on={shape === s.value} onClick={() => setShape(s.value)}>
              {s.label}
            </Chip>
          ))}
        </ChipGroup>

        <ChipGroup label="Hair">
          {HAIRS.map((h) => (
            <Chip key={h} on={hair === h} onClick={() => setHair(h)}>
              {h[0].toUpperCase() + h.slice(1)}
            </Chip>
          ))}
        </ChipGroup>

        <div className="grid gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide">Items</h2>
          {available.length === 0 ? (
            <p className="text-sm">No items yet. Check back soon.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {available.map((item) => {
                const isOn = wearing[item.slot] === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={isOn}
                    onClick={() => toggle(item)}
                    className={`grid gap-1 rounded-2xl border-[1.5px] p-3 text-left text-sm ${
                      isOn ? "border-eucalyptus bg-wall" : "border-floor bg-background"
                    }`}
                  >
                    <span className="font-semibold">{item.name}</span>
                    <span>{item.price_range}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide">Your look</h2>
          {worn.length === 0 ? (
            <p className="text-sm">Tap items to build a look.</p>
          ) : (
            <>
              <Disclosure />
              <ul className="grid gap-3">
                {worn.map((item) => (
                  <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-floor pb-3">
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm">{item.why_it_works}</p>
                    </div>
                    <a
                      href={item.amazon_url}
                      target="_blank"
                      rel="sponsored noopener"
                      className="inline-flex min-h-11 items-center rounded-full border-[1.5px] border-ink px-4 font-semibold hover:bg-wall"
                    >
                      Check price on Amazon
                      <span className="sr-only"> for {item.name} (opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Layer({ src }: { src: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" className="absolute inset-0 h-full w-full" />;
}

function ChipGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div role="group" aria-label={label} className="grid gap-2">
      <h2 className="text-xs font-semibold uppercase tracking-wide">{label}</h2>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`min-h-11 rounded-full border-[1.5px] px-4 ${
        on ? "border-mustard-soft bg-mustard-soft" : "border-ink bg-white"
      }`}
    >
      {children}
    </button>
  );
}