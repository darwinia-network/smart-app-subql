import { SubstrateEvent } from '@subql/types';
import { Transfer } from '../types';
import { AccountHandler } from './account';
import { TokenHandler } from './token';

enum FeePosition {
  'DepositRing',
  'Deposit',
}

export class TransferHandler {
  private event: SubstrateEvent;

  constructor(event: SubstrateEvent) {
    this.event = event;
  }

  async save() {
    const { data, section, hash } = this.event.event;
    const { events, timestamp, block, specVersion  } = this.event.block;
    const [from, to, amount] = JSON.parse(data.toString());

    await AccountHandler.ensureAccount(to);
    await AccountHandler.updateTransferStatistic(to);
    await AccountHandler.ensureAccount(from);
    await AccountHandler.updateTransferStatistic(from);
    await TokenHandler.ensureToken(section);

    const transfer = new Transfer(hash.toString());

    transfer.toId = to;
    transfer.fromId = from;
    transfer.tokenId = section;
    transfer.amount = BigInt(amount);
    transfer.timestamp = timestamp;
    transfer.block = {
      number: block.header.number.toNumber(),
      hash: block.hash.toString(),
      specVersion,
    };
    transfer.fee = events.reduce((total, cur) => {
      const method = cur.event.method;
      let fee = BigInt(0);

      if ([FeePosition[0], FeePosition[1]].includes(method)) {
        try {
          fee = BigInt(
            parseInt(JSON.parse(cur.event.data.toString())[FeePosition[cur.event.method]])
          );
        } catch (err) {}

        return total + BigInt(fee);
      }

      return total;
    }, BigInt(0));

    try {
      await transfer.save();
    } catch (error) {
      console.log(error.message);
    }
  }
}
