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
import { Box3, PerspectiveCamera, Vector3 } from 'three';
import { gsap } from 'gsap/gsap-core';
import { fitCamera } from '../../lib/camera';
import { createCameraEntrance } from '../../lib/camera-entrance';
import type { CanvasProps } from './scene-types';

interface Props extends Pick<
  CanvasProps,
  'active' | 'reducedMotion' | 'cameraActions' | 'sceneRevealed'
> {
  bounds: Box3;
  framingPoints: Vector3[];
}

const keyboardStep = Math.PI / 18;
const entranceDurationSeconds = 2.8;

export function CameraControls({
  bounds,
  framingPoints,
  active,
  reducedMotion,
  cameraActions,
  sceneRevealed,
}: Props) {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const { camera, size, gl, invalidate } = useThree();
  const comparison = new URLSearchParams(location.search).has('compare');
  const initialView = useRef(true);
  const entrance = useRef<{
    sample: ReturnType<typeof createCameraEntrance>;
    progress: number;
    elapsed: number;
    previous: number | null;
    tween?: ReturnType<typeof gsap.to>;
  } | null>(null);
  const cancelEntrance = useCallback(() => {
    const transition = entrance.current;
    if (!transition) return;
    entrance.current = null;
    transition.tween?.kill();
    if (controls.current) controls.current.enableDamping = !reducedMotion;
    gl.domElement.dataset.cameraEntrance = 'interrupted';
  }, [gl, reducedMotion]);
  const resetView = useCallback(() => {
    if (!(camera instanceof PerspectiveCamera) || !controls.current) return;
    cancelEntrance();
    const fit = fitCamera(
      bounds,
      size.width / size.height,
      camera.fov,
      framingPoints,
      comparison ? 'comparison' : 'hero',
    );
    camera.position.copy(fit.position);
    controls.current.target.copy(fit.target);
    const distance = fit.position.distanceTo(fit.target);
    controls.current.minDistance = distance * 0.35;
    controls.current.maxDistance = distance * 1.8;
    // Clear any pending damping before restoring the exact initial composition.
    const damping = controls.current.enableDamping;
    controls.current.enableDamping = false;
    controls.current.update();
    camera.position.copy(fit.position);
    controls.current.update();
    controls.current.enableDamping = damping;
    gl.domElement.dataset.cameraEntrance = 'complete';
    if (initialView.current && !reducedMotion && !comparison) {
      const sample = createCameraEntrance(
        fit,
        framingPoints,
        size.width / size.height,
        camera.fov,
      );
      entrance.current = { sample, progress: 0, elapsed: 0, previous: null };
      sample(0, camera.position);
      controls.current.update();
      gl.domElement.dataset.cameraEntrance = 'waiting';
    }
    initialView.current = false;
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    invalidate();
  }, [
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
  ]);
  useImperativeHandle(cameraActions, () => ({ resetView }), [resetView]);
  useLayoutEffect(() => resetView(), [resetView]);
  useEffect(() => {
    const transition = entrance.current;
    const orbit = controls.current;
    if (!transition || !orbit || !sceneRevealed) return;
    orbit.enableDamping = false;
    transition.tween = gsap.to(transition, {
      progress: 1,
      duration: entranceDurationSeconds,
      ease: 'power2.inOut',
      paused: true,
      onStart: () => {
        gl.domElement.dataset.cameraEntrance = 'running';
      },
      onUpdate: () => {
        transition.sample(transition.progress, camera.position);
        orbit.update();
        camera.updateMatrixWorld();
        invalidate();
      },
      onComplete: () => {
        transition.tween?.kill();
        entrance.current = null;
        orbit.enableDamping = !reducedMotion;
        gl.domElement.dataset.cameraEntrance = 'complete';
      },
    });
    return cancelEntrance;
  }, [
    sceneRevealed,
    resetView,
    camera,
    gl,
    invalidate,
    reducedMotion,
    cancelEntrance,
  ]);
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
      Math.min(transition.elapsed, entranceDurationSeconds),
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
  }, [gl, resetView, cancelEntrance]);

  return (
    <OrbitControls
      ref={controls}
      domElement={gl.domElement}
      enabled={active}
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
