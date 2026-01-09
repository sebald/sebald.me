import Image from 'next/image';

const layers = [
  {
    id: 'background',
    speed: 0.2,
    src: '/0-background.webp',
  },
  {
    id: 'window',
    speed: 0.6,
    src: '/1-window.webp',
  },
  {
    id: 'person',
    speed: 1.5,
    src: '/2-person.webp',
  },
];

export const Avatar = () => {
  return (
    <div className="aspect-4/3 group relative w-full overflow-hidden rounded-2xl">
      <div className="grid size-full place-items-center *:[grid-area:1/1]">
        {layers.map(layer => (
          <Image
            key={layer.id}
            src={layer.src}
            alt=""
            width={500}
            height={500}
          />
        ))}
      </div>
    </div>
  );
};
