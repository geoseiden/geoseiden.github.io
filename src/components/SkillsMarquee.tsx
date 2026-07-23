"use client";

import Marquee from "react-fast-marquee";
import { siteConfig } from "@/data/site-config";

export default function SkillsMarquee() {
  return (
    <div className="border-y-[3px] border-border bg-bg py-3 dark:bg-secondaryBlack">
      <Marquee autoFill pauseOnHover speed={40}>
        {siteConfig.skills.map((skill) => (
          <span
            key={skill.name}
            className="mx-6 flex items-center gap-2 font-bold"
          >
            <skill.icon className="h-6 w-6" aria-hidden />
            {skill.name}
          </span>
        ))}
      </Marquee>
    </div>
  );
}
