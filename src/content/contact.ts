export interface ContactMethod {
  id: 'linkedin' | 'email' | 'instagram';
  label: string;
  href: string | null;
  enabled: boolean;
  primary?: boolean;
}

export interface ContactPageContent {
  eyebrow: string;
  headline: string;
  description: string;
  closing: string;
  unavailable: string;
  backLabel: string;
  journey: string;
  metadata: string;
  methods: ContactMethod[];
}

export const contactContent: ContactPageContent = {
  eyebrow: '04 / CONTACT',
  headline: 'Have something in mind?',
  description:
    "I'm always happy to talk about interesting ideas, software, design, or a project worth building.",
  closing: 'Thanks for stopping by.',
  unavailable: 'Public contact details will appear here once confirmed.',
  backLabel: 'Back to stand',
  journey: 'Mexico → Berlin',
  metadata:
    'Get in touch with Aldo Juárez about software, design, and ideas worth building.',
  methods: [
    // TODO: supply Aldo's verified public LinkedIn URL before enabling. Launch blocker.
    {
      id: 'linkedin',
      label: 'Connect on LinkedIn',
      href: null,
      enabled: false,
      primary: true,
    },
    // TODO: configure mailto: only after Aldo explicitly approves public email publication.
    { id: 'email', label: 'Send an email', href: null, enabled: false },
    // TODO: supply and approve a public Instagram URL before enabling.
    { id: 'instagram', label: 'Instagram', href: null, enabled: false },
  ],
};

// Enabling a method records the creator's approval; URL syntax cannot verify ownership.
export function isEnabledContactMethod(
  method: ContactMethod,
): method is ContactMethod & { href: string } {
  if (!method.enabled || !method.href || method.href !== method.href.trim())
    return false;
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

export function getContactActions(methods: readonly ContactMethod[]) {
  const enabled = methods.filter(isEnabledContactMethod);
  const primary = enabled.find((method) => method.primary) ?? enabled[0];
  return { primary, secondary: enabled.filter((method) => method !== primary) };
}
