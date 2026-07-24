import { useState } from 'react';
import { SCENT_FAMILIES, SEASONS, OCCASIONS } from '../data/categories';

const FAMILY_COLORS = {
  'Citrus': '#f6d365',
  'Fresh / Aquatic': '#4facfe',
  'Green': '#8bc34a',
  'Floral': '#f48fb1',
  'Fruity': '#ff8a65',
  'Woody': '#8d6e63',
  'Oriental / Spicy': '#d4a574',
  'Gourmand': '#a1887f',
  'Leather': '#6d4c41',
  'Aromatic': '#81c784',
};

export default function FragranceCard({ fragrance, isWinner, compact, onDelete, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...fragrance });
  const color = FAMILY_COLORS[fragrance.scentFamily] || '#90a4ae';

  const handleSave = () => {
    onEdit(fragrance.id, {
      name: form.name,
      brand: form.brand,
      scentFamily: form.scentFamily,
      rating: parseInt(form.rating) || 3,
      description: form.description,
      seasons: form.seasons,
      occasions: form.occasions,
      times: form.times,
      notes: form.notes,
    });
    setEditing(false);
  };

  const toggleArrayItem = (arr, item) => {
    return arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item];
  };

  const handleNoteKeyDown = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault();
      setForm(f => ({ ...f, notes: [...(f.notes || []), e.target.value.trim()] }));
      e.target.value = '';
    }
  };

  if (editing) {
    return (
      <div className="fragrance-card edit-mode" style={{ borderLeftColor: color }}>
        <div className="edit-header">
          <h3 className="fragrance-name">Edit Fragrance</h3>
        </div>
        <div className="edit-form">
          <div className="form-row">
            <label>Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="form-row">
            <label>Brand</label>
            <input value={form.brand || ''} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} />
          </div>
          <div className="form-row">
            <label>Scent Family</label>
            <select value={form.scentFamily} onChange={e => setForm(f => ({ ...f, scentFamily: e.target.value }))}>
              {SCENT_FAMILIES.map(sf => <option key={sf} value={sf}>{sf}</option>)}
            </select>
          </div>
          <div className="form-row">
            <label>Rating</label>
            <div className="star-rating-input">
              {[1,2,3,4,5].map(n => (
                <span
                  key={n}
                  className={`star ${n <= form.rating ? 'filled' : ''}`}
                  onClick={() => setForm(f => ({ ...f, rating: n }))}
                >★</span>
              ))}
            </div>
          </div>
          <div className="form-row">
            <label>Description</label>
            <textarea value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} />
          </div>
          <div className="form-row">
            <label>Seasons</label>
            <div className="tag-select">
              {['Spring', 'Summer', 'Fall', 'Winter'].map(s => (
                <span
                  key={s}
                  className={`tag-option ${(form.seasons || []).includes(s) ? 'selected' : ''}`}
                  onClick={() => setForm(f => ({ ...f, seasons: toggleArrayItem(f.seasons || [], s) }))}
                >{s}</span>
              ))}
            </div>
          </div>
          <div className="form-row">
            <label>Occasions</label>
            <div className="tag-select">
              {['Office / School', 'Casual', 'Evening Out', 'Formal', 'Daily Wear', 'Party', 'Romantic'].map(o => (
                <span
                  key={o}
                  className={`tag-option ${(form.occasions || []).includes(o) ? 'selected' : ''}`}
                  onClick={() => setForm(f => ({ ...f, occasions: toggleArrayItem(f.occasions || [], o) }))}
                >{o}</span>
              ))}
            </div>
          </div>
          <div className="form-row">
            <label>Times</label>
            <div className="tag-select">
              {['Morning', 'Day', 'Night'].map(t => (
                <span
                  key={t}
                  className={`tag-option ${(form.times || []).includes(t) ? 'selected' : ''}`}
                  onClick={() => setForm(f => ({ ...f, times: toggleArrayItem(f.times || [], t) }))}
                >{t}</span>
              ))}
            </div>
          </div>
          <div className="form-row">
            <label>Notes (type + Enter to add)</label>
            <div className="notes-edit">
              <input
                placeholder="Add a note..."
                onKeyDown={handleNoteKeyDown}
              />
              <div className="notes-edit-list">
                {(form.notes || []).map(n => (
                  <span key={n} className="note-tag removable">
                    {n}
                    <button className="note-remove" onClick={() => setForm(f => ({ ...f, notes: f.notes.filter(x => x !== n) }))}>×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" onClick={handleSave}>💾 Save</button>
            <button className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`fragrance-card ${isWinner ? 'winner' : ''} ${compact ? 'compact' : ''}`}
      style={{ borderLeftColor: color }}
    >
      {isWinner && <div className="winner-badge">🏆 Today&apos;s Pick</div>}
      <div className="fragrance-card-header">
        <h3 className="fragrance-name">{fragrance.name}</h3>
        <span className="fragrance-brand">{fragrance.brand}</span>
        {fragrance.score !== undefined && (
          <div className="fragrance-score">
            <div className="score-bar" style={{ width: `${fragrance.score}%` }} />
            <span>{fragrance.score}%</span>
          </div>
        )}
      </div>
      <div className="fragrance-card-body">
        <span className="scent-family-tag" style={{ backgroundColor: color }}>
          {fragrance.scentFamily}
        </span>
        {!compact && (
          <>
            <p className="fragrance-description">{fragrance.description}</p>
            <div className="fragrance-notes">
              {fragrance.notes?.map(note => (
                <span key={note} className="note-tag">{note}</span>
              ))}
            </div>
            <div className="fragrance-meta">
              <span>Seasons: {fragrance.seasons?.join(', ')}</span>
              <span>Best for: {fragrance.times?.length > 0
                ? fragrance.times.map(t => t === 'Morning' ? '🌅' : t === 'Day' ? '☀️' : '🌙').join(' ')
                : 'Anytime'}</span>
              <span>Occasions: {fragrance.occasions?.join(', ')}</span>
              <span className="fragrance-rating">{'★'.repeat(fragrance.rating)}{'☆'.repeat(5 - fragrance.rating)}</span>
            </div>
          </>
        )}
        {compact && (
          <div className="fragrance-notes">
            {fragrance.notes?.slice(0, 3).map(note => (
              <span key={note} className="note-tag small">{note}</span>
            ))}
          </div>
        )}
      </div>
      <div className="fragrance-card-actions">
        {onEdit && (
          <button className="edit-btn" onClick={() => { setForm({ ...fragrance }); setEditing(true); }} title="Edit fragrance">
            ✏️
          </button>
        )}
        {onDelete && (
          <button className="delete-btn" onClick={() => onDelete(fragrance.id)} title="Remove from inventory">
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
