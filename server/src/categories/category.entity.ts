import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Portfolio } from '../portfolios/portfolio.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  slug: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'hero_title' })
  heroTitle: string;

  @Column({ name: 'hero_subtitle', type: 'text' })
  heroSubtitle: string;

  @Column({ name: 'cover_image' })
  coverImage: string;

  @Column({ default: false })
  featured: boolean;

  @OneToMany(() => Portfolio, (portfolio) => portfolio.category)
  portfolios: Portfolio[];
}
