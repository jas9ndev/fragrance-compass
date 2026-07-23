import { classifyWeather, getSeason, getTimeOfDay, WEATHER_RECOMMENDATIONS } from './categories';

/**
 * Score a fragrance against current conditions.
 * Returns a score 0–100 where higher = better match.
 */
function scoreFragrance(fragrance, weatherKey, tempF, humidity, conditions, month, dayOfYear, timeOfDay) {
  const weatherProfile = WEATHER_RECOMMENDATIONS[weatherKey];
  const season = getSeason(month);
  let score = 50; // baseline

  // --- Weather alignment (+0 to +25) ---
  if (fragrance.weather?.includes(weatherKey)) {
    score += 25;
  } else {
    const isAvoided = weatherProfile.avoid?.some(
      avoidFam => fragrance.scentFamily === avoidFam
    );
    if (isAvoided) score -= 20;
  }

  // --- Scent family match with weather (+0 to +15) ---
  if (weatherProfile.scentFamilies.includes(fragrance.scentFamily)) {
    score += 15;
  } else {
    score -= 5;
  }

  // --- Season alignment (+0 to +15) ---
  if (fragrance.seasons?.includes(season)) {
    score += 15;
  } else {
    score -= 10;
  }

  // --- Note-level match with weather profile (+0 to +10) ---
  const noteOverlap = fragrance.notes?.filter(n =>
    weatherProfile.notes.includes(n)
  ).length || 0;
  score += noteOverlap * 3;
  score = Math.min(score, 100);

  // --- Weather note penalty (-5 per mismatched note, max -15) ---
  const badNotes = fragrance.notes?.filter(n =>
    weatherProfile.avoid?.includes(n)
  ).length || 0;
  score -= badNotes * 5;

  // --- Time of day (+0 to +15) ---
  if (fragrance.times?.includes(timeOfDay)) {
    score += 15;
  } else if (fragrance.times && fragrance.times.length > 0) {
    score -= 8; // penalize if it has times set but current time isn't one
  }

  // --- Occasion: prefer daily/casual for weekdays, evening for weekends (+0 to +10) ---
  const dayOfWeek = new Date().getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  if (!isWeekend && fragrance.occasions?.includes('Office / School')) {
    score += 8;
  }
  if (isWeekend && fragrance.occasions?.includes('Casual')) {
    score += 5;
  }

  // --- Night time bonus for evening scents ---
  if (timeOfDay === 'Night' && fragrance.occasions?.includes('Evening Out')) {
    score += 8;
  }
  // --- Morning bonus for fresh scents ---
  if (timeOfDay === 'Morning' && fragrance.scentFamily === 'Citrus' || fragrance.scentFamily === 'Fresh / Aquatic') {
    score += 5;
  }

  return Math.round(Math.max(0, Math.min(100, score)));
}

/**
 * Get the best fragrance picks for now.
 * Returns top 3 sorted by score, with the winner highlighted.
 */
export function getDailyPicks(fragrances, weatherData) {
  if (!fragrances || fragrances.length === 0) return [];

  const now = new Date();
  const month = now.getMonth() + 1; // 1-based
  const timeOfDay = getTimeOfDay(now.getHours());
  const dayOfYear = Math.floor(
    (now - new Date(now.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)
  );

  // Default weather if no data yet
  const tempF = weatherData?.tempF ?? 72;
  const humidity = weatherData?.humidity ?? 50;
  const conditions = weatherData?.conditions ?? 'Clear';

  const weatherKey = classifyWeather(tempF, humidity, conditions);

  const scored = fragrances.map(frag => ({
    ...frag,
    weatherKey,
    score: scoreFragrance(frag, weatherKey, tempF, humidity, conditions, month, dayOfYear, timeOfDay),
  }));

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Return top 3 with winner
  return scored.slice(0, 3).map((frag, index) => ({
    ...frag,
    isWinner: index === 0,
  }));
}
