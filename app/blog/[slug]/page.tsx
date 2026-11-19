// src/app/blog/[slug]/page.tsx  →  yoursite/blog/any-post-slug
import { Suspense } from "react";
import { notFound } from "next/navigation";
import Disclosure from "@/components/Disclosure";
import ItemCard from "@/components/ItemCard";
import { formatDate, getPostBySlug, getPostItems } from "@/lib/posts";

type Props = { params: Promise<{ slug: string }> };

export default function PostPage({ params }: Props) {
  return (
    <Suspense fallback={<p className="mx-auto max-w-2xl px-4 py-10">Loading…</p>}>
      <PostContent params={params} />
    </Suspense>
  );
}

async function PostContent({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound(); // missing, draft or not yet scheduled → 404

  const items = await getPostItems(post.id);
  const paragraphs = post.body.split(/\n\s*\n/); // a blank line starts a new paragraph

  return (
    <article className="mx-auto max-w-2xl px-4 py-10 grid gap-6">
      <header className="grid gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-eucalyptus">
          {post.category}
        </span>
        <h1 className="text-[32px] font-extrabold leading-tight">{post.title}</h1>
        <p className="text-sm">Updated {formatDate(post.publish_at ?? post.updated_at)}</p>
      </header>

      <p className="text-lg">{post.summary}</p>

      {/* The disclosure must come BEFORE any buy link */}
      {items.length > 0 && <Disclosure />}

      <div className="grid gap-4 leading-relaxed">
        {paragraphs.map((text, i) => (
          <p key={i}>{text}</p>
        ))}
      </div>

      {items.length > 0 && (
        <section aria-labelledby="finds-heading" className="grid gap-4">
          <h2 id="finds-heading" className="text-[22px] font-extrabold">
            The finds
          </h2>
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </section>
      )}
    </article>
  );
}