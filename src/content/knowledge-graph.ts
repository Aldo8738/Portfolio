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
    y: 570,
    mobile: { x: 200, y: 560 },
    parent: 'architecture',
  },
  {
    id: 'places',
    label: '',
    x: 490,
    y: 610,
    mobile: { x: 70, y: 550 },
    parent: 'landmarks',
  },
] as const;
// Each neighborhood has its own silhouette and branching structure; -1 joins its hub.
const overloadNeighborhoods = [
  {
    anchor: 'north-america',
    points: [
      [-90, -50, -1, 1],
      [-180, -70, 0, 0],
      [-210, 10, 0, 0],
      [-125, 45, 2, 1],
      [-200, 85, 3, 0],
      [20, -105, -1, 1],
      [120, -90, 5, 0],
      [90, 20, 5, 1],
    ],
  },
  {
    anchor: 'mexico',
    points: [
      [-85, -55, -1, 1],
      [-175, -40, 0, 0],
      [-195, 35, 0, 0],
      [-105, 65, 2, 1],
      [-25, 115, 3, 0],
      [80, -35, -1, 1],
    ],
  },
  {
    anchor: 'queretaro',
    points: [
      [-60, 55, -1, 1],
      [-145, 75, 0, 0],
      [-160, 145, 1, 0],
      [30, 110, 0, 1],
      [130, 90, 3, 0],
    ],
  },
  {
    anchor: 'canada',
    points: [
      [-95, -35, -1, 1],
      [-115, 40, 0, 0],
      [-45, 85, 1, 1],
      [40, 60, 2, 0],
      [-80, 135, 2, 0],
      [30, -60, -1, 1],
      [85, -110, 5, 0],
    ],
  },
  {
    anchor: 'arts',
    points: [
      [-80, -60, -1, 1],
      [-160, -100, 0, 0],
      [-165, 10, 0, 1],
      [-80, 65, 2, 0],
      [95, 15, -1, 1],
      [155, -55, 4, 0],
      [5, 110, 3, 1],
      [110, 90, 6, 0],
      [175, 40, 4, 0],
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
    ],
  },
  {
    anchor: 'history',
    points: [
      [-90, 25, -1, 1],
      [-160, 85, 0, 0],
      [95, 60, -1, 1],
      [145, 130, 2, 0],
      [20, 150, 3, 0],
      [-60, 130, 4, 1],
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
    ],
  },
] as const;

export const overloadBranches = overloadNeighborhoods.flatMap(
  ({ anchor, points }) => {
    const hub = overloadNodes.find((node) => node.id === anchor);
    if (!hub) throw new Error('Missing overload hub: ' + anchor);
    return points.map(([x, y, parent, secondary], index) => ({
      id: anchor + '-' + index,
      anchor,
      parent: parent === -1 ? anchor : anchor + '-' + parent,
      x: hub.x + x,
      y: hub.y + y,
      mobile: { x: hub.mobile.x + x * 0.24, y: hub.mobile.y + y * 0.3 },
      mobileVisible: index < 4,
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
    bend: 0.08,
  })),
  ...overloadBranches.map((node, index) => ({
    from: node.parent,
    to: node.id,
    mobileVisible: node.mobileVisible,
    role: node.role,
    bend: index % 3 === 0 ? -0.08 : 0.06,
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
      tx * dx + ty * dy > 0 &&
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
  desktop: '-500 -60 1800 880',
  mobile: '-35 -25 470 640',
} as const;
