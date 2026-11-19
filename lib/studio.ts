// src/lib/studio.ts
// Gets every published item that has drawings, for the Style Studio.
import { connection } from "next/server";
import { sql } from "@/lib/db";

export type BodyShape = "hourglass" | "pear";

export type StudioItem = {
  id: number;
  name: string;
  slot: string;
  amazon_url: string;
  why_it_works: string;
  price_range: string;
  drawings: Partial<Record<BodyShape, string>>; // body shape → drawing file
};

export async function getStudioItems(): Promise<StudioItem[]> {
  await connection();
  const db = sql();
  const rows = await db`
    select i.id, i.name, i.slot, i.amazon_url, i.why_it_works, i.price_range,
           d.body_shape, d.svg_url
    from items i
    join item_drawings d on d.item_id = i.id
    where i.status = 'published'
    order by i.id`;

  // The database gives one row per drawing. Group them: one item, many drawings.
  const byId = new Map<number, StudioItem>();
  for (const row of rows) {
    if (!byId.has(row.id)) {
      byId.set(row.id, {
        id: row.id,
        name: row.name,
        slot: row.slot,
        amazon_url: row.amazon_url,
        why_it_works: row.why_it_works,
        price_range: row.price_range,
        drawings: {},
      });
    }
    byId.get(row.id)!.drawings[row.body_shape as BodyShape] = row.svg_url;
  }
  return [...byId.values()];
}