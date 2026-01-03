import {
  FlaskIcon,
  HandWavingIcon,
  PencilIcon,
} from '@phosphor-icons/react/dist/ssr';

export const navItems = [
  {
    title: 'Articles',
    href: '/articles',
    Icon: PencilIcon,
    description:
      'Notes from the road and lessons learned along the way. Welcome to the archive.',
  },
  { title: 'Lab', href: '/lab', Icon: FlaskIcon },
  { title: 'About', href: '/about', Icon: HandWavingIcon },
] as const;
