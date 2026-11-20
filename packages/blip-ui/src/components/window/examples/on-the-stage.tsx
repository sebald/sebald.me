import { usePixels } from '../../../providers/pixels';
import { Stage } from '../../stage/stage';
import { Text } from '../../text/text';
import { Legend } from '../window';

/** The same legend on the stage itself: the stage puts it in its bottom right corner */
export function OnTheStage() {
  const { scale } = usePixels();
  return (
    <Stage scale={scale} width={200} height={60}>
      <Text className="p-3">The stage</Text>
      <Legend keys={[['Enter', 'start']]} touch="Tap to start" />
    </Stage>
  );
}
