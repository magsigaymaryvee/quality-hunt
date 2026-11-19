// src/lib/posts.ts
// Every question the site asks the database about posts lives here.
import { connection } from "next/server";
import { sql } from "@/lib/db";

export type Category = "style" | "home" | "money";

export type Post = {
  id: number;
  title: string;
  slug: string;
  category: Category;
  summary: string;
  body: string;
  publish_at: string | Date | null;
  updated_at: string | Date;
};

export type Item = {
  id: number;
  name: string;
  amazon_url: string;
  why_it_works: string;
  price_range: string;
};

const CATEGORIES: string[] = ["style", "home", "money"];

// Is this word one of our 3 categories?
export function isCategory(value: string | undefined): value is Category {
  return value !== undefined && CATEGORIES.includes(value);
}

// Published = status is 'published' AND the publish time has arrived (or is empty)
export async function getPublishedPosts(category?: Category, limit = 50): Promise<Post[]> {
  await connection(); // always ask the database fresh
  const db = sql();
  const rows = category
    ? await db`
        select * from posts
        where status = 'published'
          and (publish_at is null or publish_at <= now())
          and category = ${category}
        order by coalesce(publish_at, updated_at) desc
        limit ${limit}`
    : await db`
        select * from posts
        where status = 'published'
          and (publish_at is null or publish_at <= now())
        order by coalesce(publish_at, updated_at) desc
        limit ${limit}`;
  return rows as Post[];
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  await connection();
  const db = sql();
  const rows = await db`
    select * from posts
    where slug = ${slug}
      and status = 'published'
      and (publish_at is null or publish_at <= now())
    limit 1`;
  return (rows[0] as Post | undefined) ?? null;
}

export async function getPostItems(postId: number): Promise<Item[]> {
  await connection();
  const db = sql();
  const rows = await db`
    select i.id, i.name, i.amazon_url, i.why_it_works, i.price_range
    from post_items pi
    join items i on i.id = pi.item_id
    where pi.post_id = ${postId}
      and i.status = 'published'
      and (i.publish_at is null or i.publish_at <= now())
    order by pi.position`;
  return rows as Item[];
}

// "Nov 17, 2026"
export function formatDate(value: string | Date): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}