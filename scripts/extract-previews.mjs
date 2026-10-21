import { mkdir, writeFile } from 'node:fs/promises';
import { readGlb } from './read-glb.mjs';

const { bytes, document, binaryOffset } = await readGlb(
  new URL(
    '../public/models/taqueria_aldo_v3_12_9_selectively_merged.glb',
    import.meta.url,
  ),
);
const previews = {
  sketchbook_left_v3_12: 'drawing-left',
  sketchbook_right_v3_12: 'drawing-right',
  lucha: 'lucha',
  paris: 'paris',
  canal: 'canal',
};
const directory = new URL('../public/media/previews/', import.meta.url);
await mkdir(directory, { recursive: true });
for (const [imageName, filename] of Object.entries(previews)) {
  const image = document.images.find((entry) => entry.name === imageName);
  if (!image || image.mimeType !== 'image/jpeg')
    throw new Error(`Missing embedded JPEG preview: ${imageName}`);
  const view = document.bufferViews[image.bufferView];
  const start = binaryOffset + (view.byteOffset ?? 0);
  await writeFile(
    new URL(`${filename}.jpg`, directory),
    bytes.subarray(start, start + view.byteLength),
  );
  console.log(
    `Extracted original embedded preview: ${filename}.jpg (${view.byteLength} bytes)`,
  );
}
