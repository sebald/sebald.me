import { cva } from '@/lib/styles.utils';
import { Text } from '@/ui/text';

// Styles
// ---------------
const styles = cva({
  base: ['pt-3'],
});

// Helpers
// ---------------
const formatDate = (date: Date | string) =>
  new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });

// Props
// ---------------
interface NoteMetaProps {
  date?: Date | string;
  minutes: number;
  className?: string;
}

// Component
// ---------------
export const NoteMeta = ({ date, minutes, className }: NoteMetaProps) => (
  <Text variant="muted" size="caption" className={styles({ className })}>
    {date && (
      <>
        <time dateTime={new Date(date).toISOString().split('T')[0]}>
          {formatDate(date)}
        </time>
        <span aria-hidden> · </span>
      </>
    )}
    {minutes} min read
  </Text>
);
