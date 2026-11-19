"use client";

import { useActionState, useState } from "react";
import { saveItem, type ItemFormState } from "@/app/admin/item-actions";
import type { AdminItem } from "@/lib/items";
import { SLOTS } from "@/lib/items";

const start: ItemFormState = { errors: {}, message: "" };

// Turns a saved date into the format the date box needs, in YOUR time zone
function toLocalInput(value: string | Date | null): string {
  if (!value) return "";
  const d = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function ItemForm({ item }: { item?: AdminItem }) {
  const [state, formAction, pending] = useActionState(saveItem, start);
  // After an error, show what you typed; otherwise show the saved item (or empty)
  const v = state.values ?? {
    name: item?.name ?? "",
    slot: item?.slot ?? "top",
    amazon_url: item?.amazon_url ?? "",
    why_it_works: item?.why_it_works ?? "",
    price_range: item?.price_range ?? "",
    status: item?.status ?? "draft",
    publish_at: item?.publish_at ? new Date(item.publish_at).toISOString() : "",
  };

  return (
    // A new key after each failed save redraws the form with what you typed
    <FormBody key={state.attempt ?? 0} v={v} e={state.errors} message={state.message}
      formAction={formAction} pending={pending} itemId={item?.id} />
  );
}

type BodyProps = {
  v: Record<string, string>;
  e: Record<string, string>;
  message: string;
  formAction: (formData: FormData) => void;
  pending: boolean;
  itemId?: number;
};

function FormBody({ v, e, message, formAction, pending, itemId }: BodyProps) {
  const [localDate, setLocalDate] = useState(toLocalInput(v.publish_at || null));
  const item = itemId ? { id: itemId } : undefined;

  return (
    <form action={formAction} className="grid gap-5 rounded-2xl bg-white p-5">
      {item && <input type="hidden" name="id" value={item.id} />}

      <Field label="Item name" name="name" error={e.name}>
        <input id="name" name="name" defaultValue={v.name} className={inputClass} />
      </Field>

      <Field label="Where she wears it (slot)" name="slot" error={e.slot}>
        <select id="slot" name="slot" defaultValue={v.slot} className={inputClass}>
          {SLOTS.map((slot) => (
            <option key={slot} value={slot}>{slot}</option>
          ))}
        </select>
      </Field>

      <Field label="Amazon link (from SiteStripe)" name="amazon_url" error={e.amazon_url}>
        <input id="amazon_url" name="amazon_url" defaultValue={v.amazon_url} placeholder="https://amzn.to/…" className={inputClass} />
      </Field>

      <Field label="Why it works (one sentence)" name="why_it_works" error={e.why_it_works}>
        <textarea id="why_it_works" name="why_it_works" defaultValue={v.why_it_works} rows={2} className={`${inputClass} py-3`} />
      </Field>

      <Field label="Price range" name="price_range" error={e.price_range}>
        <input id="price_range" name="price_range" defaultValue={v.price_range} placeholder="$20–30" className={inputClass} />
      </Field>

      <fieldset className="grid gap-2">
        <legend className="text-sm font-semibold">Status</legend>
        <label className="flex items-center gap-2">
          <input type="radio" name="status" value="draft" defaultChecked={v.status !== "published"} /> Draft (only you can see it)
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" name="status" value="published" defaultChecked={v.status === "published"} /> Published
        </label>
      </fieldset>

      <Field label="Show it from (leave empty for right away)" name="publish_at" error={e.publish_at}>
        <input id="publish_at" type="datetime-local" value={localDate} onChange={(ev) => setLocalDate(ev.target.value)} className={inputClass} />
      </Field>
      {/* The server runs in a different time zone, so send the exact moment */}
      <input type="hidden" name="publish_at" value={localDate ? new Date(localDate).toISOString() : ""} />

      <Field label={`Hourglass drawing (SVG)${item ? " — leave empty to keep the current one" : ""}`} name="drawing_hourglass" error={e.drawing_hourglass}>
        <input id="drawing_hourglass" name="drawing_hourglass" type="file" accept=".svg,image/svg+xml" />
      </Field>
      <Field label={`Pear drawing (SVG)${item ? " — leave empty to keep the current one" : ""}`} name="drawing_pear" error={e.drawing_pear}>
        <input id="drawing_pear" name="drawing_pear" type="file" accept=".svg,image/svg+xml" />
      </Field>

      {message && <p role="alert" className="font-semibold text-brick-text">{message}</p>}

      <button type="submit" disabled={pending}
        className="min-h-11 rounded-full bg-eucalyptus px-5 font-semibold text-white hover:bg-ink disabled:opacity-60">
        {pending ? "Saving…" : "Save item"}
      </button>
    </form>
  );
}

const inputClass = "min-h-12 w-full rounded-xl border-[1.5px] border-floor bg-background px-4";

function Field({ label, name, error, children }: { label: string; name: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1">
      <label htmlFor={name} className="text-sm font-semibold">{label}</label>
      {children}
      {error && <p className="text-sm text-brick-text">{error}</p>}
    </div>
  );
}