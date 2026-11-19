import Link from "next/link";
import Disclosure from "@/components/Disclosure";

const footerLinks = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/disclosure", label: "Affiliate disclosure" },
];

export default function Footer() {
  return (
    <footer className="bg-ink text-white mt-16">
      <div className="mx-auto max-w-5xl px-4 py-10 grid gap-6">
        <Disclosure tone="dark" />
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-6 gap-y-3">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="underline-offset-4 hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="text-sm text-wall">© 2026 Quality Hunt</p>
      </div>
    </footer>
  );
}