import type { Company } from './types';

export const company: Company = {
  name: 'Byte9',
  strapline: 'Digital systems, expertly delivered',
  phone: '020 8780 6350',
  phoneHref: 'tel:+442087806350',
  email: 'hello@thebyte9.com',
  recruitmentEmail: 'recruitment@thebyte9.com',
  offices: [
    {
      name: 'London',
      lines: ['39–43 Putney High Street', 'London'],
      postcode: 'SW15 1SP',
    },
    {
      name: 'Reading',
      lines: ['Victoria House', '26 Queen Victoria Street', 'Reading'],
      postcode: 'RG1 1TG',
    },
  ],
};

/** Client names shown as type, not logos (we don't reuse anyone's brand assets). */
export const clients = [
  'Kogan Page',
  'Boat International',
  'The Pharma Letter',
  'Three Rivers District Council',
  'PartsPak',
  'Bear & Bear',
  'Dockwalk',
  'Halldale',
  'Intelligent Insurer',
  'Get the Gloss',
  'Informa',
] as const;

export const perks = [
  {
    title: 'Work where you work best',
    body: 'Office, home or fully remote, with flexible hours across time zones.',
  },
  {
    title: 'The essentials, covered',
    body: 'Holiday, pension and medical cover, plus regular team socials.',
  },
  {
    title: 'A say in the company',
    body: 'Everyone shapes how we work, from tooling to process.',
  },
  {
    title: 'Visa sponsorship',
    body: 'We can sponsor UK work visas for the right people.',
  },
] as const;

export const values = [
  {
    title: 'Learning in the open',
    body: 'We share what we know, contribute to open source and keep up with a fast-moving stack.',
  },
  {
    title: 'Room for a life',
    body: 'Good work comes from rested people. We protect work–life balance.',
  },
  {
    title: 'Variety',
    body: 'Publishers, retailers, councils and our own product: no two weeks look the same.',
  },
] as const;
