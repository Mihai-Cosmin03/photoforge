import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Photographer } from '../photographers/photographer.entity';
import { Portfolio } from '../portfolios/portfolio.entity';

export type UserRole = 'user' | 'photographer' | 'admin';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({
    type: 'varchar',
    default: 'user',
  })
  role: UserRole;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'varchar', nullable: true })
  avatar: string | null;

  @Column({ type: 'text', nullable: true })
  bio: string | null;

  @Column({ name: 'avatar_index', type: 'int', nullable: true })
  avatarIndex: number | null;

  @Column({ name: 'reset_password_token', type: 'varchar', nullable: true })
  resetPasswordToken: string | null;

  @Column({ name: 'reset_password_expires', type: 'timestamptz', nullable: true })
  resetPasswordExpires: Date | null;

  @ManyToMany(() => Photographer, { eager: false })
  @JoinTable({
    name: 'saved_photographers',
    joinColumn: { name: 'user_id' },
    inverseJoinColumn: { name: 'photographer_id' },
  })
  savedPhotographers: Photographer[];

  @ManyToMany(() => Portfolio, { eager: false })
  @JoinTable({
    name: 'saved_portfolios',
    joinColumn: { name: 'user_id' },
    inverseJoinColumn: { name: 'portfolio_id' },
  })
  savedPortfolios: Portfolio[];
}
