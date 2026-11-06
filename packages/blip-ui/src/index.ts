// Foundations
export {
  type Font,
  type Glyph,
  glyphOf,
  lit,
  supported,
} from './foundations/bitmap';
export { CORNERS, rounded } from './foundations/corners';
export {
  type DitherRow,
  ditherBackground,
  ditherRows,
  edgeMask,
  endMask,
  fadeMask,
} from './foundations/dither';
export { FLOOR, SPACE, UNIT, px } from './foundations/pixel';
export {
  BACKING,
  MAX_CROP,
  MIN_SCALE,
  NATIVE,
  type Native,
  backingFor,
  crisp,
  crispScale,
  fitFor,
  fontSizeFor,
  scaleFor,
  tallFor,
} from './foundations/scale';

// Providers
export { Announcer, useAnnounce } from './providers/announcer';
export {
  type Feedback,
  type FeedbackEvent,
  FeedbackProvider,
  useFeedback,
} from './providers/feedback';
export {
  DEFAULT_PIXELS,
  Pixels,
  PixelsContext,
  type PixelsProps,
  type PixelsValue,
  usePixels,
} from './providers/pixels';

// Hooks
export {
  canFullscreen,
  isFullscreen,
  toggleFullscreen,
  useFullscreen,
} from './hooks/fullscreen';
export { TICK_MS, prefersReducedMotion, useClock } from './hooks/use-clock';
export { type InputKind, useInputKind } from './hooks/use-input-kind';
export {
  KeyLayerContext,
  useKeydown,
  useKeyLayer,
  useOnTop,
} from './hooks/key-layer';
export { useAnyKey } from './hooks/use-any-key';
export { useIdle } from './hooks/use-idle';
export { useKeys } from './hooks/use-keys';
export { type Scroll, overflows, useScroll } from './hooks/use-scroll';

// Components
export {
  BITMAP_GLYPHS,
  BitmapText,
  type BitmapTextProps,
} from './components/bitmap-text/bitmap-text';
export { Line, type LineProps } from './components/line/line';
export {
  Typewriter,
  type TypewriterProps,
} from './components/typewriter/typewriter';
export {
  SpeechBubble,
  type SpeechBubbleProps,
  TAIL_REACH,
} from './components/speech-bubble/speech-bubble';
export {
  STAMP_GLYPHS,
  Stamp,
  type StampProps,
  stampSize,
} from './components/stamp/stamp';
export { Button, type ButtonProps } from './components/button/button';
export {
  Ledger,
  type LedgerProps,
  LedgerRow,
  type LedgerRowProps,
} from './components/ledger/ledger';
export { Meter, type MeterProps } from './components/meter/meter';
export { Timer, TIMER_SIZE, type TimerProps } from './components/timer/timer';
export { Controls, type ControlsProps } from './components/controls/controls';
export {
  IconButton,
  type IconButtonProps,
  IconToggle,
  type IconToggleProps,
} from './components/icon-button/icon-button';
export { ICONS, type IconName } from './components/pixel-icon/icons';
export {
  DOT,
  PixelIcon,
  type PixelIconProps,
} from './components/pixel-icon/pixel-icon';
export { Stage, type StageProps, TALL_BAR } from './components/stage/stage';
export { useScale } from './components/stage/use-scale';
export { Confirm, type ConfirmProps } from './components/confirm/confirm';
export { Dialog, type DialogProps } from './components/dialog/dialog';
export {
  Actions,
  Content,
  type PartProps,
  PartsContext,
  type PartsValue,
  Title,
} from './components/parts/parts';
export {
  Picker,
  PickerGroup,
  PickerItem,
  type PickerItemProps,
  type PickerProps,
  PickerSetting,
  type PickerSettingProps,
  ScrollRail,
} from './components/picker/picker';
export {
  Setting,
  type SettingProps,
  Step,
  type StepProps,
} from './components/setting/setting';
export {
  Tab,
  TabList,
  type TabListProps,
  TabPanel,
  type TabPanelProps,
  type TabProps,
  Tabs,
  type TabsProps,
} from './components/tabs/tabs';
export {
  Heading,
  type HeadingProps,
  ScreenTitle,
  type ScreenTitleProps,
  Text,
  type TextProps,
} from './components/text/text';
export {
  Legend,
  type LegendProps,
  Window,
  type WindowProps,
} from './components/window/window';

// Utilities
export { cn, cva, type VariantProps } from './utils/styles';
