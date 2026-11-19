// lib/items.ts
// The admin's database questions about items.
import { sql } from "@/lib/db";

export const SLOTS = [
  "top", "bottom", "outerwear", "shoes", "bag", "belt",
  "necklace", "scarf", "wrist", "earrings", "eyewear", "hat",
] as const;

export type AdminItem = {
  id: number;
  name: string;
  slot: string;
  amazon_url: string;
  why_it_works: string;
  price_range: string;
  status: "draft" | "published";
  publish_at: string | Date | null;
  drawings: number;
};

export async function listItems(): Promise<AdminItem[]> {
  const db = sql();
  const rows = await db`
    select i.*, (select count(*) from item_drawings d where d.item_id = i.id)::int as drawings
    from items i order by i.id desc`;
  return rows as AdminItem[];
}

export async function getItem(id: number): Promise<AdminItem | null> {
  const db = sql();
  const rows = await db`
    select i.*, (select count(*) from item_drawings d where d.item_id = i.id)::int as drawings
    from items i where i.id = ${id}`;
  return (rows[0] as AdminItem | undefined) ?? null;
}

export async function getDrawingUrls(id: number): Promise<Record<string, string>> {
  const db = sql();
  const rows = await db`select body_shape, svg_url from item_drawings where item_id = ${id}`;
  return Object.fromEntries(rows.map((r) => [r.body_shape, r.svg_url]));
}

// What a visitor sees for this item right now
export function itemStatusLabel(item: AdminItem): string {
  if (item.status === "draft") return "Draft";
  if (item.publish_at && new Date(item.publish_at) > new Date()) return "Scheduled";
  return "Live";
}