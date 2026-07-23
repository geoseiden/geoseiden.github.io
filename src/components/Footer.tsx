import { Mail } from "lucide-react";
import { FaGithub, FaLinkedinIn } from "react-icons/fa";
import { siteConfig } from "@/data/site-config";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t-[3px] border-border bg-bg px-4 py-10 dark:bg-secondaryBlack md:px-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6">
        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-bold">
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

        <div className="flex items-center gap-4">
          <a
            href={siteConfig.urls.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="flex h-10 w-10 items-center justify-center rounded-base border-2 border-border bg-bg text-text shadow-brutal transition-all duration-300 hover:-translate-y-1 hover:shadow-brutal-lg dark:bg-darkBg dark:shadow-brutal-dark dark:hover:shadow-brutal-dark-lg"
          >
            <FaGithub className="h-5 w-5" />
          </a>
          <a
            href={siteConfig.urls.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="flex h-10 w-10 items-center justify-center rounded-base border-2 border-border bg-bg text-text shadow-brutal transition-all duration-300 hover:-translate-y-1 hover:shadow-brutal-lg dark:bg-darkBg dark:shadow-brutal-dark dark:hover:shadow-brutal-dark-lg"
          >
            <FaLinkedinIn className="h-5 w-5" />
          </a>
          <a
            href={siteConfig.urls.mailto}
            aria-label="Email"
            className="flex h-10 w-10 items-center justify-center rounded-base border-2 border-border bg-bg text-text shadow-brutal transition-all duration-300 hover:-translate-y-1 hover:shadow-brutal-lg dark:bg-darkBg dark:shadow-brutal-dark dark:hover:shadow-brutal-dark-lg"
          >
            <Mail className="h-5 w-5" />
          </a>
        </div>

        <p className="text-center font-bold">
          © {year} {siteConfig.name} | Built with ❤ &amp; ☕
        </p>

        <span className="rounded-base border-2 border-border bg-main px-3 py-1 font-mono text-sm font-bold text-black shadow-brutal">
          {"</>"} with Next.js + Tailwind
        </span>
      </div>
    </footer>
  );
}
