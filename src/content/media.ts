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
    alt: 'Two people wearing blue lucha libre masks in a wrestling arena.',
    preview: '/media/previews/lucha.jpg',
    original: '/images/pictures/lucha-libre-left-image.jpg',
  },
  {
    id: 'paris',
    title: 'Paris',
    alt: 'A portrait in front of the illuminated Eiffel Tower at night.',
    preview: '/media/previews/paris.jpg',
    original: '/images/pictures/paris-middle-image.png',
  },
  {
    id: 'canal',
    title: 'Canal',
    alt: 'A person wearing a captain hat on a boat beside a tree-lined canal.',
    preview: '/media/previews/canal.jpg',
    original: '/images/pictures/captain-right-image.jpg',
  },
];
export const guitarTrack: { src: string; title: string } | null = {
  src: '/media/music/original/h6.mp3',
  title: 'h6',
};
export const backgroundTrack = {
  src: '/media/sound%20effects/grilling-meat.mp3',
};
export const guitarVideo = {
  src: '/media/video/guitar.mp4',
  poster: '/media/video/guitar-poster.jpg',
  label: "Aldo's guitar performance",
} as const;
export const salsaSound = {
  src: '/media/sound%20effects/cartoon-splat.mp3',
};
export const cameraSound = {
  src: '/media/sound%20effects/soft-whoosh.mp3',
};
// TODO: supply original drawings before release.
