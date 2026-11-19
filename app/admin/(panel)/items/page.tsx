// app/admin/(panel)/items/page.tsx  →  yoursite/admin/items
import Link from "next/link";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { itemStatusLabel, listItems } from "@/lib/items";

export default function ItemsPage() {
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[32px] font-extrabold">Items</h1>
        <Link href="/admin/items/new" className="inline-flex min-h-11 items-center rounded-full bg-eucalyptus px-5 font-semibold text-white hover:bg-ink">
          Add item
        </Link>
      </div>
      <Suspense fallback={<p>Loading…</p>}>
        <ItemTable />
      </Suspense>
    </div>
  );
}

async function ItemTable() {
  await requireAdmin();
  const items = await listItems();
  if (items.length === 0) return <p>No items yet.</p>;

  return (
    <div className="overflow-x-auto rounded-2xl bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-floor">
          <tr>
            <th className="p-3">Name</th>
            <th className="p-3">Slot</th>
            <th className="p-3">Status</th>
            <th className="p-3">Drawings</th>
            <th className="p-3"><span className="sr-only">Edit</span></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-dashed border-floor last:border-0">
              <td className="p-3 font-semibold">{item.name}</td>
              <td className="p-3">{item.slot}</td>
              <td className="p-3">{itemStatusLabel(item)}</td>
              <td className={`p-3 ${item.drawings < 2 ? "text-brick-text" : ""}`}>{item.drawings} of 2</td>
              <td className="p-3 text-right">
                <Link href={`/admin/items/${item.id}`} className="font-semibold text-eucalyptus underline">Edit</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}