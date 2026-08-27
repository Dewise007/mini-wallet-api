import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Exclude } from 'class-transformer';
import { OneToOne } from 'typeorm';
import { Wallet } from '../../wallets/entities/wallet.entity';

export type UserRole = 'user' | 'admin';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  @Exclude()
  password!: string;

  @Column({ type: 'varchar', default: 'user' })
  role!: UserRole;

  @OneToOne(() => Wallet, (wallet) => wallet.user)
  wallet!: Wallet;
}
