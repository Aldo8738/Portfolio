import { expect, it } from 'vitest';
import { knowledgeBridgeMeasurements } from '../src/content/knowledge-bridge';
import { getProject } from '../src/content/portfolio';
import {
  getStoryBeat,
  getFocusedStoryBeat,
} from '../src/components/work/knowledge-bridge/story-state';
import { getHistoryFrame } from '../src/components/work/knowledge-bridge/history-state';
import {
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
