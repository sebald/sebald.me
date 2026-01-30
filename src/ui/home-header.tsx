import { Headline } from '@/ui/headline';
import { Logo } from '@/ui/logo';
import { Text } from '@/ui/text';

export const HomeHeader = () => {
  return (
    <header className="grid gap-8 sm:grid-cols-[auto_1fr] sm:gap-12">
      <Logo className="h-24 w-24 text-accent-foreground" />
      <div className="grid gap-4">
        <Headline level="1" as="h1">
          Hi there! I am Sebastian.
        </Headline>
        <Text>
          I am a software architect at Reservix based in Freiburg, Germany. I
          specialize in design engineering, working right where code meets user
          experience. My goal is to create digital products that are
          accessible, intuitive, and delightful to use.
        </Text>
        <Text>
          Design systems are at the core of my work. To me, they are much more
          than just a UI kit or component library. They provide the
          infrastructure for organizations to ship great products, translating
          creative vision into reality at scale.
        </Text>
      </div>
    </header>
  );
};
