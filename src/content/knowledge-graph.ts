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
    mobile: { x: 200, y: 260 },
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
  desktop: { story: '0 0 900 600' },
  mobile: { story: '0 0 400 360' },
} as const;

// Authored outer branches share the core graph's coordinate space and never move.
export const overloadNodes = [
  {
    id: 'north-america',
    label: 'North America',
    x: -150,
    y: 110,
    mobile: { x: 35, y: 405 },
    parent: 'cities',
  },
  {
    id: 'mexico',
    label: 'Mexico',
    x: -175,
    y: 270,
    mobile: { x: 110, y: 475 },
    parent: 'north-america',
  },
  {
    id: 'queretaro',
    label: 'Querétaro',
    x: -100,
    y: 410,
    mobile: { x: 230, y: 470 },
    parent: 'mexico',
  },
  {
    id: 'canada',
    label: '',
    x: -310,
    y: 180,
    mobile: { x: 10, y: 475 },
    parent: 'north-america',
  },
  {
    id: 'arts',
    label: 'Arts',
    x: 1040,
    y: 170,
    mobile: { x: 360, y: 420 },
    parent: 'landmarks',
  },
  {
    id: 'architecture',
    label: '',
    x: 1080,
    y: 380,
    mobile: { x: 350, y: 490 },
    parent: 'arts',
  },
  {
    id: 'history',
    label: 'History',
    x: 950,
    y: 570,
    mobile: { x: 200, y: 560 },
    parent: 'architecture',
  },
  {
    id: 'places',
    label: '',
    x: 490,
    y: 670,
    mobile: { x: 70, y: 550 },
    parent: 'landmarks',
  },
] as const;
export function overloadPoint(id: string, layout: GraphLayout): GraphPoint {
  const node = overloadNodes.find((node) => node.id === id);
  return node
    ? layout === 'mobile'
      ? node.mobile
      : node
    : graphPoint(id, layout);
}
const outerOffsets = [
  [-65, -65],
  [-105, -20],
  [-85, 55],
  [-15, 75],
  [65, 50],
  [90, -15],
  [40, -70],
] as const;
export const overloadBranches = overloadNodes.flatMap((node) =>
  outerOffsets.map(([x, y], index) => ({
    id: node.id + '-' + index,
    anchor: node.id,
    x: node.x + x,
    y: node.y + y,
    mobile: { x: node.mobile.x + x * 0.24, y: node.mobile.y + y * 0.3 },
    mobileVisible: index % 2 === 0,
  })),
);
export const overloadViewBox = {
  desktop: '-450 -80 1700 900',
  mobile: '-35 -25 470 640',
} as const;
