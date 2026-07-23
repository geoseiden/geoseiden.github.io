import { ExternalLink, Github } from "lucide-react";
import { siteConfig } from "@/data/site-config";
import SectionTitle from "@/components/SectionTitle";

export default function Projects() {
  return (
    <section id="projects" className="scroll-mt-20 px-4 py-16 md:px-8">
      <div className="mx-auto max-w-6xl">
        <SectionTitle title={siteConfig.sectionTitles.projects} />
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {siteConfig.projects.map((project) => (
            <article
              key={project.title}
              className="flex flex-col rounded-base border-[3px] border-border bg-bg p-6 shadow-brutal-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-brutal-xl dark:bg-secondaryBlack dark:shadow-brutal-dark-lg dark:hover:shadow-brutal-dark-xl"
            >
              <h3 className="mb-3 text-lg font-black">{project.title}</h3>
              <p className="mb-4 flex-1">{project.description}</p>
              <ul className="mb-5 flex flex-wrap gap-2">
                {project.tech.map((tech) => (
                  <li
                    key={tech}
                    className="rounded-base border-2 border-border bg-yellow-300 px-2 py-1 text-xs font-bold text-black"
                  >
                    {tech}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-3">
                <a
                  href={project.codeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-base border-2 border-border bg-blue-400 px-4 py-2 font-bold text-black shadow-brutal transition-all duration-300 hover:-translate-y-1 hover:shadow-brutal-lg"
                >
                  <Github className="h-4 w-4" aria-hidden />
                  Code
                </a>
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-base border-2 border-border bg-green-400 px-4 py-2 font-bold text-black shadow-brutal transition-all duration-300 hover:-translate-y-1 hover:shadow-brutal-lg"
                  >
                    <ExternalLink className="h-4 w-4" aria-hidden />
                    Live Demo
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
