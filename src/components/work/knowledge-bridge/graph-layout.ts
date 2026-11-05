import {
  knowledgeNodes,
  graphLinks,
  graphPoint,
  curvedLink,
  correctionPath,
  peripheralPoints,
  peripheralPath,
  graphViewBox,
  type GraphLayout,
} from '../../../content/knowledge-graph';

function attributes(
  element: Element | null,
  values: Record<string, string | number>,
) {
  if (!element)
    throw new Error('Knowledge Bridge graph geometry is incomplete');
  for (const [key, value] of Object.entries(values))
    element.setAttribute(key, String(value));
}
export function applyGraphLayout(root: HTMLElement, layout: GraphLayout) {
  const find = (selector: string) => root.querySelector(selector);
  const desktop = layout === 'desktop';
  const host = root.querySelector<HTMLElement>('[data-network-host]');
  if (host) host.dataset.layout = layout;
  attributes(find('.kb-graph'), { viewBox: graphViewBox[layout].story });
  knowledgeNodes.forEach((node) => {
    const point = graphPoint(node.id, layout);
    const element = find('[data-node-id="' + node.id + '"]');
    attributes(element, {
      transform: 'translate(' + point.x + ' ' + point.y + ')',
    });
    attributes(element?.querySelector('text') ?? null, {
      x: 0,
      y: ['paris', 'berlin', 'eiffel', 'gate', 'landmarks'].includes(node.id)
        ? 28
        : -18,
      'text-anchor': 'middle',
    });
  });
  graphLinks.forEach(([from, to], index) =>
    attributes(find('[data-network-edge="' + index + '"]'), {
      d: curvedLink(graphPoint(from, layout), graphPoint(to, layout)),
    }),
  );
  peripheralPoints.forEach((point, index) => {
    const position = desktop ? point : point.mobile;
    attributes(find('[data-peripheral-point="' + index + '"]'), {
      cx: position.x,
      cy: position.y,
    });
    attributes(find('[data-peripheral-path="' + index + '"]'), {
      d: peripheralPath(index, layout),
    });
  });
  attributes(find('[data-incorrect-edge]'), {
    d: correctionPath(layout, false),
  });
  attributes(find('[data-corrected-edge]'), {
    d: correctionPath(layout, true),
  });
  attributes(find('[data-viewport-frame]'), {
    d: desktop
      ? 'M195 175V165H220M310 165H335V175M335 390V400H310M220 400H195V390'
      : 'M45 140V130H65M155 130H175V140M175 255V265H155M65 265H45V255',
  });
  attributes(find('[data-viewport-label]'), {
    x: desktop ? 200 : 45,
    y: desktop ? 145 : 120,
  });
  attributes(find('[data-priority-path]'), {
    d: desktop
      ? 'M450 140C400 120 310 140 265 200'
      : 'M210 85C180 70 130 75 95 110',
  });
  attributes(find('[data-priority-label]'), {
    x: desktop ? 540 : 265,
    y: desktop ? 110 : 65,
  });
  attributes(find('[data-backend-node]'), {
    transform: desktop ? 'translate(500 485)' : 'translate(125 280)',
  });
  root
    .querySelectorAll('[data-backend-shape]')
    .forEach((element) =>
      attributes(element, { width: desktop ? 120 : 150, height: 54 }),
    );
  attributes(find('[data-backend-label]'), { x: desktop ? 60 : 75, y: 33 });
  attributes(find('[data-proposal-label]'), {
    x: desktop ? 455 : 200,
    y: desktop ? 270 : 195,
  });
  attributes(find('[data-edit-path]'), {
    d: desktop
      ? 'M280 355C390 355 390 512 500 512'
      : 'M110 200C160 200 175 245 175 280',
  });
  attributes(find('[data-return-path]'), {
    d: desktop
      ? 'M500 512C390 512 390 355 280 355'
      : 'M175 280C175 245 160 200 110 200',
  });
  for (const direction of ['edit', 'return'] as const) {
    const label = find('[data-' + direction + '-label]');
    const x = desktop ? 520 : 260;
    attributes(label, {
      x,
      y: desktop ? 415 : 245,
    });
    const lines = desktop
      ? direction === 'edit'
        ? ['USER EDIT / API', '']
        : ['WEBSOCKET / GRAPH UPDATE', '']
      : direction === 'edit'
        ? ['USER EDIT', '/ API']
        : ['WEBSOCKET', 'UPDATE'];
    label?.querySelectorAll('tspan').forEach((line, index) => {
      attributes(line, { x, dy: index === 0 ? 0 : 20 });
      line.textContent = lines[index] ?? '';
    });
  }
}
