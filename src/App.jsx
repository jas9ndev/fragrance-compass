import { useState, useEffect } from 'react';
import './App.css';

import WeatherWidget from './components/WeatherWidget';
import DailyPick from './components/DailyPick';
import Inventory from './components/Inventory';
import AddFragrance from './components/AddFragrance';
import History from './components/History';

import { useWeather } from './hooks/useWeather';
import { loadFragrances, saveFragrances, getNewId } from './data/fragrances';

function App() {
  const { weather, loading: weatherLoading, error: weatherError, location, refresh } = useWeather();
  const [fragrances, setFragrances] = useState([]);
  const [tab, setTab] = useState('today'); // 'today' | 'inventory'

  // Load fragrances on mount
  useEffect(() => {
    setFragrances(loadFragrances());
  }, []);

  // Save fragrances whenever they change
  useEffect(() => {
    if (fragrances.length > 0) {
      saveFragrances(fragrances);
    }
  }, [fragrances]);

  const handleAddFragrance = (fragrance) => {
    const newFrag = {
      ...fragrance,
      id: getNewId(fragrances),
      weather: fragrance.seasons?.map(s => {
        // Map seasons to common weather conditions
        const seasonWeather = {
          'Spring': ['mild', 'rainy', 'warm'],
          'Summer': ['hot_humid', 'hot_dry', 'warm'],
          'Fall': ['cool_dry', 'cool_wet', 'mild'],
          'Winter': ['cold', 'cool_wet', 'cool_dry'],
        };
        return seasonWeather[s] || ['mild'];
      }).flat(),
    };
    const updated = [...fragrances, newFrag];
    setFragrances(updated);
  };

  const handleDeleteFragrance = (id) => {
    if (window.confirm('Remove this fragrance from your collection?')) {
      setFragrances(prev => prev.filter(f => f.id !== id));
    }
  };

  const handleRefreshPicks = () => {
    refresh();
  };

  // Track the wear when user picks
  const handleWearTrack = (fragrance) => {
    const key = `fragrance-compass-wore-${new Date().toISOString().split('T')[0]}`;
    localStorage.setItem(key, JSON.stringify({
      date: new Date().toISOString().split('T')[0],
      fragranceName: fragrance.name,
      fragranceId: fragrance.id,
      weather: weather ? { tempF: weather.tempF, conditions: weather.conditions } : null,
    }));
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">Fragrance Compass</h1>
          <p className="app-subtitle">Weather-powered scent recommendations</p>
        </div>
        <nav className="tab-nav">
          <button
            className={`tab-btn ${tab === 'today' ? 'active' : ''}`}
            onClick={() => setTab('today')}
          >
            🌅 Today
          </button>
          <button
            className={`tab-btn ${tab === 'inventory' ? 'active' : ''}`}
            onClick={() => setTab('inventory')}
          >
            📦 Collection
          </button>
        </nav>
      </header>

      <main className="app-main">
        <aside className="sidebar">
          <WeatherWidget
            weather={weather}
            loading={weatherLoading}
            error={weatherError}
            location={location}
          />
          {tab === 'today' && (
            <div className="sidebar-actions">
              <AddFragrance onAdd={(f) => {
                handleAddFragrance(f);
                setTab('inventory');
              }} />
            </div>
          )}
        </aside>

        <section className="content">
          {tab === 'today' ? (
            <>
              <DailyPick
                fragrances={fragrances}
                weather={weather}
                onRefreshPicks={handleRefreshPicks}
              />
              <History fragrances={fragrances} />
            </>
          ) : (
            <>
              <div className="inventory-header">
                <AddFragrance onAdd={handleAddFragrance} />
              </div>
              <Inventory
                fragrances={fragrances}
                onDelete={handleDeleteFragrance}
              />
            </>
          )}
        </section>
      </main>

      <footer className="app-footer">
        <p>Fragrance Compass — built with ❤️ for the daily scent ritual</p>
      </footer>
    </div>
  );
}

export default App;
