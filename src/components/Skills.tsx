import { siteConfig } from "@/data/site-config";
import SectionTitle from "@/components/SectionTitle";

export default function Skills() {
  return (
    <section id="skills" className="grid-paper scroll-mt-20 px-4 py-16 md:px-8">
      <div className="mx-auto max-w-5xl">
        <SectionTitle title={siteConfig.sectionTitles.skills} />
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {siteConfig.skills.map((skill) => (
            <div
              key={skill.name}
              className="flex flex-col items-center gap-3 rounded-base border-2 border-border bg-bg p-5 shadow-brutal transition-all duration-300 hover:-translate-y-1 hover:shadow-brutal-lg dark:bg-secondaryBlack dark:shadow-brutal-dark dark:hover:shadow-brutal-dark-lg"
            >
              <skill.icon className="h-9 w-9" aria-hidden />
              <span className="text-center font-bold">{skill.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
