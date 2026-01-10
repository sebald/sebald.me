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

export const Intro = () => (
  <div className="prose flow-root">
    <ParallaxImage
      layers={layers}
      width="350px"
      aspect="5/6"
      className="mx-auto mb-12 rounded-3xl md:float-left md:mb-6 md:mr-12"
    />
    <p className="mt-0 font-sans text-4xl font-bold">
      Hi there! My name is Sebastian.
    </p>
    <p>
      I am a software architect at Reservix located in Freiburg, Germany. My
      focus is design engineering, allowing me to operate right in the middle
      where code meets user experience. I create digital products that are
      accessible, intuitive, and delightful to use.
    </p>
    <p>
      Design Systems are at the core of my work. To me, design sytems are much
      more than just a UI kit or component library. They are the infrastructure
      that help organizations ship great products smoothly at scale. The
      services and processes within them help bridge the gap between design
      vision and code.
    </p>
  </div>
);
