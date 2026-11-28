import { Ledger, LedgerRow } from '../../ledger/ledger';
import { Tab, TabList, TabPanel, Tabs } from '../../tabs/tabs';
import { Text } from '../../text/text';
import { Tag } from '../tag';

/** A tab with something the player has not looked at yet */
export function InventoryTabs() {
  return (
    <Tabs defaultValue="items" className="w-[max(calc(var(--px)*160),24em)]">
      <TabList aria-label="Bag">
        <Tab value="items">Items</Tab>
        <Tab value="keys">
          Keys
          <Tag>New</Tag>
        </Tab>
      </TabList>
      <TabPanel value="items">
        <Ledger>
          <LedgerRow label="Tonic">2</LedgerRow>
          <LedgerRow label="Rope">1</LedgerRow>
        </Ledger>
      </TabPanel>
      <TabPanel value="keys">
        <Text>The ferry key. Maud wants it back.</Text>
      </TabPanel>
    </Tabs>
  );
}
