import { expect, it } from 'vitest';
import {
  contactContent,
  getContactActions,
  isEnabledContactMethod,
  type ContactMethod,
} from '../src/content/contact';

const linkedin: ContactMethod = {
  id: 'linkedin',
  label: 'Fixture LinkedIn',
  href: 'https://www.linkedin.com/in/test-fixture',
  enabled: true,
};
const email: ContactMethod = {
  id: 'email',
  label: 'Fixture email',
  href: 'mailto:fixture@example.com',
  enabled: true,
};

it('keeps unapproved contact information disabled and absent', () => {
  expect(getContactActions(contactContent.methods).primary).toBeUndefined();
  expect(
    contactContent.methods.every(
      (method) => !method.enabled && method.href === null,
    ),
  ).toBe(true);
});

it('selects the first enabled primary, then falls back to the first valid method', () => {
  expect(getContactActions([linkedin, { ...email, primary: true }])).toEqual({
    primary: { ...email, primary: true },
    secondary: [linkedin],
  });
  expect(
    getContactActions([{ ...linkedin, enabled: false, primary: true }, email])
      .primary,
  ).toEqual(email);
  expect(getContactActions([linkedin, email]).primary).toEqual(linkedin);
  expect(
    getContactActions([
      { ...linkedin, primary: true },
      { ...email, primary: true },
    ]).primary?.id,
  ).toBe('linkedin');
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
      id: 'instagram',
      label: 'Fixture Instagram',
      href: 'https://www.instagram.com/test-fixture/',
      enabled: true,
    }),
  ).toBe(true);
});
