"use client";

import { motion } from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import { FaGithub, FaLinkedinIn } from "react-icons/fa";
import { siteConfig } from "@/data/site-config";
import SkillsMarquee from "@/components/SkillsMarquee";

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.15 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Hero() {
  const typeSequence = siteConfig.heroGreetings.flatMap((g) => [g, 2000]);

  return (
    <section id="home" className="flex min-h-[calc(100vh-70px)] flex-col">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center md:px-8"
      >
        <motion.p
          variants={item}
          className="mb-4 text-2xl font-black text-accent dark:text-accentDark sm:text-3xl"
        >
          <TypeAnimation sequence={typeSequence} repeat={Infinity} cursor />
        </motion.p>

        <motion.h1
          variants={item}
          className="mb-6 text-4xl font-black sm:text-5xl md:text-6xl lg:text-7xl"
        >
          I&apos;m {siteConfig.name}. 👋
        </motion.h1>

        <motion.p
          variants={item}
          className="mb-8 max-w-2xl text-base sm:text-lg md:text-xl"
        >
          {siteConfig.bio}
        </motion.p>

        <motion.div variants={item} className="mb-8 flex items-center gap-4">
          <a
            href={siteConfig.urls.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="flex h-12 w-12 items-center justify-center rounded-base border-2 border-border bg-bg text-text shadow-brutal transition-all duration-300 hover:-translate-y-1 hover:shadow-brutal-lg dark:bg-secondaryBlack dark:shadow-brutal-dark dark:hover:shadow-brutal-dark-lg"
          >
            <FaGithub className="h-6 w-6" />
          </a>
          <a
            href={siteConfig.urls.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="flex h-12 w-12 items-center justify-center rounded-base border-2 border-border bg-bg text-text shadow-brutal transition-all duration-300 hover:-translate-y-1 hover:shadow-brutal-lg dark:bg-secondaryBlack dark:shadow-brutal-dark dark:hover:shadow-brutal-dark-lg"
          >
            <FaLinkedinIn className="h-6 w-6" />
          </a>
        </motion.div>

        <motion.div
          variants={item}
          className="flex flex-col gap-4 sm:flex-row sm:items-center"
        >
          <a
            href={siteConfig.urls.mailto}
            className="rounded-base border-2 border-border bg-main px-6 py-3 text-lg font-bold text-black shadow-brutal transition-all duration-300 hover:-translate-y-1 hover:shadow-brutal-lg"
          >
            Get in Touch!
          </a>
          <a
            href={siteConfig.urls.resume}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-base border-2 border-border bg-yellow-300 px-6 py-3 text-lg font-bold text-black shadow-brutal transition-all duration-300 hover:-translate-y-1 hover:shadow-brutal-lg"
          >
            View Résumé
          </a>
        </motion.div>
      </motion.div>

      <SkillsMarquee />
    </section>
  );
}
