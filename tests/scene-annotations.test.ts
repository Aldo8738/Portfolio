import { describe, expect, it } from 'vitest';
import { BoxGeometry, Group, Mesh, Vector3 } from 'three';
import { createAnnotationAnchors } from '../src/lib/scene-annotation-anchors';
import {
  annotationFits,
  annotationRect,
  sceneAnnotations,
} from '../src/lib/scene-annotations';

describe('scene annotations', () => {
  it('keeps anchors attached to the contracted targets through parent motion', () => {
    const scene = new Group();
    for (const item of sceneAnnotations) {
      const mesh = new Mesh(new BoxGeometry(1, 1, 1));
      mesh.name = item.node;
      scene.add(mesh);
    }
    const anchors = createAnnotationAnchors(scene);
    for (const { anchor, node } of anchors) {
      expect(anchor.parent?.name).toBe(node);
      expect(anchor.children).toHaveLength(0);
      const before = anchor.getWorldPosition(new Vector3());
      anchor.parent?.position.add(new Vector3(2, 3, 4));
      expect(
        anchor.getWorldPosition(new Vector3()).sub(before).toArray(),
      ).toEqual([2, 3, 4]);
    }
    expect(() => createAnnotationAnchors(new Group())).toThrow(
      'Annotation target missing',
    );
    scene.traverse((node) => {
      if (node instanceof Mesh) node.geometry.dispose();
    });
  });

  it('reserves viewport utilities and suppresses collisions in priority order', () => {
    const work = annotationRect(800, 350, 48, 12);
    expect(annotationFits(work, 1280, 720, [])).toBe(true);
    expect(
      annotationFits(annotationRect(810, 350, 48, 12), 1280, 720, [work]),
    ).toBe(false);
    expect(
      annotationFits(annotationRect(200, 30, -54, 30), 1280, 720, []),
    ).toBe(false);
    expect(
      annotationFits(annotationRect(1200, 300, 48, 12), 1280, 720, []),
    ).toBe(false);
    expect(
      annotationFits(annotationRect(800, 640, 48, 12), 1280, 720, []),
    ).toBe(false);
  });
});
