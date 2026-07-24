// Fragrance search using Fragella API
// Previously had a hardcoded ~37 fragrances — now queries 74k+ in real time

const FRAGELLA_API = 'https://api.fragella.com/api/v1';
const API_KEY = 'a14dfb3c5203f775bbf758141fa02c4e4f6fe68c8527221ceace16e01984e485';

const SCENT_FAMILY_MAP = {
  'aromatic': 'Aromatic',
  'citrus': 'Fresh',
  'fresh spicy': 'Aromatic',
  'woody': 'Woody',
  'earthy': 'Woody',
  'mossy': 'Woody',
  'green': 'Fresh',
  'floral': 'Floral',
  'oriental': 'Oriental',
  'sweet': 'Gourmand',
  'vanilla': 'Gourmand',
  'gourmand': 'Gourmand',
  'fruity': 'Fruity',
  'spicy': 'Oriental',
  'warm spicy': 'Oriental',
  'fresh': 'Fresh',
  'aquatic': 'Fresh',
  'ozonic': 'Fresh',
  'aldehydic': 'Fresh',
  'powdery': 'Woody',
  'balsamic': 'Oriental',
  'animalic': 'Oriental',
  'leather': 'Woody',
  'tobacco': 'Oriental',
  'amber': 'Oriental',
};

function mapAccordsToScentFamily(accords) {
  if (!accords || accords.length === 0) return 'Fresh';
  // Pick the dominant accord's family, or fall through to first match
  for (const accord of accords) {
    const lower = accord.toLowerCase();
    if (SCENT_FAMILY_MAP[lower]) return SCENT_FAMILY_MAP[lower];
  }
  return 'Fresh';
}

function mapSeason(season) {
  const s = season?.toLowerCase() || '';
  if (s === 'spring') return 'Spring';
  if (s === 'summer') return 'Summer';
  if (s === 'fall') return 'Fall';
  if (s === 'winter') return 'Winter';
  return null;
}

function mapOccasion(occasion) {
  const o = occasion?.toLowerCase() || '';
  if (o.includes('professional') || o.includes('office')) return 'Office / School';
  if (o.includes('casual')) return 'Casual';
  if (o.includes('night out') || o.includes('evening')) return 'Evening Out';
  if (o.includes('formal') || o.includes('special')) return 'Formal';
  return 'Daily Wear';
}

function mapWeather(seasonScores) {
  if (!seasonScores) return ['mild'];
  const weather = [];
  const seasons = seasonScores
    .filter(s => s.score > 1)
    .map(s => s.name.toLowerCase());

  if (seasons.includes('spring')) weather.push('mild');
  if (seasons.includes('summer')) weather.push('warm', 'hot_dry');
  if (seasons.includes('fall')) weather.push('cool_dry');
  if (seasons.includes('winter')) weather.push('cold');

  return weather.length > 0 ? weather : ['mild'];
}

function mapTimes(occasionRanking) {
  if (!occasionRanking) return ['Day'];
  // If ranked for night out, include Night
  const hasNight = occasionRanking.some(o =>
    o.name.toLowerCase().includes('night out') && o.score > 0
  );
  return hasNight ? ['Morning', 'Day', 'Night'] : ['Morning', 'Day'];
}

export async function searchFragrance(query) {
  if (!query || query.trim().length < 2) return null;

  try {
    const clean = query.replace(/[^a-zA-Z0-9 '’-]/g, '').trim();
    const url = `${FRAGELLA_API}/fragrances?search=${encodeURIComponent(clean)}&limit=5`;
    const res = await fetch(url, {
      headers: { 'x-api-key': API_KEY },
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (!data || data.length === 0) return null;

    // Find the best match by name or brand match
    const queryLower = clean.toLowerCase();
    let best = data.find(f =>
      f.Name?.toLowerCase() === queryLower ||
      f.Brand?.toLowerCase() === queryLower
    );
    if (!best) best = data[0];

    const name = best.Name || best._id || 'Unknown';
    const seasons = (best['Season Ranking'] || [])
      .filter(s => s.score > 0.5)
      .map(s => mapSeason(s.name))
      .filter(Boolean);

    const occasions = (best['Occasion Ranking'] || [])
      .filter(o => o.score > 0.3)
      .map(o => mapOccasion(o.name));
    // Ensure at least one occasion
    if (occasions.length === 0) occasions.push('Daily Wear');

    const times = mapTimes(best['Occasion Ranking']);

    // Determine scent family
    let scentFamily = mapAccordsToScentFamily(best['Main Accords'] || []);
    // Override based on name/notes hints
    const allNotes = [
      ...(best.Notes?.Top || []).map(n => n.name),
      ...(best.Notes?.Middle || []).map(n => n.name),
      ...(best.Notes?.Base || []).map(n => n.name),
      ...(best['General Notes'] || [])
    ].map(n => n.toLowerCase());

    if (allNotes.some(n => ['sugar', 'caramel', 'chocolate', 'cocoa', 'honey', 'marshmallow'].includes(n))) {
      scentFamily = 'Gourmand';
    } else if (allNotes.some(n => ['oud', 'agarwood', 'incense', 'frankincense', 'myrrh'].includes(n))) {
      scentFamily = 'Woody';
    } else if (allNotes.some(n => ['rose', 'jasmine', 'lavender', 'violet', 'iris', 'ylang'].includes(n))) {
      if (scentFamily === 'Fresh' || scentFamily === 'Aromatic') scentFamily = 'Floral';
    }

    let rating = 3;
    if (best.rating) {
      const r = parseFloat(best.rating);
      if (!isNaN(r)) rating = Math.round(r);
    }
    rating = Math.max(1, Math.min(5, rating));

    return {
      name: name,
      brand: best.Brand || '',
      scentFamily,
      seasons,
      times,
      occasions,
      weather: mapWeather(best['Season Ranking']),
      rating,
      notes: allNotes.slice(0, 6).join(', '),
      image: best['Image URL'] || best['Image URL Transparent'] || null,
    };
  } catch {
    return null;
  }
}

// --- localStorage utilities (kept for App.jsx compatibility) ---

export function loadFragrances() {
  try {
    const stored = localStorage.getItem('fragrance-compass-collection');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveFragrances(fragrances) {
  try {
    localStorage.setItem('fragrance-compass-collection', JSON.stringify(fragrances));
  } catch {}
}

export function getNewId(fragrances) {
  if (!fragrances || fragrances.length === 0) return 1;
  return Math.max(...fragrances.map(f => f.id || 0)) + 1;
}
