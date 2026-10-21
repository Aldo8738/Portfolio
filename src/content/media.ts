export interface MediaItem {
  id: string;
  title: string;
  alt: string;
  preview: string;
  original: string | null;
}

export const drawings: MediaItem[] = [
  {
    id: 'drawing-left',
    title: 'Drawing · left page',
    alt: 'Drawing preview from the left sketchbook page.',
    preview: '/media/previews/drawing-left.jpg',
    original: null,
  },
  {
    id: 'drawing-right',
    title: 'Drawing · right page',
    alt: 'Drawing preview from the right sketchbook page.',
    preview: '/media/previews/drawing-right.jpg',
    original: null,
  },
];
export const photos: MediaItem[] = [
  {
    id: 'lucha',
    title: 'Lucha',
    alt: 'Embedded preview of the Polaroid identified as Lucha.',
    preview: '/media/previews/lucha.jpg',
    original: null,
  },
  {
    id: 'paris',
    title: 'Paris',
    alt: 'Embedded preview of the Polaroid identified as Paris.',
    preview: '/media/previews/paris.jpg',
    original: null,
  },
  {
    id: 'canal',
    title: 'Canal',
    alt: 'Embedded preview of the Polaroid identified as Canal.',
    preview: '/media/previews/canal.jpg',
    original: null,
  },
];
export const guitarTrack: { src: string; title: string } | null = null;
// TODO: supply original media, accurate descriptions and the guitar recording before release.
