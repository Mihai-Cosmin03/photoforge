import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Photographer } from '../photographers/photographer.entity';

@Entity('client_galleries')
export class ClientGallery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'photographer_id' })
  photographerId: number;

  @ManyToOne(() => Photographer)
  @JoinColumn({ name: 'photographer_id' })
  photographer: Photographer;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ unique: true, name: 'access_code' })
  accessCode: string;

  @Column({ type: 'simple-array', nullable: true })
  images: string[] | null;

  @Column({ type: 'simple-array', nullable: true, name: 'client_emails' })
  clientEmails: string[] | null;

  @Column({ type: 'timestamp', nullable: true, name: 'expires_at' })
  expiresAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
