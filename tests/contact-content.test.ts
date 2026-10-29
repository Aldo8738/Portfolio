import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import {
  contactContent,
  getContactMethods,
  isEnabledContactMethod,
  type ContactMethod,
} from '../src/content/contact';

const linkedin: ContactMethod = {
  id: 'linkedin',
  label: 'Fixture LinkedIn',
  order: 1,
  description: 'Professional connections',
  external: true,
  icon: {
    src: '/fixture.svg',
    darkSrc: '/fixture-white.svg',
    width: 64,
    height: 64,
  },
  href: 'https://www.linkedin.com/in/test-fixture',
  enabled: true,
};
const email: ContactMethod = {
  id: 'email',
  label: 'Fixture email',
  order: 2,
  description: 'Ideas worth sharing',
  external: false,
  icon: {
    src: '/fixture.svg',
    darkSrc: '/fixture-white.svg',
    width: 64,
    height: 64,
  },
  href: 'mailto:fixture@example.com',
  enabled: true,
};

it('keeps the downloaded official social artwork unchanged', () => {
  for (const [filename, checksum] of [
    [
      'linkedin-in-white.png',
      'ed22a5ab46c171e3449708ff34923de7298da00ac204c7f85444db05bf888791',
    ],
    [
      'instagram-glyph-white.svg',
      '3347813e9e8f082cdf48495818bd370ccff94b687efb8aa1c8a7b36cfcfb8291',
    ],
    [
      'linkedin-in-black.png',
      'b80ab65537aad1b5013da98fe82d1c36c1bb4ca896fe7829a880cc5f307693ca',
    ],
    [
      'instagram-glyph-black.svg',
      'a036f8197b3856b02d1e236e08dd1b50a4ed68cb148686beb274eabf29794d51',
    ],
  ]) {
    const bytes = readFileSync(
      new URL(`../public/images/contact/${filename}`, import.meta.url),
    );
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(checksum);
  }
});

it('publishes all three owner-approved destinations in editorial order', () => {
  const methods = getContactMethods(contactContent.methods);
  expect(methods.map((method) => method.id)).toEqual([
    'linkedin',
    'email',
    'instagram',
  ]);
  expect(methods).toHaveLength(contactContent.methods.length);
});

it('sorts valid actions without mutating source data and omits disabled or missing destinations', () => {
  const methods = [email, linkedin];
  expect(getContactMethods(methods)).toEqual([linkedin, email]);
  expect(methods).toEqual([email, linkedin]);
  expect(getContactMethods([{ ...linkedin, enabled: false }, email])).toEqual([
    email,
  ]);
  expect(getContactMethods([{ ...linkedin, href: null }])).toEqual([]);
  expect(isEnabledContactMethod({ ...email, external: true })).toBe(false);
});

it('rejects dead, malformed, unsafe and wrong-destination links', () => {
  for (const href of [
    null,
    '#',
    '',
    'javascript:alert(1)',
    'http://www.linkedin.com/in/test-fixture',
    'https://linkedin.com.evil.example/in/test-fixture',
    'https://www.linkedin.com/',
    'https://www.linkedin.com/in/',
    'https://user:password@linkedin.com/in/test-fixture',
    ' https://linkedin.com/in/test-fixture',
  ]) {
    expect(isEnabledContactMethod({ ...linkedin, href })).toBe(false);
  }
  expect(isEnabledContactMethod(linkedin)).toBe(true);
  expect(isEnabledContactMethod(email)).toBe(true);
  expect(isEnabledContactMethod({ ...email, href: 'mailto:invalid' })).toBe(
    false,
  );
  expect(isEnabledContactMethod({ ...email, enabled: false })).toBe(false);
  expect(
    isEnabledContactMethod({
      ...linkedin,
      id: 'instagram',
      label: 'Fixture Instagram',
      href: 'https://www.instagram.com/test-fixture/',
      enabled: true,
    }),
  ).toBe(true);
});
