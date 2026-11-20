import { useState } from 'react';

import { Button } from '../../button/button';
import { Confirm } from '../confirm';

/** Asks before the save is erased: the safe option is first and selected, Escape cancels */
export function EraseSave({ onErase }: { onErase: () => void }) {
  const [asking, setAsking] = useState(false);
  return (
    <>
      <Button variant="destructive" onClick={() => setAsking(true)}>
        Erase save
      </Button>
      {asking && (
        <Confirm
          title="Erase the save?"
          confirm="Erase save"
          onConfirm={() => {
            onErase();
            setAsking(false);
          }}
          onCancel={() => setAsking(false)}
        >
          This deletes your run and 2 shipped roles, for good.
        </Confirm>
      )}
    </>
  );
}
