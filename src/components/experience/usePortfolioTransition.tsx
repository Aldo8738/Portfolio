import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  Color,
  Vector2,
  Vector3,
  Vector4,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Quaternion,
  DoubleSide,
  type Object3D,
  ShaderMaterial,
} from 'three';
import { gsap } from 'gsap/gsap-core';
import {
  preparePortfolio,
  revealPortfolio,
  activatePortfolio,
  portfolioTiming as timing,
  tileVisuals,
  type PortfolioPhase,
} from './portfolio-transition';
import {
  monitorTileVertex,
  wormholeVertex,
  wormholeFragment,
} from './wormhole-shaders';
import { fitMonitorCamera, getMonitorCorners } from '../../lib/monitor-camera';

export function usePortfolioTransition(
  scene: Object3D,
  reducedMotion: boolean,
  visible: boolean,
  onCameraMotion: (moving: boolean) => void,
) {
  const {
    camera,
    scene: renderScene,
    size,
    invalidate,
    gl,
    setFrameloop,
  } = useThree();
  const [phase, setPhase] = useState<PortfolioPhase>('idle');
  const run = useRef<Promise<void> | null>(null);
  const timeline = useRef<ReturnType<typeof gsap.timeline> | null>(null);
  const abort = useRef<AbortController | null>(null);
  const cleanup = useRef<() => void>(() => {});
  const finish = useRef<() => void>(() => {});
  const previewPaused = useRef(false);
  const portal = useRef<Mesh>(null);
  const revealPage = useRef<HTMLElement | null>(null);
  const corners = useRef<Vector3[]>([]);
  const projected = useMemo(() => new Vector3(), []);
  const clock = useRef<number | null>(null);
  const uniforms = useMemo(
    () => ({
      originalScreen: { value: null as MeshBasicMaterial['map'] },
      activation: { value: 0 },
      expansion: { value: 0 },
      portalOpacity: { value: 0 },
      travel: { value: 0 },
      decomposition: { value: 0 },
      reveal: { value: 0 },
      aspect: { value: 1 },
      screenAspect: { value: 1 },
      columns: { value: tileVisuals.desktopColumns as number },
      subdivisions: { value: tileVisuals.subdivisions },
      revealRegions: {
        value: Array.from({ length: 3 }, () => new Vector4(0, 0, 1, 1)),
      },
      corners: { value: Array.from({ length: 4 }, () => new Vector2()) },
      navy: { value: new Color(tileVisuals.navy) },
      blue: { value: new Color(tileVisuals.blue) },
      cream: { value: new Color(tileVisuals.cream) },
      terracotta: { value: new Color(tileVisuals.terracotta) },
      magenta: { value: new Color(tileVisuals.magenta) },
      amber: { value: new Color(tileVisuals.amber) },
    }),
    [],
  );
  const updateRevealRegions = useCallback(() => {
    const page = revealPage.current;
    if (!page) return;
    // Read the real responsive layout once per entry or resize, never per frame.
    ['.page-intro', '.site-header', '.project-focus'].forEach((selector, i) => {
      const rect = page.querySelector(selector)?.getBoundingClientRect();
      if (!rect) return;
      uniforms.revealRegions.value[i]?.set(
        Math.max(0, rect.left / size.width),
        Math.max(0, rect.top / size.height),
        Math.min(1, rect.right / size.width),
        Math.min(1, rect.bottom / size.height),
      );
    });
  }, [size.width, size.height, uniforms]);
  useEffect(updateRevealRegions, [updateRevealRegions]);
  const materials = useMemo(
    () => ({
      screen: new ShaderMaterial({
        uniforms,
        vertexShader: monitorTileVertex,
        fragmentShader: wormholeFragment,
        defines: { MONITOR_SURFACE: 1 },
        toneMapped: false,
      }),
      portal: new ShaderMaterial({
        uniforms,
        vertexShader: wormholeVertex,
        fragmentShader: wormholeFragment,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        toneMapped: false,
        side: DoubleSide,
      }),
    }),
    [uniforms],
  );
  useEffect(
    () => () => {
      abort.current?.abort();
      cleanup.current();
      materials.screen.dispose();
      materials.portal.dispose();
    },
    [materials],
  );
  useEffect(() => {
    clock.current = null;
  }, [visible]);
  useFrame(() => {
    const current = timeline.current;
    if (!current) return;
    const now = performance.now();
    if (visible && !previewPaused.current) {
      const elapsed = clock.current === null ? 0 : (now - clock.current) / 1000;
      current.time(Math.min(current.duration(), current.time() + elapsed));
      invalidate();
    }
    clock.current = now;
    uniforms.aspect.value = size.width / size.height;
    uniforms.columns.value =
      size.width < 600 ? tileVisuals.mobileColumns : tileVisuals.desktopColumns;
    camera.updateMatrixWorld();
    corners.current.forEach((corner, i) => {
      projected.copy(corner).project(camera);
      uniforms.corners.value[i]?.set(projected.x, projected.y);
    });
  });
  const enterPortfolio = useCallback((): Promise<void> => {
    if (run.current) return run.current;
    const controller = new AbortController();
    abort.current = controller;
    run.current = (async () => {
      const prepared = await preparePortfolio(controller.signal);
      if (controller.signal.aborted) return;
      const screen = scene.getObjectByName('HIT_WORK_CRT_SCREEN');
      if (
        !(screen instanceof Mesh) ||
        !(screen.material instanceof MeshBasicMaterial)
      )
        throw new Error('Monitor screen missing');
      const screenMaterial = screen.material;
      const originalBackground = renderScene.background;
      const originalClearColor = gl.getClearColor(new Color()).clone();
      const originalClearAlpha = gl.getClearAlpha();
      const hiddenObjects: { object: Object3D; visible: boolean }[] = [];
      const hideStand = () => {
        if (hiddenObjects.length) return;
        for (const object of renderScene.children) {
          if (object === portal.current) continue;
          hiddenObjects.push({ object, visible: object.visible });
          object.visible = false;
        }
      };
      uniforms.originalScreen.value = screenMaterial.map;
      corners.current = getMonitorCorners(screen);
      const [bottomLeft, bottomRight, topLeft] = corners.current;
      if (!bottomLeft || !bottomRight || !topLeft)
        throw new Error('Monitor corners missing');
      uniforms.screenAspect.value =
        bottomLeft.distanceTo(bottomRight) / bottomLeft.distanceTo(topLeft);
      const originalPosition = camera.position.clone();
      const originalRotation = camera.quaternion.clone();
      const oldTitle = document.title;
      const debugging = new URLSearchParams(location.search).has('debug');
      const originalNodes = Array.from(document.body.children).filter(
        (node): node is HTMLElement => node instanceof HTMLElement,
      );
      const { target, position: destination } = fitMonitorCamera(
        screen,
        camera.position,
        size.width / size.height,
        camera instanceof PerspectiveCamera ? camera.fov : 38,
      );
      const endRotation = new Quaternion();
      const clone = camera.clone();
      clone.position.copy(destination);
      clone.lookAt(target);
      endRotation.copy(clone.quaternion);
      const root = gl.domElement.closest<HTMLElement>(
        '[data-scene-status]',
      )?.parentElement;
      if (!root) throw new Error('Scene root missing');
      const overlay = document.createElement('div');
      overlay.className = 'portfolio-flight';
      root.before(overlay);
      overlay.append(root);
      const page = prepared.destination;
      document.body.append(page);
      revealPage.current = page;
      updateRevealRegions();
      const state = { progress: 0 };
      const stateChange = (next: PortfolioPhase) => {
        onCameraMotion(next === 'activation' && !reducedMotion);
        gl.domElement.dataset.portfolioPhase = next;
        if (next === 'activation')
          gl.domElement.dataset.cameraEntrance = 'resetting';
        if (next === 'portfolio')
          gl.domElement.dataset.cameraEntrance = 'complete';
        setPhase(next);
      };
      let disposeWork: (() => void) | undefined;
      const restore = () => {
        disposeWork?.();
        timeline.current?.kill();
        timeline.current = null;
        overlay.before(root);
        overlay.remove();
        page.remove();
        revealPage.current = null;
        screen.material = screenMaterial;
        for (const entry of hiddenObjects) entry.object.visible = entry.visible;
        renderScene.background = originalBackground;
        gl.setClearColor(originalClearColor, originalClearAlpha);
        originalNodes.forEach((node) => {
          node.hidden = false;
          node.inert = false;
        });
        uniforms.activation.value = 0;
        uniforms.expansion.value = 0;
        uniforms.portalOpacity.value = 0;
        uniforms.travel.value = 0;
        uniforms.decomposition.value = 0;
        uniforms.reveal.value = 0;
        clock.current = null;
        corners.current = [];
        camera.position.copy(originalPosition);
        camera.quaternion.copy(originalRotation);
        document.documentElement.dataset.presentation = 'immersive';
        document.body.dataset.layout = 'immersive';
        document.title = oldTitle;
        stateChange('idle');
        setFrameloop(reducedMotion ? 'demand' : 'always');
        finish.current();
        run.current = null;
        cleanup.current = () => {};
        invalidate();
      };
      cleanup.current = restore;
      const done = new Promise<void>((resolve) => {
        finish.current = resolve;
      });
      const short = reducedMotion;
      const activation = short ? 0.15 : timing.activation;
      const flight = short ? 0 : timing.flight;
      const decomposition = short ? 0 : timing.decompose;
      const reconstruction = short ? 0.3 : timing.reconstruct;
      const decomposeAt = activation + flight;
      const revealAt = decomposeAt + decomposition;
      screen.material = materials.screen;
      stateChange('activation');
      const sequence = gsap.timeline({ paused: true });
      timeline.current = sequence;
      clock.current = null;
      sequence.to(
        uniforms.activation,
        { value: 1, duration: activation * 0.65 },
        0,
      );
      sequence.to(
        state,
        {
          progress: 1,
          duration: activation,
          ease: 'power2.inOut',
          onUpdate: () => {
            if (short) return;
            camera.position.lerpVectors(
              originalPosition,
              destination,
              state.progress,
            );
            camera.quaternion.slerpQuaternions(
              originalRotation,
              endRotation,
              state.progress,
            );
          },
        },
        0,
      );
      if (short) uniforms.expansion.value = 1;
      sequence.to(
        uniforms.portalOpacity,
        {
          value: 1,
          duration: short ? activation : 0.08,
          onComplete: short ? hideStand : undefined,
        },
        short ? 0 : activation - tileVisuals.expansionSeconds * 0.7,
      );
      if (!short)
        sequence.to(
          uniforms.expansion,
          {
            value: 1,
            duration: short ? 0.15 : tileVisuals.expansionSeconds,
            ease: 'power2.inOut',
            onComplete: hideStand,
          },
          short ? 0 : activation - tileVisuals.expansionSeconds * 0.7,
        );
      sequence.call(
        () => {
          stateChange('wormhole');
          originalNodes.forEach((node) => {
            if (!node.contains(overlay)) node.inert = true;
          });
        },
        [],
        activation,
      );
      sequence.to(
        uniforms.travel,
        {
          value: short ? 0 : 1,
          duration: flight + decomposition,
          ease: 'power2.out',
        },
        activation,
      );
      sequence.call(() => stateChange('decompose'), [], decomposeAt);
      sequence.to(
        uniforms.decomposition,
        {
          value: 1,
          duration: decomposition,
          ease: 'power2.inOut',
        },
        decomposeAt,
      );
      sequence.call(
        () => {
          stateChange('reconstruct');
          hideStand();
          renderScene.background = null;
          gl.setClearColor(0, 0);
          overlay.dataset.pixelMask = 'true';
          // Hide the source before clearing the WebGL background for the pixel mask.
          originalNodes.forEach((node) => {
            if (!node.contains(overlay)) node.hidden = true;
          });
          document.documentElement.dataset.presentation = 'portfolio';
          document.body.dataset.layout = 'portfolio';
        },
        [],
        revealAt,
      );
      sequence.to(
        uniforms.reveal,
        {
          value: 1,
          duration: reconstruction * tileVisuals.pixelClearFraction,
          ease: 'none',
        },
        revealAt,
      );
      revealPortfolio(page, sequence, revealAt, reconstruction, short);
      sequence.call(
        () => {
          stateChange('portfolio');
          setFrameloop('demand');
          sequence.kill();
          timeline.current = null;
          overlay.style.display = 'none';
          screen.material = screenMaterial;
          originalNodes.forEach((node) => {
            node.hidden = true;
            node.inert = true;
          });
          page.classList.add('portfolio-destination--ready');
          document.title = prepared.title;
          history.pushState({ portfolioTransition: true }, '', '/work');
          disposeWork = activatePortfolio(page);
          if (debugging) {
            const replay = document.createElement('button');
            replay.textContent = 'Replay monitor transition';
            replay.className = 'portfolio-replay';
            replay.onclick = () =>
              window.dispatchEvent(new Event('taqueria:replay-portfolio'));
            page.append(replay);
          }
          finish.current();
        },
        [],
        revealAt + reconstruction,
      );
      invalidate();
      await done;
    })().catch((error: unknown) => {
      cleanup.current();
      run.current = null;
      if (!controller.signal.aborted) {
        console.error('Portfolio transition failed', error);
        location.assign('/work');
      }
    });
    return run.current;
  }, [
    scene,
    camera,
    gl,
    uniforms,
    materials,
    renderScene,
    reducedMotion,
    invalidate,
    setFrameloop,
    size.width,
    size.height,
    updateRevealRegions,
    onCameraMotion,
  ]);
  useEffect(() => {
    const replay = () => {
      cleanup.current();
      history.replaceState(null, '', '/?debug=1');
      void enterPortfolio();
    };
    const back = () => {
      if (location.pathname === '/') cleanup.current();
      else if (location.pathname !== '/work' || !revealPage.current)
        location.reload();
    };
    const pause = (event: Event) => {
      if (event instanceof CustomEvent)
        previewPaused.current = event.detail === true;
      clock.current = null;
      invalidate();
    };
    window.addEventListener('popstate', back);
    if (new URLSearchParams(location.search).has('debug')) {
      window.addEventListener('taqueria:replay-portfolio', replay);
      window.addEventListener('taqueria:pause-portfolio', pause);
    }
    return () => {
      window.removeEventListener('popstate', back);
      window.removeEventListener('taqueria:replay-portfolio', replay);
      window.removeEventListener('taqueria:pause-portfolio', pause);
    };
  }, [enterPortfolio, invalidate]);
  const effect = (
    <mesh
      ref={portal}
      visible={phase !== 'portfolio' && phase !== 'idle'}
      frustumCulled={false}
      renderOrder={10000}
      raycast={() => {}}
    >
      <planeGeometry args={[2, 2]} />
      <primitive object={materials.portal} attach="material" />
    </mesh>
  );
  return { enterPortfolio, effect, phase };
}
