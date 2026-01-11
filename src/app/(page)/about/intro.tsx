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
