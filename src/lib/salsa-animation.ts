import { gsap } from 'gsap';
import {
  Box3,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  RingGeometry,
  SphereGeometry,
  Vector3,
  type Object3D,
} from 'three';
import { themes, type ThemeId } from './theme';

export const salsaTiming = {
  hover: 0.18,
  release: 0.26,
  impact: 0.48,
  finish: 1.12,
  compression: 0.93,
  widening: 1.035,
} as const;

const salsaEffect = {
  dropCount: 4,
  mainRadius: 0.023,
  secondaryRadius: 0.009,
  arcHeight: 0.5,
  rippleRadius: 1.15,
  rippleOpacity: 0.42,
  washOpacity: 0.045,
} as const;

// One bounded timeline owns the bottles and shared effects; newest selection wins.
export function createSalsaAnimation(
  model: Object3D,
  world: Object3D,
  invalidate: () => void,
  commit: (theme: ThemeId) => void,
  report: (phase: 'idle' | 'squeeze' | 'release' | 'ripple') => void,
) {
  const bottles = themes.map((theme, index) => {
    const pivot = model.getObjectByName(theme.node);
    const nozzle = pivot?.getObjectByName(`SALSA_bottle_nozzle_${index}`);
    const body = pivot?.getObjectByName(`SALSA_bottle_${index}`);
    if (!pivot || !nozzle || !(body instanceof Mesh))
      throw new Error(`Salsa animation contract missing: ${theme.node}`);
    const material = Array.isArray(body.material)
      ? body.material[0]
      : body.material;
    if (!(material instanceof MeshStandardMaterial))
      throw new Error(`Salsa body material missing: ${theme.node}`);
    // Only the bottle body needs a private highlight; never tint a shared GLB material.
    const highlight = material.clone();
    const originalMaterial = body.material;
    body.material = highlight;
    return {
      theme,
      pivot,
      nozzle,
      body,
      highlight,
      originalMaterial,
      position: pivot.position.clone(),
      rotation: pivot.rotation.clone(),
      scale: pivot.scale.clone(),
      emissive: highlight.emissive.clone(),
      intensity: highlight.emissiveIntensity,
      color: material.color.clone(),
      bounds: new Box3().setFromObject(pivot),
    };
  });
  const effects = new Group();
  effects.name = 'SALSA_RUNTIME_EFFECTS';
  effects.visible = false;
  world.add(effects);
  const sphere = new SphereGeometry(1, 12, 8);
  const ring = new RingGeometry(0.94, 1, 48);
  const sauce = new MeshBasicMaterial({ transparent: true, toneMapped: false });
  const rippleMaterial = sauce.clone();
  rippleMaterial.depthWrite = false;
  sauce.depthWrite = false;
  const drops = Array.from({ length: salsaEffect.dropCount }, () => {
    const drop = new Mesh(sphere, sauce);
    effects.add(drop);
    return drop;
  });
  const splash = new Mesh(sphere, sauce);
  const ripple = new Mesh(ring, rippleMaterial);
  ripple.rotation.x = -Math.PI / 2;
  const washMaterial = sauce.clone();
  const wash = new Mesh(sphere, washMaterial);
  effects.add(splash, ripple, wash);
  let timeline: gsap.core.Timeline | undefined;
  let hoverTween: gsap.core.Timeline | undefined;
  let hovered: string | null = null;
  let pending: ThemeId | null = null;

  function restore() {
    for (const bottle of bottles) {
      bottle.pivot.position.copy(bottle.position);
      bottle.pivot.rotation.copy(bottle.rotation);
      bottle.pivot.scale.copy(bottle.scale);
      bottle.highlight.emissive.copy(bottle.emissive);
      bottle.highlight.emissiveIntensity = bottle.intensity;
    }
    effects.visible = false;
    report('idle');
    invalidate();
  }
  function cancel(finishSelection = false) {
    timeline?.kill();
    hoverTween?.kill();
    timeline = undefined;
    hovered = null;
    if (finishSelection && pending) commit(pending);
    pending = null;
    restore();
  }
  function hover(node: Object3D | null, reducedMotion: boolean) {
    let name: string | null = null;
    for (let ancestor = node; ancestor; ancestor = ancestor.parent) {
      if (bottles.some((bottle) => bottle.pivot === ancestor)) {
        name = ancestor.name;
        break;
      }
    }
    if (timeline || name === hovered) return;
    hovered = name;
    hoverTween?.kill();
    hoverTween = gsap.timeline({ onUpdate: invalidate });
    for (const bottle of bottles) {
      const selected = name === bottle.pivot.name;
      const duration = reducedMotion ? 0 : salsaTiming.hover;
      const scale = selected && !reducedMotion ? 1.025 : 1;
      hoverTween.to(
        bottle.pivot.scale,
        {
          x: bottle.scale.x * scale,
          y: bottle.scale.y * scale,
          z: bottle.scale.z * scale,
          duration,
          ease: 'power2.out',
        },
        0,
      );
      hoverTween.to(
        bottle.pivot.rotation,
        {
          x: bottle.rotation.x + (selected && !reducedMotion ? 0.045 : 0),
          duration,
          ease: 'power2.out',
        },
        0,
      );
      const emission = selected ? bottle.color : bottle.emissive;
      hoverTween.to(
        bottle.highlight.emissive,
        {
          r: emission.r,
          g: emission.g,
          b: emission.b,
          duration,
        },
        0,
      );
      hoverTween.to(
        bottle.highlight,
        {
          emissiveIntensity: selected ? 0.22 : bottle.intensity,
          duration,
        },
        0,
      );
    }
  }
  function play(id: ThemeId, reducedMotion: boolean) {
    cancel();
    const bottle = bottles.find((item) => item.theme.id === id);
    if (!bottle) return;
    if (reducedMotion) {
      commit(id);
      return;
    }
    pending = id;
    report('squeeze');
    const { pivot, rotation, scale } = bottle;
    const nozzle = new Vector3();
    const impact = new Vector3();
    const flight = { progress: 0 };
    const wave = { progress: 0 };
    const spray = { progress: 0 };
    sauce.color.copy(bottle.color);
    rippleMaterial.color.copy(bottle.color);
    washMaterial.color.copy(bottle.color);
    function updateFlight() {
      for (const [index, drop] of drops.entries()) {
        const progress = flight.progress;
        const spread = index === 0 ? 0 : (index - 2) * 0.045;
        drop.position.copy(nozzle).lerp(impact, progress);
        drop.position.x += spread * progress;
        drop.position.y +=
          4 *
          (salsaEffect.arcHeight + index * 0.014) *
          progress *
          (1 - progress);
        drop.position.z += index * 0.012 * progress;
        const radius =
          index === 0 ? salsaEffect.mainRadius : salsaEffect.secondaryRadius;
        drop.scale.set(radius, radius * (1.4 - progress * 0.5), radius);
      }
    }
    timeline = gsap.timeline({
      onUpdate: invalidate,
      onComplete: () => {
        pending = null;
        timeline = undefined;
        restore();
      },
    });
    timeline.timeScale(bottle.theme.motion.speed);
    timeline.to(
      pivot.rotation,
      { x: rotation.x - 0.09, duration: 0.15, ease: 'power2.out' },
      0,
    );
    timeline.to(
      pivot.scale,
      {
        x: scale.x * salsaTiming.widening,
        y: scale.y * salsaTiming.compression,
        z: scale.z * salsaTiming.widening,
        duration: 0.11,
        ease: 'power2.in',
      },
      0.15,
    );
    timeline.call(
      () => {
        model.updateWorldMatrix(true, true);
        const bounds = new Box3().setFromObject(bottle.nozzle);
        nozzle.copy(bounds.getCenter(new Vector3())).setY(bounds.max.y);
        impact.copy(bottle.bounds.getCenter(new Vector3()));
        impact.y = bottle.bounds.min.y + 0.006;
        impact.z = bottle.bounds.max.z + 0.045;
        world.worldToLocal(nozzle);
        world.worldToLocal(impact);
        effects.visible = true;
        report('release');
        drops.forEach((drop) => {
          drop.visible = true;
        });
        splash.visible = false;
        ripple.visible = false;
        sauce.opacity = 0.92;
        washMaterial.opacity = 0;
        updateFlight();
      },
      [],
      salsaTiming.release,
    );
    timeline.to(
      pivot.scale,
      {
        x: scale.x * 0.985,
        y: scale.y * 1.035,
        z: scale.z * 0.985,
        duration: 0.17,
        ease: `back.out(${bottle.theme.motion.spring})`,
      },
      salsaTiming.release,
    );
    timeline.to(
      pivot.rotation,
      { x: rotation.x + 0.055, duration: 0.18, ease: 'power2.out' },
      salsaTiming.release,
    );
    timeline.to(
      flight,
      {
        progress: 1,
        duration: salsaTiming.impact - salsaTiming.release,
        ease: 'power1.in',
        onUpdate: updateFlight,
      },
      salsaTiming.release,
    );
    timeline.call(
      () => {
        drops.forEach((drop) => {
          drop.visible = false;
        });
        splash.visible = true;
        splash.position.copy(impact);
        ripple.visible = true;
        ripple.position.copy(impact);
        wash.position.copy(impact).add(new Vector3(0, -0.002, 0));
        commit(id);
        report('ripple');
        pending = null;
      },
      [],
      salsaTiming.impact,
    );
    timeline.to(
      spray,
      {
        progress: 1,
        duration: 0.2,
        ease: 'power2.out',
        onUpdate: () => {
          const radius = 0.025 + spray.progress * 0.065;
          splash.scale.set(
            radius,
            0.004 * (1 - spray.progress) + 0.001,
            radius,
          );
        },
      },
      salsaTiming.impact,
    );
    timeline.to(sauce, { opacity: 0, duration: 0.18 }, 0.64);
    timeline.to(
      wave,
      {
        progress: 1,
        duration: 0.6,
        ease: 'power2.out',
        onUpdate: () => {
          const radius = 0.035 + wave.progress * salsaEffect.rippleRadius;
          ripple.scale.setScalar(radius);
          rippleMaterial.opacity =
            salsaEffect.rippleOpacity * (1 - wave.progress);
          wash.scale.set(radius, 0.001, radius);
          washMaterial.opacity =
            Math.sin(wave.progress * Math.PI) * salsaEffect.washOpacity;
        },
      },
      salsaTiming.impact,
    );
    timeline.to(
      pivot.rotation,
      { x: rotation.x, duration: 0.55, ease: 'elastic.out(1,0.45)' },
      0.44,
    );
    timeline.to(
      pivot.scale,
      {
        x: scale.x,
        y: scale.y,
        z: scale.z,
        duration: salsaTiming.finish - 0.44,
        ease: 'elastic.out(1,0.45)',
      },
      0.44,
    );
  }
  return {
    play,
    hover,
    cancel,
    dispose() {
      cancel();
      effects.removeFromParent();
      sphere.dispose();
      ring.dispose();
      sauce.dispose();
      rippleMaterial.dispose();
      washMaterial.dispose();
      for (const bottle of bottles) {
        if (bottle.body.material === bottle.highlight)
          bottle.body.material = bottle.originalMaterial;
        bottle.highlight.dispose();
      }
    },
  };
}
