import type { Object3D } from 'three';

export const modelUrl = '/models/taqueria_aldo_v3_12_9_selectively_merged.glb';
export const modelSha256 =
  '09e950db19887e86094b5feb98df50badee1b21a5171afeba0d230cbdf61bad9';

export const requiredNodeNames = [
  'TAQUERIA_ALDO',
  'TROMPO_ROTATING',
  'SALSA_RED_PIVOT',
  'SALSA_GREEN_PIVOT',
  'SALSA_ORANGE_PIVOT',
  'HIT_WORK_CRT_SCREEN',
  'HIT_DRAWINGS_SKETCHBOOK_0',
  'HIT_DRAWINGS_SKETCHBOOK_1',
  'POLAROID_0_SWING_PIVOT',
  'POLAROID_1_SWING_PIVOT',
  'POLAROID_2_SWING_PIVOT',
  'HIT_PHOTOS_POLAROID_0',
  'HIT_PHOTOS_POLAROID_1',
  'HIT_PHOTOS_POLAROID_2',
  'PHOTOS_PRINT_lucha',
  'PHOTOS_PRINT_paris',
  'PHOTOS_PRINT_canal',
  'HIT_MUSIC_AMP',
  'HIT_MUSIC_PEDAL',
] as const;

const requiredParents: Record<string, string> = {
  TROMPO_ROTATING: 'TAQUERIA_ALDO',
  SALSA_RED_PIVOT: 'SALSA_BOTTLES',
  SALSA_GREEN_PIVOT: 'SALSA_BOTTLES',
  SALSA_ORANGE_PIVOT: 'SALSA_BOTTLES',
  POLAROID_0_SWING_PIVOT: 'POLAROIDS',
  POLAROID_1_SWING_PIVOT: 'POLAROIDS',
  POLAROID_2_SWING_PIVOT: 'POLAROIDS',
  HIT_WORK_CRT_SCREEN: 'CRT_INTERACTION',
  PHOTOS_PRINT_lucha: 'POLAROID_0_SWING_PIVOT',
  PHOTOS_PRINT_paris: 'POLAROID_1_SWING_PIVOT',
  PHOTOS_PRINT_canal: 'POLAROID_2_SWING_PIVOT',
};

export interface NamedNode {
  name: string;
  parentName?: string;
  interaction?: unknown;
}

export function assertNodeContract(nodes: readonly NamedNode[]) {
  for (const name of requiredNodeNames) {
    const matches = nodes.filter((node) => node.name === name);
    if (matches.length !== 1)
      throw new Error(
        `GLB contract: expected exactly one ${name}; found ${matches.length}`,
      );
    const node = matches[0];
    if (!node) throw new Error(`GLB contract: missing ${name}`);
    const expectedParent = requiredParents[name];
    if (expectedParent && node.parentName !== expectedParent) {
      throw new Error(
        `GLB contract: ${name} must remain under ${expectedParent}`,
      );
    }
    if (name === 'HIT_WORK_CRT_SCREEN' && node.interaction !== 'work') {
      throw new Error('GLB contract: CRT interaction metadata must be work');
    }
  }
}

export function assertModelContract(scene: Object3D) {
  const nodes: NamedNode[] = [];
  scene.traverse((node) =>
    nodes.push({
      name: node.name,
      parentName: node.parent?.name,
      interaction: node.userData.interaction,
    }),
  );
  assertNodeContract(nodes);
}
