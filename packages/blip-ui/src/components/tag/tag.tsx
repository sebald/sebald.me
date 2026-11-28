import { tag as styles } from './tag.styles';

export interface TagProps {
  /** The word: what it marks, said in letters (`New`, `Done`) */
  children: string;
  /**
   * What it marks: `new`, something the player has not looked at yet, in
   * the second accent; `done`, something finished, quiet. The word says
   * it too, never the colour alone
   * @default 'new'
   */
  variant?: 'new' | 'done';
  className?: string;
}

/**
 * A short word beside a name: new, done. It sits in the name's line and
 * is read with it (`Lantern New`); the container it is in gives it its
 * room (a menu row, a tab). A word in letters, not art: a `Stamp` is
 * drawn over a face
 */
export const Tag = ({ variant, className, children }: TagProps) => (
  <span data-slot="tag" className={styles.root({ variant, className })}>
    {/* The space a screen reader reads between the name and the tag:
        none is written before it, and the gap the eye sees is the
        container's margin */}
    <span className="sr-only"> </span>
    {children}
  </span>
);
