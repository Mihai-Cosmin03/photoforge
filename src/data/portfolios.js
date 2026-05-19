import poza1 from '../assets/poza1.jpeg'
import poza2 from '../assets/poza2.jpeg'
import poza3 from '../assets/poza3.jpeg'
import poza4 from '../assets/poza4.jpeg'
import poza5 from '../assets/poza5.jpeg'
import poza6 from '../assets/poza6.jpeg'
import poza7 from '../assets/poza7.jpeg'
import poza8 from '../assets/poza8.jpeg'

const portfolios = [
  {
    id: 1,
    slug: 'mihai-varga-wedding-stories',
    title: 'Wedding Stories',
    description: 'Elegant wedding sessions, candid emotion, and timeless memories captured across intimate ceremonies and grand celebrations.',
    categorySlug: 'wedding',
    photographerSlug: 'mihai-varga',
    coverImage: poza1,
    featured: true,
    materialsEnabled: true,
    images: [poza1, poza2, poza3, poza5, poza6, poza7],
  },
  {
    id: 2,
    slug: 'alexandra-popescu-portrait-light',
    title: 'Portrait Light',
    description: 'Studio portraits with refined lighting and expressive framing. Each session is a collaborative study of character, light, and presence.',
    categorySlug: 'portraits',
    photographerSlug: 'alexandra-popescu',
    coverImage: poza2,
    featured: true,
    materialsEnabled: true,
    images: [poza2, poza4, poza5, poza1, poza8],
  },
  {
    id: 3,
    slug: 'daria-ionescu-fashion-editorial',
    title: 'Fashion Editorial',
    description: 'Creative styling, editorial mood, and high-end fashion compositions. A collaboration between vision, wardrobe, and light.',
    categorySlug: 'fashion',
    photographerSlug: 'daria-ionescu',
    coverImage: poza4,
    featured: true,
    materialsEnabled: true,
    images: [poza4, poza5, poza6, poza2, poza3],
  },
  {
    id: 4,
    slug: 'andrei-stan-live-energy',
    title: 'Live Energy',
    description: 'Concert photography focused on stage emotion, lights, and movement. The pulse of live music captured in a single frame.',
    categorySlug: 'concerts',
    photographerSlug: 'andrei-stan',
    coverImage: poza7,
    featured: false,
    materialsEnabled: false,
    images: [poza7, poza8, poza3, poza6],
  },
  {
    id: 5,
    slug: 'mihai-varga-event-moments',
    title: 'Event Moments',
    description: 'Professional event coverage with natural storytelling and authentic highlights for corporate and private gatherings.',
    categorySlug: 'events',
    photographerSlug: 'mihai-varga',
    coverImage: poza5,
    featured: false,
    materialsEnabled: false,
    images: [poza5, poza6, poza1, poza3],
  },
  {
    id: 6,
    slug: 'daria-ionescu-brand-vision',
    title: 'Brand Vision',
    description: 'Commercial photography for products, campaigns, and modern visual branding. Precision meets creativity in every shot.',
    categorySlug: 'commercial',
    photographerSlug: 'daria-ionescu',
    coverImage: poza6,
    featured: false,
    materialsEnabled: false,
    images: [poza6, poza4, poza2, poza5],
  },
  {
    id: 7,
    slug: 'elena-dumitru-destination-frames',
    title: 'Destination Frames',
    description: 'Travel photography with cinematic views, atmosphere, and visual storytelling from the most evocative corners of the world.',
    categorySlug: 'travel',
    photographerSlug: 'elena-dumitru',
    coverImage: poza8,
    featured: false,
    materialsEnabled: false,
    images: [poza8, poza7, poza3, poza1],
  },
  {
    id: 8,
    slug: 'alexandra-popescu-lifestyle-notes',
    title: 'Lifestyle Notes',
    description: 'Natural moments, soft tones, and candid lifestyle narratives. Photography that feels lived-in and real.',
    categorySlug: 'lifestyle',
    photographerSlug: 'alexandra-popescu',
    coverImage: poza3,
    featured: false,
    materialsEnabled: false,
    images: [poza3, poza2, poza5, poza8],
  },
]

export default portfolios
