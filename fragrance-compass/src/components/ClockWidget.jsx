import { useState, useEffect } from 'react';

export default function ClockWidget() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const timeStr = time.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  });

  const dateStr = time.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const timeEmoji = getTimeEmoji(time.getHours());

  return (
    <div className="clock-widget">
      <span className="clock-time">{timeEmoji} {timeStr}</span>
      <span className="clock-date">{dateStr}</span>
    </div>
  );
}

function getTimeEmoji(hour) {
  if (hour >= 5 && hour < 8) return '🌅';
  if (hour >= 8 && hour < 17) return '☀️';
  if (hour >= 17 && hour < 20) return '🌇';
  return '🌙';
}
