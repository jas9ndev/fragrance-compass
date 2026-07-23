import { useState } from 'react';
import { SCENT_FAMILIES, SEASONS, OCCASIONS, TIMES, NOTES } from '../data/categories';
import { searchFragrance } from '../data/fragrances';

const INITIAL = {
  name: '',
  brand: '',
  scentFamily: 'Citrus',
  notes: [],
  seasons: [],
  times: [],
  occasions: [],
  rating: 3,
  description: '',
};

export default function AddFragrance({ onAdd }) {
  const [form, setForm] = useState(INITIAL);
  const [noteInput, setNoteInput] = useState('');
  const [showForm, setShowForm] = useState(false);

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const toggleArray = (key, value) => {
    setForm(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(v => v !== value)
        : [...prev[key], value],
    }));
  };

  const addNote = (note) => {
    const trimmed = note.trim();
    if (trimmed && !form.notes.includes(trimmed)) {
      update('notes', [...form.notes, trimmed]);
    }
    setNoteInput('');
  };

  const removeNote = (note) => {
    update('notes', form.notes.filter(n => n !== note));
  };

  const handleAutoFill = () => {
    const query = (form.name + ' ' + form.brand).trim();
    if (!query) {
      alert('Type a fragrance name first');
      return;
    }
    const result = searchFragrance(query);
    if (result) {
      setForm(prev => ({
        ...prev,
        scentFamily: result.scentFamily,
        notes: result.notes,
        seasons: result.seasons,
        times: result.times || [],
        occasions: result.occasions,
        rating: result.rating,
        description: result.description,
      }));
    } else {
      alert('No match found in our database. You can fill in the details manually!');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.brand.trim()) {
      alert('Name and brand are required');
      return;
    }
    onAdd({
      ...form,
      name: form.name.trim(),
      brand: form.brand.trim(),
      description: form.description.trim() || `${form.scentFamily} fragrance from ${form.brand}`,
    });
    setForm(INITIAL);
    setShowForm(false);
  };

  if (!showForm) {
    return (
      <button className="btn btn-primary add-btn" onClick={() => setShowForm(true)}>
        + Add Fragrance
      </button>
    );
  }

  return (
    <div className="add-form-overlay">
      <form className="add-form" onSubmit={handleSubmit}>
        <div className="form-header">
          <h3>Add a Fragrance</h3>
          <button type="button" className="btn-icon" onClick={() => setShowForm(false)}>✕</button>
        </div>

        <div className="form-row">
          <label>
            Name *
            <input
              type="text" value={form.name}
              onChange={e => update('name', e.target.value)}
              placeholder="e.g. Sauvage"
              required
            />
          </label>
          <label>
            Brand *
            <input
              type="text" value={form.brand}
              onChange={e => update('brand', e.target.value)}
              placeholder="e.g. Dior"
              required
            />
          </label>
        </div>

        <button type="button" className="btn btn-secondary" onClick={handleAutoFill} style={{width: '100%'}}>
          🔍 Auto-Fill Details
        </button>

        <label>
          Scent Family
          <select value={form.scentFamily} onChange={e => update('scentFamily', e.target.value)}>
            {SCENT_FAMILIES.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </label>

        <label>
          Notes
          <div className="note-input-group">
            <input
              type="text" value={noteInput}
              onChange={e => setNoteInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addNote(noteInput); } }}
              placeholder="Type a note and press Enter"
              list="note-suggestions"
            />
            <datalist id="note-suggestions">
              {NOTES.map(n => <option key={n} value={n} />)}
            </datalist>
            <button type="button" className="btn btn-sm" onClick={() => addNote(noteInput)}>+</button>
          </div>
          <div className="note-tags">
            {form.notes.map(n => (
              <span key={n} className="note-tag removable" onClick={() => removeNote(n)}>
                {n} ✕
              </span>
            ))}
          </div>
        </label>

        <div className="form-row">
          <label>
            Time of Day
            <div className="checkbox-group">
              {TIMES.map(t => (
                <label key={t} className={`checkbox-label ${form.times.includes(t) ? 'active' : ''}`}
                  onClick={() => toggleArray('times', t)}>
                  {t === 'Morning' ? '🌅' : t === 'Day' ? '☀️' : '🌙'} {t}
                </label>
              ))}
            </div>
          </label>
          <label>
            Seasons
            <div className="checkbox-group">
              {SEASONS.map(s => (
                <label key={s} className={`checkbox-label ${form.seasons.includes(s) ? 'active' : ''}`}
                  onClick={() => toggleArray('seasons', s)}>
                  {s}
                </label>
              ))}
            </div>
          </label>
        </div>
        <div className="form-row">
          <label>
            Occasions
            <div className="checkbox-group">
              {OCCASIONS.map(o => (
                <label key={o} className={`checkbox-label ${form.occasions.includes(o) ? 'active' : ''}`}
                  onClick={() => toggleArray('occasions', o)}>
                  {o}
                </label>
              ))}
            </div>
          </label>
        </div>

        <label>
          Rating: {form.rating}/5
          <input
            type="range" min="1" max="5" step="1"
            value={form.rating}
            onChange={e => update('rating', parseInt(e.target.value))}
          />
        </label>

        <label>
          Description
          <textarea
            value={form.description}
            onChange={e => update('description', e.target.value)}
            placeholder="Brief description of the scent..."
            rows="2"
          />
        </label>

        <button type="submit" className="btn btn-primary">Save to Collection</button>
      </form>
    </div>
  );
}
