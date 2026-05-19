import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Photographer } from '../photographers/photographer.entity';

@Entity('pricing_packages')
export class PricingPackage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'photographer_id' })
  photographerId: number;

  @ManyToOne(() => Photographer)
  @JoinColumn({ name: 'photographer_id' })
  photographer: Photographer;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ default: 'RON' })
  currency: string;

  @Column({ type: 'simple-array', nullable: true })
  features: string[];

  // New fields
  @Column({ nullable: true })
  duration: string; // e.g. "1h", "2h", "Half day", "Full day"

  @Column({ nullable: true, type: 'int' })
  maxPhotos: number; // e.g. 30

  @Column({ default: false })
  highlighted: boolean; // "Most Popular" badge

  @Column({ type: 'simple-array', nullable: true })
  coverImages: string[]; // sample image URLs for this package

  @Column({ default: 0 })
  displayOrder: number;
}
