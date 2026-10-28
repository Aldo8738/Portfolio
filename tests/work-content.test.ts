import { expect, it } from 'vitest';
import {
  getProject,
  orderedProjects,
  projectPath,
  projects,
} from '../src/content/portfolio';
import { getProjectPosition, projectLinks } from '../src/content/project-links';

it('keeps project identities, order, and static detail URLs unambiguous', () => {
  expect(new Set(projects.map((project) => project.slug)).size).toBe(
    projects.length,
  );
  expect(new Set(projects.map((project) => project.order)).size).toBe(
    projects.length,
  );
  expect(orderedProjects.map((project) => project.order)).toEqual([1, 2, 3, 4]);
  for (const project of projects) {
    expect(project.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    expect(getProject(project.slug)).toBe(project);
    expect(projectPath(project)).toBe(`/work/${project.slug}`);
    expect(project.caseStudy.intro.length).toBeGreaterThan(0);
    expect(project.caseStudy.sections.length).toBeGreaterThan(0);
  }
  expect(getProject('../about')).toBeUndefined();
});

it('links only real projects and preserves the supplied highlights', () => {
  for (const link of projectLinks) {
    expect(getProject(link.source)).toBeDefined();
    expect(getProject(link.target)).toBeDefined();
    expect(link.source).not.toBe(link.target);
  }
  expect(getProject('knowledge-bridge')?.highlight).toBe(
    '81% less loading time · 72% faster task completion',
  );
  expect(getProject('trading-agent')?.highlight).toBe(
    'Co-built in under a month',
  );
  expect(getProject('herby')?.highlight).toContain('€100');
});

it('lays out a new fifth entry without requiring another position or navigation list', () => {
  const slugs = [
    ...orderedProjects.map((project) => project.slug),
    'fifth-project',
  ];
  const positions = slugs.map((slug, index) =>
    getProjectPosition(slug, index, slugs.length),
  );
  expect(
    new Set(positions.map((position) => `${position.x},${position.y}`)).size,
  ).toBe(slugs.length);
  for (const position of positions) {
    expect(position.x).toBeGreaterThanOrEqual(0);
    expect(position.x).toBeLessThan(80);
    expect(position.y).toBeGreaterThanOrEqual(0);
    expect(position.y).toBeLessThan(85);
  }
});
