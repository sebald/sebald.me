import { usePixels } from '../../../providers/pixels';
import { Button } from '../../button/button';
import { Heading, Text } from '../../text/text';
import { Stage, type StageProps } from '../stage';

const Readout = () => {
  const { scale, tall, rows, crop, crisp, backing } = usePixels();
  return (
    <Text className="absolute bottom-3 left-3">
      {`${scale}x, ${rows} rows, ${tall ? 'tall' : 'wide'}, crop ${crop}, backing ${backing}${crisp ? ', crisp' : ''}`}
    </Text>
  );
};

/**
 * Fitted to the viewport, as a game uses it: 3x where there is room, less
 * below, tall on a phone held upright, `turned` on one held sideways. Set
 * `scale` and it stays at that scale instead
 */
export function Fitted(props: Partial<StageProps>) {
  return (
    <Stage
      label="Stage"
      turned={
        <>
          <p className="m-0 text-(--bui-primary)">Turn your phone upright.</p>
          <p className="m-0 text-(--bui-muted)">The meeting will wait.</p>
        </>
      }
      {...props}
    >
      <Stage.Center>
        <Heading>Pushback</Heading>
        <Button>Start</Button>
        <Readout />
      </Stage.Center>
    </Stage>
  );
}
