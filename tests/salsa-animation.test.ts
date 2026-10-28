import { afterEach, describe, expect, it, vi } from 'vitest';
import { gsap } from 'gsap';
import { BoxGeometry, Group, Mesh, MeshStandardMaterial } from 'three';
import { createSalsaAnimation } from '../src/lib/salsa-animation';
import { themes } from '../src/lib/theme';

function fixture() {
  const world = new Group();
  const model = new Group();
  world.add(model);
  const geometry = new BoxGeometry(0.1, 0.35, 0.1);
  const material = new MeshStandardMaterial({ color: '#d86642' });
  const pivots = themes.map((theme, index) => {
    const pivot = new Group();
    pivot.name = theme.node;
    pivot.position.set(index * 0.2, 1.5, 0.6);
    pivot.scale.set(1.1, 0.9, 1.2);
    pivot.rotation.set(0.01, 0.02, 0.03);
    const body = new Mesh(geometry, material);
    body.name = `SALSA_bottle_${index}`;
    body.position.y = 0.175;
    const nozzle = new Mesh(geometry, material);
    nozzle.name = `SALSA_bottle_nozzle_${index}`;
    nozzle.position.y = 0.385;
    pivot.add(body, nozzle);
    model.add(pivot);
    return pivot;
  });
  const originals = pivots.map((pivot) => ({
    position: pivot.position.clone(),
    quaternion: pivot.quaternion.clone(),
    scale: pivot.scale.clone(),
  }));
  const commit = vi.fn();
  const report = vi.fn();
  const controller = createSalsaAnimation(
    model,
    world,
    vi.fn(),
    commit,
    report,
  );
  const cleanup = () => {
    controller.dispose();
    geometry.dispose();
    material.dispose();
  };
  cleanups.push(cleanup);
  return {
    world,
    model,
    pivots,
    originals,
    commit,
    report,
    controller,
    material,
  };
}
const cleanups: (() => void)[] = [];
afterEach(() => {
  cleanups.splice(0).forEach((cleanup) => cleanup());
});
function seek(time: number) {
  const timeline = gsap.globalTimeline.getChildren(false, false, true).at(-1);
  if (!timeline) throw new Error('Salsa timeline missing');
  timeline.totalTime(time, false);
}

describe('salsa choreography', () => {
  it('squeezes before release, commits only at impact and restores authored transforms', () => {
    const { controller, pivots, originals, commit, world, report } = fixture();
    controller.play('synthwave', false);
    seek(0.25);
    expect(pivots[2]?.scale.y).toBeLessThan(0.9 * 0.95);
    expect(commit).not.toHaveBeenCalled();
    seek(0.261);
    const released = world.getObjectByName('SALSA_RUNTIME_EFFECTS')
      ?.children[0];
    const nozzleHeight = released?.position.y ?? 0;
    seek(0.3);
    expect(released?.position.y).toBeGreaterThan(nozzleHeight);
    seek(0.34);
    const effects = world.getObjectByName('SALSA_RUNTIME_EFFECTS');
    expect(effects?.visible).toBe(true);
    expect(report).toHaveBeenCalledWith('release');
    seek(0.49);
    expect(commit).toHaveBeenCalledExactlyOnceWith('synthwave');
    seek(1.2);
    expect(effects?.visible).toBe(false);
    pivots.forEach((pivot, index) => {
      expect(pivot.position.toArray()).toEqual(
        originals[index]?.position.toArray(),
      );
      expect(pivot.scale.toArray()).toEqual(originals[index]?.scale.toArray());
      expect(pivot.quaternion.toArray()).toEqual(
        originals[index]?.quaternion.toArray(),
      );
    });
    expect(report).toHaveBeenLastCalledWith('idle');
  });
  it('newest selection wins, including during a ripple and on reduced-motion changes', () => {
    const { controller, commit, pivots, originals } = fixture();
    controller.play('synthwave', false);
    seek(0.3);
    controller.play('noir', false);
    expect(pivots[2]?.scale.toArray()).toEqual(originals[2]?.scale.toArray());
    seek(0.5);
    expect(commit.mock.calls).toEqual([['noir']]);
    controller.play('synthwave', false);
    seek(0.2);
    controller.play('original', true);
    expect(commit.mock.calls).toEqual([['noir'], ['original']]);
    pivots.forEach((pivot, index) =>
      expect(pivot.scale.toArray()).toEqual(originals[index]?.scale.toArray()),
    );
  });
  it('finishes pending intent on interruption and releases only owned resources', () => {
    const { controller, commit, world, model, material } = fixture();
    const dispose = vi.spyOn(material, 'dispose');
    controller.hover(model.getObjectByName('SALSA_bottle_0') ?? null, false);
    seek(0.18);
    controller.play('noir', false);
    seek(0.2);
    controller.cancel(true);
    expect(commit).toHaveBeenCalledExactlyOnceWith('noir');
    controller.dispose();
    expect(world.getObjectByName('SALSA_RUNTIME_EFFECTS')).toBeUndefined();
    expect(dispose).not.toHaveBeenCalled();
    expect((model.getObjectByName('SALSA_bottle_0') as Mesh).material).toBe(
      material,
    );
  });
});
