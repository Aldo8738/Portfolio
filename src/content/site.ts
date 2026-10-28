export interface SocialLink {
  label: string;
  url: string;
}

export const siteContent = {
  brand: 'Taquería Aldo',
  name: 'Aldo Juárez',
  headerLine: 'Product engineer · Mexico → Berlin',
  cvUrl: '/cv' as string | null,
  description: 'A creative portfolio behind an interactive nighttime taquería.',
  introduction: null as string | null,
  biography: null as string | null,
  email: null as string | null,
  socialLinks: [] as SocialLink[],
};
// TODO: replace nulls with Aldo's approved introduction, biography and contact details.
