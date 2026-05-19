import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Portfolio } from '../portfolios/portfolio.entity';

export type PhotographerStatus = 'pending' | 'approved';

@Entity('photographers')
export class Photographer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  slug: string;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  name: string;

  @Column({ nullable: true })
  avatar: string;

  @Column()
  city: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ default: 0 })
  experience: number;

  @Column({ default: false })
  featured: boolean;

  @Column({ default: 0 })
  views: number;

  @Column({ type: 'varchar', default: 'approved' })
  status: PhotographerStatus;

  @Column({ type: 'simple-array', nullable: true })
  specialties: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => Portfolio, (portfolio) => portfolio.photographer)
  portfolios: Portfolio[];
}
