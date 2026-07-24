import { useState, useEffect } from 'react';
import './App.css';

import WeatherWidget from './components/WeatherWidget';
import ClockWidget from './components/ClockWidget';
import DailyPick from './components/DailyPick';
import Inventory from './components/Inventory';
import AddFragrance from './components/AddFragrance';
import History from './components/History';
import ScentChat from './components/ScentChat';
import FragranceSearch from './components/FragranceSearch';
import FragranceBrowse from './components/FragranceBrowse';

import { useWeather } from './hooks/useWeather';
import { loadFragrances, saveFragrances, getNewId } from './data/fragrances';

function App() {
  const { weather, loading: weatherLoading, error: weatherError, location, refresh } = useWeather();
  const [fragrances, setFragrances] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [tab, setTab] = useState('today'); // 'today' | 'inventory' | 'wishlist' | 'browse'

  // Load fragrances and wishlist on mount
  useEffect(() => {
    setFragrances(loadFragrances());
    try {
      const stored = localStorage.getItem('fragrance-compass-wishlist');
      if (stored) setWishlist(JSON.parse(stored));
    } catch {}
  }, []);

  // Save fragrances whenever they change (always save, even when empty)
  useEffect(() => {
    saveFragrances(fragrances);
  }, [fragrances]);

  // Save wishlist whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('fragrance-compass-wishlist', JSON.stringify(wishlist));
    } catch {}
  }, [wishlist]);

  const handleAddFragrance = (fragrance) => {
    // Normalize array fields in case Scenty sends strings
    const ensureArray = (val) => {
      if (Array.isArray(val)) return val;
      if (typeof val === 'string' && val.trim()) return val.split(',').map(s => s.trim()).filter(Boolean);
      return [];
    };
    const newFrag = {
      ...fragrance,
      id: getNewId(fragrances),
      notes: ensureArray(fragrance.notes),
      seasons: ensureArray(fragrance.seasons),
      occasions: ensureArray(fragrance.occasions),
      times: ensureArray(fragrance.times),
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

  const handleAddWishlist = (item) => {
    if (wishlist.some(w => w.name === item.name && w.brand === item.brand)) {
      alert(`${item.name} is already in your wishlist!`);
      return;
    }
    setWishlist(prev => [...prev, item]);
  };

  const handleRemoveWishlist = (id) => {
    setWishlist(prev => prev.filter(w => w.id !== id));
  };

  const handleWishlistToCollection = (item) => {
    handleAddFragrance({
      name: item.name,
      brand: item.brand,
      scentFamily: item.scentFamily || 'Fresh',
      seasons: item.seasons || [],
      occasions: item.occasions || [],
      times: item.times || [],
      notes: item.notes || [],
      rating: item.rating || 3,
      description: item.description || '',
    });
    handleRemoveWishlist(item.id);
    setTab('inventory');
  };

  const handleDeleteFragrance = (id) => {
    if (window.confirm('Remove this fragrance from your collection?')) {
      setFragrances(prev => prev.filter(f => f.id !== id));
    }
  };

  const handleEditFragrance = (id, updates) => {
    setFragrances(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const handleRefreshPicks = () => {
    refresh();
  };

  const handleExport = () => {
    const data = JSON.stringify(fragrances, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fragrance-compass-collection-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (!Array.isArray(imported)) {
          alert('Invalid file: expected a list of fragrances');
          return;
        }
        setFragrances(imported);
        saveFragrances(imported);
        alert(`Imported ${imported.length} fragrances successfully!`);
      } catch {
        alert('Invalid file: could not parse JSON');
      }
    };
    reader.readAsText(file);
    // Reset input so same file can be re-imported
    e.target.value = '';
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
          <button
            className={`tab-btn ${tab === 'wishlist' ? 'active' : ''}`}
            onClick={() => setTab('wishlist')}
          >
            ♡ Wishlist ({wishlist.length})
          </button>
          <button
            className={`tab-btn ${tab === 'browse' ? 'active' : ''}`}
            onClick={() => setTab('browse')}
          >
            📋 Browse
          </button>
        </nav>
      </header>

      <main className="app-main">
        <aside className="sidebar">
          <ClockWidget />
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
          ) : tab === 'wishlist' ? (
            <div className="wishlist-view">
              <FragranceSearch
                onAddToCollection={handleAddFragrance}
                onAddToWishlist={handleAddWishlist}
              />
              <h2>♡ Wishlist ({wishlist.length})</h2>
              {wishlist.length === 0 ? (
                <p className="empty-wishlist">Your wishlist is empty. Search above to add fragrances!</p>
              ) : (
                <div className="wishlist-grid">
                  {wishlist.map(item => (
                    <div key={item.id} className="wishlist-card">
                      <div className="wishlist-card-img">
                        {item.image ? (
                          <img src={item.image} alt={item.name} loading="lazy" />
                        ) : (
                          <span className="wishlist-emoji">🧴</span>
                        )}
                      </div>
                      <div className="wishlist-card-body">
                        <strong>{item.name}</strong>
                        <span className="wishlist-brand">{item.brand}</span>
                        {item.price && <span className="wishlist-price">${item.price}</span>}
                        <div className="wishlist-card-actions">
                          <button className="btn btn-sm btn-primary" onClick={() => handleWishlistToCollection(item)}>
                            + Add to Collection
                          </button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleRemoveWishlist(item.id)}>
                            ✕ Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : tab === 'browse' ? (
            <FragranceBrowse
              onAddToCollection={handleAddFragrance}
              onAddToWishlist={handleAddWishlist}
            />
          ) : (
            <div>
              <FragranceSearch
                onAddToCollection={handleAddFragrance}
                onAddToWishlist={handleAddWishlist}
              />
              <div className="inventory-header">
                <AddFragrance onAdd={handleAddFragrance} />
              </div>
              <Inventory
                fragrances={fragrances}
                onDelete={handleDeleteFragrance}
                onEdit={handleEditFragrance}
              />
            </div>
          )}
        </section>
      </main>

      <ScentChat fragrances={fragrances} weather={weather} onAdd={(f) => {
        handleAddFragrance(f);
        setTab('inventory');
      }} />

      <footer className="app-footer">
        <div className="footer-actions">
          <button className="btn btn-sm btn-secondary" onClick={handleExport}>
            📥 Export Collection
          </button>
          <label className="btn btn-sm btn-secondary import-label">
            📤 Import Collection
            <input
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={handleImport}
            />
          </label>
        </div>
        <p>Fragrance Compass — built with ❤️ for the daily scent ritual</p>
      </footer>
    </div>
  );
}

export default App;
