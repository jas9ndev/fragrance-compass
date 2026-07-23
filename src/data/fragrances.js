// Default fragrance library — add your own!
// Each fragrance has categories for the recommendation engine to work with

const defaultFragrances = [
  {
    id: 1,
    name: 'Dior Sauvage',
    brand: 'Dior',
    scentFamily: 'Aromatic',
    notes: ['Bergamot', 'Pepper', 'Amber', 'Lavender'],
    seasons: ['Spring', 'Summer', 'Fall'],
    occasions: ['Daily Wear', 'Casual', 'Office / School'],
    weather: ['warm', 'hot_dry', 'mild', 'cool_dry'],
    rating: 5,
    description: 'A fresh, spicy fougère — versatile crowd-pleaser',
    image: null,
  },
  {
    id: 2,
    name: 'Bleu de Chanel',
    brand: 'Chanel',
    scentFamily: 'Aromatic',
    notes: ['Grapefruit', 'Ginger', 'Cedar', 'Sandalwood'],
    seasons: ['Spring', 'Summer', 'Fall', 'Winter'],
    occasions: ['Daily Wear', 'Office / School', 'Formal / Date Night'],
    weather: ['mild', 'cool_dry', 'warm', 'cool_wet', 'cold'],
    rating: 5,
    description: 'Sophisticated, clean, and versatile — a signature scent',
    image: null,
  },
  {
    id: 3,
    name: 'Acqua di Gio',
    brand: 'Giorgio Armani',
    scentFamily: 'Fresh / Aquatic',
    notes: ['Bergamot', 'Neroli', 'Sea Salt', 'Jasmine'],
    seasons: ['Spring', 'Summer'],
    occasions: ['Daily Wear', 'Casual', 'Office / School'],
    weather: ['hot_humid', 'hot_dry', 'warm', 'rainy'],
    rating: 4,
    description: 'The classic fresh aquatic — perfect for heat',
    image: null,
  },
  {
    id: 4,
    name: 'Jazz Club',
    brand: 'Maison Margiela',
    scentFamily: 'Oriental / Spicy',
    notes: ['Tobacco', 'Vanilla', 'Leather', 'Rum'],
    seasons: ['Fall', 'Winter'],
    occasions: ['Evening Out', 'Casual', 'Special Occasion'],
    weather: ['cold', 'cool_wet', 'cool_dry'],
    rating: 4,
    description: 'Warm, boozy, cozy — like a dimly lit jazz bar',
    image: null,
  },
  {
    id: 5,
    name: 'Light Blue',
    brand: 'Dolce & Gabbana',
    scentFamily: 'Citrus',
    notes: ['Lemon', 'Apple', 'Cedar', 'Rose'],
    seasons: ['Spring', 'Summer'],
    occasions: ['Daily Wear', 'Casual', 'Office / School'],
    weather: ['hot_humid', 'hot_dry', 'warm', 'mild'],
    rating: 4,
    description: 'Bright Sicilian citrus — sunny in a bottle',
    image: null,
  },
  {
    id: 6,
    name: 'Terre d\'Hermès',
    brand: 'Hermès',
    scentFamily: 'Woody',
    notes: ['Orange', 'Vetiver', 'Cedar', 'Pepper'],
    seasons: ['Fall', 'Winter', 'Spring'],
    occasions: ['Office / School', 'Daily Wear', 'Formal / Date Night'],
    weather: ['cool_dry', 'cool_wet', 'cold', 'mild'],
    rating: 5,
    description: 'Earthy, mineral, grounded — pure class',
    image: null,
  },
  {
    id: 7,
    name: 'Aventus',
    brand: 'Creed',
    scentFamily: 'Fruity',
    notes: ['Pineapple', 'Bergamot', 'Birch', 'Musk'],
    seasons: ['Spring', 'Summer', 'Fall'],
    occasions: ['Special Occasion', 'Evening Out', 'Formal / Date Night'],
    weather: ['warm', 'mild', 'cool_dry', 'hot_dry'],
    rating: 5,
    description: 'The legendary smoky-pineapple — confidence in a bottle',
    image: null,
  },
  {
    id: 8,
    name: 'Spicebomb Extreme',
    brand: 'Viktor & Rolf',
    scentFamily: 'Oriental / Spicy',
    notes: ['Cinnamon', 'Vanilla', 'Tobacco', 'Pepper'],
    seasons: ['Fall', 'Winter'],
    occasions: ['Evening Out', 'Special Occasion', 'Formal / Date Night'],
    weather: ['cold', 'cool_wet'],
    rating: 5,
    description: 'Explosively warm and sweet — best in deep cold',
    image: null,
  },
  {
    id: 9,
    name: 'Y Eau de Parfum',
    brand: 'Yves Saint Laurent',
    scentFamily: 'Aromatic',
    notes: ['Apple', 'Sage', 'Ginger', 'Amber'],
    seasons: ['Spring', 'Fall', 'Winter'],
    occasions: ['Daily Wear', 'Office / School', 'Evening Out'],
    weather: ['cool_dry', 'cool_wet', 'cold', 'mild'],
    rating: 4,
    description: 'Modern, sharp, sweet-fresh — a great all-rounder',
    image: null,
  },
  {
    id: 10,
    name: 'Nautica Voyage',
    brand: 'Nautica',
    scentFamily: 'Fresh / Aquatic',
    notes: ['Sea Salt', 'Cucumber', 'Apple', 'Musk'],
    seasons: ['Spring', 'Summer'],
    occasions: ['Daily Wear', 'Casual'],
    weather: ['hot_humid', 'hot_dry', 'warm', 'rainy'],
    rating: 3,
    description: 'Budget king — fresh green aquatic for hot days',
    image: null,
  },
  {
    id: 11,
    name: 'Baccarat Rouge 540',
    brand: 'Maison Francis Kurkdjian',
    scentFamily: 'Gourmand',
    notes: ['Saffron', 'Amber', 'Cedar', 'Almond'],
    seasons: ['Fall', 'Winter', 'Spring'],
    occasions: ['Formal / Date Night', 'Special Occasion', 'Evening Out'],
    weather: ['cool_dry', 'cool_wet', 'cold', 'mild'],
    rating: 5,
    description: 'Sweet, saffron-amber masterpiece — unmistakable',
    image: null,
  },
  {
    id: 12,
    name: 'L\'Immensité',
    brand: 'Louis Vuitton',
    scentFamily: 'Aromatic',
    notes: ['Ginger', 'Grapefruit', 'Amber', 'Sage'],
    seasons: ['Spring', 'Summer', 'Fall'],
    occasions: ['Daily Wear', 'Office / School', 'Evening Out'],
    weather: ['warm', 'hot_dry', 'mild', 'cool_dry'],
    rating: 4,
    description: 'Bright ginger-citrus with a salty mineral base',
    image: null,
  },
];

// Load user fragrances from localStorage, fall back to defaults
export function loadFragrances() {
  try {
    const stored = localStorage.getItem('fragrance-compass-inventory');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Could not load saved fragrances', e);
  }
  return defaultFragrances;
}

export function saveFragrances(fragrances) {
  try {
    localStorage.setItem('fragrance-compass-inventory', JSON.stringify(fragrances));
  } catch (e) {
    console.warn('Could not save fragrances', e);
  }
}

export function getNewId(fragrances) {
  return fragrances.length > 0 ? Math.max(...fragrances.map(f => f.id)) + 1 : 1;
}

export default defaultFragrances;
