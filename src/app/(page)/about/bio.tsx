import {
  AddressBookIcon,
  AtIcon,
  BuildingOfficeIcon,
  MapPinIcon,
} from '@phosphor-icons/react/dist/ssr';

import { ParallaxImage } from '@/ui/parallax-image';

import background from './images/intro-background.webp';
import person from './images/intro-person.webp';
import window from './images/intro-window.webp';

const layers = [
  {
    id: 'background',
    src: background.src,
    width: background.width,
    height: background.height,
    blurDataURL: background.blurDataURL,
    config: {
      width: '400px',
      xMove: '-10px',
      yMove: '-10px',
    },
  },
  {
    id: 'window',
    src: window.src,
    width: window.width,
    height: window.height,
    blurDataURL: window.blurDataURL,
    config: {
      width: '400px',
      xMove: '-15px',
      yMove: '-10px',
    },
  },
  {
    id: 'person',
    src: person.src,
    width: person.width,
    height: person.height,
    blurDataURL: person.blurDataURL,
    // slightly move to center the person
    className: 'left-[56%]',
    config: {
      width: '450px',
      xMove: '-30px',
      yMove: '-25px',
    },
  },
];

export const Bio = () => (
  <div className="grid gap-8 sm:gap-10">
    <div className="grid gap-1">
      <h5 className="font-sans text-4xl font-bold" aria-hidden="true">
        Hi there! I am Sebastian.
      </h5>
      <div className="text-oatmeal-700 hidden flex-wrap gap-x-8 gap-y-1 text-sm sm:flex">
        <div className="flex items-center gap-1">
          <AddressBookIcon />
          Software Architect
        </div>
        <div className="flex items-center gap-1">
          <BuildingOfficeIcon />
          Reservix GmbH
        </div>
        <div className="flex items-center gap-1">
          <MapPinIcon />
          Freiburg, Germany
        </div>
      </div>
    </div>
    <div className="grid grid-cols-1 gap-8 sm:gap-12 md:grid-cols-[350px_1fr]">
      <ParallaxImage
        layers={layers}
        width="350px"
        aspect="5/6"
        className="mx-auto rounded-3xl"
      />
      <div className="prose">
        <p className="">
          I am a software architect at Reservix based in Freiburg, Germany. I
          specialize in design engineering, working right where code meets user
          experience. My goal is to create digital products that are accessible,
          intuitive, and delightful to use.
        </p>
        <p>
          Design systems are at the core of my work. To me, they are much more
          than just a UI kit or component library. They provide the
          infrastructure for organizations to ship great products, translating
          creative vision into reality at scale.
        </p>
      </div>
    </div>
  </div>
);
