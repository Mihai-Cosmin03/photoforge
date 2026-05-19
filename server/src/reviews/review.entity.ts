import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Photographer } from '../photographers/photographer.entity';
import { User } from '../users/user.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'photographer_id' })
  photographerId: number;

  @ManyToOne(() => Photographer)
  @JoinColumn({ name: 'photographer_id' })
  photographer: Photographer;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  text: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
