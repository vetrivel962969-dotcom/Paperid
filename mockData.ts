
import { Product } from './types';

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Gojo Satoru "Limitless" Tee',
    description: 'High-quality cotton tee featuring the strongest sorcerer. Minimalist streetwear design with premium embroidery.',
    price: 999,
    originalPrice: 1499,
    category: 'Anime',
    images: ['https://picsum.photos/seed/anime1/600/800', 'https://picsum.photos/seed/anime1b/600/800'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'White', 'Lilac'],
    isCustomizable: true,
    isNewArrival: true,
    rating: 4.8,
    reviewsCount: 124
  },
  {
    id: '2',
    name: 'Hitman 45 - Bleed Blue Edition',
    description: 'The ultimate cricket fan jersey. Lightweight breathable fabric for stadium vibes and street comfort.',
    price: 899,
    originalPrice: 1199,
    category: 'Cricket',
    images: ['https://picsum.photos/seed/cricket1/600/800'],
    sizes: ['M', 'L', 'XL'],
    colors: ['Deep Blue', 'White'],
    isCustomizable: true,
    isBestSeller: true,
    rating: 4.9,
    reviewsCount: 450
  },
  {
    id: '3',
    name: 'Akatsuki Cloud Oversized Hoodie',
    description: 'Join the organization. Plush heavyweight cotton with vibrant red cloud prints.',
    price: 1899,
    originalPrice: 2499,
    category: 'Anime',
    images: ['https://picsum.photos/seed/anime2/600/800'],
    sizes: ['M', 'L', 'XL'],
    colors: ['Black'],
    isCustomizable: false,
    rating: 4.7,
    reviewsCount: 89
  },
  {
    id: '4',
    name: 'Better Together - Couple Set',
    description: 'Matching minimalist tees for you and your partner. Perfect for anniversaries and casual dates.',
    price: 1599,
    category: 'Lovers',
    images: ['https://picsum.photos/seed/lovers1/600/800'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['White', 'Peach'],
    isCustomizable: true,
    rating: 4.6,
    reviewsCount: 210
  },
  {
    id: '5',
    name: 'Super Dad & Mini Me - Family Set',
    description: 'Celebrate the bond. Organic cotton tees for the whole family.',
    price: 2199,
    category: 'Family',
    images: ['https://picsum.photos/seed/family1/600/800'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Royal Blue', 'Heather Grey'],
    isCustomizable: true,
    rating: 4.9,
    reviewsCount: 56
  },
  {
    id: '6',
    name: 'Vintage Dhoni No. 7 Tee',
    description: 'Legendary number, legendary player. Distressed vintage print for the die-hard fan.',
    price: 799,
    category: 'Cricket',
    images: ['https://picsum.photos/seed/cricket2/600/800'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Yellow', 'Navy'],
    isCustomizable: false,
    rating: 5.0,
    reviewsCount: 1205
  }
];

export const CATEGORIES = [
  { name: 'Anime', icon: '🔥', image: 'https://picsum.photos/seed/cat-anime/400/500' },
  { name: 'Cricket', icon: '🏏', image: 'https://picsum.photos/seed/cat-cricket/400/500' },
  { name: 'Fanmade', icon: '✨', image: 'https://picsum.photos/seed/cat-fan/400/500' },
  { name: 'Family', icon: '👨‍👩‍👧', image: 'https://picsum.photos/seed/cat-fam/400/500' },
  { name: 'Lovers', icon: '❤️', image: 'https://picsum.photos/seed/cat-love/400/500' },
];
