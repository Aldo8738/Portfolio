import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type Ref,
} from 'react';
import {
  backgroundTrack,
  cameraSound,
  guitarTrack,
  salsaSound,
} from '../../content/media';

export interface AmpAudioActions {
  toggle: () => void;
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

type SoundMode = 'off' | 'ambient' | 'amp';
type SoundState =
  | { mode: 'off' }
  | { mode: 'ambient' | 'amp'; status: 'loading' | 'playing' | 'error' };

export function AmpAudio({ ref }: { ref: Ref<AmpAudioActions> }) {
  const ambient = useRef<HTMLAudioElement>(null);
  const amp = useRef<HTMLAudioElement>(null);
  const salsa = useRef<HTMLAudioElement>(null);
  const whoosh = useRef<HTMLAudioElement>(null);
  const mode = useRef<SoundMode>('off');
  const request = useRef(0);
  const [state, setState] = useState<SoundState>({ mode: 'off' });
  const changeMode = useCallback((next: SoundMode) => {
    mode.current = next;
    const currentRequest = ++request.current;
    ambient.current?.pause();
    amp.current?.pause();
    if (next === 'off') {
      salsa.current?.pause();
      whoosh.current?.pause();
      setState({ mode: 'off' });
      return;
    }
    // Warm short effects on sound opt-in so brief transitions can finish decoding in time.
    prepareEffect(salsa.current, salsaSound.src);
    prepareEffect(whoosh.current, cameraSound.src);
    const player = next === 'amp' ? amp.current : ambient.current;
    const track = next === 'amp' ? guitarTrack : backgroundTrack;
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
  const pause = useCallback(() => changeMode('off'), [changeMode]);
  const splat = useCallback(() => {
    if (mode.current !== 'off') playEffect(salsa.current, salsaSound.src);
  }, []);
  const cameraMotion = useCallback((moving: boolean) => {
    if (!moving) {
      whoosh.current?.pause();
      return;
    }
    if (mode.current !== 'off') playEffect(whoosh.current, cameraSound.src);
  }, []);
  const toggleAmp = useCallback(
    () => changeMode(mode.current === 'amp' ? 'ambient' : 'amp'),
    [changeMode],
  );
  const toggleSound = useCallback(() => {
    if (state.mode !== 'off' && state.status === 'error') {
      changeMode(state.mode);
      return;
    }
    changeMode(mode.current === 'off' ? 'ambient' : 'off');
  }, [changeMode, state]);
  useImperativeHandle(ref, () => ({ toggle: toggleAmp, pause, cameraMotion }), [
    toggleAmp,
    pause,
    cameraMotion,
  ]);
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
    const on = state.mode !== 'off' && state.status !== 'error';
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
    const music = amp.current;
    const effect = salsa.current;
    const movement = whoosh.current;
    const hide = () => {
      if (document.hidden) pause();
    };
    window.addEventListener('pagehide', pause);
    window.addEventListener('popstate', pause);
    document.addEventListener('visibilitychange', hide);
    return () => {
      background?.pause();
      music?.pause();
      effect?.pause();
      movement?.pause();
      window.removeEventListener('pagehide', pause);
      window.removeEventListener('popstate', pause);
      document.removeEventListener('visibilitychange', hide);
    };
  }, [pause]);
  const playing = (source: 'ambient' | 'amp') => {
    if (mode.current === source) setState({ mode: source, status: 'playing' });
  };
  const failed = (source: 'ambient' | 'amp') => {
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
      <audio
        ref={amp}
        data-audio="amp"
        preload="none"
        onPlaying={() => playing('amp')}
        onError={() => failed('amp')}
        onEnded={() => {
          if (mode.current === 'amp') changeMode('ambient');
        }}
      />
    </>
  );
}
