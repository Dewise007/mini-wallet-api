import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { MoneyMovedEvent } from '../events/money-moved.event';

@Injectable()
export class MoneyMovedListener {
  constructor(
    @InjectQueue('notifications')
    private readonly notificationsQueue: Queue,
  ) {}

  @OnEvent('wallet.money-moved')
  async handleMoneyMoved(event: MoneyMovedEvent) {
    await this.notificationsQueue.add('money-moved', {
      userId: event.userId,
      type: event.type,
      amountMinor: event.amountMinor,
    });
  }
}
