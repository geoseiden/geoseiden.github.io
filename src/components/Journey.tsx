import { Briefcase, GraduationCap, MapPin } from "lucide-react";
import { siteConfig } from "@/data/site-config";
import SectionTitle from "@/components/SectionTitle";

export default function Journey() {
  return (
    <section id="journey" className="scroll-mt-20 px-4 py-16 md:px-8">
      <div className="mx-auto max-w-4xl">
        <SectionTitle title={siteConfig.sectionTitles.journey} />
        <ol className="relative ml-6 space-y-10 border-l-[3px] border-border pl-10 md:ml-8">
          {siteConfig.timeline.map((entry) => (
            <li key={`${entry.role}-${entry.organisation}`} className="relative">
              <span className="absolute -left-[4.35rem] top-0 flex h-12 w-12 items-center justify-center rounded-base border-2 border-border bg-main text-black shadow-brutal md:-left-[4.6rem]">
                {entry.type === "work" ? (
                  <Briefcase className="h-6 w-6" aria-label="Work" />
                ) : (
                  <GraduationCap className="h-6 w-6" aria-label="Education" />
                )}
              </span>
              <article className="rounded-base border-[3px] border-border bg-bg p-6 shadow-brutal-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-brutal-xl dark:bg-secondaryBlack dark:shadow-brutal-dark-lg dark:hover:shadow-brutal-dark-xl">
                <h3 className="text-xl font-black">{entry.role}</h3>
                <p className="mt-1 font-bold text-accent dark:text-accentDark">
                  {entry.organisation}
                </p>
                <p className="mt-3">
                  <span className="inline-block rounded-base border-2 border-border bg-yellow-300 px-2 py-0.5 font-mono text-sm font-bold text-black">
                    {entry.date}
                  </span>
                </p>
                <p className="mt-3">{entry.description}</p>
                <p className="mt-3 flex items-center gap-1 text-sm font-bold">
                  <MapPin className="h-4 w-4" aria-hidden />
                  {entry.location}
                </p>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
