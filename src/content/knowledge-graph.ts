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
  mobileOmit?: boolean;
  focused?: boolean;
}

// Authored geography keeps each country's city and landmark on its own branch.
export const knowledgeNodes: readonly KnowledgeNode[] = [
  {
    id: 'europe',
    label: 'Europe',
    role: 'idea',
    x: 450,
    y: 75,
    mobile: { x: 200, y: 35 },
  },
  {
    id: 'france',
    label: 'France',
    role: 'cluster',
    x: 265,
    y: 205,
    mobile: { x: 95, y: 110 },
    focused: true,
  },
  {
    id: 'germany',
    label: 'Germany',
    role: 'cluster',
    x: 645,
    y: 205,
    mobile: { x: 300, y: 110 },
  },
  {
    id: 'paris',
    label: 'Paris',
    role: 'item',
    x: 265,
    y: 355,
    mobile: { x: 95, y: 200 },
    focused: true,
  },
  {
    id: 'berlin',
    label: 'Berlin',
    role: 'item',
    x: 645,
    y: 355,
    mobile: { x: 300, y: 200 },
  },
  {
    id: 'eiffel',
    label: 'Eiffel Tower',
    role: 'item',
    x: 130,
    y: 475,
    mobile: { x: 80, y: 305 },
    focused: true,
  },
  {
    id: 'gate',
    label: 'Brandenburg Gate',
    role: 'item',
    x: 710,
    y: 475,
    mobile: { x: 290, y: 305 },
  },
  {
    id: 'cities',
    label: 'Cities',
    role: 'cluster',
    x: 95,
    y: 100,
    mobile: { x: 45, y: 30 },
    mobileOmit: true,
  },
  {
    id: 'landmarks',
    label: 'Landmarks',
    role: 'cluster',
    x: 440,
    y: 505,
    mobile: { x: 200, y: 330 },
    mobileOmit: true,
  },
];
export const knowledgeCorrection = {
  entity: 'paris',
  before: 'germany',
  after: 'france',
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
export function heroPoint(
  id: 'paris' | 'france',
  layout: GraphLayout,
): GraphPoint {
  return layout === 'desktop'
    ? { x: id === 'paris' ? 140 : 610, y: id === 'paris' ? 300 : 120 }
    : { x: id === 'paris' ? 105 : 295, y: 80 };
}
export function curvedLink(from: GraphPoint, to: GraphPoint) {
  const middle = (from.x + to.x) / 2 + (from.y - to.y) * 0.12;
  return `M${from.x} ${from.y}C${middle} ${from.y + 18} ${middle} ${to.y - 18} ${to.x} ${to.y}`;
}
export const graphLinks = [
  ['europe', 'france'],
  ['europe', 'germany'],
  ['germany', 'berlin'],
  ['paris', 'eiffel'],
  ['berlin', 'gate'],
  ['cities', 'paris'],
  ['landmarks', 'eiffel'],
  ['landmarks', 'gate'],
] as const;
export function correctionPath(
  layout: GraphLayout,
  corrected: boolean,
  flow = false,
) {
  return curvedLink(
    graphPoint(knowledgeCorrection.entity, layout, flow),
    graphPoint(
      corrected ? knowledgeCorrection.after : knowledgeCorrection.before,
      layout,
      flow,
    ),
  );
}

const branchOffsets = [
  { x: -70, y: -45 },
  { x: -95, y: 15 },
  { x: 75, y: -35 },
  { x: 90, y: 30 },
] as const;
// Small local branches add density without connections crossing the whole canvas.
export const peripheralPoints = [
  'europe',
  'france',
  'germany',
  'paris',
  'berlin',
  'landmarks',
].flatMap((anchor) =>
  branchOffsets.map((offset, index) => {
    const node = graphNode(anchor);
    return {
      x: node.x + offset.x,
      y: node.y + offset.y,
      anchor,
      radius: index === 0 ? 2.5 : 1.8,
      mobile: {
        x: node.mobile.x + offset.x * 0.35,
        y: node.mobile.y + offset.y * 0.4,
      },
      mobileVisible:
        ['france', 'germany', 'paris', 'berlin'].includes(anchor) &&
        index % 2 === 0,
    };
  }),
);
export function peripheralPath(index: number, layout: GraphLayout) {
  const point = peripheralPoints[index];
  if (!point) throw new Error('Missing peripheral point');
  return curvedLink(
    graphPoint(point.anchor, layout),
    layout === 'mobile' ? point.mobile : point,
  );
}

export const graphViewBox = {
  desktop: { hero: '0 0 900 420', story: '0 0 900 600' },
  mobile: { hero: '0 0 400 150', story: '0 0 400 360' },
} as const;
