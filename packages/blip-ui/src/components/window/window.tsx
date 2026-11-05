'use client';

import type { CSSProperties, PropsWithChildren } from 'react';

import { CORNERS, rounded } from '../../foundations/corners';
import {
  type DitherRow,
  ditherBackground,
  ditherRows,
} from '../../foundations/dither';
import { useInputKind } from '../../hooks/use-input-kind';
import { window as styles } from './window.styles';

/** The window's rings, from the outside in, one stage pixel each */
const RINGS = ['var(--bui-ink)', 'var(--bui-frame)', 'var(--bui-frame-inner)'];

/**
 * The fill's dithered gradient: a solid row of light under the frame,
 * then rows at a half, a quarter and an eighth of the dots; the same
 * steps in the shade up from the bottom edge, without the solid row. Low
 * contrast on purpose: light falling on the window, not a pattern.
 */
const FADE: DitherRow[] = [
  { at: 1, period: 2, offset: 0 },
  { at: 2, period: 2, offset: 1 },
  { at: 3, period: 4, offset: 0 },
  { at: 4, period: 4, offset: 2 },
  { at: 5, period: 8, offset: 0 },
  { at: 6, period: 8, offset: 4 },
];

const FILL = ditherBackground([
  ...ditherRows(
    [{ at: 0, period: 1, offset: 0 }, ...FADE],
    'var(--bui-surface-light)',
    'top',
  ),
  ...ditherRows(
    FADE.map(row => ({ ...row, at: row.at - 1 })),
    'var(--bui-surface-shade)',
    'bottom',
  ),
]);

export interface WindowProps extends PropsWithChildren {
  className?: string;
  style?: CSSProperties;
}

/**
 * The window's look, for the kit's parts that are a window (a Window, a
 * tab's panel): ink, frame, inner line and the dithered fill, the
 * corners in pixel steps. Not exported from the kit. A `Legend` in it
 * goes to its bottom edge by itself.
 */
export const WindowFrame = ({ className, style, children }: WindowProps) => (
  // `data-window`: what a picker's description box sits beside
  <div data-window className={styles.root({ className })} style={style}>
    {/* The rings; the content is not clipped, so nothing is cut at a corner */}
    {RINGS.map((colour, i) => (
      <span
        key={colour}
        aria-hidden
        className={styles.ring()}
        style={{
          inset: `calc(var(--px) * ${i})`,
          backgroundColor: colour,
          clipPath: rounded(CORNERS[i]!),
        }}
      />
    ))}
    <div
      className={styles.body()}
      style={{ margin: `calc(var(--px) * ${RINGS.length})`, ...FILL }}
    >
      {children}
    </div>
  </div>
);

/**
 * The quiet RPG window every text sits in: ink, a pale frame, a dark
 * fill with a dithered gradient, the corners rounded in pixel steps, all
 * on the stage's grid. It grows with what is in it; position and size
 * it from outside. Three stage pixels of it are the frame.
 */
export const Window = (props: WindowProps) => <WindowFrame {...props} />;

export interface LegendProps {
  /** Each key and what it does, for keyboards */
  keys: [key: string, does: string][];
  /** The one line for touch */
  touch: string;
  className?: string;
}

/** What works right now, in key or touch wording by the last input */
const Hints = ({ keys, touch }: Omit<LegendProps, 'className'>) => {
  const kind = useInputKind();
  if (kind === 'touch') return <>{touch}</>;
  return (
    <>
      {keys.map(([key, does], i) => (
        <span key={key}>
          {i > 0 && ' · '}
          <span className={styles.key()}>{key}</span> {does}
        </span>
      ))}
    </>
  );
};

/**
 * The control hints of what it is in: put it last in a window (or a
 * tab's panel) and it sits along the bottom edge, right aligned
 */
export const Legend = ({ className, ...props }: LegendProps) => (
  <div className={styles.legend({ className })}>
    <Hints {...props} />
  </div>
);

/**
 * The legend on its own, in the stage's bottom right corner; held
 * upright, centred over the bar of controls
 */
export const CornerLegend = ({ className, ...props }: LegendProps) => (
  <div className={styles.corner({ className })}>
    <Hints {...props} />
  </div>
);
