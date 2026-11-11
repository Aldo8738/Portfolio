export type GraphLayout = 'desktop' | 'mobile';
export interface GraphPoint {
  x: number;
  y: number;
}
export interface KnowledgeNode extends GraphPoint {
  id: string;
  label: string;
  role: 'idea' | 'cluster' | 'item';
  overloadLabelTier: 'primary' | 'secondary' | 'tertiary';
  mobile: GraphPoint;
  mobileOmit?: boolean;
  focused?: boolean;
}

// Authored geography keeps each country's city and landmark on its own branch.
export const knowledgeNodes: readonly KnowledgeNode[] = [
  {
    id: 'europe',
    label: 'Europe',
    overloadLabelTier: 'primary',
    role: 'idea',
    x: 450,
    y: 75,
    mobile: { x: 200, y: 35 },
  },
  {
    id: 'france',
    label: 'France',
    overloadLabelTier: 'primary',
    role: 'cluster',
    x: 265,
    y: 205,
    mobile: { x: 95, y: 110 },
    focused: true,
  },
  {
    id: 'germany',
    label: 'Germany',
    overloadLabelTier: 'primary',
    role: 'cluster',
    x: 645,
    y: 205,
    mobile: { x: 300, y: 110 },
  },
  {
    id: 'paris',
    label: 'Paris',
    overloadLabelTier: 'primary',
    role: 'item',
    x: 265,
    y: 355,
    mobile: { x: 95, y: 200 },
    focused: true,
  },
  {
    id: 'berlin',
    label: 'Berlin',
    overloadLabelTier: 'tertiary',
    role: 'item',
    x: 645,
    y: 355,
    mobile: { x: 300, y: 200 },
  },
  {
    id: 'eiffel',
    label: 'Eiffel Tower',
    overloadLabelTier: 'tertiary',
    role: 'item',
    x: 130,
    y: 475,
    mobile: { x: 80, y: 305 },
    focused: true,
  },
  {
    id: 'gate',
    label: 'Brandenburg Gate',
    overloadLabelTier: 'tertiary',
    role: 'item',
    x: 710,
    y: 475,
    mobile: { x: 290, y: 305 },
  },
  {
    id: 'cities',
    label: 'Cities',
    overloadLabelTier: 'secondary',
    role: 'cluster',
    x: 95,
    y: 100,
    mobile: { x: 45, y: 30 },
    mobileOmit: true,
  },
  {
    id: 'landmarks',
    label: 'Landmarks',
    overloadLabelTier: 'secondary',
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

// Overload detail shares the core graph's coordinate space and never moves.
export const overloadNodes = [
  {
    id: 'north-america',
    label: 'North America',
    x: -150,
    y: 110,
    mobile: { x: 45, y: 405 },
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
    x: -325,
    y: 180,
    mobile: { x: 10, y: 475 },
    parent: 'north-america',
  },
  {
    id: 'arts',
    label: '',
    x: 1050,
    y: 170,
    mobile: { x: 360, y: 420 },
    parent: 'landmarks',
  },
  {
    id: 'architecture',
    label: '',
    x: 1095,
    y: 380,
    mobile: { x: 350, y: 490 },
    parent: 'arts',
  },
  {
    id: 'history',
    label: '',
    x: 950,
    y: 500,
    mobile: { x: 200, y: 560 },
    parent: 'architecture',
  },
  {
    id: 'places',
    label: '',
    x: 490,
    y: 560,
    mobile: { x: 70, y: 550 },
    parent: 'landmarks',
  },
] as const;
// Each neighborhood has its own silhouette and branching structure; -1 joins its hub.
const overloadNeighborhoods = [
  {
    anchor: 'north-america',
    points: [
      [-105, -45, -1, 1],
      [-160, -75, 0, 1],
      [-185, -50, 1, 0],
      [-145, -40, 1, 0],
      [-185, -100, 1, 0],
      [35, -95, -1, 1],
      [115, -115, 5, 1],
      [85, -80, 6, 0],
      [-145, -110, 1, 0],
      [-175, -130, 8, 0],
      [-210, -65, 1, 0],
      [145, -145, 6, 0],
      [160, -105, 6, 0],
    ],
  },
  {
    anchor: 'mexico',
    points: [
      [-85, -55, -1, 1],
      [-145, -15, 0, 1],
      [-170, 15, 1, 0],
      [-175, 65, 1, 1],
      [-125, 95, 3, 0],
      [80, -35, -1, 1],
      [-220, 65, 3, 1],
      [-245, 40, 6, 0],
      [-240, 95, 6, 0],
      [-205, 105, 6, 0],
      [20, 45, 5, 0],
    ],
  },
  {
    anchor: 'queretaro',
    points: [
      [-60, 55, -1, 1],
      [-115, 85, 0, 1],
      [-155, 130, 1, 0],
      [30, 110, 0, 1],
      [130, 90, 3, 0],
      [-185, 145, 2, 1],
      [-220, 125, 5, 0],
      [-210, 170, 5, 0],
      [-155, 175, 5, 0],
      [65, 140, 3, 0],
    ],
  },
  {
    anchor: 'canada',
    points: [
      [-100, 5, -1, 1],
      [-125, 25, 0, 0],
      [-60, 80, -1, 1],
      [-25, 95, 2, 0],
      [-80, 110, 2, 0],
      [30, -55, -1, 1],
      [65, -80, 5, 0],
      [-135, -10, 0, 0],
      [-110, -30, 0, 0],
      [-65, -15, 0, 0],
    ],
  },
  {
    anchor: 'arts',
    points: [
      [-80, -60, -1, 1],
      [-130, -80, 0, 0],
      [-165, 10, 0, 1],
      [-80, 65, 2, 0],
      [115, 15, -1, 1],
      [155, -15, 4, 0],
      [5, 110, 3, 1],
      [110, 90, 6, 0],
      [160, 40, 4, 0],
      [70, -95, -1, 1],
      [45, -120, 9, 0],
      [95, -130, 9, 0],
      [115, -95, 9, 0],
      [-35, -110, 0, 0],
    ],
  },
  {
    anchor: 'architecture',
    points: [
      [-50, -70, -1, 1],
      [60, -100, 0, 0],
      [120, -20, 1, 0],
      [-100, 30, -1, 1],
      [-170, -5, 3, 0],
      [10, 100, 3, 1],
      [125, 95, 5, 0],
      [155, 35, 6, 0],
      [170, 150, 6, 1],
      [200, 135, 8, 0],
      [195, 180, 8, 0],
      [145, 180, 8, 0],
      [170, -20, 2, 0],
    ],
  },
  {
    anchor: 'history',
    points: [
      [-90, 25, -1, 1],
      [-160, 85, 0, 0],
      [95, 60, -1, 1],
      [145, 85, 2, 0],
      [85, 115, 2, 0],
      [-60, 130, -1, 1],
      [130, 135, 2, 1],
      [160, 155, 6, 0],
      [110, 165, 6, 0],
      [100, 130, 6, 0],
    ],
  },
  {
    anchor: 'places',
    points: [
      [-65, -65, -1, 1],
      [-150, -35, 0, 0],
      [-220, 30, 1, 0],
      [-135, 95, 1, 1],
      [-35, 125, 3, 0],
      [65, 80, -1, 0],
      [150, 40, 5, 1],
      [-160, 100, 3, 1],
      [-205, 125, 7, 0],
      [-125, 130, 7, 0],
      [-75, 105, 7, 0],
      [90, 115, 5, 0],
    ],
  },
  {
    anchor: 'europe',
    points: [
      [-105, -65, -1, 1],
      [-145, -110, 0, 0],
      [-80, -145, 1, 0],
      [-30, -90, 2, 0],
      [85, -70, -1, 1],
      [135, -115, 4, 0],
      [190, -70, 5, 0],
      [145, -25, 4, 0],
      [-65, 65, -1, 1],
      [-115, 100, 8, 0],
      [45, 80, -1, 0],
      [95, 105, 10, 0],
      [-25, 155, 8, 1],
      [-95, 175, 12, 0],
      [55, 160, 10, 1],
      [15, 205, 14, 0],
      [5, 125, 12, 0],
      [-55, 190, 15, 1],
      [90, 185, 14, 0],
    ],
  },
  {
    anchor: 'france',
    points: [
      [-60, -65, -1, 1],
      [-110, -85, 0, 0],
      [-90, -20, 0, 0],
      [65, -45, -1, 1],
      [110, -70, 3, 0],
      [125, -5, 3, 0],
      [45, 65, -1, 1],
      [95, 90, 6, 0],
      [-40, 75, -1, 0],
      [-110, 60, 8, 0],
      [-155, 10, 9, 1],
      [-185, 55, 10, 0],
      [-200, -30, 10, 0],
      [5, 105, 8, 0],
      [115, 60, 6, 1],
      [145, 95, 14, 0],
      [175, 45, 5, 1],
      [155, 150, 15, 0],
      [85, 95, 14, 0],
      [135, 125, 15, 1],
      [85, 145, 13, 0],
    ],
  },
  {
    anchor: 'germany',
    points: [
      [-65, -60, -1, 1],
      [-105, -95, 0, 0],
      [-115, -25, 0, 0],
      [70, -45, -1, 1],
      [120, -80, 3, 0],
      [160, -25, 4, 0],
      [95, 25, 3, 0],
      [-45, 65, -1, 1],
      [-100, 85, 7, 0],
      [50, 80, -1, 1],
      [120, 105, 9, 0],
      [155, 60, 10, 0],
      [-115, 40, 7, 1],
      [-155, 65, 12, 0],
      [-140, 120, 8, 1],
      [-190, 100, 14, 0],
      [-80, 115, 14, 0],
      [-145, 95, 13, 1],
      [-65, 145, 7, 0],
    ],
  },
  {
    anchor: 'paris',
    points: [
      [-60, -50, -1, 1],
      [-105, -85, 0, 0],
      [-120, -20, 0, 0],
      [65, -35, -1, 1],
      [100, -75, 3, 0],
      [140, -15, 3, 0],
      [55, 55, -1, 1],
      [100, 95, 6, 0],
      [-45, 65, -1, 0],
      [-95, 95, 8, 0],
      [-175, 30, 2, 1],
      [-215, -5, 10, 0],
      [-225, 60, 10, 0],
      [5, -100, 0, 0],
      [155, 65, 6, 1],
      [185, 30, 5, 0],
      [135, 115, 7, 1],
      [225, 90, 14, 0],
      [90, 35, 6, 0],
      [120, 75, 14, 1],
      [180, 75, 17, 0],
    ],
  },
  {
    anchor: 'berlin',
    points: [
      [-70, -45, -1, 1],
      [-120, -70, 0, 0],
      [-145, -10, 1, 0],
      [65, -35, -1, 1],
      [110, -65, 3, 0],
      [155, -5, 3, 0],
      [-55, 60, -1, 1],
      [-110, 95, 6, 0],
      [45, 65, -1, 0],
      [95, 95, 8, 0],
      [195, 45, 5, 1],
      [225, 10, 10, 0],
      [235, 80, 10, 0],
      [5, -100, 0, 0],
      [-180, 35, 6, 1],
      [-120, 110, 7, 0],
      [-90, 55, 6, 1],
      [-200, -5, 2, 0],
      [-125, 25, 14, 0],
      [-90, 95, 16, 1],
      [-170, 70, 15, 0],
    ],
  },
  {
    anchor: 'landmarks',
    points: [
      [-65, -55, -1, 1],
      [-110, -85, 0, 0],
      [-135, -25, 0, 0],
      [60, -65, -1, 1],
      [110, -95, 3, 0],
      [150, -40, 3, 0],
      [-50, 65, -1, 1],
      [-95, 105, 6, 0],
      [-140, 70, 7, 0],
      [85, 45, -1, 1],
      [135, 80, 9, 0],
      [175, 25, 9, 0],
      [0, -105, 0, 1],
      [95, -125, 3, 0],
      [35, -25, 9, 1],
      [125, -5, 14, 0],
      [-15, -65, 12, 0],
      [65, -75, 13, 1],
      [80, -35, 14, 0],
    ],
  },
  {
    anchor: 'cities',
    points: [
      [-65, -70, -1, 1],
      [-100, -105, 0, 0],
      [-40, -120, 0, 0],
      [70, -85, -1, 1],
      [115, -125, 3, 0],
      [130, -60, 3, 0],
      [80, 60, -1, 1],
      [135, 85, 6, 0],
      [160, 25, 6, 1],
      [210, 5, 8, 0],
      [245, 60, 9, 1],
      [190, 95, 10, 0],
    ],
  },
] as const;

export const overloadBranches = overloadNeighborhoods.flatMap(
  ({ anchor, points }) => {
    const coreHub = knowledgeNodes.find((node) => node.id === anchor);
    const hub = coreHub ?? overloadNodes.find((node) => node.id === anchor);
    if (!hub) throw new Error('Missing overload hub: ' + anchor);
    return points.map(([x, y, parent, secondary], index) => ({
      id: anchor + '-' + index,
      anchor,
      parent: parent === -1 ? anchor : anchor + '-' + parent,
      x: hub.x + x,
      y: hub.y + y,
      mobile: { x: hub.mobile.x + x * 0.24, y: hub.mobile.y + y * 0.3 },
      mobileVisible: index < (coreHub ? 2 : 4),
      role: secondary ? ('secondary' as const) : ('peripheral' as const),
    }));
  },
);

export function overloadPoint(id: string, layout: GraphLayout): GraphPoint {
  const node =
    overloadNodes.find((node) => node.id === id) ??
    overloadBranches.find((node) => node.id === id);
  if (node) return layout === 'mobile' ? node.mobile : node;
  if (id.startsWith('detail-')) {
    const point = peripheralPoints[Number(id.slice(7))];
    if (!point) throw new Error('Missing overload detail: ' + id);
    return layout === 'mobile' ? point.mobile : point;
  }
  return graphPoint(id, layout);
}

// Bridges join neighboring regions and existing core detail without adding focused-state lines.
const overloadBridges = [
  ['europe-16', 'france-16', false, 0.1],
  ['europe-17', 'france-18', false, -0.08],
  ['europe-18', 'germany-17', false, 0.12],
  ['france-18', 'paris-18', false, -0.1],
  ['france-19', 'berlin-17', false, 0.08],
  ['france-20', 'paris-3', false, -0.12],
  ['germany-16', 'berlin-18', false, 0.1],
  ['germany-17', 'europe-15', false, -0.08],
  ['germany-18', 'berlin-0', false, 0.12],
  ['paris-18', 'landmarks-1', false, -0.1],
  ['paris-19', 'landmarks-16', false, 0.08],
  ['paris-20', 'berlin-20', false, -0.12],
  ['berlin-18', 'landmarks-13', false, 0.1],
  ['berlin-19', 'landmarks-15', false, -0.08],
  ['berlin-20', 'paris-14', false, 0.12],
  ['landmarks-16', 'paris-16', false, -0.1],
  ['landmarks-17', 'berlin-15', false, 0.08],
  ['landmarks-18', 'landmarks-11', false, -0.12],
  ['canada-9', 'north-america-3', false, 0.1],
  ['mexico-9', 'queretaro-0', false, -0.12],
  ['queretaro-8', 'places-2', false, 0.1],
  ['arts-8', 'architecture-1', false, -0.08],
  ['architecture-7', 'berlin-11', false, 0.1],
  ['history-7', 'architecture-3', false, -0.1],
  ['places-10', 'places-11', false, 0.1],
  ['europe-3', 'europe-5', false, -0.1],
  ['north-america-0', 'north-america-5', false, 0.16],
  ['north-america-4', 'canada-6', false, -0.12],
  ['canada-0', 'canada-2', false, 0.12],
  ['canada-2', 'mexico-0', false, -0.14],
  ['mexico-5', 'cities-6', false, 0.16],
  ['mexico-4', 'queretaro-1', false, -0.12],
  ['queretaro-1', 'queretaro-3', false, 0.14],
  ['arts-4', 'germany-4', false, -0.12],
  ['arts-6', 'architecture-3', false, 0.12],
  ['architecture-0', 'architecture-3', false, -0.14],
  ['architecture-5', 'history-0', false, 0.12],
  ['history-2', 'places-6', false, -0.16],
  ['places-0', 'places-5', false, 0.12],
  ['france-6', 'france-8', false, -0.14],
  ['france-9', 'paris-0', false, 0.12],
  ['europe-8', 'europe-14', false, -0.16],
  ['berlin-0', 'berlin-17', false, 0.12],
  ['landmarks-12', 'paris-5', false, -0.14],
  ['germany-12', 'germany-14', false, 0.12],
  ['paris-14', 'berlin-17', false, -0.16],
  ['europe-15', 'france-15', false, 0.12],
  ['landmarks-13', 'germany-14', false, -0.14],
  ['paris-3', 'paris-14', false, 0.16],
  ['berlin-6', 'landmarks-12', false, -0.12],
  ['europe-12', 'france-16', false, 0.12],
  ['europe-13', 'france-14', false, -0.09],
  ['europe-14', 'germany-12', false, 0.1],
  ['europe-15', 'germany-13', false, -0.08],
  ['europe-12', 'europe-15', false, 0.08],
  ['europe-14', 'france-16', false, -0.11],
  ['france-14', 'germany-13', false, 0.09],
  ['france-15', 'germany-15', false, -0.1],
  ['france-16', 'germany-12', false, 0.06],
  ['france-17', 'berlin-17', false, -0.08],
  ['france-17', 'paris-15', false, 0.12],
  ['germany-14', 'berlin-17', false, -0.08],
  ['germany-15', 'paris-5', false, 0.1],
  ['germany-13', 'berlin-1', false, -0.1],
  ['paris-14', 'landmarks-12', false, 0.1],
  ['paris-15', 'berlin-18', false, -0.12],
  ['paris-16', 'landmarks-0', false, 0.08],
  ['paris-17', 'berlin-15', false, -0.12],
  ['berlin-14', 'landmarks-12', false, 0.09],
  ['berlin-16', 'landmarks-13', false, -0.1],
  ['berlin-15', 'landmarks-14', false, 0.08],
  ['landmarks-14', 'paris-17', false, 0.14],
  ['landmarks-15', 'berlin-9', false, 0.1],
  ['cities-8', 'france-0', false, -0.08],
  ['cities-9', 'europe-9', false, 0.09],
  ['cities-10', 'france-3', false, -0.1],
  ['cities-11', 'france-6', false, 0.08],
  ['europe', 'france-14', false, 0.12],
  ['europe', 'germany-13', false, -0.11],
  ['europe', 'france-5', false, 0.1],
  ['europe', 'germany-7', false, -0.1],
  ['france', 'paris-4', false, 0.09],
  ['france', 'paris-13', false, -0.1],
  ['france', 'germany-15', false, 0.12],
  ['paris', 'france-14', false, -0.12],
  ['paris', 'landmarks-12', false, 0.1],
  ['paris', 'berlin-14', false, -0.08],
  ['germany', 'berlin-13', false, 0.1],
  ['germany', 'berlin-0', false, -0.12],
  ['berlin', 'landmarks-13', false, 0.08],
  ['berlin', 'germany-14', false, -0.1],
  ['landmarks', 'paris-14', false, 0.12],
  ['landmarks', 'berlin-16', false, -0.1],
  ['landmarks', 'paris-16', false, 0.1],
  ['mexico-10', 'france-11', false, -0.1],
  ['north-america-7', 'cities-8', false, 0.09],
  ['arts-6', 'berlin-11', false, 0.1],
  ['architecture-4', 'berlin-12', false, -0.08],
  ['places-6', 'landmarks-15', false, 0.09],
  ['europe-0', 'cities-3', false, 0.06],
  ['europe-3', 'europe-4', false, -0.08],
  ['europe-7', 'germany-0', false, 0.06],
  ['europe-8', 'france-3', false, -0.06],
  ['europe-9', 'france-4', false, 0.06],
  ['europe-10', 'germany-2', false, -0.08],
  ['france-5', 'germany-8', false, 0.06],
  ['france-6', 'paris-3', false, -0.06],
  ['france-7', 'paris-4', false, 0.08],
  ['france-8', 'paris-0', false, -0.06],
  ['france-9', 'cities-6', false, 0.06],
  ['france-10', 'mexico-5', false, -0.06],
  ['france-13', 'paris-13', false, 0.08],
  ['germany-6', 'arts-2', false, 0.06],
  ['germany-7', 'berlin-0', false, -0.06],
  ['germany-9', 'berlin-3', false, 0.06],
  ['germany-10', 'berlin-4', false, -0.08],
  ['germany-11', 'architecture-4', false, 0.06],
  ['paris-5', 'berlin-2', false, -0.08],
  ['paris-6', 'landmarks-0', false, 0.06],
  ['paris-7', 'landmarks-1', false, -0.06],
  ['paris-8', 'detail-14', false, 0.06],
  ['paris-10', 'queretaro-4', false, -0.06],
  ['paris-12', 'eiffel', false, 0.08],
  ['berlin-6', 'landmarks-3', false, -0.06],
  ['berlin-7', 'landmarks-4', false, 0.06],
  ['berlin-8', 'gate', false, -0.06],
  ['berlin-10', 'architecture-3', false, 0.08],
  ['landmarks-2', 'eiffel', false, -0.06],
  ['landmarks-5', 'gate', false, 0.08],
  ['landmarks-6', 'places-1', false, -0.06],
  ['landmarks-9', 'places-5', false, 0.06],
  ['landmarks-11', 'history-1', false, -0.06],
  ['cities-0', 'north-america-6', false, 0.06],
  ['cities-5', 'europe-1', false, -0.06],
  ['cities-7', 'france-2', false, 0.06],
  ['arts-9', 'germany-4', false, -0.06],
  ['architecture-8', 'history-2', false, 0.06],
  ['history-9', 'places-11', false, -0.06],
  ['queretaro-9', 'places-8', false, 0.06],
  ['north-america-3', 'canada-0', true, 0.08],
  ['canada-3', 'mexico-0', true, -0.06],
  ['canada-4', 'mexico-1', false, 0.1],
  ['north-america-7', 'detail-5', false, -0.06],
  ['north-america-6', 'cities', false, 0.12],
  ['mexico-3', 'queretaro-1', true, -0.08],
  ['mexico-5', 'detail-13', false, 0.06],
  ['queretaro-3', 'places-1', true, -0.06],
  ['queretaro-4', 'eiffel', false, 0.08],
  ['arts-0', 'detail-8', false, -0.06],
  ['arts-2', 'detail-10', false, 0.06],
  ['arts-3', 'architecture-0', true, -0.08],
  ['arts-4', 'architecture-1', false, 0.1],
  ['architecture-3', 'detail-18', false, -0.06],
  ['architecture-5', 'history-2', false, 0.06],
  ['architecture-6', 'history-3', false, -0.08],
  ['history-0', 'places-6', false, 0.08],
  ['history-1', 'places-5', false, -0.06],
  ['places-0', 'detail-21', false, -0.06],
  ['places-2', 'queretaro-2', true, 0.08],
  ['detail-2', 'detail-8', false, -0.08],
  ['detail-6', 'detail-1', false, 0.08],
  ['detail-7', 'detail-12', false, -0.06],
  ['detail-11', 'detail-16', false, 0.06],
  ['detail-15', 'detail-20', false, -0.08],
  ['north-america-1', 'canada-5', false, 0.06],
  ['north-america-2', 'canada-5', false, -0.06],
  ['canada-2', 'mexico-1', false, 0.06],
  ['canada-4', 'mexico-2', false, -0.06],
  ['mexico-4', 'queretaro-0', false, 0.06],
  ['arts-2', 'architecture-0', false, -0.06],
  ['arts-3', 'architecture-4', false, 0.06],
  ['architecture-4', 'history-0', false, -0.06],
  ['history-5', 'places-6', false, 0.06],
  ['detail-14', 'detail-17', false, -0.06],
  ['detail-6', 'detail-9', false, 0.06],
  ['detail-15', 'detail-16', false, -0.06],
  ['detail-23', 'history-0', false, 0.06],
  ['history-1', 'places', false, -0.06],
] as const;

export const overloadConnections = [
  ...overloadNodes.map((node) => ({
    from: node.parent,
    to: node.id,
    mobileVisible: true,
    role: 'secondary' as const,
    bend: 0.16,
  })),
  ...overloadBranches.map((node, index) => ({
    from: node.parent,
    to: node.id,
    mobileVisible: node.mobileVisible,
    role: node.role,
    bend: index % 3 === 0 ? -0.16 : 0.12,
  })),
  ...overloadBridges.map(([from, to, mobileVisible, bend]) => ({
    from,
    to,
    mobileVisible,
    role: 'secondary' as const,
    bend,
  })),
];

const supportingNodeIds = new Set(overloadBranches.map((node) => node.id));
const overloadPathCache: Partial<Record<GraphLayout, readonly string[]>> = {};

function overloadControl(
  fromId: string,
  toId: string,
  layout: GraphLayout,
  neighbors: ReadonlyMap<string, ReadonlySet<string>>,
  bend: number,
): GraphPoint {
  const from = overloadPoint(fromId, layout),
    to = overloadPoint(toId, layout);
  const dx = to.x - from.x,
    dy = to.y - from.y;
  const connected = neighbors.get(fromId);
  const otherId =
    connected?.size === 2
      ? [...connected].find((id) => id !== toId)
      : undefined;
  // A degree-two support point shares one tangent, so connected curves flow through it.
  if (supportingNodeIds.has(fromId) && otherId) {
    const other = overloadPoint(otherId, layout);
    const tx = to.x - other.x,
      ty = to.y - other.y;
    const length = Math.hypot(tx, ty);
    if (
      length > 0 &&
      tx * dx + ty * dy > length * Math.hypot(dx, dy) * 0.6 &&
      tx * (other.x - from.x) + ty * (other.y - from.y) < 0
    ) {
      const handle =
        Math.min(
          Math.hypot(dx, dy),
          Math.hypot(other.x - from.x, other.y - from.y),
        ) * 0.3;
      return {
        x: from.x + (tx / length) * handle,
        y: from.y + (ty / length) * handle,
      };
    }
  }
  return {
    x: from.x + dx * 0.32 - dy * bend,
    y: from.y + dy * 0.32 + dx * bend,
  };
}

function buildOverloadPaths(layout: GraphLayout) {
  const neighbors = new Map<string, Set<string>>();
  for (const edge of overloadConnections) {
    if (layout === 'mobile' && !edge.mobileVisible) continue;
    for (const [from, to] of [
      [edge.from, edge.to],
      [edge.to, edge.from],
    ]) {
      if (!from || !to) throw new Error('Missing overload endpoint');
      const connected = neighbors.get(from) ?? new Set<string>();
      connected.add(to);
      neighbors.set(from, connected);
    }
  }
  return overloadConnections.map((edge) => {
    const from = overloadPoint(edge.from, layout),
      to = overloadPoint(edge.to, layout);
    // Route the two long mobile branches around the landmark labels, not through them.
    if (layout === 'mobile' && edge.from === 'landmarks') {
      if (edge.to === 'arts')
        return `M${from.x} ${from.y}C280 242 380 240 405 275C425 320 420 370 ${to.x} ${to.y}`;
      if (edge.to === 'places')
        return `M${from.x} ${from.y}C135 230 135 250 145 300C170 360 90 500 ${to.x} ${to.y}`;
    }
    const start = overloadControl(
      edge.from,
      edge.to,
      layout,
      neighbors,
      edge.bend,
    );
    const end = overloadControl(
      edge.to,
      edge.from,
      layout,
      neighbors,
      -edge.bend,
    );
    return `M${from.x} ${from.y}C${start.x} ${start.y} ${end.x} ${end.y} ${to.x} ${to.y}`;
  });
}

export function overloadConnectionPath(index: number, layout: GraphLayout) {
  const paths = (overloadPathCache[layout] ??= buildOverloadPaths(layout));
  const path = paths[index];
  if (!path) throw new Error('Missing overload connection: ' + index);
  return path;
}

export const overloadViewBox = {
  desktop: '-550 -110 1940 880',
  mobile: '-35 -25 470 640',
} as const;
