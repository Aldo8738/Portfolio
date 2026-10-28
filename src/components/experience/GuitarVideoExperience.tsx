import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type Ref,
  type RefObject,
} from 'react';
import { gsap } from 'gsap';
import { guitarVideo } from '../../content/media';
import { guitarMotion } from '../../lib/guitar-camera';
import type { AmpAudioActions } from './AmpAudio';
import type { CameraActions, GuitarPhase } from './scene-types';
import styles from './GuitarVideoExperience.module.css';

export interface GuitarVideoActions {
  open: () => void;
  close: (immediate?: boolean, restoreAudio?: boolean) => void;
}
type Playback =
  'loading' | 'playing' | 'paused' | 'blocked' | 'error' | 'ended';

export function GuitarVideoExperience({
  ref,
  cameraActions,
  audio,
  phase,
  onPhaseChange,
  reducedMotion,
  trigger,
}: {
  ref: Ref<GuitarVideoActions>;
  cameraActions: RefObject<CameraActions | null>;
  audio: RefObject<AmpAudioActions | null>;
  phase: GuitarPhase;
  onPhaseChange: (phase: GuitarPhase) => void;
  reducedMotion: boolean;
  trigger: RefObject<HTMLButtonElement | null>;
}) {
  const panel = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const currentPhase = useRef<GuitarPhase>('idle');
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const restoreCamera = useRef<(() => void) | undefined>(undefined);
  const resumeAmbient = useRef(true);
  const request = useRef(0);
  const [playback, setPlayback] = useState<Playback>('loading');
  const [muted, setMuted] = useState(false);
  const changePhase = useCallback(
    (next: GuitarPhase) => {
      currentPhase.current = next;
      onPhaseChange(next);
    },
    [onPhaseChange],
  );
  const finish = useCallback(
    (restoreAudio: boolean, notify = true) => {
      ++request.current;
      timeline.current?.kill();
      timeline.current = null;
      restoreCamera.current?.();
      restoreCamera.current = undefined;
      audio.current?.endVideo(restoreAudio);
      const player = video.current;
      if (player) {
        player.pause();
        player.removeAttribute('src');
        player.removeAttribute('poster');
        player.preload = 'none';
        player.load();
      }
      if (panel.current) panel.current.hidden = true;
      currentPhase.current = 'idle';
      if (notify) {
        onPhaseChange('idle');
        requestAnimationFrame(() =>
          trigger.current?.focus({ preventScroll: true }),
        );
      }
    },
    [audio, onPhaseChange, trigger],
  );
  const close = useCallback(
    (immediate = false, restoreAudio = true) => {
      if (currentPhase.current === 'idle') return;
      ++request.current;
      video.current?.pause();
      resumeAmbient.current = restoreAudio;
      if (immediate || !timeline.current || timeline.current.time() === 0) {
        finish(restoreAudio);
        return;
      }
      if (currentPhase.current === 'closing') return;
      changePhase('closing');
      timeline.current.timeScale(guitarMotion.exitSpeed).reverse();
    },
    [changePhase, finish],
  );
  const play = useCallback(() => {
    const player = video.current;
    if (!player) return;
    const token = ++request.current;
    if (player.error) player.load();
    setPlayback('loading');
    void player.play().catch((error: unknown) => {
      if (token !== request.current || currentPhase.current === 'idle') return;
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setPlayback(player.error ? 'error' : 'blocked');
    });
  }, []);
  const open = useCallback(() => {
    const element = panel.current;
    const player = video.current;
    if (!element || !player || currentPhase.current !== 'idle') return;
    changePhase('opening');
    resumeAmbient.current = true;
    element.hidden = false;
    player.poster = guitarVideo.poster;
    player.preload = 'auto';
    player.src = guitarVideo.src;
    player.currentTime = 0; // Each visit starts the same performance from the beginning.
    audio.current?.beginVideo(player);
    setMuted(player.muted);
    play(); // Stay inside the trusted amp/button gesture, before any animation awaits.
    const sequence = gsap.timeline({
      paused: true,
      onComplete: () => changePhase('open'),
      onReverseComplete: () => finish(resumeAmbient.current),
    });
    timeline.current = sequence;
    const composition = cameraActions.current?.composeGuitar(sequence);
    restoreCamera.current = composition?.restore;
    const rect = element.getBoundingClientRect();
    const origin = composition?.origin ?? {
      x: innerWidth / 2,
      y: innerHeight * 0.75,
    };
    const start = reducedMotion
      ? { x: 0, y: 0, scale: 1 }
      : {
          x: origin.x - (rect.left + rect.width / 2),
          y: origin.y - (rect.top + rect.height / 2),
          scale: 0.08,
        };
    sequence.fromTo(
      element,
      { ...start, opacity: 0 },
      {
        x: 0,
        y: 0,
        scale: 1,
        opacity: 1,
        ease: 'power3.out',
        duration: reducedMotion ? guitarMotion.reduced : guitarMotion.reveal,
      },
      0,
    );
    sequence.play(0);
    player.focus({ preventScroll: true });
  }, [audio, cameraActions, changePhase, finish, play, reducedMotion]);
  useImperativeHandle(ref, () => ({ open, close }), [open, close]);
  const cleanup = useRef(finish);
  useEffect(() => {
    cleanup.current = finish;
  }, [finish]);
  useEffect(
    () => () => {
      if (currentPhase.current !== 'idle') cleanup.current(false, false);
    },
    [],
  );
  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && currentPhase.current !== 'idle') {
        event.preventDefault();
        close();
      }
    };
    const navigation = (event: MouseEvent) => {
      if (
        event.button === 0 &&
        !event.ctrlKey &&
        !event.metaKey &&
        event.target instanceof Element &&
        event.target.closest('a[href]')
      )
        close(true, false);
    };
    const leave = () => close(true, false);
    const visibility = () => {
      if (document.hidden) {
        video.current?.pause();
        timeline.current?.pause();
      } else if (
        currentPhase.current === 'opening' ||
        currentPhase.current === 'closing'
      )
        timeline.current?.paused(false);
    };
    window.addEventListener('keydown', escape);
    window.addEventListener('pagehide', leave);
    window.addEventListener('popstate', leave);
    document.addEventListener('click', navigation, true);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      window.removeEventListener('keydown', escape);
      window.removeEventListener('pagehide', leave);
      window.removeEventListener('popstate', leave);
      document.removeEventListener('click', navigation, true);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [close]);
  const status = (next: Playback) => {
    if (currentPhase.current !== 'idle' && currentPhase.current !== 'closing')
      setPlayback(video.current?.error ? 'error' : next);
  };
  return (
    <section
      ref={panel}
      className={styles.panel}
      hidden={phase === 'idle'}
      aria-label="Guitar performance"
      data-guitar-panel
      data-guitar-playback={playback}
    >
      <div className={styles.topline}>
        <span>A little guitar session</span>
        <button
          type="button"
          aria-label="Close guitar video"
          onClick={() => close()}
        >
          Close ×
        </button>
      </div>
      <video
        ref={video}
        className={styles.video}
        preload="none"
        playsInline
        controls
        tabIndex={0}
        aria-label={guitarVideo.label}
        onPlaying={() => status('playing')}
        onPause={() => status('paused')}
        onWaiting={() => status('loading')}
        onEnded={() => status('ended')}
        onError={() => status('error')}
        onVolumeChange={() =>
          setMuted(Boolean(video.current?.muted || video.current?.volume === 0))
        }
      />
      <div className={styles.feedback}>
        <p role="status">
          {playback === 'loading'
            ? 'Loading the performance…'
            : playback === 'blocked'
              ? 'Press Play to start the performance.'
              : playback === 'error'
                ? 'The video could not play. You can retry or return to the stand.'
                : ''}
        </p>
        {(playback === 'blocked' || playback === 'error') && (
          <button type="button" onClick={play}>
            {playback === 'error' ? 'Retry video' : 'Play performance'}
          </button>
        )}
        {muted && (
          <button
            type="button"
            onClick={() => {
              if (video.current) {
                video.current.muted = false;
                if (video.current.volume === 0) video.current.volume = 1;
              }
            }}
          >
            Unmute
          </button>
        )}
      </div>
    </section>
  );
}
