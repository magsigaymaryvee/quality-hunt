// src/app/style-studio/page.tsx  →  yoursite/style-studio
import { Suspense } from "react";
import StudioClient from "@/components/StudioClient";
import { getStudioItems } from "@/lib/studio";

export default function StyleStudioPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 grid gap-6">
      <div className="grid gap-2">
        <h1 className="text-[32px] font-extrabold">Style Studio</h1>
        <p>Pick a model, then tap items to try them on.</p>
      </div>
      <Suspense fallback={<p>Loading the studio…</p>}>
        <StudioData />
      </Suspense>
    </div>
  );
}

async function StudioData() {
  const items = await getStudioItems();
  return <StudioClient items={items} />;
}