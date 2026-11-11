import { gsap, CSSPlugin } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { knowledgeBridgeMeasurements } from '../../../content/knowledge-bridge';
import {
  createChapterTimeline,
  createGraphTimeline,
  getGraphStoryTiming,
  getLegacyStoryProgress,
  knowledgeStoryMotion,
  resetGraphPresentation,
} from './graph-motion';
import { applyGraphLayout } from './graph-layout';
import { getStoryBeat, getFocusedStoryBeat } from './story-state';

gsap.registerPlugin(CSSPlugin, ScrollTrigger);
const mounted = new WeakMap<HTMLElement, () => void>();

export function mountKnowledgeBridge(root: HTMLElement): () => void {
  const existing = mounted.get(root);
  if (existing) return existing;
  function required<T extends Element>(selector: string): T {
    const element = root.querySelector<T>(selector);
    if (!element)
      throw new Error('Knowledge Bridge markup missing: ' + selector);
    return element;
  }
  const stage = required<HTMLElement>('[data-story-stage]');
  const host = required<HTMLElement>('[data-network-host]');
  const overloadDock = required<HTMLElement>('[data-overload-dock]');
  const focusDock = required<HTMLElement>('[data-focus-dock]');
  const humanCopy = required<HTMLElement>('.kb-human-copy');
  const humanDock = required<HTMLElement>('[data-human-dock]');
  const heroValue = required<HTMLElement>('[data-hero-value]');
  const hint = required<HTMLElement>('[data-scroll-hint]');
  const progress = required<HTMLElement>('[data-story-progress-track]');
  const beats = root.querySelectorAll<HTMLElement>('li[data-story-beat]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const events = new AbortController();
  const motion = gsap.matchMedia();
  const heroTotal = knowledgeBridgeMeasurements[0].reduction;
  let heroTween: gsap.core.Tween | undefined;
  const heroMotion = gsap.context(() => {
    if (reduced.matches) return;
    const count = { value: 0 };
    heroValue.textContent = '0';
    heroTween = gsap.to(count, {
      value: heroTotal,
      duration: knowledgeStoryMotion.heroCountDuration,
      ease: 'power2.out',
      onUpdate: () => {
        heroValue.textContent = count.value.toFixed(1);
      },
      scrollTrigger: { trigger: heroValue, start: 'top 90%', once: true },
    });
  }, root);
  reduced.addEventListener(
    'change',
    () => {
      if (reduced.matches) {
        heroTween?.progress(1).pause();
        heroTween?.scrollTrigger?.kill();
        heroValue.textContent = String(heroTotal);
      }
    },
    { signal: events.signal },
  );

  motion.add(
    {
      wide: '(min-width: 1100px)',
      desktop: '(min-width: 1100px) and (min-height: 650px)',
      reduced: '(prefers-reduced-motion: reduce)',
      full: '(prefers-reduced-motion: no-preference)',
    },
    (context) => {
      resetGraphPresentation(root);
      const pinned =
        Boolean(context.conditions?.desktop) && !context.conditions?.reduced;
      const desktopGraph = Boolean(context.conditions?.wide) || pinned;
      const layout = desktopGraph ? 'desktop' : 'mobile';
      root.dataset.caseMotion = context.conditions?.reduced
        ? 'reduced'
        : 'full';
      root.dataset.storyMode = context.conditions?.reduced
        ? 'static'
        : pinned
          ? 'pinned'
          : 'scroll';
      applyGraphLayout(root, layout);
      const scrollEvents = new AbortController();

      if (!context.conditions?.reduced) {
        root.dataset.networkEnhanced = 'true';
        hint.hidden = false;
        progress.hidden = false;
        const chapterTimeline = createChapterTimeline(root, layout, pinned);
        root.dataset.graphEntry = '0.000';
        const clamp = gsap.utils.clamp(0, 1);
        const setOpacity = gsap.quickSetter(host, 'opacity');
        const setX = gsap.quickSetter(host, 'x', 'px');
        const setY = gsap.quickSetter(host, 'y', 'px');
        let storyTrigger: ScrollTrigger | undefined;
        type Box = { x: number; y: number; width: number; height: number };
        let chapterBox: Box | undefined;
        let overloadBox: Box | undefined;
        const focusEase = gsap.parseEase('power1.inOut');
        const storyTimeline = createGraphTimeline(root, pinned);
        const storyTiming = getGraphStoryTiming(pinned);
        let humanBox: Box | undefined;
        let humanTextBox: Box | undefined;
        let chapterTrigger: ScrollTrigger | undefined;
        let focusBox: Box | undefined;
        const rendered = {
          x: NaN,
          y: NaN,
          width: NaN,
          height: NaN,
          opacity: NaN,
          visibility: '',
        };
        let queued = false;
        let viewportHeight = 0;
        function pinOffset(scroll: number) {
          if (!pinned || !storyTrigger) return 0;
          if (storyTrigger.isActive) return scroll - storyTrigger.start;
          return storyTrigger.progress >= 1
            ? storyTrigger.end - storyTrigger.start
            : 0;
        }
        // One fixed scene follows reserved layout targets. Its parent and SVG never change.
        function positionNetwork() {
          gsap.ticker.remove(positionNetwork);
          queued = false;
          if (!chapterBox || !overloadBox) return;
          // Reuse sampled scroll and refresh-time boxes; no scroll-frame layout reads.
          const scroll = storyTrigger?.scroll() ?? scrollY;
          if (!pinned && focusBox && humanBox && humanTextBox) {
            const readStart = humanTextBox.y - viewportHeight * 0.4;
            const graphStart = humanBox.y - viewportHeight * 0.2;
            const graphEnd = humanBox.y + humanBox.height - viewportHeight;
            const time =
              scroll < readStart
                ? 0
                : scroll < graphStart
                  ? knowledgeStoryMotion.humanAiDuration *
                    0.32 *
                    clamp(
                      (scroll - readStart) /
                        Math.max(1, graphStart - readStart),
                    )
                  : knowledgeStoryMotion.humanAiDuration *
                    (0.32 +
                      0.68 *
                        clamp(
                          (scroll - graphStart) /
                            Math.max(1, graphEnd - graphStart),
                        ));
            if (storyTimeline.time() !== time) storyTimeline.time(time, false);
          }
          const scene = knowledgeStoryMotion.chapter;
          const chapter = pinned
            ? storyTimeline.time() /
              (100 * knowledgeStoryMotion.chapterFraction)
            : scene.restoreStart +
              (1 - scene.restoreStart) * (chapterTrigger?.progress ?? 0);
          if (!pinned) chapterTimeline.progress(chapter);
          root.dataset.graphEntry = Math.min(1, chapter).toFixed(3);
          root.dataset.chapterScene =
            chapter < scene.overloadStart
              ? 'problem'
              : chapter < scene.overloadEnd
                ? 'overload'
                : chapter < scene.restoreStart
                  ? 'solution'
                  : chapter < scene.focusStart
                    ? 'overload'
                    : chapter < scene.focusEnd
                      ? 'focusing'
                      : 'focused';
          // Only overload breaks the editorial grid; focus returns to its original dock.
          const focus = focusEase(
            clamp(
              (chapter - scene.focusStart) /
                (scene.focusEnd - scene.focusStart),
            ),
          );
          const from = {
            x: overloadBox.x + (chapterBox.x - overloadBox.x) * focus,
            y: overloadBox.y + (chapterBox.y - overloadBox.y) * focus,
            width:
              overloadBox.width +
              (chapterBox.width - overloadBox.width) * focus,
            height:
              overloadBox.height +
              (chapterBox.height - overloadBox.height) * focus,
          };
          // Natural-flow mobile docks leave the solution copy entirely clear.
          const inFocus =
            !pinned && focusBox && scroll >= focusBox.y - viewportHeight * 0.75;
          const inHuman =
            !pinned && humanBox && scroll >= humanBox.y - viewportHeight * 0.8;
          const naturalDock = inHuman && humanBox ? humanBox : focusBox;
          if (!pinned && naturalDock) {
            const target = inHuman || inFocus ? naturalDock : overloadBox;
            from.x = target.x;
            from.width = target.width;
            from.height = Math.min(target.height, viewportHeight * 0.65);
            from.y = target.y;
          }
          const fromY = pinned
            ? from.y - scroll + pinOffset(scroll)
            : (inHuman || inFocus) && naturalDock
              ? Math.min(
                  Math.max(naturalDock.y - scroll, viewportHeight * 0.16),
                  naturalDock.y + naturalDock.height - scroll - from.height,
                )
              : from.y - scroll;
          const x = from.x;
          const y = fromY;
          const width = from.width;
          const height = from.height;
          const opacity = pinned
            ? 1
            : inHuman || inFocus
              ? clamp(
                  (viewportHeight * 0.75 - (from.y - scroll)) /
                    (viewportHeight * 0.12),
                )
              : clamp(
                  (viewportHeight * 0.85 - (from.y - scroll)) /
                    (viewportHeight * 0.15),
                ) *
                clamp(
                  (from.y + from.height - scroll) / (viewportHeight * 0.15),
                );
          if (opacity !== rendered.opacity) {
            setOpacity(opacity);
            rendered.opacity = opacity;
          }
          const visibility =
            y + height < 0 || y > viewportHeight ? 'hidden' : 'visible';
          if (visibility !== rendered.visibility) {
            host.style.visibility = visibility;
            rendered.visibility = visibility;
          }
          if (visibility === 'hidden') return;
          if (width !== rendered.width) {
            host.style.width = width + 'px';
            rendered.width = width;
          }
          if (height !== rendered.height) {
            host.style.height = height + 'px';
            rendered.height = height;
          }
          if (x !== rendered.x) {
            setX(x);
            rendered.x = x;
          }
          if (y !== rendered.y) {
            setY(y);
            rendered.y = y;
          }
        }
        function queueNetwork() {
          if (queued || scrollEvents.signal.aborted) return;
          queued = true;
          gsap.ticker.add(positionNetwork);
        }
        function measureNetwork() {
          // Read only on layout refresh, before the frame's placement writes.
          const scroll = scrollY;
          viewportHeight = innerHeight;
          const chapter = focusDock.getBoundingClientRect();
          chapterBox = {
            x: chapter.x,
            y: chapter.y + scroll - pinOffset(scroll),
            width: chapter.width,
            height: pinned ? chapter.height : innerHeight * 0.65,
          };
          const overload = overloadDock.getBoundingClientRect();
          overloadBox = {
            x: overload.x,
            y: overload.y + scroll - pinOffset(scroll),
            width: overload.width,
            height: overload.height,
          };
          focusBox = {
            x: chapter.x,
            y: chapter.y + scroll - pinOffset(scroll),
            width: chapter.width,
            height: chapter.height,
          };
          const human = humanDock.getBoundingClientRect();
          humanBox = {
            x: human.x,
            y: human.y + scroll,
            width: human.width,
            height: human.height,
          };
          const humanText = humanCopy.getBoundingClientRect();
          humanTextBox = {
            x: humanText.x,
            y: humanText.y + scroll,
            width: humanText.width,
            height: humanText.height,
          };
          gsap.ticker.remove(positionNetwork);
          positionNetwork();
        }
        scrollEvents.signal.addEventListener(
          'abort',
          () => gsap.ticker.remove(positionNetwork),
          { once: true },
        );
        const timeline = storyTimeline;
        let current = -1;
        function showBeat(progress = 0) {
          const index = pinned
            ? getFocusedStoryBeat(progress)
            : humanTextBox &&
                (storyTrigger?.scroll() ?? scrollY) >=
                  humanTextBox.y - viewportHeight * 0.4
              ? getStoryBeat(0.25 + progress * 0.75)
              : 0;

          if (index !== current) {
            current = index;
            beats.forEach((beat, beatIndex) => {
              beat.dataset.active = String(index === beatIndex);
            });
            root.dataset.storyBeat = String(index);
          }
        }
        timeline.eventCallback('onUpdate', () => {
          if (pinned)
            chapterTimeline.progress(
              Math.min(
                1,
                timeline.time() / (100 * knowledgeStoryMotion.chapterFraction),
              ),
            );
          showBeat(getLegacyStoryProgress(timeline.time(), pinned));
          queueNetwork();
        });
        showBeat();
        storyTrigger = ScrollTrigger.create({
          id: 'knowledge-bridge-story',
          trigger: pinned ? stage : focusDock,
          animation: pinned ? timeline : undefined,
          pin: pinned ? stage : false,
          start: 'top top',
          end: pinned
            ? () =>
                '+=' +
                (innerHeight *
                  knowledgeStoryMotion.scrollScreens *
                  storyTiming.total) /
                  100
            : () =>
                humanDock.getBoundingClientRect().bottom +
                scrollY -
                innerHeight,
          scrub: pinned ? knowledgeStoryMotion.scrub : false,
          invalidateOnRefresh: true,
          anticipatePin: pinned ? 1 : 0,
          onUpdate: () => {
            showBeat(getLegacyStoryProgress(timeline.time(), pinned));
            queueNetwork();
          },
          // GSAP suppresses animation callbacks while restoring progress on refresh.
          onRefresh: (trigger) => {
            storyTrigger = trigger;
            if (pinned)
              chapterTimeline.progress(
                Math.min(
                  1,
                  timeline.time() /
                    (100 * knowledgeStoryMotion.chapterFraction),
                ),
              );
            measureNetwork();
            showBeat(getLegacyStoryProgress(timeline.time(), pinned));
          },
        });
        if (!pinned) {
          chapterTrigger = ScrollTrigger.create({
            id: 'knowledge-bridge-chapter-one',
            trigger: focusDock,
            start: 'top top',
            end: 'top -45%',
            onUpdate: queueNetwork,
            invalidateOnRefresh: true,
            onRefresh: (trigger) => {
              chapterTrigger = trigger;
              measureNetwork();
            },
          });
        }
        window.addEventListener('scroll', queueNetwork, {
          passive: true,
          signal: scrollEvents.signal,
        });
        measureNetwork();
      } else {
        root.dataset.networkEnhanced = 'true';
        const staticTimeline = createChapterTimeline(root, layout, false);
        let previousFocus: boolean | undefined;
        function positionStaticNetwork() {
          const dense = overloadDock.getBoundingClientRect();
          const focus = focusDock.getBoundingClientRect();
          const human = humanDock.getBoundingClientRect();
          const inFocus = focus.top < innerHeight * 0.75;
          const target =
            human.top < innerHeight * 0.75 ? human : inFocus ? focus : dense;
          if (inFocus !== previousFocus) {
            previousFocus = inFocus;
            root.dataset.chapterScene = inFocus ? 'focused' : 'overload';
            staticTimeline.progress(
              inFocus ? 1 : knowledgeStoryMotion.chapter.restoreStart,
            );
          }
          gsap.set(root.querySelector('[data-ai-learns-label]'), {
            opacity: target === human ? 1 : 0,
          });
          gsap.set(host, {
            x: target.x,
            y: target.y,
            width: target.width,
            height: Math.min(target.height, innerHeight * 0.65),
            visibility:
              target.bottom < 0 || target.top > innerHeight
                ? 'hidden'
                : 'visible',
          });
        }
        positionStaticNetwork();
        window.addEventListener('scroll', positionStaticNetwork, {
          passive: true,
          signal: scrollEvents.signal,
        });
        window.addEventListener('resize', positionStaticNetwork, {
          passive: true,
          signal: scrollEvents.signal,
        });
        void document.fonts.ready.then(() => {
          if (!scrollEvents.signal.aborted) positionStaticNetwork();
        });
      }
      return () => {
        scrollEvents.abort();
        delete root.dataset.networkEnhanced;
        resetGraphPresentation(root);
        applyGraphLayout(root, 'mobile');
        hint.hidden = true;
        progress.hidden = true;
        beats.forEach((beat) => {
          delete beat.dataset.active;
        });
        delete root.dataset.storyBeat;
        delete root.dataset.graphEntry;
        delete root.dataset.chapterScene;
        root.dataset.storyMode = 'static';
      };
    },
    root,
  );
  root.dataset.caseReady = 'true';
  void document.fonts.ready.then(() => {
    if (mounted.has(root)) ScrollTrigger.refresh();
  });
  const dispose = () => {
    // Reserve pin space before teardown so native history keeps the current scroll.
    delete root.dataset.caseReady;
    events.abort();
    motion.revert();
    heroMotion.revert();
    resetGraphPresentation(root);
    applyGraphLayout(root, 'mobile');
    heroValue.textContent = String(heroTotal);
    delete root.dataset.caseMotion;
    delete root.dataset.storyMode;
    delete root.dataset.networkEnhanced;
    mounted.delete(root);
  };
  mounted.set(root, dispose);
  return dispose;
}
