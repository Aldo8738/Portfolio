import { expect, it } from 'vitest';
import { knowledgeBridgeMeasurements } from '../src/content/knowledge-bridge';
import { getProject } from '../src/content/portfolio';
import {
  getStoryBeat,
  getFocusedStoryBeat,
} from '../src/components/work/knowledge-bridge/story-state';
import { getHistoryFrame } from '../src/components/work/knowledge-bridge/history-state';
import {
  overloadConnections,
  overloadConnectionPath,
  peripheralPoints,
  overloadNodes,
  overloadBranches,
  overloadPoint,
  overloadViewBox,
  knowledgeCorrection,
  graphNode,
  knowledgeNodes,
  graphLinks,
  correctionPath,
  graphPoint,
} from '../src/content/knowledge-graph';

it('scrubs one relationship continuously between the graph’s saved classifications', () => {
  expect(graphNode(knowledgeCorrection.entity).label).toBe('Paris');
  expect(graphNode(knowledgeCorrection.before).label).toBe('Germany');
  expect(graphNode(knowledgeCorrection.after).label).toBe('France');
  const original = getHistoryFrame(0),
    middle = getHistoryFrame(0.5),
    correction = getHistoryFrame(1);
  expect(original.version).toBe(0);
  expect(correction.version).toBe(1);
  expect(middle.version).toBeNull();
  expect(middle.y).toBe((original.y + correction.y) / 2);
  expect(new Set([original.path, middle.path, correction.path]).size).toBe(3);
  expect(middle.description).toContain('not a saved state');
  expect(getHistoryFrame(-1)).toEqual(original);
  expect(getHistoryFrame(2)).toEqual(correction);
});

it('keeps all authored relationships attached to existing semantic nodes', () => {
  expect(new Set(knowledgeNodes.map(({ id }) => id)).size).toBe(
    knowledgeNodes.length,
  );
  for (const [from, to] of graphLinks) {
    expect(graphNode(from)).toBeDefined();
    expect(graphNode(to)).toBeDefined();
  }
  for (const layout of ['desktop', 'mobile'] as const) {
    for (const corrected of [false, true]) {
      const entity = graphPoint('paris', layout);
      const target = graphPoint(corrected ? 'france' : 'germany', layout);
      expect(correctionPath(layout, corrected)).toMatch(
        new RegExp('^M' + entity.x + ' ' + entity.y),
      );
      expect(
        correctionPath(layout, corrected).endsWith(target.x + ' ' + target.y),
      ).toBe(true);
    }
  }
});

it('attributes each measured reduction to its metric and dataset condition', () => {
  for (const measurement of knowledgeBridgeMeasurements) {
    const reduction =
      Math.round((1 - measurement.after / measurement.before) * 1000) / 10;
    expect(measurement.reduction).toBe(reduction);
  }
  expect(
    knowledgeBridgeMeasurements.map(({ metric, items }) => [metric, items]),
  ).toEqual([
    ['graph finish time', 100],
    ['page load time', 600],
  ]);
  expect(JSON.stringify(getProject('knowledge-bridge'))).not.toMatch(
    /task completion|81% less loading/i,
  );
});

it('selects the same story beats when progressing and reversing across boundaries', () => {
  const progress = [0, 0.249, 0.25, 0.499, 0.5, 0.799, 0.8, 1];
  const expected = [0, 0, 1, 1, 2, 2, 3, 3];
  expect(progress.map(getStoryBeat)).toEqual(expected);
  expect(progress.toReversed().map(getStoryBeat)).toEqual(
    expected.toReversed(),
  );
});

it('keeps Chapter 1 focused before preserving the later story boundaries', () => {
  expect(
    [0, 0.4, 0.624, 0.625, 0.749, 0.75, 0.899, 0.9, 1].map(getFocusedStoryBeat),
  ).toEqual([0, 0, 0, 1, 1, 2, 2, 3, 3]);
});

it('keeps dense outer branches deterministic and attached in both layouts', () => {
  expect(overloadBranches.length).toBeGreaterThan(knowledgeNodes.length * 5);
  expect(new Set(overloadBranches.map((node) => node.id)).size).toBe(
    overloadBranches.length,
  );
  expect(overloadNodes.find((node) => node.id === 'queretaro')?.parent).toBe(
    'mexico',
  );
  expect(overloadNodes.find((node) => node.id === 'mexico')?.parent).toBe(
    'north-america',
  );
  for (const layout of ['desktop', 'mobile'] as const) {
    const [x, y, width, height] = overloadViewBox[layout]
      .split(' ')
      .map(Number);
    if (
      x === undefined ||
      y === undefined ||
      width === undefined ||
      height === undefined
    )
      throw new Error('Invalid graph bounds');
    for (const node of overloadNodes) {
      expect(overloadPoint(node.parent, layout)).toBeDefined();
      const point = overloadPoint(node.id, layout);
      expect(point.x).toBeGreaterThan(x);
      expect(point.x).toBeLessThan(x + width);
      expect(point.y).toBeGreaterThan(y);
      expect(point.y).toBeLessThan(y + height);
    }
  }
});

it('forms one connected, varied overload topology with twelve labels and 97 nodes', () => {
  const ids = [
    ...knowledgeNodes.map((node) => node.id),
    ...peripheralPoints.map((_, index) => 'detail-' + index),
    ...overloadNodes.map((node) => node.id),
    ...overloadBranches.map((node) => node.id),
  ];
  expect(ids).toHaveLength(97);
  expect(new Set(ids).size).toBe(ids.length);
  expect(
    knowledgeNodes.length + overloadNodes.filter((node) => node.label).length,
  ).toBe(12);
  const neighbors = new Map(ids.map((id) => [id, new Set<string>()]));
  const edges = [
    ...graphLinks,
    ['paris', 'france'],
    ...peripheralPoints.map((node, index) => [node.anchor, 'detail-' + index]),
    ...overloadConnections.map((edge) => [edge.from, edge.to]),
  ];
  for (const [from, to] of edges) {
    if (!from || !to || !neighbors.has(from) || !neighbors.has(to))
      throw new Error('Disconnected graph endpoint');
    neighbors.get(from)?.add(to);
    neighbors.get(to)?.add(from);
  }
  const visited = new Set<string>();
  const queue = ['europe'];
  while (queue.length) {
    const id = queue.pop();
    if (!id || visited.has(id)) continue;
    visited.add(id);
    queue.push(...(neighbors.get(id) ?? []));
  }
  expect(visited.size).toBe(ids.length);
  const degrees = new Set(
    overloadBranches.map((node) => neighbors.get(node.id)?.size),
  );
  expect(degrees.has(1)).toBe(true);
  expect(degrees.has(2)).toBe(true);
  expect(degrees.has(3)).toBe(true);
  for (const layout of ['desktop', 'mobile'] as const) {
    const [left = 0, top = 0, width = 0, height = 0] = overloadViewBox[layout]
      .split(' ')
      .map(Number);
    for (const id of ids) {
      const point = overloadPoint(id, layout);
      expect(point.x).toBeGreaterThan(left);
      expect(point.x).toBeLessThan(left + width);
      expect(point.y).toBeGreaterThan(top);
      expect(point.y).toBeLessThan(top + height);
    }
    overloadConnections.forEach((edge, index) => {
      const from = overloadPoint(edge.from, layout),
        to = overloadPoint(edge.to, layout);
      expect(overloadConnectionPath(index, layout)).toMatch(
        new RegExp('^M' + from.x + ' ' + from.y),
      );
      expect(
        overloadConnectionPath(index, layout).endsWith(to.x + ' ' + to.y),
      ).toBe(true);
    });
  }
});

it('shares a smooth tangent through a degree-two support junction', () => {
  const id = 'queretaro-2';
  const point = overloadPoint(id, 'desktop');
  const vectors = overloadConnections.flatMap((edge, index) => {
    if (edge.from !== id && edge.to !== id) return [];
    const numbers = overloadConnectionPath(index, 'desktop')
      .match(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/gi)
      ?.map(Number);
    if (!numbers || numbers.length !== 8)
      throw new Error('Expected a single cubic relationship');
    const [x, y] = edge.from === id ? numbers.slice(2, 4) : numbers.slice(4, 6);
    if (x === undefined || y === undefined)
      throw new Error('Missing tangent control point');
    return [{ x: x - point.x, y: y - point.y }];
  });
  expect(vectors).toHaveLength(2);
  const [a, b] = vectors;
  if (!a || !b) throw new Error('Missing shared tangent');
  expect(a.x * b.y - a.y * b.x).toBeCloseTo(0, 6);
  expect(a.x * b.x + a.y * b.y).toBeLessThan(0);
});
