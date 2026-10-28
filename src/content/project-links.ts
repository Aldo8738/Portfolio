export interface ProjectLink {
  source: string;
  target: string;
  theme: string;
}

export const projectLinks: ProjectLink[] = [
  {
    source: 'knowledge-bridge',
    target: 'trading-agent',
    theme: 'Human–AI systems',
  },
  { source: 'herby', target: 'custom-cpu-os', theme: 'Hardware and systems' },
];

const positions: Record<string, { x: number; y: number }> = {
  'knowledge-bridge': { x: 14, y: 25 },
  'trading-agent': { x: 63, y: 14 },
  herby: { x: 29, y: 76 },
  'custom-cpu-os': { x: 70, y: 66 },
};

export function getProjectPosition(slug: string, index: number, total: number) {
  const authored = positions[slug];
  if (authored && total <= 4) return authored;
  const columns = Math.ceil(Math.sqrt(total));
  const rows = Math.ceil(total / columns);
  return {
    x: 5 + (index % columns) * (90 / columns),
    y: 18 + Math.floor(index / columns) * (65 / rows),
  };
}
