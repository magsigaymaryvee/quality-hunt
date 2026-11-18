// src/app/test-db/page.tsx
// The folder name becomes the address: yoursite/test-db
import { Suspense } from "react";
import { connection } from "next/server";
import { sql } from "@/lib/db";

export default function TestDbPage() {
  return (
    <main style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>Database test</h1>
      {/* Show "Loading…" while the database answers */}
      <Suspense fallback={<p>Loading…</p>}>
        <ItemList />
      </Suspense>
    </main>
  );
}

async function ItemList() {
  await connection(); // ask the database fresh every time someone opens the page
  const db = sql();
  const items = await db`
    select id, name, slot, price_range
    from items
    where status = 'published'
    order by id
  `;

  return (
    <>
      <p>{items.length} item(s) found</p>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {item.name} — {item.slot} — {item.price_range}
          </li>
        ))}
      </ul>
    </>
  );
}