import Link from "next/link";
import type { Post } from "@/lib/posts";

export default function PostCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group grid gap-2 content-start rounded-2xl bg-white p-4 transition-shadow hover:shadow-md"
    >
      <span className="text-xs font-medium uppercase tracking-wide text-eucalyptus">
        {post.category}
      </span>
      <h3 className="text-[17px] font-bold leading-snug group-hover:underline">{post.title}</h3>
      <p className="text-sm">{post.summary}</p>
    </Link>
  );
}