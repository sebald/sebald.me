import { Ledger, LedgerRow } from '../../../components/ledger/ledger';
import { Line } from '../../../components/line/line';
import { Meter } from '../../../components/meter/meter';
import { SpeechBubble } from '../../../components/speech-bubble/speech-bubble';
import { Tab, TabList, TabPanel, Tabs } from '../../../components/tabs/tabs';
import { Timer } from '../../../components/timer/timer';
import { Window } from '../../../components/window/window';

/**
 * A duel: who says what in a window, the other side's bubble, the
 * pools as a ledger of meters, the clock, and the tabs of a log. Put it
 * on a `Stage`; on the tall one the bottom clears the bar of controls
 */
export function Meeting() {
  return (
    <>
      <SpeechBubble
        side="bottom"
        align="start"
        className="absolute top-[calc(var(--px)*12)] left-[calc(var(--px)*16)] w-[calc(var(--px)*120)] tall:top-[calc(var(--px)*16)]"
      >
        Can we circle back on that after lunch?
      </SpeechBubble>
      {/* A frozen moment: `paused`, fixed time and meter values. Drive them from the duel's state */}
      <Timer
        duration={10000}
        remaining={4000}
        paused
        className="absolute top-[calc(var(--px)*14)] right-[calc(var(--px)*16)] tall:top-[calc(var(--px)*18)]"
      />
      <div className="absolute inset-x-[calc(var(--px)*16)] bottom-[calc(var(--px)*12)] grid grid-cols-[3fr_2fr] gap-[calc(var(--px)*6)] tall:bottom-[calc(var(--bui-bar)+var(--px)*12)] tall:grid-cols-1">
        <Window>
          <div className="grid gap-[calc(var(--px)*3)]">
            <Line variant="secondary" past>
              We need this by Monday.
            </Line>
            <Line>Monday, as in next quarter?</Line>
          </div>
        </Window>
        <Tabs defaultValue="pools">
          <TabList aria-label="Duel">
            <Tab value="pools">Pools</Tab>
            <Tab value="log">Log</Tab>
          </TabList>
          <TabPanel value="pools">
            <Ledger>
              <LedgerRow label="Momentum">
                <Meter aria-label="Momentum" value={3} max={5} />
              </LedgerRow>
              <LedgerRow label="Their momentum">
                <Meter
                  aria-label="Their momentum"
                  value={1}
                  max={5}
                  variant="secondary"
                />
              </LedgerRow>
            </Ledger>
          </TabPanel>
          <TabPanel value="log">Nothing yet.</TabPanel>
        </Tabs>
      </div>
    </>
  );
}
