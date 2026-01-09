import Image from 'next/image';

const layers = [
  {
    id: 'background',
    speed: 0.2,
    src: '/0-background.webp',
    width: 500,
    height: 500,
  },
  {
    id: 'window',
    speed: 0.6,
    src: '/1-window.webp',
    width: 500,
    height: 500,
  },
  {
    id: 'person',
    speed: 1.5,
    src: '/2-person.webp',
    width: 700,
    height: 700,
  },
];

export const Avatar = () => {
  return (
    <div className="aspect-5/6 group relative w-full overflow-hidden rounded-2xl">
      <div className="grid size-full place-items-center *:[grid-area:1/1]">
        {layers.map(layer => (
          <Image
            key={layer.id}
            src={layer.src}
            alt=""
            width={layer.width}
            height={layer.height}
            className="size-full object-cover"
          />
        ))}
      </div>
    </div>
  );
};
