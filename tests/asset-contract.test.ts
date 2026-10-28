import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { assertNodeContract, modelSha256 } from '../src/lib/glb-contract';
import { readGlb } from '../scripts/read-glb.mjs';

const asset = await readGlb(
  new URL(
    '../public/models/taqueria_aldo_v3_12_9_selectively_merged.glb',
    import.meta.url,
  ),
);

describe('frozen production asset', () => {
  it('retains the approved bytes and interaction hierarchy', () => {
    expect(createHash('sha256').update(asset.bytes).digest('hex')).toBe(
      modelSha256,
    );
    expect(() => assertNodeContract(asset.nodes)).not.toThrow();
    expect(asset.document.meshes).toHaveLength(175);
    expect(asset.document.images).toHaveLength(13);
  });
  it('rejects missing targets, duplicates, moved pivots and wrong metadata', () => {
    expect(() =>
      assertNodeContract(
        asset.nodes.filter((node) => node.name !== 'HIT_WORK_CRT_SCREEN'),
      ),
    ).toThrow(/HIT_WORK_CRT_SCREEN/);
    expect(() =>
      assertNodeContract([...asset.nodes, { name: 'TROMPO_ROTATING' }]),
    ).toThrow(/exactly one/);
    expect(() =>
      assertNodeContract(
        asset.nodes.map((node) =>
          node.name === 'SALSA_RED_PIVOT'
            ? { ...node, parentName: 'STATIC_ENVIRONMENT' }
            : node,
        ),
      ),
    ).toThrow(/SALSA_BOTTLES/);
    expect(() =>
      assertNodeContract(
        asset.nodes.map((node) =>
          node.name === 'HIT_WORK_CRT_SCREEN'
            ? { ...node, interaction: 'photos' }
            : node,
        ),
      ),
    ).toThrow(/metadata/);
    expect(() =>
      assertNodeContract(
        asset.nodes.map((node) =>
          node.name === 'PHOTOS_PRINT_lucha'
            ? { ...node, parentName: 'STATIC_ENVIRONMENT' }
            : node,
        ),
      ),
    ).toThrow(/POLAROID_0_SWING_PIVOT/);
  });
});
