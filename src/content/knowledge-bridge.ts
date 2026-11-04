export const knowledgeBridge = {
  eyebrow: '01 / HUMAN–AI · 2024 · TU BERLIN',
  title: 'Knowledge Bridge.',
  subheading: 'Making AI-generated knowledge human-friendly.',
  introduction:
    'I helped turn an early knowledge-graph research prototype into a faster, more responsive interface for human–AI collaboration.',
  checkpoint: {
    eyebrow: '02 / MODEL VERSION CONTROL',
    heading: 'Every change has a history.',
    description:
      'Save a state, correct a relationship, and return to an earlier version.',
    states: ['Checkpoint 01 · Original', 'Checkpoint 02 · Human correction'],
    versions: ['Original', 'Human correction'],
    restore: ['Restore correction', 'Restore original'],
    descriptions: [
      'Checkpoint 01: Skyrim is incorrectly linked to Sports.',
      'Checkpoint 02: Skyrim is corrected to RPG.',
    ],
    changes: ['Original: Skyrim → Sports', 'Changed: Sports → RPG'],
  },
  engineering: {
    eyebrow: '03 / THE ENGINEERING',
    heading: 'Designed for people. Engineered for speed.',
    contribution:
      'Full-stack development, UX, performance, human–AI interaction',
    technologies: [
      'React',
      'TypeScript',
      'React Flow',
      'WebSockets',
      'Python',
      'FastAPI',
    ],
    footnote:
      'Controlled Chrome comparisons · mean of 10 graph creations per dataset condition',
  },
} as const;

export const knowledgeBridgeBeats = [
  {
    title: 'Everything, all at once.',
    description:
      'The original prototype rendered too much graph detail at once.',
  },
  {
    title: 'Render what matters.',
    description: 'Viewport-aware rendering keeps relevant detail in focus.',
  },
  {
    title: 'A two-way conversation.',
    description:
      'People correct the graph. Prioritized updates return through WebSockets.',
  },
  {
    title: 'Less waiting. More exploring.',
    description: '81.5% shorter graph finish time in the 100-item Reddit test.',
  },
] as const;

export const knowledgeBridgeMeasurements = [
  {
    reduction: 81.5,
    metric: 'graph finish time',
    before: 8.47,
    after: 1.57,
    dataset: 'Reddit',
    items: 100,
  },
  {
    reduction: 72.4,
    metric: 'page load time',
    before: 4.82,
    after: 1.33,
    dataset: 'Reddit',
    items: 600,
  },
] as const;
