import { useState, useEffect, useCallback } from 'react';

// Free weather API — no API key needed for basic usage
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';

// Default to Houston, TX
const DEFAULT_LAT = 29.7604;
const DEFAULT_LON = -95.3698;

export function useWeather() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState('Houston, TX');

  const fetchWeather = useCallback(async (lat, lon) => {
    setLoading(true);
    setError(null);
    try {
      // Get city name from coords (reverse geocode)
      let cityName = 'Your Location';
      try {
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=en`
        );
        const geoData = await geoRes.json();
        if (geoData.results?.[0]) {
          const r = geoData.results[0];
          cityName = [r.city || r.name, r.admin1, r.country_code?.toUpperCase()]
            .filter(Boolean)
            .join(', ');
        }
      } catch {
        // fallback
      }

      // Get weather data
      const res = await fetch(
        `${WEATHER_URL}?latitude=${lat}&longitude=${lon}` +
        `&current=temperature_2m,relative_humidity_2m,weather_code,precipitation` +
        `&temperature_unit=fahrenheit&daily=temperature_2m_max,temperature_2m_min,weather_code` +
        `&timezone=auto`
      );
      const data = await res.json();

      const current = data.current;

      // Map weather codes to readable conditions
      const code = current.weather_code;
      const conditions = weatherCodeToText(code);

      const weatherData = {
        tempF: Math.round(current.temperature_2m),
        humidity: current.relative_humidity_2m,
        conditions,
        weatherCode: code,
        precipitation: current.precipitation,
        high: Math.round(data.daily.temperature_2m_max[0]),
        low: Math.round(data.daily.temperature_2m_min[0]),
      };

      setWeather(weatherData);
      setLocation(cityName);
    } catch (err) {
      setError('Could not fetch weather data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Try browser geolocation first
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          fetchWeather(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          // Fallback to Houston
          fetchWeather(DEFAULT_LAT, DEFAULT_LON);
        },
        { timeout: 5000 }
      );
    } else {
      fetchWeather(DEFAULT_LAT, DEFAULT_LON);
    }
  }, [fetchWeather]);

  const refresh = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeather(DEFAULT_LAT, DEFAULT_LON),
      );
    } else {
      fetchWeather(DEFAULT_LAT, DEFAULT_LON);
    }
  }, [fetchWeather]);

  return { weather, loading, error, location, refresh };
}

function weatherCodeToText(code) {
  // WMO Weather interpretation codes
  const codes = {
    0: 'Clear',
    1: 'Mainly Clear',
    2: 'Partly Cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Foggy',
    51: 'Light Drizzle',
    53: 'Moderate Drizzle',
    55: 'Drizzle',
    56: 'Freezing Drizzle',
    57: 'Freezing Drizzle',
    61: 'Light Rain',
    63: 'Rain',
    65: 'Heavy Rain',
    66: 'Freezing Rain',
    67: 'Freezing Rain',
    71: 'Light Snow',
    73: 'Snow',
    75: 'Heavy Snow',
    77: 'Snow Grains',
    80: 'Light Rain Showers',
    81: 'Rain Showers',
    82: 'Heavy Rain Showers',
    85: 'Snow Showers',
    86: 'Heavy Snow Showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with Hail',
    99: 'Thunderstorm with Hail',
  };
  return codes[code] || 'Unknown';
}
