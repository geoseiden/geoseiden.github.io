import { siteConfig } from "@/data/site-config";
import SectionTitle from "@/components/SectionTitle";

export default function About() {
  return (
    <section id="about" className="grid-paper scroll-mt-20 px-4 py-16 md:px-8">
      <div className="mx-auto max-w-5xl">
        <SectionTitle title={siteConfig.sectionTitles.about} />
        <div className="grid gap-8 md:grid-cols-2">
          {siteConfig.aboutCards.map((card) => (
            <article
              key={card.title}
              className="rounded-base border-[3px] border-border bg-bg p-6 shadow-brutal-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-brutal-xl dark:bg-secondaryBlack dark:shadow-brutal-dark-lg dark:hover:shadow-brutal-dark-xl"
            >
              <h3 className="mb-3 text-xl font-black">{card.title}</h3>
              <p>{card.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
