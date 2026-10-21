import { createHash } from 'node:crypto';
import { assertNodeContract, modelSha256 } from '../src/lib/glb-contract.ts';
import { readGlb } from './read-glb.mjs';

const { bytes, document, nodes } = await readGlb(
  new URL(
    '../public/models/taqueria_aldo_v3_12_9_selectively_merged.glb',
    import.meta.url,
  ),
);
assertNodeContract(nodes);
if (createHash('sha256').update(bytes).digest('hex') !== modelSha256)
  throw new Error('Frozen GLB checksum changed');
console.log(
  `Asset contract passed: ${bytes.length} bytes, ${nodes.length} nodes, ${document.meshes.length} meshes, ${document.materials.length} materials, ${document.images.length} embedded images.`,
);
