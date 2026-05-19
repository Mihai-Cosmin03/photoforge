import poza1 from '../assets/poza1.jpeg'
import poza2 from '../assets/poza2.jpeg'
import poza3 from '../assets/poza3.jpeg'
import poza4 from '../assets/poza4.jpeg'
import poza5 from '../assets/poza5.jpeg'
import poza6 from '../assets/poza6.jpeg'
import poza7 from '../assets/poza7.jpeg'
import poza8 from '../assets/poza8.jpeg'

const categories = [
  {
    id: 1,
    slug: 'wedding',
    name: 'Wedding',
    description: 'Elegant wedding sessions and candid moments.',
    heroTitle: 'Wedding Photography',
    heroSubtitle: 'Discover refined wedding portfolios with emotion, elegance, and timeless storytelling.',
    coverImage: poza1,
    featured: true,
  },
  {
    id: 2,
    slug: 'portraits',
    name: 'Portraits',
    description: 'Studio portraits and creative lighting.',
    heroTitle: 'Portrait Photography',
    heroSubtitle: 'Explore expressive portrait sessions, personal branding shoots, and editorial styles.',
    coverImage: poza2,
    featured: true,
  },
  {
    id: 3,
    slug: 'fashion',
    name: 'Fashion',
    description: 'Editorial shoots, runway and creative styling.',
    heroTitle: 'Fashion Photography',
    heroSubtitle: 'High-end editorial work, styling, and creative direction for modern fashion brands.',
    coverImage: poza4,
    featured: true,
  },
  {
    id: 4,
    slug: 'concerts',
    name: 'Concerts',
    description: 'Live energy, stage emotion and crowd atmosphere.',
    heroTitle: 'Concert Photography',
    heroSubtitle: 'Find photographers who capture motion, atmosphere, lights, and the pulse of live events.',
    coverImage: poza3,
    featured: false,
  },
  {
    id: 5,
    slug: 'events',
    name: 'Events',
    description: 'Corporate events, private parties and conferences.',
    heroTitle: 'Event Photography',
    heroSubtitle: 'Professional coverage for corporate events, private parties, and large-scale gatherings.',
    coverImage: poza5,
    featured: false,
  },
  {
    id: 6,
    slug: 'commercial',
    name: 'Commercial',
    description: 'Product photography and brand campaigns.',
    heroTitle: 'Commercial Photography',
    heroSubtitle: 'Product, branding, and advertising photography tailored for businesses and campaigns.',
    coverImage: poza6,
    featured: false,
  },
  {
    id: 7,
    slug: 'travel',
    name: 'Travel',
    description: 'Landscape, nature and destination photography.',
    heroTitle: 'Travel Photography',
    heroSubtitle: 'Explore stunning landscapes, destinations, and visual storytelling from around the world.',
    coverImage: poza7,
    featured: false,
  },
  {
    id: 8,
    slug: 'lifestyle',
    name: 'Lifestyle',
    description: 'Natural moments, everyday stories and candid life.',
    heroTitle: 'Lifestyle Photography',
    heroSubtitle: 'Authentic moments, everyday stories, and candid visual narratives.',
    coverImage: poza8,
    featured: false,
  },
]

export default categories
