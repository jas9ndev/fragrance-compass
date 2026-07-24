import { useState, useRef, useEffect } from 'react';

const FRAGELLA_API = 'https://api.fragella.com/api/v1';
const API_KEY = '***';

// 3-letter prefixes per letter — these reliably return results for each letter
const LETTER_PREFIXES = {
  'A': 'a', 'B': 'ba', 'C': 'ch', 'D': 'di', 'E': 'ea',
  'F': 'fr', 'G': 'go', 'H': 'he', 'I': 'ir', 'J': 'ja',
  'K': 'kn', 'L': 'la', 'M': 'ma', 'N': 'ni', 'O': 'od',
  'P': 'pa', 'Q': 'qu', 'R': 'ri', 'S': 'sa', 'T': 'ta',
  'U': 'un', 'V': 'va', 'W': 'wa', 'X': 'xa', 'Y': 'ye',
  'Z': 'ze',
};

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

// Cache: letter -> { results: [], timestamp }
const searchCache = {};

export default function FragranceBrowse({ onAddToCollection, onAddToWishlist }) {
  const [selectedLetter, setSelectedLetter] = useState('A');
  const [browseResults, setBrowseResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const listRef = useRef(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    if (loadingRef.current) return;
    const cached = searchCache[selectedLetter];
    if (cached && Date.now() - cached.timestamp < 300000) {
      setBrowseResults(cached.results);
      return;
    }
    loadingRef.current = true;
    setLoading(true);
    const prefix = LETTER_PREFIXES[selectedLetter] || selectedLetter.toLowerCase().repeat(3);
    const url = `${FRAGELLA_API}/fragrances?search=${encodeURIComponent(prefix)}&limit=20`;
    fetch(url, { headers: { 'x-api-key': API_KEY } })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => {
        const list = data || [];
        // Sort alphabetically
        list.sort((a, b) => (a.Name || '').localeCompare(b.Name || ''));
        setBrowseResults(list);
        searchCache[selectedLetter] = { results: list, timestamp: Date.now() };
      })
      .catch(() => setBrowseResults([]))
      .finally(() => { setLoading(false); loadingRef.current = false; });
  }, [selectedLetter]);

  const handleSelect = (result) => {
    setSelectedDetail(result);
    listRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setSelectedDetail(null);
  };

  // --- Detail View ---
  if (selectedDetail) {
    const r = selectedDetail;
    const notes = extractNotes(r);
    const seasons = mapSeasons(r['Season Ranking']);
    const occasions = mapOccasions(r['Occasion Ranking']);
    const hasNight = r['Occasion Ranking']?.some(o => o.name.toLowerCase().includes('night out') && o.score > 0);
    const times = hasNight ? ['Morning', 'Day', 'Night'] : ['Morning', 'Day'];
    let rating = 3;
    if (r.rating) {
      const p = parseFloat(r.rating);
      if (!isNaN(p)) rating = Math.max(1, Math.min(5, Math.round(p)));
    }

    return (
      <div className="browse-detail">
        <button className="btn btn-sm btn-secondary browse-back" onClick={handleBack}>← Back to Browse</button>
        <div className="detail-card">
          <div className="detail-hero">
            {(r['Image URL Transparent'] || r['Image URL']) ? (
              <img
                src={r['Image URL Transparent'] || r['Image URL']}
                alt={r.Name}
                className="detail-img"
              />
            ) : (
              <div className="detail-img-placeholder">🧴</div>
            )}
            <div className="detail-title-area">
              <h2 className="detail-name">{r.Name}</h2>
              <p className="detail-brand">{r.Brand}{r.Year ? ` · ${r.Year}` : ''}</p>
              {r.Gender && <span className={`detail-gender ${(r.Gender || '').toLowerCase()}`}>{r.Gender}</span>}
            </div>
          </div>

          {r.OilType && <p className="detail-type">{r.OilType}{r.Longevity ? ` · ${r.Longevity} longevity` : ''}{r.Sillage ? ` · ${r.Sillage} sillage` : ''}</p>}

          <div className="detail-section">
            <strong>Scent Family</strong>
            <span className="detail-value">{mapScentFamily(r['Main Accords']) || 'Fresh'}</span>
          </div>

          {(r['Main Accords']?.length > 0) && (
            <div className="detail-section">
              <strong>Main Accords</strong>
              <div className="detail-accords">
                {r['Main Accords'].map(a => <span key={a} className="accord-tag">{a}</span>)}
              </div>
            </div>
          )}

          {notes.length > 0 && (
            <div className="detail-section">
              <strong>Notes</strong>
              <div className="detail-notes-grid">
                {r.Notes?.Top?.length > 0 && (
                  <div>
                    <span className="note-layer-label">Top</span>
                    <div className="note-layer-tags">
                      {r.Notes.Top.map(n => <span key={n.name} className="note-tag">{n.name}</span>)}
                    </div>
                  </div>
                )}
                {r.Notes?.Middle?.length > 0 && (
                  <div>
                    <span className="note-layer-label">Middle</span>
                    <div className="note-layer-tags">
                      {r.Notes.Middle.map(n => <span key={n.name} className="note-tag">{n.name}</span>)}
                    </div>
                  </div>
                )}
                {r.Notes?.Base?.length > 0 && (
                  <div>
                    <span className="note-layer-label">Base</span>
                    <div className="note-layer-tags">
                      {r.Notes.Base.map(n => <span key={n.name} className="note-tag">{n.name}</span>)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="detail-section">
            <strong>Seasons</strong>
            <div className="detail-tags">
              {seasons.length > 0 ? seasons.map(s => <span key={s} className="detail-tag">{s}</span>) : <span className="detail-tag muted">All Seasons</span>}
            </div>
          </div>

          <div className="detail-section">
            <strong>Time of Day</strong>
            <div className="detail-tags">
              {times.map(t => <span key={t} className="detail-tag">{t}</span>)}
            </div>
          </div>

          <div className="detail-section">
            <strong>Occasions</strong>
            <div className="detail-tags">
              {occasions.map(o => <span key={o} className="detail-tag">{o}</span>)}
            </div>
          </div>

          <div className="detail-section">
            <strong>Rating</strong>
            <span className="detail-rating">{'★'.repeat(rating)}{'☆'.repeat(5 - rating)} ({r.rating || 'N/A'})</span>
          </div>

          {r.Price && (
            <div className="detail-section">
              <strong>Price</strong>
              <span className="detail-value">${r.Price}</span>
            </div>
          )}

          {r.Popularity && (
            <div className="detail-section">
              <strong>Popularity</strong>
              <span className="detail-value">{r.Popularity}</span>
            </div>
          )}

          <div className="detail-actions">
            <button className="btn btn-primary" onClick={() => {
              onAddToCollection({
                id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
                name: r.Name,
                brand: r.Brand || '',
                scentFamily: mapScentFamily(r['Main Accords']),
                notes,
                seasons,
                times,
                occasions,
                rating,
                description: `${r.Name} by ${r.Brand || 'Unknown'}`,
                image: r['Image URL'] || r['Image URL Transparent'] || null,
                dateAdded: new Date().toISOString(),
              });
            }}>
              + Add to Collection
            </button>
            <button className="btn btn-secondary wishlist-btn" onClick={() => {
              onAddToWishlist({
                id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
                name: r.Name,
                brand: r.Brand || '',
                scentFamily: mapScentFamily(r['Main Accords']),
                notes,
                description: `${r.Name} by ${r.Brand || 'Unknown'}`,
                image: r['Image URL'] || r['Image URL Transparent'] || null,
                price: r.Price || '',
                dateAdded: new Date().toISOString(),
              });
            }}>
              ♡ Add to Wishlist
            </button>
          </div>

          {r['Purchase URL'] && (
            <div className="detail-purchase">
              <a href={r['Purchase URL']} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-secondary">
                🛒 Buy Online
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- Browse List View ---
  return (
    <div className="browse-view">
      <div className="browse-alpha-nav">
        {Object.keys(LETTER_PREFIXES).map(letter => (
          <button
            key={letter}
            className={`alpha-btn ${selectedLetter === letter ? 'active' : ''}`}
            onClick={() => { setSelectedLetter(letter); setSelectedDetail(null); }}
          >
            {letter}
          </button>
        ))}
      </div>
      <div className="browse-list-heading">
        <h3>Fragrances · {selectedLetter}</h3>
        {loading && <span className="browse-spinner">⏳</span>}
        <span className="browse-count">{browseResults.length} results</span>
      </div>
      <div className="browse-list" ref={listRef}>
        {loading ? (
          <div className="browse-loading">Loading...</div>
        ) : browseResults.length === 0 ? (
          <div className="browse-empty">No results for "{selectedLetter}"</div>
        ) : (
          browseResults.map((r, i) => (
            <div
              key={r._id || i}
              className="browse-item"
              onClick={() => handleSelect(r)}
            >
              <div className="browse-item-img">
                {(r['Image URL Transparent'] || r['Image URL']) ? (
                  <img
                    src={r['Image URL Transparent'] || r['Image URL']}
                    alt={r.Name}
                    loading="lazy"
                  />
                ) : (
                  <span className="browse-item-emoji">🧴</span>
                )}
              </div>
              <div className="browse-item-text">
                <strong>{r.Name}</strong>
                <span className="browse-item-brand">{r.Brand}{r.Year ? ` (${r.Year})` : ''}</span>
                <span className="browse-item-meta">{r.OilType || ''}{r.Longevity ? ` · ${r.Longevity}` : ''}</span>
              </div>
              <div className="browse-item-actions" onClick={e => e.stopPropagation()}>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => {
                    const notes = extractNotes(r);
                    onAddToCollection({
                      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
                      name: r.Name,
                      brand: r.Brand || '',
                      scentFamily: mapScentFamily(r['Main Accords']),
                      notes,
                      seasons: mapSeasons(r['Season Ranking']),
                      times: r['Occasion Ranking']?.some(o => o.name.toLowerCase().includes('night out') && o.score > 0) ? ['Morning', 'Day', 'Night'] : ['Morning', 'Day'],
                      occasions: mapOccasions(r['Occasion Ranking']),
                      rating: r.rating ? Math.max(1, Math.min(5, Math.round(parseFloat(r.rating) || 3))) : 3,
                      description: `${r.Name} by ${r.Brand || 'Unknown'}`,
                      image: r['Image URL'] || r['Image URL Transparent'] || null,
                      dateAdded: new Date().toISOString(),
                    });
                  }}
                >
                  + Collection
                </button>
                <button
                  className="btn btn-sm btn-secondary wishlist-btn"
                  onClick={() => {
                    onAddToWishlist({
                      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
                      name: r.Name,
                      brand: r.Brand || '',
                      scentFamily: mapScentFamily(r['Main Accords']),
                      notes: extractNotes(r),
                      description: `${r.Name} by ${r.Brand || 'Unknown'}`,
                      image: r['Image URL'] || r['Image URL Transparent'] || null,
                      price: r.Price || '',
                      dateAdded: new Date().toISOString(),
                    });
                  }}
                >
                  ♡ Wishlist
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
