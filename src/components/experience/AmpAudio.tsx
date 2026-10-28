import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type Ref,
} from 'react';
import { backgroundTrack, cameraSound, salsaSound } from '../../content/media';

export interface AmpAudioActions {
  beginVideo: (video: HTMLVideoElement) => void;
  endVideo: (restore?: boolean) => void;
  pause: () => void;
  cameraMotion: (moving: boolean) => void;
}

function prepareEffect(player: HTMLAudioElement | null, src: string) {
  if (!player || player.getAttribute('src')) return;
  player.preload = 'auto';
  player.src = src;
  player.load();
}

function playEffect(player: HTMLAudioElement | null, src: string) {
  if (!player) return;
  prepareEffect(player, src);
  if (player.error) player.load();
  player.currentTime = 0;
  void player.play().catch((error: unknown) => {
    if (error instanceof DOMException && error.name === 'AbortError') return;
    if (player.isConnected) player.dataset.playback = 'failed';
  });
}

type SoundMode = 'off' | 'ambient' | 'video';
type SoundState =
  | { mode: 'off' }
  | {
      mode: 'ambient' | 'video';
      status: 'loading' | 'playing' | 'paused' | 'error';
      muted?: boolean;
    };

export function AmpAudio({ ref }: { ref: Ref<AmpAudioActions> }) {
  const ambient = useRef<HTMLAudioElement>(null);
  const video = useRef<HTMLVideoElement | null>(null);
  const explicitlyMuted = useRef(false);
  const previousAmbient = useRef(false);
  const detachVideo = useRef<() => void>(() => {});
  const salsa = useRef<HTMLAudioElement>(null);
  const whoosh = useRef<HTMLAudioElement>(null);
  const mode = useRef<SoundMode>('off');
  const request = useRef(0);
  const [state, setState] = useState<SoundState>({ mode: 'off' });
  const changeMode = useCallback((next: 'off' | 'ambient') => {
    mode.current = next;
    const currentRequest = ++request.current;
    ambient.current?.pause();
    video.current?.pause();
    if (next === 'off') {
      salsa.current?.pause();
      whoosh.current?.pause();
      setState({ mode: 'off' });
      return;
    }
    // Warm short effects on sound opt-in so brief transitions can finish decoding in time.
    prepareEffect(salsa.current, salsaSound.src);
    prepareEffect(whoosh.current, cameraSound.src);
    const player = ambient.current;
    const track = backgroundTrack;
    if (!player || !track) {
      setState({ mode: next, status: 'error' });
      return;
    }
    setState({ mode: next, status: 'loading' });
    if (!player.getAttribute('src')) player.src = track.src;
    else if (player.error) player.load();
    void player.play().catch(() => {
      if (request.current !== currentRequest || !player.isConnected) return;
      setState({ mode: next, status: 'error' });
    });
  }, []);
  const endVideo = useCallback(
    (restore = true) => {
      const player = video.current;
      video.current = null;
      detachVideo.current();
      player?.pause();
      changeMode(
        restore &&
          previousAmbient.current &&
          !explicitlyMuted.current &&
          !document.hidden
          ? 'ambient'
          : 'off',
      );
    },
    [changeMode],
  );
  const beginVideo = useCallback((player: HTMLVideoElement) => {
    previousAmbient.current = mode.current === 'ambient';
    ++request.current;
    ambient.current?.pause();
    salsa.current?.pause();
    whoosh.current?.pause();
    detachVideo.current();
    video.current = player;
    mode.current = 'video';
    player.muted = explicitlyMuted.current;
    const sync = () => {
      if (video.current !== player) return;
      setState({
        mode: 'video',
        status: player.error ? 'error' : player.paused ? 'paused' : 'playing',
        muted: player.muted || player.volume === 0,
      });
    };
    const volume = () => {
      explicitlyMuted.current = player.muted || player.volume === 0;
      sync();
    };
    for (const event of ['playing', 'pause', 'error'])
      player.addEventListener(event, sync);
    player.addEventListener('volumechange', volume);
    detachVideo.current = () => {
      for (const event of ['playing', 'pause', 'error'])
        player.removeEventListener(event, sync);
      player.removeEventListener('volumechange', volume);
    };
    setState({ mode: 'video', status: 'loading', muted: player.muted });
  }, []);
  const pause = useCallback(() => {
    if (video.current) endVideo(false);
    else changeMode('off');
  }, [changeMode, endVideo]);
  const splat = useCallback(() => {
    if (mode.current === 'ambient') playEffect(salsa.current, salsaSound.src);
  }, []);
  const cameraMotion = useCallback((moving: boolean) => {
    if (!moving) {
      whoosh.current?.pause();
      return;
    }
    if (mode.current === 'ambient') playEffect(whoosh.current, cameraSound.src);
  }, []);
  const toggleSound = useCallback(() => {
    const player = video.current;
    if (player) {
      const off = player.muted || player.volume === 0 || Boolean(player.error);
      player.muted = !off;
      if (off && player.volume === 0) player.volume = 1;
      explicitlyMuted.current = player.muted;
      if (!player.muted && player.paused) {
        if (player.error) player.load();
        void player.play().catch(() => {
          if (video.current !== player) return;
          setState({ mode: 'video', status: 'error', muted: player.muted });
        });
      }
      return;
    }
    if (state.mode === 'ambient' && state.status === 'error') {
      changeMode(state.mode);
      return;
    }
    explicitlyMuted.current = mode.current !== 'off';
    changeMode(mode.current === 'off' ? 'ambient' : 'off');
  }, [changeMode, state]);
  useImperativeHandle(
    ref,
    () => ({ beginVideo, endVideo, pause, cameraMotion }),
    [beginVideo, endVideo, pause, cameraMotion],
  );
  useEffect(() => {
    window.addEventListener('taqueria:theme', splat);
    return () => window.removeEventListener('taqueria:theme', splat);
  }, [splat]);
  useEffect(() => {
    const button = document.querySelector<HTMLButtonElement>(
      '[data-music-toggle]',
    );
    button?.addEventListener('click', toggleSound);
    return () => button?.removeEventListener('click', toggleSound);
  }, [toggleSound]);
  useEffect(() => {
    const button = document.querySelector<HTMLButtonElement>(
      '[data-music-toggle]',
    );
    if (!button) return;
    const on = state.mode !== 'off' && state.status !== 'error' && !state.muted;
    button.setAttribute('aria-pressed', String(on));
    button.dataset.musicState = state.mode === 'off' ? 'paused' : state.status;
    button.dataset.musicSource = state.mode;
    button.title =
      state.mode !== 'off' && state.status === 'error'
        ? 'Could not play audio. Click to try again.'
        : on
          ? 'Turn sound off'
          : 'Turn sound on';
    const label = button.querySelector('[data-music-label]');
    if (label) label.textContent = on ? 'Sound on' : 'Sound off';
  }, [state]);
  useEffect(() => {
    const background = ambient.current;
    const music = video.current;
    const effect = salsa.current;
    const movement = whoosh.current;
    const hide = () => {
      if (document.hidden) {
        if (video.current) video.current.pause();
        else pause();
      }
    };
    window.addEventListener('pagehide', pause);
    window.addEventListener('popstate', pause);
    document.addEventListener('visibilitychange', hide);
    return () => {
      detachVideo.current();
      video.current?.pause();
      background?.pause();
      music?.pause();
      effect?.pause();
      movement?.pause();
      window.removeEventListener('pagehide', pause);
      window.removeEventListener('popstate', pause);
      document.removeEventListener('visibilitychange', hide);
    };
  }, [pause]);
  const playing = (source: 'ambient') => {
    if (mode.current === source) setState({ mode: source, status: 'playing' });
  };
  const failed = (source: 'ambient') => {
    if (mode.current === source) setState({ mode: source, status: 'error' });
  };
  return (
    <>
      <audio ref={salsa} data-audio="salsa" preload="none" />
      <audio ref={whoosh} data-audio="camera" preload="none" />
      <audio
        ref={ambient}
        data-audio="ambient"
        preload="none"
        loop
        onPlaying={() => playing('ambient')}
        onError={() => failed('ambient')}
      />
    </>
  );
}
