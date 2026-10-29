import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  type ComponentRef,
} from 'react';
import { OrbitControls } from '@react-three/drei/core/OrbitControls.js';
import { useFrame, useThree } from '@react-three/fiber';
import {
  Box3,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Vector3,
  type Object3D,
} from 'three';
import { fitGuitarCamera, guitarMotion } from '../../lib/guitar-camera';
import { gsap } from 'gsap/gsap-core';
import { fitCamera, heroCamera } from '../../lib/camera';
import { fitMonitorCamera } from '../../lib/monitor-camera';
import {
  createPhotoCameraApproach,
  createPhotoCameraSlide,
  fitPhotoCamera,
  photoCamera,
} from '../../lib/photo-camera';
import {
  createCameraEntrance,
  createCameraReset,
} from '../../lib/camera-entrance';
import type { CameraActions, CanvasProps } from './scene-types';
import { fitNotebookCamera, notebookCamera } from '../../lib/notebook-camera';

interface Props extends Pick<
  CanvasProps,
  | 'active'
  | 'reducedMotion'
  | 'cameraActions'
  | 'sceneRevealed'
  | 'onCameraMotion'
  | 'guitarPhase'
  | 'photoId'
> {
  amp: Object3D;
  notebook: Object3D;
  bounds: Box3;
  framingPoints: Vector3[];
  onReset: () => void;
}

const keyboardStep = Math.PI / 18;

export function CameraControls({
  amp,
  guitarPhase,
  photoId,
  notebook,
  bounds,
  framingPoints,
  active,
  reducedMotion,
  cameraActions,
  sceneRevealed,
  onReset,
  onCameraMotion,
}: Props) {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const { camera, size, gl, invalidate } = useThree();
  const comparison = new URLSearchParams(location.search).has('compare');
  const initialView = useRef(true);
  const focusedPhoto = useRef<Mesh | null>(null);
  const focusedNotebook = useRef<Object3D | null>(null);
  const guitarRestore = useRef<(() => void) | null>(null);
  const entrance = useRef<{
    sample: (progress: number, position: Vector3, target: Vector3) => void;
    duration: number;
    kind: 'entrance' | 'reset';
    progress: number;
    elapsed: number;
    previous: number | null;
    tween?: ReturnType<typeof gsap.to>;
    onSettled?: (completed: boolean) => void;
  } | null>(null);
  const cancelEntrance = useCallback(() => {
    const transition = entrance.current;
    if (!transition) return;
    entrance.current = null;
    focusedPhoto.current = null;
    focusedNotebook.current = null;
    delete gl.domElement.dataset.drawingsView;
    transition.tween?.kill();
    onCameraMotion(false);
    transition.onSettled?.(false);
    if (controls.current) controls.current.enableDamping = !reducedMotion;
    gl.domElement.dataset.cameraEntrance = 'interrupted';
  }, [gl, reducedMotion, onCameraMotion]);
  const playTransition = useCallback(() => {
    const transition = entrance.current;
    const orbit = controls.current;
    if (!transition || !orbit || transition.tween) return;
    orbit.enableDamping = false;
    onCameraMotion(true);
    transition.tween = gsap.to(transition, {
      progress: 1,
      duration: transition.duration,
      ease: 'power2.inOut',
      paused: true,
      onStart: () => {
        gl.domElement.dataset.cameraEntrance =
          transition.kind === 'reset' ? 'resetting' : 'running';
      },
      onUpdate: () => {
        transition.sample(transition.progress, camera.position, orbit.target);
        orbit.update();
        camera.updateMatrixWorld();
        invalidate();
      },
      onComplete: () => {
        onCameraMotion(false);
        transition.tween?.kill();
        entrance.current = null;
        orbit.enableDamping = !reducedMotion;
        gl.domElement.dataset.cameraEntrance = 'complete';
        transition.onSettled?.(true);
      },
    });
    invalidate();
  }, [camera, gl, invalidate, reducedMotion, onCameraMotion]);
  const resetView = useCallback(
    (smooth = true) => {
      if (guitarRestore.current) return;
      if (!(camera instanceof PerspectiveCamera) || !controls.current) return;
      const photo = focusedPhoto.current;
      const book = focusedNotebook.current;
      const focused = book ?? photo;
      if (!smooth && focused && !entrance.current) {
        const fit = photo
          ? fitPhotoCamera(photo, size.width / size.height, camera.fov)
          : fitNotebookCamera(focused, size.width / size.height, camera.fov);
        camera.position.copy(fit.position);
        controls.current.target.copy(fit.target);
        controls.current.update();
        camera.updateProjectionMatrix();
        camera.updateMatrixWorld();
        invalidate();
        return;
      }
      cancelEntrance();
      focusedPhoto.current = null;
      focusedNotebook.current = null;
      delete gl.domElement.dataset.drawingsView;
      controls.current.minPolarAngle =
        smooth && book && !reducedMotion
          ? notebookCamera.minPolarAngle
          : Math.PI / 4;
      const fit = fitCamera(
        bounds,
        size.width / size.height,
        camera.fov,
        framingPoints,
        comparison ? 'comparison' : 'hero',
      );
      const photoReturn =
        smooth && (photo || book)
          ? createPhotoCameraApproach(
              fit.position,
              fit.target,
              fit,
              {
                position: camera.position.clone(),
                target: controls.current.target.clone(),
              },
              bounds.max.z,
            )
          : null;
      const resetSample = photoReturn
        ? (progress: number, position: Vector3, target: Vector3) =>
            photoReturn(1 - progress, position, target)
        : createCameraReset(camera.position, controls.current.target, fit);
      const distance = fit.position.distanceTo(fit.target);
      const smoothReset = smooth && !initialView.current && !reducedMotion;
      // Keep the close-up inside the controls' limits until the return finishes.
      controls.current.minDistance = smoothReset
        ? Math.min(
            distance * 0.15,
            camera.position.distanceTo(controls.current.target),
          )
        : distance * 0.15;
      controls.current.maxDistance = distance * 1.8;
      // Clear any pending damping before restoring the exact initial composition.
      const damping = controls.current.enableDamping;
      controls.current.enableDamping = false;
      const startPosition = camera.position.clone();
      const startTarget = controls.current.target.clone();
      controls.current.update();
      camera.position.copy(startPosition);
      controls.current.target.copy(startTarget);
      if (smoothReset) {
        entrance.current = {
          sample: (progress, position, target) => {
            resetSample(progress, position, target);
            if (progress >= 1 && controls.current) {
              controls.current.minDistance = distance * 0.15;
              controls.current.minPolarAngle = Math.PI / 4;
            }
          },
          duration: heroCamera.resetSeconds,
          kind: 'reset',
          progress: 0,
          elapsed: 0,
          previous: null,
        };
        playTransition();
        return;
      }
      camera.position.copy(fit.position);
      controls.current.target.copy(fit.target);
      controls.current.update();
      controls.current.enableDamping = damping;
      gl.domElement.dataset.cameraEntrance = 'complete';
      if (initialView.current && !reducedMotion && !comparison) {
        const sample = createCameraEntrance(
          fit,
          framingPoints,
          size.width / size.height,
          camera.fov,
          fitCamera(
            bounds,
            size.width / size.height,
            camera.fov,
            framingPoints,
            'entrance',
          ),
        );
        entrance.current = {
          sample: (progress, position, target) => {
            sample(progress, position);
            target.copy(fit.target);
          },
          duration: heroCamera.entranceSeconds,
          kind: 'entrance',
          progress: 0,
          elapsed: 0,
          previous: null,
        };
        sample(0, camera.position);
        controls.current.update();
        gl.domElement.dataset.cameraEntrance = 'waiting';
      }
      initialView.current = false;
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld();
      invalidate();
    },
    [
      bounds,
      framingPoints,
      camera,
      size.width,
      size.height,
      invalidate,
      reducedMotion,
      comparison,
      cancelEntrance,
      gl,
      playTransition,
    ],
  );
  useImperativeHandle(cameraActions, () => {
    const focusOn: CameraActions['focusOn'] = (focus, onSettled) => {
      if (!(camera instanceof PerspectiveCamera) || !controls.current) {
        onSettled?.(false);
        return;
      }
      const isPhoto =
        focus instanceof Mesh && focus.name.startsWith('HIT_PHOTOS_POLAROID_');
      const isNotebook = focus === notebook;
      const previousPhoto = focusedPhoto.current;
      const slide = isPhoto && previousPhoto !== null;
      cancelEntrance();
      // Photo mode starts with the request, including interrupted approaches and slides.
      focusedPhoto.current = isPhoto ? focus : null;
      focusedNotebook.current = null;
      delete gl.domElement.dataset.drawingsView;
      if (isNotebook) gl.domElement.dataset.drawingsView = 'moving';
      controls.current.minPolarAngle = isNotebook
        ? notebookCamera.minPolarAngle
        : Math.PI / 4;
      const rest = fitCamera(
        bounds,
        size.width / size.height,
        camera.fov,
        framingPoints,
      );
      const focusBounds =
        focus instanceof Box3 ? focus : new Box3().setFromObject(focus);
      const target = focusBounds.getCenter(new Vector3());
      const extent = focusBounds.getSize(new Vector3());
      const distance = Math.max(
        1.4,
        extent.x /
          (Math.tan((camera.fov * Math.PI) / 360) *
            (size.width / size.height) *
            0.65),
      );
      const fit = isNotebook
        ? fitNotebookCamera(notebook, size.width / size.height, camera.fov)
        : focus instanceof Mesh
          ? isPhoto
            ? fitPhotoCamera(focus, size.width / size.height, camera.fov)
            : fitMonitorCamera(
                focus,
                camera.position,
                size.width / size.height,
                camera.fov,
              )
          : {
              target,
              position: target
                .clone()
                .add(new Vector3(0, distance * 0.2, distance)),
            };
      controls.current.minDistance = Math.min(
        0.6,
        fit.position.distanceTo(fit.target) * 0.5,
      );
      if (reducedMotion) {
        focusedPhoto.current = isPhoto && focus instanceof Mesh ? focus : null;
        focusedNotebook.current = isNotebook ? notebook : null;
        if (isNotebook) gl.domElement.dataset.drawingsView = 'focused';
        camera.position.copy(fit.position);
        controls.current.target.copy(fit.target);
        controls.current.update();
        invalidate();
        onSettled?.(true);
        return;
      }
      entrance.current = {
        sample: isNotebook
          ? createPhotoCameraApproach(
              camera.position,
              controls.current.target,
              rest,
              fit,
              bounds.max.z,
            )
          : isPhoto
            ? slide
              ? createPhotoCameraSlide(
                  camera.position,
                  controls.current.target,
                  fit,
                )
              : createPhotoCameraApproach(
                  camera.position,
                  controls.current.target,
                  rest,
                  fit,
                  bounds.max.z,
                )
            : createCameraReset(camera.position, controls.current.target, fit),
        duration: isNotebook
          ? notebookCamera.approachSeconds
          : isPhoto
            ? slide
              ? photoCamera.slideSeconds
              : photoCamera.approachSeconds
            : 0.8,
        kind: 'reset',
        progress: 0,
        elapsed: 0,
        previous: null,
        onSettled: (completed) => {
          if (completed && isNotebook) {
            focusedNotebook.current = notebook;
            gl.domElement.dataset.drawingsView = 'focused';
          }
          onSettled?.(completed);
        },
      };
      playTransition();
    };
    return {
      composeGuitar: (sequence) => {
        const orbit = controls.current;
        if (!orbit || guitarRestore.current) return;
        cancelEntrance();
        const position = camera.position.clone();
        const rotation = camera.quaternion.clone();
        const target = orbit.target.clone();
        const saved = {
          enabled: orbit.enabled,
          damping: orbit.enableDamping,
          min: orbit.minDistance,
          max: orbit.maxDistance,
          polar: orbit.minPolarAngle,
          photo: focusedPhoto.current,
          notebook: focusedNotebook.current,
        };
        const anchor = new Box3()
          .setFromObject(amp)
          .getCenter(new Vector3())
          .project(camera);
        const origin = {
          x: ((anchor.x + 1) * size.width) / 2,
          y: ((1 - anchor.y) * size.height) / 2,
        };
        const fit = reducedMotion
          ? { position, target }
          : fitGuitarCamera(
              bounds,
              framingPoints,
              amp,
              size.width / size.height,
              camera instanceof PerspectiveCamera ? camera.fov : 38,
            );
        orbit.enabled = false;
        orbit.enableDamping = false;
        orbit.minDistance = 0;
        orbit.maxDistance = Infinity;
        const pulseMesh = amp.getObjectByName('HIT_MUSIC_AMP');
        const material =
          pulseMesh instanceof Mesh &&
          pulseMesh.material instanceof MeshStandardMaterial
            ? pulseMesh.material
            : null;
        const pulse = material?.clone();
        if (pulse && pulseMesh instanceof Mesh) {
          pulse.emissive.set('#ffd09a');
          pulse.emissiveIntensity = 0;
          pulseMesh.material = pulse;
          sequence.to(
            pulse,
            { emissiveIntensity: 0.28, duration: 0.1, repeat: 1, yoyo: true },
            0,
          );
        }
        const sample = createCameraReset(position, target, fit);
        const movement = { progress: 0 };
        sequence.to(
          movement,
          {
            progress: 1,
            duration: reducedMotion
              ? guitarMotion.reduced
              : guitarMotion.approach,
            ease: 'power2.inOut',
            onUpdate: () => {
              sample(movement.progress, camera.position, orbit.target);
              orbit.update();
              camera.updateMatrixWorld();
              invalidate();
            },
          },
          0,
        );
        const restore = () => {
          if (guitarRestore.current !== restore) return;
          guitarRestore.current = null;
          orbit.minDistance = saved.min;
          orbit.maxDistance = saved.max;
          orbit.minPolarAngle = saved.polar;
          camera.position.copy(position);
          orbit.target.copy(target);
          orbit.update();
          camera.position.copy(position);
          camera.quaternion.copy(rotation);
          camera.updateMatrixWorld();
          orbit.enabled = saved.enabled;
          orbit.enableDamping = saved.damping;
          focusedPhoto.current = saved.photo;
          focusedNotebook.current = saved.notebook;
          if (
            pulseMesh instanceof Mesh &&
            pulseMesh.material === pulse &&
            material
          )
            pulseMesh.material = material;
          pulse?.dispose();
          invalidate();
        };
        guitarRestore.current = restore;
        return { origin, restore };
      },
      focusOn,
      focusDrawings: () => focusOn(notebook),
      resetView: () => {
        onReset();
        resetView(true);
      },
    };
  }, [
    resetView,
    notebook,
    amp,
    gl,
    bounds,
    framingPoints,
    onReset,
    camera,
    cancelEntrance,
    size.width,
    size.height,
    reducedMotion,
    invalidate,
    playTransition,
  ]);
  useLayoutEffect(() => resetView(false), [resetView]);
  useEffect(() => {
    if (sceneRevealed) playTransition();
  }, [sceneRevealed, playTransition, resetView]);
  useEffect(() => cancelEntrance, [cancelEntrance]);
  useEffect(() => () => guitarRestore.current?.(), []);
  useEffect(() => {
    if (entrance.current) entrance.current.previous = null;
  }, [active]);
  useFrame(() => {
    const transition = entrance.current;
    if (!transition?.tween || !active || !sceneRevealed) return;
    const now = performance.now();
    transition.elapsed +=
      transition.previous === null ? 0 : (now - transition.previous) / 1000;
    transition.previous = now;
    // Advance the paused GSAP tween from the existing scene clock.
    transition.tween.time(
      Math.min(transition.elapsed, transition.duration),
      false,
    );
  });

  useEffect(() => {
    const canvas = gl.domElement;
    canvas.tabIndex = 0;
    canvas.setAttribute(
      'aria-label',
      'Explore the stand: left-drag or use arrow keys to rotate. Scroll or use plus and minus to zoom. Press Home to reset the view.',
    );
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const orbit = controls.current;
      if (!orbit?.enabled) return;
      cancelEntrance();
      switch (event.key) {
        case 'ArrowLeft':
          orbit.setAzimuthalAngle(orbit.getAzimuthalAngle() - keyboardStep);
          break;
        case 'ArrowRight':
          orbit.setAzimuthalAngle(orbit.getAzimuthalAngle() + keyboardStep);
          break;
        case 'ArrowUp':
          orbit.setPolarAngle(orbit.getPolarAngle() - keyboardStep);
          break;
        case 'ArrowDown':
          orbit.setPolarAngle(orbit.getPolarAngle() + keyboardStep);
          break;
        case 'Home':
          onReset();
          resetView();
          break;
        case '+':
        case '=':
          orbit.dollyIn();
          break;
        case '-':
        case '_':
          orbit.dollyOut();
          break;
        default:
          return;
      }
      event.preventDefault();
    };
    canvas.addEventListener('keydown', onKeyDown);
    return () => canvas.removeEventListener('keydown', onKeyDown);
  }, [gl, resetView, cancelEntrance, onReset]);

  return (
    <OrbitControls
      ref={controls}
      domElement={gl.domElement}
      enabled={active && !photoId && guitarPhase === 'idle'}
      onStart={cancelEntrance}
      enablePan={false}
      enableZoom
      zoomSpeed={0.7}
      enableDamping={!reducedMotion}
      dampingFactor={0.08}
      rotateSpeed={0.6}
      minPolarAngle={Math.PI / 4}
      maxPolarAngle={Math.PI / 2 - 0.05}
    />
  );
}
