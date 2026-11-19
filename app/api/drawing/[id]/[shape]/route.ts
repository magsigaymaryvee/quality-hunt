// app/api/drawings/[id]/[shape]/route.ts  →  yoursite/api/drawings/7/pear
// Sends a drawing that was uploaded from the admin.
import { sql } from "@/lib/db";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string; shape: string }> }) {
  const { id, shape } = await params;
  const db = sql();
  const rows = await db`
    select d.svg from item_drawings d join items i on i.id = d.item_id
    where d.item_id = ${Number(id) || 0} and d.body_shape = ${shape} and d.svg is not null`;
  if (rows.length === 0) return new Response("Not found", { status: 404 });

  return new Response(rows[0].svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      // Even if a bad file slipped through, the browser won't run anything inside it
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "public, max-age=300",
    },
  });
}