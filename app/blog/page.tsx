import { Suspense } from "react";
import Button from "@/components/Button";
import PostCard from "@/components/PostCard";
import { getPublishedPosts } from "@/lib/posts";

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 grid gap-10">
      <section className="grid gap-4 max-w-xl">
        <h1 className="text-[32px] md:text-5xl font-extrabold leading-tight">
          Good things come in checked boxes.
        </h1>
        <p>Fashion finds and home fixes, checked before we recommend them.</p>
      </section>

      <section aria-labelledby="need-heading" className="grid gap-3 max-w-md">
        <h2 id="need-heading" className="text-[22px] font-extrabold">
          What do you need?
        </h2>
        <Button href="/style-studio" variant="outline">Style an outfit</Button>
        <Button href="/blog?category=home" variant="outline">Fix a problem</Button>
        <Button href="/blog" variant="outline">Browse finds</Button>
      </section>

      <section aria-labelledby="latest-heading" className="grid gap-3">
        <h2 id="latest-heading" className="text-[22px] font-extrabold">
          Latest finds
        </h2>
        <Suspense fallback={<p className="text-sm">Loading…</p>}>
          <LatestFinds />
        </Suspense>
      </section>
    </div>
  );
}

async function LatestFinds() {
  const posts = await getPublishedPosts(undefined, 2); // the 2 newest
  if (posts.length === 0) return <p className="text-sm">New finds coming soon.</p>;
  return (
    <div className="grid grid-cols-2 gap-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}