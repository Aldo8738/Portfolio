export interface ContactMethod {
  id: 'linkedin' | 'email' | 'instagram';
  label: string;
  order: number;
  description: string;
  external: boolean;
  icon: { src: string; darkSrc: string; width: number; height: number };
  href: string | null;
  enabled: boolean;
}

export interface ContactPageContent {
  eyebrow: string;
  headline: string;
  description: string;
  closing: string;
  backLabel: string;
  journey: string;
  metadata: string;
  methods: ContactMethod[];
}

export const contactContent: ContactPageContent = {
  eyebrow: '04 / CONTACT',
  headline: 'Have something in mind?',
  description:
    "An interesting idea, a collaboration, or just a conversation? I'd love to hear from you.",
  closing: 'Thanks for stopping by.',
  backLabel: 'Back to stand',
  journey: 'Mexico → Berlin',
  metadata:
    'Get in touch with Aldo Juárez about software, design, and ideas worth building.',
  methods: [
    {
      id: 'linkedin',
      label: 'LinkedIn',
      icon: {
        src: '/images/contact/linkedin-in-black.png',
        darkSrc: '/images/contact/linkedin-in-white.png',
        width: 840,
        height: 779,
      },
      order: 1,
      description: 'For professional connections',
      external: true,
      href: 'https://www.linkedin.com/in/aldo-juárez-05557319a',
      enabled: true,
    },
    {
      id: 'email',
      label: 'Email',
      icon: {
        src: '/images/contact/mail-outline.svg',
        darkSrc: '/images/contact/mail-outline-white.svg',
        width: 64,
        height: 64,
      },
      order: 2,
      description: 'For ideas worth sharing',
      external: false,
      href: 'mailto:aldo.emilio.8738@gmail.com',
      enabled: true,
    },
    {
      id: 'instagram',
      label: 'Instagram',
      icon: {
        src: '/images/contact/instagram-glyph-black.svg',
        darkSrc: '/images/contact/instagram-glyph-white.svg',
        width: 1000,
        height: 1000,
      },
      order: 3,
      description: 'For the less professional side',
      external: true,
      href: 'https://www.instagram.com/aldoemiliojh/',
      enabled: true,
    },
  ],
};

// Enabling a method records the creator's approval; URL syntax cannot verify ownership.
export function isEnabledContactMethod(
  method: ContactMethod,
): method is ContactMethod & { href: string } {
  if (!method.enabled || !method.href || method.href !== method.href.trim())
    return false;
  if (method.external !== (method.id !== 'email')) return false;
  if (method.id === 'email')
    return /^mailto:[^\s@?]+@[^\s@?]+\.[^\s@?]+$/.test(method.href);
  try {
    const url = new URL(method.href);
    const domain = method.id === 'linkedin' ? 'linkedin.com' : 'instagram.com';
    return (
      url.protocol === 'https:' &&
      [domain, `www.${domain}`].includes(url.hostname) &&
      !url.username &&
      !url.password &&
      !url.port &&
      url.pathname.split('/').filter(Boolean).length >=
        (method.id === 'linkedin' ? 2 : 1) &&
      (method.id !== 'linkedin' || url.pathname.startsWith('/in/'))
    );
  } catch {
    return false;
  }
}

export function getContactMethods(methods: readonly ContactMethod[]) {
  return methods
    .filter(isEnabledContactMethod)
    .sort((a, b) => a.order - b.order);
}
