export interface ProjectImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}
export interface Project {
  slug: string;
  title: string;
  summary: string;
  role: string;
  context: string;
  process: string;
  outcome: string;
  technologies: string[];
  images: ProjectImage[];
  links: { label: string; url: string }[];
}

// TODO: add real case studies and supplied imagery here. Do not publish test fixtures.
export const projects: Project[] = [];

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}
