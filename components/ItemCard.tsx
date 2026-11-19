import type { Item } from "@/lib/posts";

export default function ItemCard({ item }: { item: Item }) {
  return (
    <div className="grid gap-3 rounded-2xl bg-white p-4">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-[17px] font-bold">{item.name}</h3>
        <span className="text-sm whitespace-nowrap">{item.price_range}</span>
      </div>
      <p className="text-sm">{item.why_it_works}</p>
      <a
        href={item.amazon_url}
        target="_blank"
        rel="sponsored noopener"
        className="inline-flex items-center justify-center min-h-11 px-5 rounded-full font-semibold bg-eucalyptus text-white hover:bg-ink"
      >
        Check price on Amazon
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    </div>
  );
}