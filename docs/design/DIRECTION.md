# Visual direction

The creator supplied [mock.png](mock.png) as the visual direction for the site.
It supersedes the initial large headline and boxed scene layout.

- The homepage opens with the stand in a full-viewport Canvas, with a compact
  identity and navigation over the scene. Keep the heading available to assistive
  technology without placing a large text block above the stand.
- Frame the frozen model prominently from the front at a slight angle. Preserve
  the sign, photos, sketchbook, counter and amplifier. Portrait screens fit the
  complete stand rather than cropping interaction targets to fill the narrow view.
- Keep direct work navigation and accessible theme controls available during
  loading and on failure. The sound indicator stays inactive until real audio
  and its controls are implemented.
- Left-button drag orbits the camera around the stand; scrolling zooms in and out.
  Keep panning disabled, bound zoom distance and elevation above the floor, and
  never auto-orbit. Provide arrow-key exploration, plus/minus zoom, Home and a
  visible Reset view button. Dragging an object
  must not also activate its click action, even when the pointer returns to its start.
- Portfolio routes use warm white surfaces, bold sans-serif headings, magenta
  accents, thin dividers and a featured project followed by smaller project cards.
  They remain static HTML and honor the selected theme.
- The identity and location line come from the supplied mock. A CV link appears
  only when a real CV URL is configured in `src/content/site.ts`.

The mock contains illustrative artwork and sample case studies. It does not
authorize editing the frozen GLB or publishing those projects as real content.
The lower-left CRT close-up guides the forthcoming camera transition; this
checkpoint retains the existing immediate CRT navigation. The later
[cinematic stand direction](TACO-STAND.md) refines lighting, materials and camera
composition. Its [visual review](../qa/cinematic/REVIEW.md) records accepted local
captures and outstanding physical-device performance checks.
