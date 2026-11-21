import { Ledger, LedgerRow } from '../../ledger/ledger';
import { Text } from '../../text/text';
import { Tab, TabList, TabPanel, Tabs } from '../tabs';

/** Two panels in one window: the pools and the log of a duel */
export function DuelLog() {
  return (
    <Tabs defaultValue="pools" className="w-[max(calc(var(--px)*160),24em)]">
      <TabList aria-label="Duel">
        <Tab value="pools">Pools</Tab>
        <Tab value="log">Log</Tab>
      </TabList>
      <TabPanel value="pools">
        <Ledger>
          <LedgerRow label="Momentum">3</LedgerRow>
          <LedgerRow label="Their momentum">1</LedgerRow>
        </Ledger>
      </TabPanel>
      <TabPanel value="log">
        <Text>Nothing yet.</Text>
      </TabPanel>
    </Tabs>
  );
}
