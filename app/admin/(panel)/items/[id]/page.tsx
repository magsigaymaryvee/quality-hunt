// app/admin/(panel)/items/[id]/page.tsx  →  yoursite/admin/items/7
import { Suspense } from "react";
import { notFound } from "next/navigation";
import ItemForm from "@/components/ItemForm";
import { requireAdmin } from "@/lib/auth";
import { getDrawingUrls, getItem, itemStatusLabel } from "@/lib/items";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
};

export default function EditItemPage(props: Props) {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <EditItem {...props} />
    </Suspense>
  );
}

async function EditItem({ params, searchParams }: Props) {
  await requireAdmin();
  const { id } = await params;
  const { saved } = await searchParams;
  const item = await getItem(Number(id) || 0);
  if (!item) notFound();
  const drawings = await getDrawingUrls(item.id);

  return (
    <div className="grid gap-6">
      <h1 className="text-[32px] font-extrabold">Edit: {item.name}</h1>
      {saved && <p role="status" className="rounded-xl bg-wall p-3 font-semibold">Saved. Status: {itemStatusLabel(item)}</p>}

      {/* Preview: the item on both models, exactly as the Style Studio stacks it */}
      <div className="grid grid-cols-2 gap-4">
        {(["hourglass", "pear"] as const).map((shape) => (
          <figure key={shape} className="grid gap-2 rounded-2xl bg-wall p-3">
            <div className="relative mx-auto aspect-[2/5] w-full max-w-[180px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/studio/model-${shape}.svg`} alt="" className="absolute inset-0 h-full w-full" />
              {drawings[shape] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={drawings[shape]} alt="" className="absolute inset-0 h-full w-full" />
              ) : null}
            </div>
            <figcaption className="text-center text-sm">
              {shape === "hourglass" ? "Hourglass" : "Pear"}{drawings[shape] ? "" : " · no drawing yet"}
            </figcaption>
          </figure>
        ))}
      </div>

      <ItemForm item={item} />
    </div>
  );
}