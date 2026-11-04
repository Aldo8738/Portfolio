import {
  knowledgeNodes,
  graphLinks,
  graphPoint,
  curvedLink,
  correctionPath,
  peripheralPoints,
  peripheralPath,
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
  attributes(find('.kb-graph'), {
    viewBox: desktop ? '40 25 800 550' : '0 0 400 360',
  });
  knowledgeNodes.forEach((node) => {
    const point = graphPoint(node.id, layout);
    const element = find(`[data-node-id="${node.id}"]`);
    attributes(element, { transform: `translate(${point.x} ${point.y})` });
    attributes(element?.querySelector('text') ?? null, {
      x: desktop ? 14 : 0,
      y: desktop
        ? -14
        : ['sports', 'skyrim', 'fifa'].includes(node.id)
          ? 25
          : -16,
      'text-anchor': desktop ? 'start' : 'middle',
    });
  });
  graphLinks.forEach(([from, to], index) =>
    attributes(find(`[data-network-edge="${index}"]`), {
      d: curvedLink(graphPoint(from, layout), graphPoint(to, layout)),
    }),
  );
  peripheralPoints.forEach((point, index) => {
    const position = desktop ? point : point.mobile;
    attributes(find(`[data-peripheral-point="${index}"]`), {
      cx: position.x,
      cy: position.y,
    });
    attributes(find(`[data-peripheral-path="${index}"]`), {
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
    x: desktop ? 520 : 210,
    y: desktop ? 150 : 65,
    width: desktop ? 310 : 170,
    height: desktop ? 335 : 225,
  });
  attributes(find('[data-viewport-label]'), {
    x: desktop ? 532 : 215,
    y: desktop ? 138 : 53,
  });
  attributes(find('[data-priority-path]'), {
    d: desktop
      ? 'M850 110C810 105 770 165 745 215'
      : 'M390 35C350 25 340 65 330 85',
  });
  attributes(find('[data-priority-label]'), {
    x: desktop ? 795 : 388,
    y: desktop ? 95 : 20,
  });
  attributes(find('[data-backend-node]'), {
    transform: desktop ? 'translate(770 480)' : 'translate(125 280)',
  });
  root
    .querySelectorAll('[data-backend-shape], [data-backend-pulse]')
    .forEach((element) =>
      attributes(element, { width: desktop ? 108 : 150, height: 54 }),
    );
  attributes(find('[data-backend-label]'), { x: desktop ? 54 : 75, y: 33 });
  attributes(find('[data-edit-path]'), {
    d: desktop
      ? 'M625 425C700 425 700 507 770 507'
      : 'M185 50C100 50 22 90 22 210Q22 307 125 307',
  });
  attributes(find('[data-return-path]'), {
    d: desktop
      ? 'M824 534C824 588 640 585 610 440'
      : 'M275 307Q378 307 378 220V95Q378 50 215 50',
  });
  for (const direction of ['edit', 'return'] as const) {
    const label = find(`[data-${direction}-label]`);
    const x = desktop
      ? direction === 'edit'
        ? 700
        : 800
      : direction === 'edit'
        ? 80
        : 312;
    attributes(label, {
      x,
      y: desktop ? (direction === 'edit' ? 451 : 560) : 215,
    });
    const lines = desktop
      ? direction === 'edit'
        ? ['USER EDIT / API', '']
        : ['WEBSOCKET /', 'GRAPH UPDATE']
      : direction === 'edit'
        ? ['USER EDIT', '/ API']
        : ['WEBSOCKET', 'UPDATE'];
    label?.querySelectorAll('tspan').forEach((line, index) => {
      attributes(line, { x, dy: index === 0 ? 0 : 20 });
      line.textContent = lines[index] ?? '';
    });
  }
}
