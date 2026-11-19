// app/admin/(panel)/page.tsx  →  yoursite/admin
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";

export default function DashboardPage() {
  return (
    <div className="grid gap-6">
      <h1 className="text-[32px] font-extrabold">Dashboard</h1>
      <Suspense fallback={<p>Loading…</p>}>
        <Dashboard />
      </Suspense>
    </div>
  );
}

async function Dashboard() {
  await requireAdmin(); // check again: never trust that the layout ran first
  const db = sql();
  const [counts] = await db`
    select
      (select count(*) from items)::int as items,
      (select count(*) from posts)::int as posts,
      (select count(*) from messages where status = 'new')::int as new_messages`;
  const events = await db`
    select kind, detail, created_at from security_events
    order by created_at desc limit 10`;

  const cards = [
    { label: "Items", value: counts.items },
    { label: "Posts", value: counts.posts },
    { label: "New messages", value: counts.new_messages },
  ];

  return (
    <>
      <div className="grid grid-cols-3 gap-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl bg-white p-4">
            <p className="text-sm">{card.label}</p>
            <p className="text-[32px] font-extrabold">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-2 rounded-2xl bg-white p-4">
        <h2 className="text-[17px] font-bold">Recent sign-in activity</h2>
        <ul className="grid gap-1 text-sm">
          {events.map((event, i) => (
            <li key={i} className={event.kind === "locked" || event.kind === "new_device" ? "font-semibold text-brick-text" : ""}>
              {new Date(event.created_at).toLocaleString("en-US")} · {event.kind.replace(/_/g, " ")}
              {event.detail && ` · ${event.detail}`}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}