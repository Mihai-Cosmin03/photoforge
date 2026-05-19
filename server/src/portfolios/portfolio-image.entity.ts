import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Portfolio } from './portfolio.entity';

@Entity('portfolio_images')
export class PortfolioImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'portfolio_id' })
  portfolioId: number;

  @ManyToOne(() => Portfolio, (portfolio) => portfolio.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'portfolio_id' })
  portfolio: Portfolio;

  @Column({ name: 'image_url' })
  imageUrl: string;

  @Column({ name: 'display_order', default: 0 })
  displayOrder: number;
}
