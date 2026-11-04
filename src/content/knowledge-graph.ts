export type GraphLayout = 'desktop' | 'mobile';
export interface GraphPoint {
  x: number;
  y: number;
}
export interface KnowledgeNode extends GraphPoint {
  id: string;
  label: string;
  role: 'idea' | 'cluster' | 'item';
  mobile: GraphPoint;
  detail?: boolean;
  focused?: boolean;
}
export const knowledgeNodes: readonly KnowledgeNode[] = [
  {
    id: 'gaming',
    label: 'Gaming discussions',
    role: 'idea',
    x: 440,
    y: 275,
    mobile: { x: 165, y: 155 },
  },
  {
    id: 'shooter',
    label: 'Shooter',
    role: 'cluster',
    x: 205,
    y: 145,
    mobile: { x: 65, y: 85 },
  },
  {
    id: 'rpg',
    label: 'RPG',
    role: 'cluster',
    x: 745,
    y: 230,
    mobile: { x: 330, y: 95 },
  },
  {
    id: 'sports',
    label: 'Sports',
    role: 'cluster',
    x: 200,
    y: 440,
    mobile: { x: 65, y: 275 },
  },
  {
    id: 'rainbow',
    label: 'Rainbow Six',
    role: 'item',
    x: 100,
    y: 220,
    mobile: { x: 55, y: 180 },
  },
  {
    id: 'skyrim',
    label: 'Skyrim',
    role: 'item',
    x: 610,
    y: 425,
    mobile: { x: 275, y: 245 },
  },
  {
    id: 'fifa',
    label: 'FIFA',
    role: 'item',
    x: 85,
    y: 475,
    mobile: { x: 145, y: 310 },
  },
  {
    id: 'teamplay',
    label: 'Teamplay',
    role: 'item',
    x: 100,
    y: 80,
    mobile: { x: 95, y: 40 },
    detail: true,
  },
  {
    id: 'operators',
    label: 'Operators',
    role: 'item',
    x: 315,
    y: 80,
    mobile: { x: 240, y: 55 },
    detail: true,
  },
  {
    id: 'modding',
    label: 'Modding',
    role: 'item',
    x: 675,
    y: 510,
    mobile: { x: 340, y: 195 },
    detail: true,
    focused: true,
  },
  {
    id: 'quests',
    label: 'Quests',
    role: 'item',
    x: 755,
    y: 420,
    mobile: { x: 345, y: 285 },
    detail: true,
    focused: true,
  },
  {
    id: 'football',
    label: 'Football',
    role: 'item',
    x: 95,
    y: 380,
    mobile: { x: 35, y: 235 },
    detail: true,
  },
  {
    id: 'leagues',
    label: 'Leagues',
    role: 'item',
    x: 295,
    y: 525,
    mobile: { x: 200, y: 325 },
    detail: true,
  },
];
export const knowledgeCorrection = {
  entity: 'skyrim',
  before: 'sports',
  after: 'rpg',
} as const;
export function graphNode(id: string) {
  const node = knowledgeNodes.find((node) => node.id === id);
  if (!node) throw new Error(`Knowledge graph node missing: ${id}`);
  return node;
}
export function graphPoint(
  id: string,
  layout: GraphLayout,
  flow = false,
): GraphPoint {
  if (layout === 'mobile' && flow) {
    if (id === knowledgeCorrection.entity) return { x: 200, y: 45 };
    if (id === knowledgeCorrection.before) return { x: 85, y: 140 };
    if (id === knowledgeCorrection.after) return { x: 315, y: 140 };
  }
  const node = graphNode(id);
  return layout === 'mobile' ? node.mobile : node;
}
export function curvedLink(from: GraphPoint, to: GraphPoint) {
  const middle = (from.x + to.x) / 2 + (from.y - to.y) * 0.16;
  return `M${from.x} ${from.y}C${middle} ${from.y - 24} ${middle} ${to.y + 24} ${to.x} ${to.y}`;
}
export const graphLinks = [
  ['gaming', 'shooter'],
  ['gaming', 'rpg'],
  ['gaming', 'sports'],
  ['shooter', 'rainbow'],
  ['sports', 'fifa'],
  ['shooter', 'teamplay'],
  ['shooter', 'operators'],
  ['skyrim', 'modding'],
  ['rpg', 'quests'],
  ['sports', 'football'],
  ['sports', 'leagues'],
] as const;
export function correctionPath(
  layout: GraphLayout,
  corrected: boolean,
  flow = false,
) {
  return curvedLink(
    graphPoint(
      corrected ? knowledgeCorrection.after : knowledgeCorrection.before,
      layout,
      flow,
    ),
    graphPoint(knowledgeCorrection.entity, layout, flow),
  );
}

// Fixed arithmetic creates authored branch variation without runtime physics or randomness.
export const peripheralPoints = Array.from({ length: 64 }, (_, index) => {
  const angle = (index * Math.PI * 2) / 64;
  const x = Math.round(440 + Math.cos(angle) * (245 + ((index * 19) % 105)));
  const y = Math.round(280 + Math.sin(angle) * (150 + ((index * 31) % 100)));
  const anchor = ['gaming', 'shooter', 'rpg', 'sports'][index % 4] ?? 'gaming';
  return {
    x,
    y,
    anchor,
    radius: index % 7 === 0 ? 3.2 : index % 3 === 0 ? 2.2 : 1.4,
    mobile: { x: Math.round((x / 900) * 400), y: Math.round((y / 600) * 360) },
    mobileVisible: index % 3 === 0,
  };
});
export function peripheralPath(index: number, layout: GraphLayout) {
  const point = peripheralPoints[index];
  if (!point) throw new Error('Missing peripheral point');
  const from = graphPoint(point.anchor, layout);
  const to = layout === 'mobile' ? point.mobile : point;
  const dx = to.x - from.x,
    dy = to.y - from.y;
  const length = Math.max(1, Math.hypot(dx, dy));
  const bend =
    (index % 2 === 0 ? 1 : -1) *
    (22 + ((index * 17) % 62)) *
    (layout === 'mobile' ? 0.45 : 1);
  const nx = (-dy / length) * bend,
    ny = (dx / length) * bend;
  return `M${from.x} ${from.y}C${from.x + dx * 0.25 + nx} ${from.y + dy * 0.25 + ny} ${from.x + dx * 0.75 + nx * 0.6} ${from.y + dy * 0.75 + ny * 0.6} ${to.x} ${to.y}`;
}
