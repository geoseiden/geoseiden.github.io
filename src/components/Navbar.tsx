"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Menu, Moon, Sun, X } from "lucide-react";
import { siteConfig } from "@/data/site-config";

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <button
      aria-label="Toggle dark mode"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="flex h-10 w-10 items-center justify-center rounded-base border-2 border-border bg-bg text-text shadow-brutal transition-all duration-300 hover:-translate-y-1 hover:shadow-brutal-lg"
    >
      {mounted && resolvedTheme === "dark" ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </button>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b-[3px] border-border bg-yellow-300 text-black">
      <nav className="flex items-center justify-between gap-4 px-4 py-3 md:px-8">
        <a
          href="#home"
          aria-label="Home"
          className="flex h-11 w-11 items-center justify-center rounded-base border-2 border-border bg-main text-lg font-black text-black shadow-brutal transition-all duration-300 hover:-translate-y-1 hover:shadow-brutal-lg"
        >
          {siteConfig.initials}
        </a>

        <ul className="hidden items-center gap-6 font-bold md:flex">
          {siteConfig.navLinks.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                className="underline-offset-4 hover:underline"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <a
            href={siteConfig.urls.mailto}
            className="hidden rounded-base border-2 border-border bg-main px-4 py-2 font-bold text-black shadow-brutal transition-all duration-300 hover:-translate-y-1 hover:shadow-brutal-lg sm:block"
          >
            Get in Touch
          </a>
          <ThemeToggle />
          <button
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-base border-2 border-border bg-bg text-text shadow-brutal transition-all duration-300 hover:-translate-y-1 hover:shadow-brutal-lg md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <ul className="flex flex-col gap-1 border-t-2 border-border bg-yellow-300 px-4 pb-4 pt-2 font-bold md:hidden">
          {siteConfig.navLinks.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                onClick={() => setOpen(false)}
                className="block rounded-base border-2 border-transparent px-2 py-2 hover:border-border hover:bg-main"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href={siteConfig.urls.mailto}
              onClick={() => setOpen(false)}
              className="mt-1 block rounded-base border-2 border-border bg-main px-2 py-2 text-center shadow-brutal"
            >
              Get in Touch
            </a>
          </li>
        </ul>
      )}
    </header>
  );
}
