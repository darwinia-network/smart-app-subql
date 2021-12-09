import { SubstrateEvent } from '@subql/types';
import { TransferHandler } from '../handlers/transfer';

// export async function handleBlock(block: SubstrateBlock): Promise<void> {
// }

export async function handleEvent(event: SubstrateEvent): Promise<void> {
  if (event.event.method === 'Transfer') {
    const entity = new TransferHandler(event);

    await entity.save();
  }
}

// export async function handleCall(extrinsic: SubstrateExtrinsic): Promise<void> {
// }
