import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChatCircleIcon,
} from '@phosphor-icons/react/ssr';
import type { ReactNode } from 'react';

import { socialLinks } from '@/app.config';
import { cva } from '@/lib/styles.utils';
import { Card } from '@/ui/card';
import { Link } from '@/ui/link';
import { Text } from '@/ui/text';

// Styles
// ---------------
const styles = {
  root: cva({
    // Reply and navigation are separate things, keep them apart. The top gap
    // is well above a paragraph break, so the card doesn't read as prose
    base: ['grid gap-16 pt-24 sm:gap-20'],
  }),
  nav: cva({
    base: ['grid gap-6 sm:grid-cols-2'],
  }),
  neighbour: cva({
    base: ['group mx-0 flex items-center gap-4 rounded-xl'],
    variants: {
      direction: {
        older: '',
        newer: 'justify-end text-right sm:col-start-2',
      },
    },
  }),
  // Calmer than the note title, brightens with its arrow on hover
  title: cva({
    base: [
      'text-sm font-medium text-foreground',
      'transition-colors duration-150 group-hover:text-accent-foreground',
    ],
  }),
};

// Bubble
// ---------------
// Looks like the round icon link, but the link is the element around it
const Bubble = ({ children }: { children: ReactNode }) => (
  <span
    aria-hidden
    className="grid size-11 shrink-0 place-items-center rounded-full bg-mist-800 text-mist-400 transition-colors duration-150 group-hover:bg-mist-500/50 group-hover:text-mist-50 [&_svg]:size-4.5"
  >
    {children}
  </span>
);

// Reply
// ---------------
const Reply = ({ linkedin }: { linkedin?: string }) => (
  <Card
    href={linkedin ?? socialLinks.linkedin}
    target="_blank"
    variant="flat"
    className="flex items-center gap-4"
  >
    {/* Same size as the social icons in the footer */}
    <ChatCircleIcon
      size={28}
      aria-hidden
      className="hidden shrink-0 text-mist-400 transition-colors duration-150 group-hover:text-mist-300 sm:block"
    />
    <Text as="span" className="grow text-pretty">
      Thanks for reading. If this sparked a thought, I’d like to hear it.{' '}
      {/* Styled like a text link, the card itself is the link */}
      <span className="font-medium whitespace-nowrap text-link underline decoration-link/15 underline-offset-3 transition-colors duration-150 group-hover:decoration-link/75">
        {linkedin ? 'Reply on LinkedIn' : 'Write me on LinkedIn'}
      </span>
    </Text>
  </Card>
);

// Neighbour
// ---------------
interface NoteLink {
  url: string;
  title: string;
}

interface NeighbourProps {
  note: NoteLink;
  direction: 'older' | 'newer';
}

const Neighbour = ({ note, direction }: NeighbourProps) => {
  const label = (
    <span
      className={
        direction === 'older'
          ? 'grid gap-2 text-balance'
          : 'grid justify-items-end gap-2 text-balance'
      }
    >
      <Text variant="muted" size="caption" as="span">
        {direction === 'older' ? 'Previous' : 'Next'}
      </Text>
      <span className={styles.title()}>{note.title}</span>
    </span>
  );

  return (
    <Link
      href={note.url}
      variant="plain"
      className={styles.neighbour({ direction })}
    >
      {direction === 'older' ? (
        <>
          <Bubble>
            <ArrowLeftIcon />
          </Bubble>
          {label}
        </>
      ) : (
        <>
          {label}
          <Bubble>
            <ArrowRightIcon />
          </Bubble>
        </>
      )}
    </Link>
  );
};

// Props
// ---------------
interface NoteEndProps {
  /** The LinkedIn post that shares the note */
  linkedin?: string;
  newer?: NoteLink;
  older?: NoteLink;
  className?: string;
}

// Component
// ---------------
export const NoteEnd = ({
  linkedin,
  newer,
  older,
  className,
}: NoteEndProps) => (
  <div className={styles.root({ className })}>
    <Reply linkedin={linkedin} />
    {(older || newer) && (
      <nav aria-label="More notes" className={styles.nav()}>
        {older && <Neighbour note={older} direction="older" />}
        {newer && <Neighbour note={newer} direction="newer" />}
      </nav>
    )}
  </div>
);
