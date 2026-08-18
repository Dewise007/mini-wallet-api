import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'bigint', default: 0 })
  balanceMinor!: string;

  @OneToOne(() => User, (user) => user.wallet)
  @JoinColumn()
  declare user: User;
}
