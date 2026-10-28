import { expect, it } from 'vitest';
import {
  assertCvContent,
  cv,
  education,
  experience,
  formatCareerMonth,
  skills,
} from '../src/content/cv';
import { getProject, projectPath } from '../src/content/portfolio';

it('retains the supplied chronology, full employment status and separate overlapping education', () => {
  expect(
    experience.map((entry) => [
      entry.id,
      entry.start,
      entry.end,
      Boolean(entry.current),
    ]),
  ).toEqual([
    ['sap', '2025-03', null, true],
    ['koppla', '2023-06', '2024-08', false],
    ['axel-springer', '2022-03', '2023-02', false],
  ]);
  expect(
    experience.filter((entry) => entry.role.includes('Working Student')),
  ).toHaveLength(2);
  expect(education.map((entry) => [entry.id, entry.start, entry.end])).toEqual([
    ['tu-berlin', '2020-10', '2024-08'],
  ]);
  expect(education[0]?.highlight).toBe('Thesis grade: 1.0');
  expect(cv.languages).toEqual([
    { label: 'Spanish', level: 'Native' },
    { label: 'English', level: 'C1 · Fluent' },
    { label: 'German', level: 'C1 · DSH-2' },
  ]);
  expect(cv.download).toBeNull();
  const thesis = education[0]?.relatedProjectId;
  const project = thesis ? getProject(thesis) : undefined;
  expect(project).toBeDefined();
  if (!project) throw new Error('Thesis project missing');
  expect(projectPath(project)).toBe('/work/knowledge-bridge');
});

it('formats month-only dates consistently and rejects invalid months', () => {
  expect(formatCareerMonth('2025-03')).toBe('Mar 2025');
  expect(formatCareerMonth('2020-10')).toBe('Oct 2020');
  for (const value of [
    '2025-00',
    '2025-13',
    'Mar 2025',
    '2025-3',
    '2025-03-01',
  ])
    expect(() => formatCareerMonth(value)).toThrow(/Invalid CV month/);
});

it('rejects dangling skill/project references, duplicate identities, and reversed date ranges', () => {
  const first = cv.experience[0];
  if (!first) throw new Error('Experience fixture missing');
  expect(() =>
    assertCvContent(
      { ...cv, experience: [{ ...first, skillIds: ['unknown'] }] },
      skills,
    ),
  ).toThrow(/skill reference/);
  expect(() =>
    assertCvContent(
      { ...cv, experience: [{ ...first, relatedProjectId: 'unknown' }] },
      skills,
    ),
  ).toThrow(/project reference/);
  expect(() =>
    assertCvContent({ ...cv, experience: [first, first] }, skills),
  ).toThrow(/career IDs/);
  expect(() => assertCvContent(cv, [...skills, ...skills])).toThrow(
    /skill IDs/,
  );
  expect(() =>
    assertCvContent(
      { ...cv, experience: [{ ...first, current: false, end: '2024-01' }] },
      skills,
    ),
  ).toThrow(/end precedes start/);
});

it('accepts an additional employer and shared skill through data records', () => {
  const first = cv.experience[0];
  if (!first) throw new Error('Experience fixture missing');
  const catalog = [
    ...skills,
    {
      id: 'fixture-tool',
      label: 'Fixture tool',
      category: 'frontend' as const,
      order: 9,
    },
  ];
  const content = {
    ...cv,
    experience: [
      ...cv.experience,
      {
        ...first,
        id: 'fixture-employer',
        order: 4,
        start: '2021-01',
        end: '2021-12',
        current: false as const,
        skillIds: ['fixture-tool'],
      },
    ],
  };
  expect(() => assertCvContent(content, catalog)).not.toThrow();
});
