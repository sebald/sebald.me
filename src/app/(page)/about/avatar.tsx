import { ParallaxImage } from '@/ui/parallax-image';

const layers = [
  {
    id: 'background',
    src: '/0-background.webp',
    width: 1000,
    height: 1000,
    config: {
      width: '400px',
      xMove: '-10px',
      yMove: '-10px',
    },
  },
  {
    id: 'window',
    src: '/1-window.webp',
    width: 1000,
    height: 1000,
    config: {
      width: '400px',
      xMove: '-15px',
      yMove: '-10px',
    },
  },
  {
    id: 'person',
    src: '/2-person.webp',
    width: 1000,
    height: 1000,
    // slightly move to center the person
    className: 'left-[56%]',
    config: {
      width: '450px',
      xMove: '-30px',
      yMove: '-25px',
    },
  },
];

export const Avatar = () => (
  <ParallaxImage
    layers={layers}
    width="350px"
    aspect="5/6"
    className="rounded-3xl"
  />
);
