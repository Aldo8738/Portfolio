import {
  graphNode,
  knowledgeCorrection,
} from '../../../content/knowledge-graph';

export function getHistoryFrame(value: number) {
  const progress = Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
  const y = 245 - 150 * progress;
  const version = progress === 0 ? 0 : progress === 1 ? 1 : null;
  const entity = graphNode(knowledgeCorrection.entity).label;
  const before = graphNode(knowledgeCorrection.before).label;
  const after = graphNode(knowledgeCorrection.after).label;
  return {
    progress,
    version,
    x: 455,
    y,
    path: `M235 154C330 154 335 ${y} 449 ${y}`,
    caption:
      version === 0
        ? `${entity}: ${before} · Original`
        : version === 1
          ? `${entity}: ${before} → ${after} · Human correction`
          : `Transition · ${Math.round(progress * 100)}% · illustrative interpolation`,
    description:
      version === null
        ? `Between saved checkpoints, ${Math.round(progress * 100)}% to Human correction. Illustrative interpolation, not a saved state.`
        : `${version === 0 ? 'Original' : 'Human correction'}: ${entity} linked to ${version === 0 ? before : after}.`,
  };
}
