import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  Box3,
  Mesh,
  Material,
  Color,
  Matrix4,
  Vector3,
  type Object3D,
} from 'three';
import { createAnnotationAnchors } from '../../lib/scene-annotation-anchors';
import { getInteractiveObject } from '../../lib/interactive-object';
import {
  annotationFits,
  annotationRect,
  type AnnotationElements,
  type AnnotationRect,
} from '../../lib/scene-annotations';

interface Props {
  scene: Object3D;
  elements: RefObject<AnnotationElements>;
  layer: RefObject<HTMLDivElement | null>;
  enabled: boolean;
  enterWork: () => Promise<void>;
}

function setData(element: HTMLElement, key: string, value: string) {
  if (element.dataset[key] !== value) element.dataset[key] = value;
}

export function SceneAnnotationTracking({
  scene,
  elements,
  layer,
  enabled,
  enterWork,
}: Props) {
  const { camera, size, gl, invalidate, events } = useThree();
  const previousCamera = useRef(new Matrix4());
  const anchors = useRef<ReturnType<typeof createAnnotationAnchors>>([]);
  const world = useRef(new Vector3());
  const projected = useRef(new Vector3());
  const occupied = useRef<AnnotationRect[]>([]);
  const ampBounds = useRef(new Box3());
  const highlight = useRef<{
    object: Object3D;
    materials: { mesh: Mesh; original: Material | Material[] }[];
    clones: Map<Material, Material>;
  } | null>(null);
  const clearHighlight = () => {
    const current = highlight.current;
    if (!current) return;
    for (const { mesh, original } of current.materials)
      mesh.material = original;
    for (const clone of current.clones.values()) clone.dispose();
    highlight.current = null;
  };
  useEffect(() => {
    const down = () => {
      gl.domElement.dataset.targetDragging = 'true';
      gl.domElement.dataset.hoverTarget = '';
      clearHighlight();
    };
    const up = () => {
      delete gl.domElement.dataset.targetDragging;
    };
    gl.domElement.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    window.addEventListener('taqueria:theme', clearHighlight);
    return () => {
      gl.domElement.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      window.removeEventListener('taqueria:theme', clearHighlight);
      clearHighlight();
    };
  }, [gl]);

  useLayoutEffect(() => {
    anchors.current = createAnnotationAnchors(scene);
    return () => {
      for (const { anchor } of anchors.current) anchor.removeFromParent();
      anchors.current = [];
    };
  }, [scene]);
  useEffect(() => {
    const overlay = layer.current;
    if (!overlay) return;
    const open = (event: MouseEvent) => {
      if (
        !(event.target instanceof Element) ||
        !event.target.closest('[data-annotation-work]')
      )
        return;
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      event.preventDefault();
      clearHighlight();
      void enterWork().catch(() => location.assign('/work'));
    };
    const refresh = () => {
      clearHighlight();
      invalidate();
    };
    overlay.addEventListener('click', open);
    overlay.addEventListener('click', refresh);
    overlay.addEventListener('focusin', refresh);
    overlay.addEventListener('focusout', refresh);
    return () => {
      overlay.removeEventListener('click', open);
      overlay.removeEventListener('click', refresh);
      overlay.removeEventListener('focusin', refresh);
      overlay.removeEventListener('focusout', refresh);
    };
  }, [layer, enterWork, invalidate]);

  useFrame(() => {
    const overlay = layer.current;
    if (!overlay) return;
    const entrance = gl.domElement.dataset.cameraEntrance;
    const ready =
      enabled &&
      !gl.domElement.dataset.drawingsView &&
      (entrance === 'complete' || entrance === 'interrupted');
    setData(overlay, 'ready', String(ready));
    overlay.inert = !ready;
    if (!ready || overlay.hidden) {
      clearHighlight();
      return;
    }
    if (!previousCamera.current.equals(camera.matrixWorld)) {
      previousCamera.current.copy(camera.matrixWorld);
      // Recheck the visible surface under a stationary pointer after orbit or zoom.
      if (gl.domElement.dataset.hoverTarget) events.update?.();
    }
    const focus =
      document.activeElement?.closest<HTMLElement>('[data-annotation]')?.dataset
        .annotation;
    const hovered = gl.domElement.dataset.hoverTarget;
    const selected = gl.domElement.dataset.targetDragging
      ? undefined
      : (focus ?? hovered);
    const activeItem = anchors.current.find((item) => item.id === selected);
    const hoveredMesh =
      activeItem && hovered === selected
        ? scene.getObjectById(Number(gl.domElement.dataset.hoverMeshId))
        : undefined;
    const mesh = hoveredMesh ?? activeItem?.anchor.parent;
    const object = mesh ? getInteractiveObject(mesh) : undefined;
    if (highlight.current?.object !== object) {
      clearHighlight();
      if (object) {
        const materials: { mesh: Mesh; original: Material | Material[] }[] = [];
        const clones = new Map<Material, Material>();
        const tint = new Color(
          getComputedStyle(overlay)
            .getPropertyValue(
              selected === 'guitar' ? '--scene-accent' : '--scene-text',
            )
            .trim(),
        );
        const brighten = (original: Material) => {
          const existing = clones.get(original);
          if (existing) return existing;
          const clone = original.clone();
          if (
            selected !== 'guitar' &&
            'color' in clone &&
            clone.color instanceof Color
          )
            clone.color.multiplyScalar(1.16);
          if (
            'emissive' in clone &&
            clone.emissive instanceof Color &&
            'emissiveIntensity' in clone &&
            typeof clone.emissiveIntensity === 'number'
          ) {
            clone.emissive.lerp(tint, selected === 'guitar' ? 0.12 : 0.08);
            clone.emissiveIntensity = Math.max(
              clone.emissiveIntensity,
              selected === 'guitar' ? 0.35 : 0.18,
            );
          }
          clones.set(original, clone);
          return clone;
        };
        object.traverse((node) => {
          if (!(node instanceof Mesh)) return;
          // Keep the amp's casing, grille and controls untouched; cue its pink pedal.
          if (selected === 'guitar' && node.name !== 'HIT_MUSIC_PEDAL') return;
          const original = node.material;
          materials.push({ mesh: node, original });
          node.material = Array.isArray(original)
            ? original.map(brighten)
            : brighten(original);
        });
        highlight.current = { object, materials, clones };
      }
    }
    const compact = size.width <= 1024;
    const menuOpen = overlay.dataset.menuOpen === 'true';
    occupied.current.length = 0;

    for (const item of anchors.current) {
      const element = elements.current[item.id];
      if (!element) continue;
      if (item.id === selected && hoveredMesh) {
        hoveredMesh.updateWorldMatrix(true, false);
        world.current.set(
          Number(gl.domElement.dataset.hoverX),
          Number(gl.domElement.dataset.hoverY),
          Number(gl.domElement.dataset.hoverZ),
        );
        hoveredMesh.localToWorld(world.current);
      } else item.anchor.getWorldPosition(world.current);
      projected.current.copy(world.current).project(camera);
      let x = ((projected.current.x + 1) * size.width) / 2;
      let y = ((1 - projected.current.y) * size.height) / 2;
      let dx: number = item.x;
      if (item.id === 'guitar' && object && item.id === selected) {
        const body = object.getObjectByName('AMP_BODY');
        if (body) {
          const bounds = ampBounds.current.setFromObject(body);
          let left = Infinity;
          let right = -Infinity;
          let top = Infinity;
          let bottom = -Infinity;
          for (const bx of [bounds.min.x, bounds.max.x])
            for (const by of [bounds.min.y, bounds.max.y])
              for (const bz of [bounds.min.z, bounds.max.z]) {
                world.current.set(bx, by, bz).project(camera);
                const px = ((world.current.x + 1) * size.width) / 2;
                const py = ((1 - world.current.y) * size.height) / 2;
                left = Math.min(left, px);
                right = Math.max(right, px);
                top = Math.min(top, py);
                bottom = Math.max(bottom, py);
              }
          const onLeft = (left + right) / 2 < size.width / 2;
          x = onLeft ? left : right;
          y = (top + bottom) / 2;
          dx = onLeft ? -item.x : item.x;
        }
      }
      const rect = annotationRect(x, y, dx, item.y);
      const shown =
        item.id !== 'work' &&
        item.id !== 'photos' &&
        item.id === selected &&
        !compact &&
        projected.current.z > -1 &&
        projected.current.z < 1 &&
        Math.abs(projected.current.x) < 1 &&
        Math.abs(projected.current.y) < 1 &&
        annotationFits(rect, size.width, size.height, occupied.current);
      if (shown) {
        occupied.current.push(rect);
        element.dataset.side = dx < 0 ? 'left' : 'right';
        element.style.setProperty('--label-x', `${dx}px`);
        // Hold the last visible placement during fade-out instead of reverting anchors.
        element.style.setProperty('--anchor-x', `${x.toFixed(2)}px`);
        element.style.setProperty('--anchor-y', `${y.toFixed(2)}px`);
      }

      setData(element, 'visible', String(shown));
      element.inert = !menuOpen && !shown;
    }
    const restore = overlay.querySelector<HTMLElement>('[data-restore-focus]');
    if (restore) {
      const target = restore.closest('[inert]')
        ? overlay.querySelector<HTMLElement>('[data-explore]')
        : restore;
      target?.focus({ preventScroll: true });
      if (document.activeElement === target)
        delete restore.dataset.restoreFocus;
      else invalidate();
    }
    setData(overlay, 'hasHidden', 'true');
  });
  return null;
}
