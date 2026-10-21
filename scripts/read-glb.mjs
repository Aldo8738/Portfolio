import { readFile } from 'node:fs/promises';

export async function readGlb(path) {
  const bytes = await readFile(path);
  if (
    bytes.toString('ascii', 0, 4) !== 'glTF' ||
    bytes.readUInt32LE(4) !== 2 ||
    bytes.readUInt32LE(8) !== bytes.length
  ) {
    throw new Error('Invalid glTF 2 binary header');
  }
  const length = bytes.readUInt32LE(12);
  if (bytes.readUInt32LE(16) !== 0x4e4f534a || 20 + length > bytes.length) {
    throw new Error('Invalid GLB JSON chunk');
  }
  const document = JSON.parse(bytes.toString('utf8', 20, 20 + length));
  /** @type {import('../src/lib/glb-contract').NamedNode[]} */
  const nodes = document.nodes.map((node, index) => ({
    name: node.name ?? '',
    parentName: document.nodes.find((parent) =>
      parent.children?.includes(index),
    )?.name,
    interaction: node.extras?.interaction,
  }));
  return { bytes, document, nodes, binaryOffset: 28 + length };
}
