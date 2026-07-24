import { useState, useEffect } from 'react';
import FragranceCard from './FragranceCard';
import { getDailyPicks } from '../data/recommendationEngine';
import { getTimeOfDay } from '../data/categories';

export default function DailyPick({ fragrances, weather, onRefreshPicks }) {
  const [picks, setPicks] = useState([]);
  const [pickedToday, setPickedToday] = useState(null);
  const [rerollCount, setRerollCount] = useState(0);

  useEffect(() => {
    // Check if user already picked today
    const today = new Date().toDateString();
    const stored = localStorage.getItem('fragrance-compass-today');
    if (stored) {
      try {
        const saved = JSON.parse(stored);
        if (saved.date === today) {
          setPickedToday(saved);
          return;
        }
      } catch {}
    }

    const dailyPicks = getDailyPicks(fragrances, weather);
    setPicks(dailyPicks);
  }, [fragrances, weather]);

  const handlePick = (fragrance) => {
    const today = new Date().toDateString();
    const entry = { date: today, fragrance };
    localStorage.setItem('fragrance-compass-today', JSON.stringify(entry));
    setPickedToday(entry);
  };

  const handleReroll = () => {
    if (rerollCount >= 2) return; // max 3 picks per day
    const dailyPicks = getDailyPicks(fragrances, weather).map((p, i) => ({
      ...p,
      score: Math.max(10, p.score + Math.floor(Math.random() * 20 - 10)),
    }));
    // Keep top 3 after shuffle
    dailyPicks.sort((a, b) => b.score - a.score);
    setPicks(dailyPicks.slice(0, 3));
    setRerollCount(r => r + 1);
  };

  if (pickedToday) {
    return (
      <div className="daily-pick">
        <h2>Today&apos;s Pick 🌅</h2>
        <p className="pick-subtitle">
          You already picked <strong>{pickedToday.fragrance.name}</strong> for today
        </p>
        <FragranceCard fragrance={pickedToday.fragrance} isWinner />
        <button className="btn btn-sm" onClick={() => {
          localStorage.removeItem('fragrance-compass-today');
          setPickedToday(null);
          setRerollCount(0);
          const dailyPicks = getDailyPicks(fragrances, weather);
          setPicks(dailyPicks);
        }}>
          Pick Again
        </button>
      </div>
    );
  }

  return (
    <div className="daily-pick">
      <h2>
        {getTimeIcon()} {getTimeLabel()} Pick
        {weather && <button className="btn-icon refresh-btn" onClick={onRefreshPicks} title="Refresh">🔄</button>}
      </h2>
      <p className="pick-subtitle">
        Based on current weather, time of day, and your collection
        {rerollCount > 0 && ` · re-roll ${rerollCount}/2 used`}
      </p>
      {picks.length === 0 ? (
        <p className="empty-state">Add some fragrances to your inventory to get recommendations!</p>
      ) : (
        <div className="picks-list">
          {picks.map((frag, i) => (
            <div key={frag.id} className="pick-item">
              <FragranceCard fragrance={frag} isWinner={frag.isWinner} />
              {i === 0 && (
                <button className="btn btn-primary pick-btn" onClick={() => handlePick(frag)}>
                  Wear This Today
                </button>
              )}
            </div>
          ))}
          {rerollCount < 2 && (
            <button className="btn btn-secondary reroll-btn" onClick={handleReroll}>
              Not Feeling It? Try Again ({2 - rerollCount} left)
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function getTimeLabel() {
  const t = getTimeOfDay();
  if (t === 'Morning') return 'Morning';
  if (t === 'Day') return "Afternoon";
  return 'Evening';
}

function getTimeIcon() {
  const t = getTimeOfDay();
  if (t === 'Morning') return '🌅';
  if (t === 'Day') return '☀️';
  return '🌙';
}
