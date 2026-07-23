import { useState, useEffect } from 'react';

export default function WeatherWidget({ weather, loading, error, location }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="weather-widget loading">
        <div className="weather-spinner" />
        <p>Loading weather...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="weather-widget error">
        <span className="weather-icon">⚠️</span>
        <p>Couldn&apos;t get weather data</p>
      </div>
    );
  }

  if (!weather) return null;

  const weatherIcon = getWeatherEmoji(weather.weatherCode);
  const dateStr = time.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  const timeStr = time.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
  const timeIcon = getTimeEmoji(time.getHours());

  return (
    <div className="weather-widget">
      <div className="weather-main">
        <span className="weather-icon-large">{weatherIcon}</span>
        <div className="weather-temp-block">
          <span className="weather-temp">{weather.tempF}°F</span>
          <span className="weather-conditions">{weather.conditions}</span>
        </div>
      </div>
      <div className="weather-details">
        <span className="weather-location">{location}</span>
        <span className="weather-date">{dateStr}</span>
        <span className="weather-time">{timeIcon} {timeStr}</span>
        <span className="weather-humidity">💧 {weather.humidity}% humidity</span>
        <span className="weather-highlow">H:{weather.high}° L:{weather.low}°</span>
      </div>
    </div>
  );
}

function getWeatherEmoji(code) {
  if (code === 0 || code === 1) return '☀️';
  if (code === 2) return '⛅';
  if (code === 3) return '☁️';
  if (code >= 45 && code <= 48) return '🌫️';
  if (code >= 51 && code <= 57) return '🌦️';
  if (code >= 61 && code <= 65) return '🌧️';
  if (code >= 66 && code <= 77) return '❄️';
  if (code >= 80 && code <= 82) return '🌦️';
  if (code >= 85 && code <= 86) return '🌨️';
  if (code >= 95) return '⛈️';
  return '🌤️';
}

function getTimeEmoji(hour) {
  if (hour >= 5 && hour < 8) return '🌅';
  if (hour >= 8 && hour < 17) return '☀️';
  if (hour >= 17 && hour < 20) return '🌇';
  return '🌙';
}
