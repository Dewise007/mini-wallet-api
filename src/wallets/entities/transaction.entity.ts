import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Wallet } from './wallet.entity';

export type TransactionType =
  'deposit' | 'withdraw' | 'transfer_in' | 'transfer_out';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  walletId!: number;

  @ManyToOne(() => Wallet)
  @JoinColumn({ name: 'walletId' })
  wallet!: Wallet;

  @Column({ type: 'varchar' })
  type!: TransactionType;

  @Column({ type: 'bigint' })
  amountMinor!: string;

  @Column({ type: 'bigint' })
  balanceBeforeMinor!: string;

  @Column({ type: 'bigint' })
  balanceAfterMinor!: string;

  @Column()
  reference!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
