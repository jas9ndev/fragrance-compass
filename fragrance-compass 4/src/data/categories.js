// Fragrance categories, notes, seasons, and weather mappings

export const SEASONS = [
  'Spring',
  'Summer',
  'Fall',
  'Winter',
];

export const OCCASIONS = [
  'Daily Wear',
  'Casual',
  'Formal / Date Night',
  'Office / School',
  'Special Occasion',
  'Evening Out',
];

export const TIMES = [
  'Morning',
  'Day',
  'Night',
];

export const SCENT_FAMILIES = [
  'Citrus',
  'Fresh / Aquatic',
  'Green',
  'Floral',
  'Fruity',
  'Woody',
  'Oriental / Spicy',
  'Gourmand',
  'Leather',
  'Aromatic',
];

export const NOTES = [
  // Citrus
  'Bergamot', 'Lemon', 'Grapefruit', 'Orange', 'Mandarin', 'Yuzu',
  // Fresh
  'Sea Salt', 'Ozone', 'Cucumber', 'Water Lily', 'Aldehydes',
  // Green
  'Violet Leaf', 'Grass', 'Sage', 'Basil', 'Mint', 'Tea',
  // Floral
  'Rose', 'Jasmine', 'Lavender', 'Iris', 'Lily of the Valley', 'Neroli',
  // Fruity
  'Apple', 'Pear', 'Peach', 'Berry', 'Pineapple', 'Coconut',
  // Woody
  'Sandalwood', 'Cedar', 'Vetiver', 'Oud', 'Pine', 'Patchouli',
  // Spicy / Oriental
  'Cinnamon', 'Vanilla', 'Amber', 'Tobacco', 'Incense', 'Saffron',
  // Gourmand
  'Chocolate', 'Caramel', 'Coffee', 'Honey', 'Almond',
  // Leather
  'Leather', 'Suede', 'Birch',
  // Aromatic
  'Rosemary', 'Thyme', 'Pepper', 'Juniper',
];

// Weather conditions mapped to recommended scent profiles
export const WEATHER_RECOMMENDATIONS = {
  hot_humid: {
    label: 'Hot & Humid',
    description: 'Light, fresh, citrusy — heat amplifies fragrance',
    scentFamilies: ['Citrus', 'Fresh / Aquatic', 'Green'],
    avoid: ['Oriental / Spicy', 'Leather', 'Gourmand'],
    notes: ['Bergamot', 'Lemon', 'Grapefruit', 'Sea Salt', 'Ozone', 'Cucumber', 'Mint'],
  },
  hot_dry: {
    label: 'Hot & Dry',
    description: 'Citrus and light florals — avoid heavy scents that get cloying',
    scentFamilies: ['Citrus', 'Fresh / Aquatic', 'Floral'],
    avoid: ['Oriental / Spicy', 'Gourmand'],
    notes: ['Neroli', 'Bergamot', 'Orange', 'Lavender', 'Tea', 'Water Lily'],
  },
  warm: {
    label: 'Warm',
    description: 'Versatile — fresh, fruity, or light woody scents shine',
    scentFamilies: ['Fruity', 'Aromatic', 'Woody', 'Floral'],
    avoid: [],
    notes: ['Apple', 'Pear', 'Sage', 'Rosemary', 'Sandalwood', 'Jasmine'],
  },
  mild: {
    label: 'Mild / Pleasant',
    description: 'Most fragrances work — great day for signature scents',
    scentFamilies: ['Woody', 'Aromatic', 'Floral', 'Citrus', 'Fresh / Aquatic'],
    avoid: [],
    notes: ['Vetiver', 'Cedar', 'Rose', 'Sage', 'Bergamot', 'Lavender'],
  },
  cool_dry: {
    label: 'Cool & Dry',
    description: 'Warmer florals and woody scents come alive',
    scentFamilies: ['Woody', 'Floral', 'Aromatic', 'Oriental / Spicy'],
    avoid: ['Fresh / Aquatic'],
    notes: ['Cedar', 'Sandalwood', 'Rose', 'Amber', 'Tobacco', 'Pepper'],
  },
  cool_wet: {
    label: 'Cool & Damp',
    description: 'Cozy, slightly heavier — gourmand and woody shine',
    scentFamilies: ['Woody', 'Gourmand', 'Oriental / Spicy', 'Leather'],
    avoid: ['Fresh / Aquatic', 'Citrus'],
    notes: ['Vanilla', 'Cedar', 'Patchouli', 'Coffee', 'Leather', 'Cinnamon'],
  },
  cold: {
    label: 'Cold',
    description: 'Heavy, rich, warm — scents project beautifully in cold air',
    scentFamilies: ['Oriental / Spicy', 'Leather', 'Gourmand', 'Woody'],
    avoid: ['Citrus', 'Fresh / Aquatic'],
    notes: ['Oud', 'Tobacco', 'Amber', 'Leather', 'Incense', 'Vanilla', 'Saffron'],
  },
  rainy: {
    label: 'Rainy',
    description: 'Fresh green, aquatic, or petrichor-adjacent scents',
    scentFamilies: ['Green', 'Fresh / Aquatic', 'Aromatic'],
    avoid: ['Gourmand', 'Leather'],
    notes: ['Violet Leaf', 'Grass', 'Tea', 'Sea Salt', 'Cucumber', 'Basil'],
  },
  indoor: {
    label: 'Indoor Day',
    description: 'Subtle, skin-like, office-safe — no projection needed',
    scentFamilies: ['Fresh / Aquatic', 'Aromatic', 'Floral', 'Citrus'],
    avoid: ['Oud', 'Leather', 'Oriental / Spicy'],
    notes: ['Lavender', 'Musk', 'Iris', 'Tea', 'Neroli', 'Sage'],
  },
};

// Get the current time category based on hour
// Morning: 5-11 | Day: 11-17 | Night: 17-5
export function getTimeOfDay(hour = new Date().getHours()) {
  if (hour >= 5 && hour < 11) return 'Morning';
  if (hour >= 11 && hour < 17) return 'Day';
  return 'Night';
}

// Get the weather category from temperature and humidity/precipitation
export function classifyWeather(tempF, humidity, conditions) {
  if (!tempF && tempF !== 0) return 'indoor'; // fallback

  const isRainy = conditions?.toLowerCase().includes('rain')
    || conditions?.toLowerCase().includes('drizzle')
    || conditions?.toLowerCase().includes('thunderstorm');

  const isHumid = humidity > 65;

  if (isRainy) return 'rainy';

  if (tempF >= 90) {
    return isHumid ? 'hot_humid' : 'hot_dry';
  }
  if (tempF >= 80) {
    return isHumid ? 'hot_humid' : 'warm';
  }
  if (tempF >= 70) return 'warm';
  if (tempF >= 60) return 'mild';
  if (tempF >= 50) {
    return isHumid ? 'cool_wet' : 'cool_dry';
  }
  if (tempF >= 35) {
    return isHumid ? 'cool_wet' : 'cold';
  }
  return 'cold';
}

// Get season from month
export function getSeason(month) {
  if (month >= 3 && month <= 5) return 'Spring';
  if (month >= 6 && month <= 8) return 'Summer';
  if (month >= 9 && month <= 11) return 'Fall';
  return 'Winter';
}
