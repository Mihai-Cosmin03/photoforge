import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Photographer } from '../photographers/photographer.entity';

export type BookingStatus = 'pending' | 'accepted' | 'rejected';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'photographer_id' })
  photographerId: number;

  @ManyToOne(() => Photographer)
  @JoinColumn({ name: 'photographer_id' })
  photographer: Photographer;

  @Column({ type: 'date' })
  date: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  type: string; // 'Wedding' | 'Portrait' | ... | 'consultation'

  @Column({ nullable: true, type: 'int', name: 'package_id' })
  packageId: number; // optional selected pricing package

  @Column({ nullable: true, name: 'consultation_platform' })
  consultationPlatform: string; // 'Google Meet' | 'Zoom' | 'WhatsApp' | 'Phone'

  @Column({ nullable: true, name: 'preferred_time' })
  preferredTime: string; // e.g. 'morning', 'afternoon', 'evening'

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ type: 'varchar', default: 'pending' })
  status: BookingStatus;

  @Column({ type: 'text', nullable: true, name: 'photographer_note' })
  photographerNote: string; // message when accepting or declining

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
