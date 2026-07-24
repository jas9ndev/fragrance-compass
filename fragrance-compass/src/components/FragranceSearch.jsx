import { useState, useRef, useEffect, useCallback } from 'react';

const FRAGELLA_API = 'https://api.fragella.com/api/v1';
const API_KEY = '***';

const SCENT_FAMILY_MAP = {
  aromatic: 'Aromatic', citrus: 'Fresh', 'fresh spicy': 'Aromatic',
  woody: 'Woody', earthy: 'Woody', mossy: 'Woody', green: 'Fresh',
  floral: 'Floral', oriental: 'Oriental', sweet: 'Gourmand',
  vanilla: 'Gourmand', gourmand: 'Gourmand', fruity: 'Fruity',
  spicy: 'Oriental', 'warm spicy': 'Oriental', fresh: 'Fresh',
  aquatic: 'Fresh', ozonic: 'Fresh', leather: 'Woody',
  tobacco: 'Oriental', amber: 'Oriental',
};

function mapScentFamily(accords) {
  if (!accords?.length) return 'Fresh';
  for (const a of accords) {
    const mapped = SCENT_FAMILY_MAP[a.toLowerCase()];
    if (mapped) return mapped;
  }
  return 'Fresh';
}

function extractNotes(result) {
  const notes = [];
  for (const layer of ['Top', 'Middle', 'Base']) {
    if (result.Notes?.[layer]) {
      for (const n of result.Notes[layer]) {
        if (n.name && !notes.includes(n.name)) notes.push(n.name);
      }
    }
  }
  if (notes.length === 0 && result['General Notes']) {
    for (const n of result['General Notes']) {
      if (!notes.includes(n)) notes.push(n);
    }
  }
  return notes;
}

function mapSeasons(seasonRanking) {
  if (!seasonRanking) return [];
  return seasonRanking
    .filter(s => s.score > 0.5)
    .map(s => {
      const name = s.name.toLowerCase();
      if (name === 'spring') return 'Spring';
      if (name === 'summer') return 'Summer';
      if (name === 'fall') return 'Fall';
      if (name === 'winter') return 'Winter';
      return null;
    })
    .filter(Boolean);
}

function mapOccasions(occasionRanking) {
  if (!occasionRanking) return ['Daily Wear'];
  const list = occasionRanking
    .filter(o => o.score > 0.3)
    .map(o => {
      const name = o.name.toLowerCase();
      if (name.includes('professional')) return 'Office / School';
      if (name.includes('casual')) return 'Casual';
      if (name.includes('night out')) return 'Evening Out';
      if (name.includes('formal')) return 'Formal';
      return 'Daily Wear';
    });
  return list.length > 0 ? [...new Set(list)] : ['Daily Wear'];
}

function mapTimes(occasionRanking) {
  if (occasionRanking?.some(o => o.name.toLowerCase().includes('night out') && o.score > 0)) {
    return ['Morning', 'Day', 'Night'];
  }
  return ['Morning', 'Day'];
}

export default function FragranceSearch({ onAddToCollection, onAddToWishlist }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const debounceRef = useRef(null);
  const inputRef = useRef(null);

  const search = useCallback(async (q) => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const url = `${FRAGELLA_API}/fragrances?search=${encodeURIComponent(q.trim())}&limit=15`;
      const res = await fetch(url, { headers: { 'x-api-key': API_KEY } });
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      setResults(data || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInput = (e) => {
    const val = e.target.value;
    setQuery(val);
    setSelected(null);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 300);
  };

  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  const handleAddCollection = (result) => {
    const notes = extractNotes(result);
    const seasons = mapSeasons(result['Season Ranking']);
    const occasions = mapOccasions(result['Occasion Ranking']);
    const times = mapTimes(result['Occasion Ranking']);

    let rating = 3;
    if (result.rating) {
      const r = parseFloat(result.rating);
      if (!isNaN(r)) rating = Math.max(1, Math.min(5, Math.round(r)));
    }

    onAddToCollection({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name: result.Name || result._id || 'Unknown',
      brand: result.Brand || '',
      scentFamily: mapScentFamily(result['Main Accords']),
      notes,
      seasons,
      times,
      occasions,
      rating,
      description: `${result.Name || 'Unknown'} by ${result.Brand || 'Unknown'} — ${result.OilType || ''}`.trim(),
      image: result['Image URL'] || result['Image URL Transparent'] || null,
      dateAdded: new Date().toISOString(),
    });
  };

  const handleAddWishlist = (result) => {
    onAddToWishlist({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name: result.Name || result._id || 'Unknown',
      brand: result.Brand || '',
      scentFamily: mapScentFamily(result['Main Accords']),
      notes: extractNotes(result),
      description: `${result.Name || 'Unknown'} by ${result.Brand || 'Unknown'}`,
      image: result['Image URL'] || result['Image URL Transparent'] || null,
      price: result.Price || '',
      dateAdded: new Date().toISOString(),
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && results.length > 0 && !selected) {
      handleAddCollection(results[0]);
      setQuery('');
      setResults([]);
    }
  };

  return (
    <div className="fragrance-search">
      <div className="search-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder="Search 74k+ fragrances..."
          value={query}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
        />
        {loading && <span className="search-spinner">⏳</span>}
        {query && !loading && (
          <button className="search-clear" onClick={() => { setQuery(''); setResults([]); setSelected(null); }}>
            ✕
          </button>
        )}
      </div>

      {results.length > 0 && (
        <div className="search-results">
          {results.map((r, i) => (
            <div
              key={r._id || i}
              className="search-result-item"
              onMouseEnter={() => setSelected(r._id)}
            >
              <div className="result-info">
                <div className="result-header-row">
                  <div className="result-image-wrapper">
                    {(r['Image URL'] || r['Image URL Transparent']) ? (
                      <img
                        src={r['Image URL Transparent'] || r['Image URL']}
                        alt={r.Name}
                        className="result-img"
                        loading="lazy"
                      />
                    ) : (
                      <div className="result-img-placeholder">🧴</div>
                    )}
                  </div>
                  <div className="result-text">
                    <strong className="result-name">{r.Name}</strong>
                    <span className="result-brand">{r.Brand}</span>
                    <span className="result-meta">
                      {r.OilType || ''} {r.Year ? `· ${r.Year}` : ''} {r.Longevity ? `· ${r.Longevity}` : ''}
                    </span>
                    {r['Main Accords'] && (
                      <div className="result-accords">
                        {r['Main Accords'].slice(0, 4).map(a => (
                          <span key={a} className="accord-tag">{a}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="result-actions">
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => { handleAddCollection(r); setQuery(''); setResults([]); inputRef.current?.focus(); }}
                  >
                    + Collection
                  </button>
                  <button
                    className="btn btn-sm btn-secondary wishlist-btn"
                    onClick={() => { handleAddWishlist(r); setQuery(''); setResults([]); inputRef.current?.focus(); }}
                  >
                    ♡ Wishlist
                  </button>
                </div>
              </div>
            </div>
          ))}
          <div className="search-results-footer">
            Results from Fragella · {results.length} shown
          </div>
        </div>
      )}

      {query && !loading && results.length === 0 && query.length >= 2 && (
        <div className="search-empty">No results found for "{query}"</div>
      )}
    </div>
  );
}
