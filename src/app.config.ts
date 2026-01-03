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
  {
    title: 'Lab',
    href: '/lab',
    Icon: FlaskIcon,
    description:
      'Code, concepts, and curiosities. Feel free to grab what you need.',
  },
  {
    title: 'About',
    href: '/about',
    Icon: HandWavingIcon,
    description: 'Who I am and the work I do. Don’t hesitate to say hello.',
  },
] as const;
