import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';
import * as bcrypt from 'bcrypt';

dotenv.config({ path: join(__dirname, '..', '.env') });

import { User, UserRole } from './users/user.entity';
import { Category } from './categories/category.entity';
import { Photographer } from './photographers/photographer.entity';
import { Portfolio } from './portfolios/portfolio.entity';
import { PortfolioImage } from './portfolios/portfolio-image.entity';
import { Conversation } from './conversations/conversation.entity';
import { Message } from './conversations/message.entity';

const ds = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT!,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  synchronize: true,
  entities: [User, Category, Photographer, Portfolio, PortfolioImage, Conversation, Message],
});

const CATEGORIES = [
  { slug: 'wedding', name: 'Wedding', description: 'Elegant wedding sessions and candid moments.', heroTitle: 'Wedding Photography', heroSubtitle: 'Discover refined wedding portfolios with emotion, elegance, and timeless storytelling.', coverImage: '/uploads/placeholder.jpg', featured: true },
  { slug: 'portraits', name: 'Portraits', description: 'Studio portraits and creative lighting.', heroTitle: 'Portrait Photography', heroSubtitle: 'Explore expressive portrait sessions, personal branding shoots, and editorial styles.', coverImage: '/uploads/placeholder.jpg', featured: true },
  { slug: 'fashion', name: 'Fashion', description: 'Editorial shoots, runway and creative styling.', heroTitle: 'Fashion Photography', heroSubtitle: 'High-end editorial work, styling, and creative direction for modern fashion brands.', coverImage: '/uploads/placeholder.jpg', featured: true },
  { slug: 'concerts', name: 'Concerts', description: 'Live energy, stage emotion and crowd atmosphere.', heroTitle: 'Concert Photography', heroSubtitle: 'Find photographers who capture motion, atmosphere, lights, and the pulse of live events.', coverImage: '/uploads/placeholder.jpg', featured: false },
  { slug: 'events', name: 'Events', description: 'Corporate events, private parties and conferences.', heroTitle: 'Event Photography', heroSubtitle: 'Professional coverage for corporate events, private parties, and large-scale gatherings.', coverImage: '/uploads/placeholder.jpg', featured: false },
  { slug: 'commercial', name: 'Commercial', description: 'Product photography and brand campaigns.', heroTitle: 'Commercial Photography', heroSubtitle: 'Product, branding, and advertising photography tailored for businesses and campaigns.', coverImage: '/uploads/placeholder.jpg', featured: false },
  { slug: 'travel', name: 'Travel', description: 'Landscape, nature and destination photography.', heroTitle: 'Travel Photography', heroSubtitle: 'Explore stunning landscapes, destinations, and visual storytelling from around the world.', coverImage: '/uploads/placeholder.jpg', featured: false },
  { slug: 'lifestyle', name: 'Lifestyle', description: 'Natural moments, everyday stories and candid life.', heroTitle: 'Lifestyle Photography', heroSubtitle: 'Authentic moments, everyday stories, and candid visual narratives.', coverImage: '/uploads/placeholder.jpg', featured: false },
];

const PHOTOGRAPHERS = [
  { slug: 'alexandra-popescu', name: 'Alexandra Popescu', city: 'București', specialties: ['portraits', 'lifestyle'], bio: 'Portrait photographer with 5 years of studio and natural light experience.', experience: 5, featured: true },
  { slug: 'mihai-varga', name: 'Mihai Varga', city: 'Cluj-Napoca', specialties: ['wedding', 'events'], bio: 'Wedding photographer capturing candid, emotional moments and real stories.', experience: 7, featured: true },
  { slug: 'daria-ionescu', name: 'Daria Ionescu', city: 'Timișoara', specialties: ['commercial', 'fashion'], bio: 'Creative photographer focused on branding, campaigns, and editorial visuals.', experience: 4, featured: false },
  { slug: 'andrei-stan', name: 'Andrei Stan', city: 'Iași', specialties: ['concerts', 'events'], bio: 'Concert photographer capturing energy, lights and crowd atmosphere.', experience: 6, featured: false },
  { slug: 'elena-dumitru', name: 'Elena Dumitru', city: 'Brașov', specialties: ['travel', 'lifestyle'], bio: 'Travel and lifestyle photographer focused on authentic visual storytelling.', experience: 5, featured: false },
];

const PORTFOLIOS = [
  { slug: 'mihai-varga-wedding-stories', title: 'Wedding Stories', description: 'Elegant wedding sessions, candid emotion, and timeless memories.', categorySlug: 'wedding', photographerSlug: 'mihai-varga', featured: true, materialsEnabled: true },
  { slug: 'alexandra-popescu-portrait-light', title: 'Portrait Light', description: 'Studio portraits with refined lighting and expressive framing.', categorySlug: 'portraits', photographerSlug: 'alexandra-popescu', featured: true, materialsEnabled: true },
  { slug: 'daria-ionescu-fashion-editorial', title: 'Fashion Editorial', description: 'Creative styling, editorial mood, and high-end fashion compositions.', categorySlug: 'fashion', photographerSlug: 'daria-ionescu', featured: true, materialsEnabled: true },
  { slug: 'andrei-stan-live-energy', title: 'Live Energy', description: 'Concert photography focused on stage emotion, lights, and movement.', categorySlug: 'concerts', photographerSlug: 'andrei-stan', featured: false, materialsEnabled: false },
  { slug: 'mihai-varga-event-moments', title: 'Event Moments', description: 'Professional event coverage with natural storytelling.', categorySlug: 'events', photographerSlug: 'mihai-varga', featured: false, materialsEnabled: false },
  { slug: 'daria-ionescu-brand-vision', title: 'Brand Vision', description: 'Commercial photography for products, campaigns, and modern visual branding.', categorySlug: 'commercial', photographerSlug: 'daria-ionescu', featured: false, materialsEnabled: false },
  { slug: 'elena-dumitru-destination-frames', title: 'Destination Frames', description: 'Travel photography with cinematic views and visual storytelling.', categorySlug: 'travel', photographerSlug: 'elena-dumitru', featured: false, materialsEnabled: false },
  { slug: 'alexandra-popescu-lifestyle-notes', title: 'Lifestyle Notes', description: 'Natural moments, soft tones, and candid lifestyle narratives.', categorySlug: 'lifestyle', photographerSlug: 'alexandra-popescu', featured: false, materialsEnabled: false },
];

const USERS: { name: string; email: string; password: string; role: UserRole }[] = [
  { name: 'Admin', email: 'admin@photoforge.com', password: 'admin123', role: 'admin' },
  { name: 'Test User', email: 'user@photoforge.com', password: 'user123', role: 'user' },
];

async function seed() {
  await ds.initialize();
  console.log('Connected to DB');

  // Seed users
  const userRepo = ds.getRepository(User);
  for (const u of USERS) {
    const existing = await userRepo.findOne({ where: { email: u.email } });
    if (!existing) {
      const passwordHash = await bcrypt.hash(u.password, 10);
      await userRepo.save(userRepo.create({ name: u.name, email: u.email, passwordHash, role: u.role }));
      console.log(`Created user: ${u.email} (${u.role})`);
    }
  }

  const categoryRepo = ds.getRepository(Category);
  const photographerRepo = ds.getRepository(Photographer);
  const portfolioRepo = ds.getRepository(Portfolio);
  const imageRepo = ds.getRepository(PortfolioImage);

  // Seed categories
  for (const cat of CATEGORIES) {
    const existing = await categoryRepo.findOne({ where: { slug: cat.slug } });
    if (!existing) {
      await categoryRepo.save(categoryRepo.create(cat));
      console.log(`Created category: ${cat.slug}`);
    }
  }

  // Seed photographers
  for (const ph of PHOTOGRAPHERS) {
    const existing = await photographerRepo.findOne({ where: { slug: ph.slug } });
    if (!existing) {
      await photographerRepo.save(photographerRepo.create({ ...ph, status: 'approved' }));
      console.log(`Created photographer: ${ph.slug}`);
    }
  }

  // Seed portfolios
  for (const p of PORTFOLIOS) {
    const existing = await portfolioRepo.findOne({ where: { slug: p.slug } });
    if (existing) continue;

    const category = await categoryRepo.findOne({ where: { slug: p.categorySlug } });
    const photographer = await photographerRepo.findOne({ where: { slug: p.photographerSlug } });

    if (!category || !photographer) {
      console.warn(`Skipping portfolio ${p.slug}: missing category or photographer`);
      continue;
    }

    const portfolio = await portfolioRepo.save(
      portfolioRepo.create({
        slug: p.slug,
        title: p.title,
        description: p.description,
        categoryId: category.id,
        photographerId: photographer.id,
        coverImage: '/uploads/placeholder.jpg',
        featured: p.featured,
        materialsEnabled: p.materialsEnabled,
        status: 'approved',
      }),
    );

    // Add placeholder images (replace with real uploads later)
    await imageRepo.save([
      imageRepo.create({ portfolioId: portfolio.id, imageUrl: '/uploads/placeholder.jpg', displayOrder: 0 }),
      imageRepo.create({ portfolioId: portfolio.id, imageUrl: '/uploads/placeholder.jpg', displayOrder: 1 }),
      imageRepo.create({ portfolioId: portfolio.id, imageUrl: '/uploads/placeholder.jpg', displayOrder: 2 }),
    ]);

    console.log(`Created portfolio: ${p.slug}`);
  }

  console.log('Seed complete!');
  await ds.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
