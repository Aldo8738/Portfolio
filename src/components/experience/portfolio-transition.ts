import { gsap, CSSPlugin } from 'gsap';
import { parseTheme, selectTheme } from '../../lib/theme';

gsap.registerPlugin(CSSPlugin);

export const portfolioTiming = {
  activation: 0.5,
  flight: 0.9,
  decompose: 0.4,
  reconstruct: 0.7,
} as const;

export const tileVisuals = {
  navy: '#111525',
  blue: '#244767',
  cream: '#f0dfbd',
  terracotta: '#b86141',
  magenta: '#9d305e',
  amber: '#e7ad60',
  desktopColumns: 44,
  mobileColumns: 28,
  subdivisions: 4,
  expansionSeconds: 0.22,
  pixelClearFraction: 0.65,
} as const;

export type PortfolioPhase =
  | 'idle'
  | 'activation'
  | 'wormhole'
  | 'decompose'
  | 'reconstruct'
  | 'portfolio';

// Prepare the real static route before starting any visible animation.
export async function preparePortfolio(signal: AbortSignal) {
  const response = await fetch('/work', { signal });
  if (!response.ok)
    throw new Error(`Portfolio preparation failed: ${response.status}`);
  const page = new DOMParser().parseFromString(
    await response.text(),
    'text/html',
  );
  // Astro serves inline styles in development and linked styles in production.
  for (const source of page.head.querySelectorAll('style')) {
    const devId = source.getAttribute('data-vite-dev-id');
    const exists = Array.from(document.head.querySelectorAll('style')).some(
      (style) =>
        devId
          ? style.getAttribute('data-vite-dev-id') === devId
          : style.textContent === source.textContent &&
            style.media === source.media,
    );
    if (!exists) document.head.append(document.importNode(source, true));
  }
  await Promise.all(
    Array.from(
      page.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'),
    ).map((source) => {
      const href = new URL(source.getAttribute('href') ?? '', location.href)
        .href;
      if (
        Array.from(
          document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'),
        ).some((link) => link.href === href)
      )
        return;
      return new Promise<void>((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        const finish = (error?: Error) => {
          link.onload = link.onerror = null;
          signal.removeEventListener('abort', abort);
          if (error) {
            link.remove();
            reject(error);
          } else resolve();
        };
        const abort = () =>
          finish(new Error('Work stylesheet loading aborted'));
        link.onload = () => finish();
        link.onerror = () =>
          finish(new Error('Work stylesheet could not load'));
        if (signal.aborted) {
          abort();
          return;
        }
        signal.addEventListener('abort', abort, { once: true });
        document.head.append(link);
      });
    }),
  );
  const destination = document.createElement('div');
  destination.className = 'portfolio-destination';
  destination.inert = true;
  for (const child of Array.from(page.body.children)) {
    if (child.tagName !== 'SCRIPT' && child.tagName !== 'ASTRO-ISLAND')
      destination.append(document.importNode(child, true));
  }
  destination.querySelectorAll('script').forEach((script) => script.remove());
  const main = destination.querySelector('main');
  if (main) main.id = 'work-main';
  destination.querySelector('.skip-link')?.setAttribute('href', '#work-main');
  await document.fonts.ready;
  return { destination, title: page.title };
}

export function revealPortfolio(
  destination: HTMLElement,
  timeline: ReturnType<typeof gsap.timeline>,
  start: number,
  duration: number,
  reducedMotion: boolean,
) {
  const heading = destination.querySelector('h1');
  const navigation = destination.querySelector('header');
  const content = destination.querySelectorAll(
    '.page-intro p, .project-exhibition, footer',
  );
  // The shader supplies the mask; keep the HTML background opaque beneath its holes.
  timeline.set(destination, { opacity: 1 }, start);
  if (heading)
    timeline.fromTo(
      heading,
      { opacity: 0, y: reducedMotion ? 0 : 12 },
      { opacity: 1, y: 0, duration: duration * 0.55 },
      start + duration * 0.12,
    );
  if (navigation)
    timeline.fromTo(
      navigation,
      { opacity: 0 },
      { opacity: 1, duration: duration * 0.4 },
      start + duration * 0.2,
    );
  timeline.fromTo(
    content,
    { opacity: 0, y: reducedMotion ? 0 : 8 },
    {
      opacity: 1,
      y: 0,
      duration: duration * 0.45,
      stagger: { amount: duration * 0.08 },
    },
    start + duration * 0.42,
  );
}

export function activatePortfolio(destination: HTMLElement) {
  const events = new AbortController();
  let disposeWork: (() => void) | undefined;
  const work = destination.querySelector<HTMLElement>('[data-work-experience]');
  if (work)
    void import('../work/work-experience')
      .then(({ mountWorkExperience }) => {
        if (!events.signal.aborted && destination.isConnected)
          disposeWork = mountWorkExperience(work);
      })
      .catch((error: unknown) =>
        console.error('Work enhancements could not load', error),
      );
  destination.inert = false;
  destination
    .querySelectorAll<HTMLButtonElement>('[data-theme-id]')
    .forEach((button) => {
      button.addEventListener(
        'click',
        () => {
          selectTheme(parseTheme(button.dataset.themeId));
          destination
            .querySelectorAll('[data-theme-id]')
            .forEach((other) =>
              other.setAttribute('aria-pressed', String(other === button)),
            );
        },
        { signal: events.signal },
      );
      button.setAttribute(
        'aria-pressed',
        String(
          button.dataset.themeId ===
            parseTheme(document.documentElement.dataset.theme),
        ),
      );
    });
  const heading = destination.querySelector<HTMLElement>('h1');
  heading?.setAttribute('tabindex', '-1');
  heading?.focus({ preventScroll: true });
  return () => {
    events.abort();
    disposeWork?.();
  };
}
