import { useState, useEffect } from 'react';

export default function History({ fragrances }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const loaded = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('fragrance-compass-wore-')) {
        try {
          const entry = JSON.parse(localStorage.getItem(key));
          if (entry.fragranceId || entry.fragranceName) {
            loaded.push(entry);
          }
        } catch {}
      }
    }
    loaded.sort((a, b) => new Date(b.date) - new Date(a.date));
    setHistory(loaded);
  }, []);

  const clearHistory = () => {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('fragrance-compass-wore-')) {
        keys.push(key);
      }
    }
    keys.forEach(k => localStorage.removeItem(k));
    setHistory([]);
  };

  if (history.length === 0) return null;

  return (
    <div className="history">
      <div className="history-header">
        <h2>Wear History</h2>
        <button className="btn btn-sm btn-secondary" onClick={clearHistory}>Clear</button>
      </div>
      <div className="history-list">
        {history.map((entry, i) => (
          <div key={`${entry.date}-${i}`} className="history-item">
            <span className="history-date">
              {new Date(entry.date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </span>
            <span className="history-fragrance">{entry.fragranceName || entry.fragrance?.name}</span>
            {entry.weather && (
              <span className="history-weather">{entry.weather.tempF}°F</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
