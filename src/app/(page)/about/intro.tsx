import { ParallaxImage } from '@/ui/parallax-image';

import background from './images/intro-background.webp';
import person from './images/intro-person.webp';
import window from './images/intro-window.webp';

const layers = [
  {
    id: 'background',
    ...background,
    config: {
      width: '400px',
      xMove: '-10px',
      yMove: '-10px',
    },
  },
  {
    id: 'window',
    ...window,
    config: {
      width: '400px',
      xMove: '-15px',
      yMove: '-10px',
    },
  },
  {
    id: 'person',
    ...person,
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
    <p className="mt-0 font-sans text-4xl font-bold" aria-hidden="true">
      Hi there!
    </p>
    <p>
      I am Sebastian, a software architect at Reservix based in Freiburg,
      Germany. I specialize in design engineering, working right where code
      meets user experience. My goal is to create digital products that are
      accessible, intuitive, and delightful to use.
    </p>
    <p>
      Design systems are at the core of my work. To me, they are much more than
      just a UI kit or component library. They serve as the infrastructure that
      empowers organizations to ship great products smoothly, providing the
      framework needed to translate creative vision into technical reality at
      scale.
    </p>
  </div>
);
