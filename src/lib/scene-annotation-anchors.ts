import { Box3, Object3D, Vector3 } from 'three';
import { sceneAnnotations } from './scene-annotations';

export function createAnnotationAnchors(scene: Object3D) {
  scene.updateWorldMatrix(true, true);
  return sceneAnnotations.map((annotation) => {
    const target = scene.getObjectByName(annotation.node);
    if (!target)
      throw new Error(`Annotation target missing: ${annotation.node}`);
    const bounds = new Box3().setFromObject(target);
    const center = bounds.getCenter(new Vector3());
    // Put Work's dot beside the screen, leaving its authored content clear.
    if (annotation.id === 'work') center.x = bounds.max.x + 0.025;
    const anchor = new Object3D();
    anchor.name = `ANNOTATION_${annotation.id.toUpperCase()}`;
    anchor.position.copy(target.worldToLocal(center));
    target.add(anchor);
    return { ...annotation, anchor };
  });
}
