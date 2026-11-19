// app/admin/(panel)/layout.tsx
// Wraps every admin page except Sign in. Nobody gets past this without signing in.
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { signOutAction, signOutEverywhereAction } from "@/app/admin/actions";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/items", label: "Items" },
];

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<p className="p-10">Checking your sign-in…</p>}>
      <Guard>{children}</Guard>
    </Suspense>
  );
}

async function Guard({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin(); // not signed in → sent to Sign in

  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 md:grid-cols-[200px_1fr]">
      <aside className="grid h-fit gap-4 rounded-2xl bg-white p-4">
        <p className="text-sm">Signed in as<br /><b className="break-all">{admin.email}</b></p>
        <nav aria-label="Admin">
          <ul className="grid gap-1">
            {nav.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="block rounded-lg px-3 py-2 font-medium hover:bg-wall">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <form action={signOutAction}>
          <button className="min-h-11 w-full rounded-full border-[1.5px] border-ink px-4 font-semibold">Sign out</button>
        </form>
        <form action={signOutEverywhereAction}>
          <button className="min-h-11 w-full rounded-full px-4 text-sm font-semibold text-brick-text underline">
            Sign out everywhere
          </button>
        </form>
      </aside>
      <section>{children}</section>
    </div>
  );
}