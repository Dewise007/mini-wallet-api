export class MoneyMovedEvent {
  constructor(
    public readonly userId: number,
    public readonly type:
      'deposit' | 'withdraw' | 'transfer_in' | 'transfer_out',
    public readonly amountMinor: number,
  ) {}
}
