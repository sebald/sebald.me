import { Heading, ScreenTitle, Text } from '../text';

/** A screen's title along the top, a heading under it and the hint a player acts on */
export function ScreenHeading() {
  return (
    <div className="relative grid gap-[calc(var(--px)*4)]">
      <div className="relative h-[calc(var(--px)*26+var(--bui-px)*2+1.5em)]">
        <ScreenTitle blurb="Whose side are you on today?">
          Pick a role
        </ScreenTitle>
      </div>
      <Heading>Your run as the PM</Heading>
      <Text variant="call">Press Enter to play</Text>
    </div>
  );
}
