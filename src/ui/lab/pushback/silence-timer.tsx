'use client';

import type { ReactNode } from 'react';

import { PALETTE } from './palette';
import { px } from './stage';
import { useClock } from './use-clock';
import { Window } from './window';

/** The timer's line keeps clear of the window's rounded corners by this much */
const INSET = 4;

/**
 * The phases, as the share of the time left: gold while a counter still
 * counts as fast (the first half, the momentum's colour), then ember,
 * then red and blinking for the last quarter
 */
const FAST = 0.5;
const LATE = 0.25;

/** How long the timer flashes when the fast half runs out */
const FLASH_MS = 300;

/** The late blink, and the fuse's sparks at half of it */
const BLINK_MS = 250;

/** MOCK: the looks being compared; one stays */
export type TimerLook = 'fuse' | 'fade' | 'chunks' | 'clock' | 'tab';

/** One pixel of dither in a colour, every other column */
const dots = (colour: string) =>
  `repeating-linear-gradient(90deg, ${colour} 0 var(--px), transparent var(--px) calc(var(--px) * 2))`;

export interface SilenceTimerProps {
  elapsed: number;
  limit: number;
  /** No flicker, no blink */
  still?: boolean;
  look?: TimerLook;
}

interface Phase {
  share: number;
  light: string;
  mid: string;
  glow: string;
  /** Dimmed for the off beat of the late blink */
  off: boolean;
  flicker: boolean;
}

/** Where the time is, and its colours: gold, the flash, ember, red */
const usePhase = ({
  elapsed,
  limit,
  still = false,
}: SilenceTimerProps): Phase => {
  const share = Math.max(0, Math.min(1, 1 - elapsed / limit));
  const late = share <= LATE;
  const fast = share > FAST;
  // A moment you notice, not only a colour: the fast half running out
  const sinceFast = elapsed - limit * (1 - FAST);
  const flash = sinceFast >= 0 && sinceFast < FLASH_MS;
  const clock = useClock(!still);
  const colours = flash
    ? { light: PALETTE.spark, mid: PALETTE.spark, glow: PALETTE.emberLight }
    : fast
      ? { light: PALETTE.gold, mid: PALETTE.gold, glow: PALETTE.goldShade }
      : late
        ? { light: PALETTE.stamp, mid: PALETTE.stamp, glow: PALETTE.stamp }
        : {
            light: PALETTE.ember,
            mid: PALETTE.ember,
            glow: PALETTE.emberShade,
          };
  return {
    share,
    ...colours,
    off: late && !still && Math.floor(clock / BLINK_MS) % 2 === 1,
    flicker: !still && Math.floor(clock / (BLINK_MS / 2)) % 2 === 0,
  };
};

/** The strip along the window's top frame the line looks draw in */
const Strip = ({ children }: { children: ReactNode }) => (
  <div
    aria-hidden
    className="pointer-events-none absolute z-[1]"
    style={{ left: px(INSET), right: px(INSET), top: px(1), height: px(3) }}
  >
    {children}
  </div>
);

/**
 * The lit stretch, centred, as wide as the time left, rounded to `step`
 * pixels so both ends burn back in the same steps
 */
const Lit = ({
  phase,
  step = 2,
  children,
}: {
  phase: Phase;
  step?: number;
  children: ReactNode;
}) => (
  <span
    className="absolute inset-y-0 left-1/2 -translate-x-1/2"
    style={{
      width: `round(down, ${phase.share * 100}%, calc(var(--px) * ${step}))`,
      opacity: phase.off ? 0.35 : 1,
    }}
  >
    {children}
  </span>
);

/** The frame row, the ring under it, the glow's dither below, between two insets */
const Rows = ({ phase, from = 0 }: { phase: Phase; from?: number }) => (
  <>
    <span
      className="absolute top-0"
      style={{
        left: px(from),
        right: px(from),
        height: px(1),
        background: phase.light,
      }}
    />
    <span
      className="absolute"
      style={{
        left: px(from),
        right: px(from),
        top: px(1),
        height: px(1),
        background: phase.mid,
      }}
    />
    <span
      className="absolute"
      style={{
        left: px(from),
        right: px(from),
        top: px(2),
        height: px(1),
        background: dots(phase.glow),
      }}
    />
  </>
);

/** The fuse: the line with a spark flickering at each burning end */
const Fuse = ({ phase }: { phase: Phase }) => (
  <Strip>
    <Lit phase={phase}>
      <Rows phase={phase} />
      {phase.share > 0 &&
        (['left', 'right'] as const).map(end => (
          <span
            key={end}
            className="absolute"
            style={{
              [end]: px(-1),
              top: px(phase.flicker ? -1 : 0),
              width: px(2),
              height: px(phase.flicker ? 3 : 2),
              background: PALETTE.spark,
              boxShadow: `0 0 0 var(--px) ${phase.light}`,
            }}
          />
        ))}
    </Lit>
  </Strip>
);

/**
 * The fade: the line with no sparks, its ends fading out in two dither
 * steps, the way the windows' light fades, so the end looks drawn
 */
const FADE: [column: number, rows: number[]][] = [
  [0, [1]],
  [1, [0, 2]],
  [2, [0, 1]],
];
const FadeLine = ({ phase }: { phase: Phase }) => {
  const colour = [phase.light, phase.mid, phase.glow];
  return (
    <Lit phase={phase}>
      <Rows phase={phase} from={3} />
      {(['left', 'right'] as const).flatMap(end =>
        FADE.flatMap(([column, rows]) =>
          rows.map(row => (
            <span
              key={`${end}-${column}-${row}`}
              className="absolute"
              style={{
                [end]: px(column),
                top: px(row),
                width: px(1),
                height: px(1),
                background: colour[row],
              }}
            />
          )),
        ),
      )}
    </Lit>
  );
};

const Fade = ({ phase }: { phase: Phase }) => (
  <Strip>
    <FadeLine phase={phase} />
  </Strip>
);

/** The tab's width, and the line's height inside it, in stage pixels */
const TAB = { width: 128, line: 3 } as const;

/** The tab's height: the line, the tight window's padding and its frame */
const TAB_HEIGHT = TAB.line + 2 * 2 + 3 * 2;

/**
 * The tab: the fade line in a small window of its own on the dialogue
 * window's top edge, centred and narrower than it, its bottom frame over
 * the window's top frame so the two join
 */
const Tab = ({ phase }: { phase: Phase }) => (
  <Window
    tight
    className="pointer-events-none absolute left-1/2 z-[1] -translate-x-1/2"
    style={{ top: px(-(TAB_HEIGHT - 3)), width: px(TAB.width) }}
  >
    <div aria-hidden className="relative" style={{ height: px(TAB.line) }}>
      <FadeLine phase={phase} />
    </div>
  </Window>
);

/** A chunk of the progress bar and the gap after it, in stage pixels */
const CHUNK = { lit: 4, gap: 1 } as const;

/**
 * The progress bar: the office computer's chunky bar, the line in chunks
 * that go out a pair at a time from both ends, time read in steps
 */
const Chunks = ({ phase }: { phase: Phase }) => {
  const pitch = CHUNK.lit + CHUNK.gap;
  return (
    <Strip>
      <Lit phase={phase} step={pitch * 2}>
        <span
          className="absolute inset-x-0 top-0"
          style={{
            height: px(2),
            background: `repeating-linear-gradient(90deg, ${phase.light} 0 calc(var(--px) * ${CHUNK.lit}), ${PALETTE.frameInner} calc(var(--px) * ${CHUNK.lit}) calc(var(--px) * ${pitch}))`,
          }}
        />
        <span
          className="absolute inset-x-0"
          style={{ top: px(2), height: px(1), background: dots(phase.glow) }}
        />
      </Lit>
    </Strip>
  );
};

/** The clock face's size, in stage pixels */
const FACE = 11;

/** The face's pixels: inside the circle, with the angle clockwise from twelve */
const FACE_PIXELS = Array.from({ length: FACE * FACE }, (_, i) => {
  const x = i % FACE;
  const y = Math.floor(i / FACE);
  const dx = x - (FACE - 1) / 2;
  const dy = y - (FACE - 1) / 2;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const radius = (FACE - 0.5) / 2;
  const angle = (Math.atan2(dx, -dy) / (Math.PI * 2) + 1) % 1;
  return {
    x,
    y,
    inside: distance <= radius,
    rim: distance > radius - 1,
    angle,
  };
}).filter(pixel => pixel.inside);

/**
 * The meeting clock: a pixel clock face in a tab on the window's top
 * edge, framed like the window, its wedge of time left shrinking
 * clockwise from twelve like a meeting timer
 */
const Clock = ({ phase }: { phase: Phase }) => (
  <div
    aria-hidden
    className="pointer-events-none absolute left-1/2 z-[1] -translate-x-1/2"
    style={{
      top: px(-FACE + 1),
      padding: px(2),
      background: PALETTE.fill,
      boxShadow: `0 0 0 var(--px) ${PALETTE.frameInner}, 0 0 0 calc(var(--px) * 2) ${PALETTE.frame}, 0 0 0 calc(var(--px) * 3) ${PALETTE.ink}`,
      opacity: phase.off ? 0.6 : 1,
    }}
  >
    <svg
      viewBox={`0 0 ${FACE} ${FACE}`}
      shapeRendering="crispEdges"
      className="block"
      style={{ width: px(FACE), height: px(FACE) }}
    >
      {/* The rim in ink, the face dim where the time is gone */}
      {FACE_PIXELS.map(({ x, y, angle, rim }) => (
        <rect
          key={`${x}-${y}`}
          x={x}
          y={y}
          width={1}
          height={1}
          fill={
            rim
              ? PALETTE.ink
              : angle >= 1 - phase.share
                ? phase.mid
                : PALETTE.frameDim
          }
        />
      ))}
      {/* The hand at twelve: where the wedge starts and ends */}
      <rect
        x={(FACE - 1) / 2}
        y={0}
        width={1}
        height={2}
        fill={PALETTE.frame}
      />
    </svg>
  </div>
);

/**
 * The silence bar, on the dialogue window's top edge: while the defender
 * hesitates, it runs down from full. Gold while a counter still counts
 * as fast, a flash when that half runs out, ember after it, and the last
 * quarter stamp red and blinking; under reduced motion it stays lit.
 * Sits on the window's top edge; the window draws itself underneath.
 */
export const SilenceTimer = (props: SilenceTimerProps) => {
  const phase = usePhase(props);
  switch (props.look ?? 'fuse') {
    case 'fade':
      return <Fade phase={phase} />;
    case 'chunks':
      return <Chunks phase={phase} />;
    case 'clock':
      return <Clock phase={phase} />;
    case 'tab':
      return <Tab phase={phase} />;
    default:
      return <Fuse phase={phase} />;
  }
};
