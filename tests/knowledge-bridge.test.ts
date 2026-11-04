import { expect, it } from 'vitest';
import { knowledgeBridgeMeasurements } from '../src/content/knowledge-bridge';
import { getProject } from '../src/content/portfolio';
import { getStoryBeat } from '../src/components/work/knowledge-bridge/story-state';
import { getHistoryFrame } from '../src/components/work/knowledge-bridge/history-state';
import { knowledgeCorrection, graphNode } from '../src/content/knowledge-graph';

it('scrubs one relationship continuously between the graph’s saved classifications', () => {
  expect(graphNode(knowledgeCorrection.entity).label).toBe('Skyrim');
  expect(graphNode(knowledgeCorrection.before).label).toBe('Sports');
  expect(graphNode(knowledgeCorrection.after).label).toBe('RPG');
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
