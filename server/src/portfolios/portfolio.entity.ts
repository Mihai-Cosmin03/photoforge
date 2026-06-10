import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Category } from '../categories/category.entity';
import { Photographer } from '../photographers/photographer.entity';
import { PortfolioImage } from './portfolio-image.entity';

export type PortfolioStatus = 'pending' | 'approved' | 'rejected';

@Entity('portfolios')
export class Portfolio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  slug: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'category_id' })
  categoryId: number;

  @ManyToOne(() => Category, (category) => category.portfolios, { eager: false })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ name: 'photographer_id' })
  photographerId: number;

  @ManyToOne(() => Photographer, (photographer) => photographer.portfolios, { eager: false })
  @JoinColumn({ name: 'photographer_id' })
  photographer: Photographer;

  @Column({ name: 'cover_image', type: 'varchar', nullable: true })
  coverImage: string | null;

  @Column({ default: false })
  featured: boolean;

  @Column({ name: 'materials_enabled', default: false })
  materialsEnabled: boolean;

  @Column({ type: 'varchar', default: 'approved' })
  status: PortfolioStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => PortfolioImage, (image) => image.portfolio, { eager: true, cascade: true })
  images: PortfolioImage[];
}
