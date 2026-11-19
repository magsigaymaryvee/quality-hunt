"use client"; // this part reacts to taps, so it runs in the browser

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/style-studio", label: "Style Studio" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false); // is the phone menu open?

  return (
    <header className="relative bg-white border-b border-floor">
      <div className="mx-auto max-w-5xl flex items-center justify-between px-4 h-16">
        <Link href="/" className="flex items-center gap-2 font-heading font-extrabold text-lg">
          <Image src="logo/logo-icon.svg" alt="" width={32} height={32} />
          Quality Hunt
        </Link>

        <button
          type="button"
          className="md:hidden h-11 w-11 grid place-items-center rounded-full text-2xl"
          aria-expanded={open}
          aria-controls="site-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen(!open)}
        >
          {open ? "✕" : "☰"}
        </button>

        <nav
          id="site-menu"
          aria-label="Main"
          className={`${open ? "block" : "hidden"} md:block absolute md:static top-16 left-0 right-0 z-10 bg-white md:bg-transparent border-b md:border-0 border-floor`}
        >
          <ul className="flex flex-col md:flex-row md:gap-6 p-2 md:p-0">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block px-2 py-3 md:p-0 font-medium hover:text-eucalyptus"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}