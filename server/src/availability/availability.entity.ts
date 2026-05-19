import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Photographer } from '../photographers/photographer.entity';

@Entity('availability')
@Unique(['photographerId', 'date'])
export class Availability {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'photographer_id' })
  photographerId: number;

  @ManyToOne(() => Photographer)
  @JoinColumn({ name: 'photographer_id' })
  photographer: Photographer;

  @Column({ type: 'date' })
  date: string;

  @Column({ default: true })
  available: boolean;
}
