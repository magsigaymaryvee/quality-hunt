"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { checkAmazonLink } from "@/lib/amazon";
import { SLOTS } from "@/lib/items";
import { checkSvg } from "@/lib/svg";

export type ItemFormState = {
  errors: Record<string, string>; // field name → message
  message: string;
  values?: Record<string, string>; // what you typed, so it isn't lost when there's an error
  attempt?: number;
};

// The rules every item must follow. The server checks them, so nobody can skip them.
const ItemSchema = z.object({
  name: z.string().trim().min(2, "Give the item a name.").max(80, "Keep the name under 80 characters."),
  slot: z.enum(SLOTS, "Pick where she wears it."),
  amazon_url: z.string().trim().min(1, "Paste the Amazon link."),
  why_it_works: z.string().trim().min(10, "Say why it works in a short sentence.").max(200, "Keep it under 200 characters."),
  price_range: z.string().trim().min(2, "Add a price range, like $20–30.").max(20, "Keep the price short."),
  status: z.enum(["draft", "published"]),
  publish_at: z.string().trim(), // empty = now
});

export async function saveItem(prev: ItemFormState, formData: FormData): Promise<ItemFormState> {
  await requireAdmin(); // only you can save items

  const parsed = ItemSchema.safeParse(Object.fromEntries(formData));
  const errors: Record<string, string> = {};
  if (!parsed.success) {
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] ??= issue.message;
  }

  const linkError = checkAmazonLink(String(formData.get("amazon_url") ?? "").trim());
  if (linkError && !errors.amazon_url) errors.amazon_url = linkError;

  // Read both drawing files (empty when you didn't choose a new one)
  const files: Record<string, string> = {};
  for (const shape of ["hourglass", "pear"]) {
    const file = formData.get(`drawing_${shape}`);
    files[shape] = file instanceof File && file.size > 0 ? await file.text() : "";
    const svgError = checkSvg(files[shape], shape === "hourglass" ? "Hourglass drawing" : "Pear drawing");
    if (svgError) errors[`drawing_${shape}`] = svgError;
  }

  let publishAt: string | null = null;
  if (parsed.success && parsed.data.publish_at) {
    const date = new Date(parsed.data.publish_at);
    if (Number.isNaN(date.getTime())) errors.publish_at = "That date doesn't look right.";
    else publishAt = date.toISOString();
  }

  const id = Number(formData.get("id")) || null; // empty = a new item
  if (!id && (!files.hourglass || !files.pear) && parsed.success && parsed.data.status === "published") {
    errors.drawing_hourglass ??= "A published item needs both drawings.";
  }

  if (!parsed.success || Object.keys(errors).length > 0) {
    const values: Record<string, string> = {};
    for (const key of ["name", "slot", "amazon_url", "why_it_works", "price_range", "status", "publish_at"]) {
      values[key] = String(formData.get(key) ?? "");
    }
    const fileNote = files.hourglass || files.pear ? " Choose the drawing files again." : "";
    return { errors, message: `Please fix the marked fields.${fileNote}`, values, attempt: (prev.attempt ?? 0) + 1 };
  }

  const item = parsed.data;
  const db = sql();
  let itemId = id;
  if (itemId) {
    await db`
      update items set name = ${item.name}, slot = ${item.slot}, amazon_url = ${item.amazon_url},
        why_it_works = ${item.why_it_works}, price_range = ${item.price_range},
        status = ${item.status}, publish_at = ${publishAt}
      where id = ${itemId}`;
  } else {
    const rows = await db`
      insert into items (name, slot, amazon_url, why_it_works, price_range, status, publish_at)
      values (${item.name}, ${item.slot}, ${item.amazon_url}, ${item.why_it_works},
              ${item.price_range}, ${item.status}, ${publishAt})
      returning id`;
    itemId = rows[0].id as number;
  }

  // Save each new drawing (replaces the old one for that body shape)
  for (const shape of ["hourglass", "pear"]) {
    if (!files[shape]) continue;
    const url = `/api/drawings/${itemId}/${shape}`;
    await db`
      insert into item_drawings (item_id, body_shape, svg_url, svg)
      values (${itemId}, ${shape}, ${url}, ${files[shape]})
      on conflict (item_id, body_shape) do update set svg_url = ${url}, svg = ${files[shape]}`;
  }

  redirect(`/admin/items/${itemId}?saved=1`);
}