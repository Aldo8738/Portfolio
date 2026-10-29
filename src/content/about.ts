export interface AboutContent {
  eyebrow: string;
  title: string;
  introduction: readonly string[];
  setup: readonly string[];
  payoff: string;
  metadata: string;
}

export const aboutContent: AboutContent = {
  eyebrow: '03 / ABOUT',
  title: 'A little about me.',
  introduction: [
    "¡Hola! I'm Aldo, a software engineer from Mexico, now based in Berlin.",
    "I'm curious by nature. I love discovering new places, figuring out how things work, and exploring ideas just to see where they lead.",
    "I'm especially drawn to the space between technology and creativity, where a little experimentation can turn something complicated into something surprisingly simple.",
  ],
  setup: [
    'I also have a tendency to take small ideas a bit too far.',
    'This website, for example, was supposed to be a simple portfolio.',
  ],
  payoff: 'Somehow, it ended up as a taquería.',
  metadata:
    'Meet Aldo Juárez, a software engineer from Mexico, now based in Berlin, exploring the space between technology and creativity.',
};
