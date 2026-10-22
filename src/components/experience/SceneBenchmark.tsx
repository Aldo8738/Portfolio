import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';

// Opt-in lab sampling only; ordinary visits incur no benchmark work.
export function SceneBenchmark() {
  const { gl } = useThree();
  const sample = useRef({
    warmupFrames: 0,
    started: 0,
    previous: 0,
    times: [] as number[],
    done: false,
  });
  useFrame(() => {
    const data = sample.current;
    if (data.done) return;
    if (data.warmupFrames++ < 3) return;
    const now = performance.now();
    if (!data.started) data.started = now;
    if (now - data.started < 1000) {
      data.previous = now;
      return;
    }
    data.times.push(now - data.previous);
    data.previous = now;
    if (now - data.started < 5000) return;
    data.done = true;
    const sorted = [...data.times].sort((a, b) => a - b);
    const elapsed = data.times.reduce((sum, time) => sum + time, 0);
    gl.domElement.dataset.sceneBenchmark = JSON.stringify({
      frames: data.times.length,
      elapsedMs: Math.round(elapsed),
      renderedFps: Number(((data.times.length * 1000) / elapsed).toFixed(1)),
      p95FrameMs: Math.round(sorted[Math.floor(sorted.length * 0.95)] ?? 0),
      calls: gl.info.render.calls,
      triangles: gl.info.render.triangles,
      textures: gl.info.memory.textures,
    });
  });
  return null;
}
