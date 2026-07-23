import { useState } from 'react';
import FragranceCard from './FragranceCard';
import { SCENT_FAMILIES, SEASONS, OCCASIONS, NOTES } from '../data/categories';

export default function Inventory({ fragrances, onDelete, onEdit }) {
  const [search, setSearch] = useState('');
  const [filterFamily, setFilterFamily] = useState('All');
  const [filterSeason, setFilterSeason] = useState('All');
  const [sortBy, setSortBy] = useState('name');

  const filtered = fragrances
    .filter(f => {
      const nameMatch = f.name.toLowerCase().includes(search.toLowerCase());
      const brandMatch = f.brand?.toLowerCase().includes(search.toLowerCase());
      const familyMatch = filterFamily === 'All' || f.scentFamily === filterFamily;
      const seasonMatch = filterSeason === 'All' || f.seasons?.includes(filterSeason);
      return (nameMatch || brandMatch) && familyMatch && seasonMatch;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'brand') return a.brand.localeCompare(b.brand);
      return 0;
    });

  return (
    <div className="inventory">
      <h2>Your Collection ({fragrances.length})</h2>

      <div className="inventory-controls">
        <input
          type="text"
          placeholder="Search fragrances..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <select value={filterFamily} onChange={(e) => setFilterFamily(e.target.value)}>
          <option value="All">All Families</option>
          {SCENT_FAMILIES.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <select value={filterSeason} onChange={(e) => setFilterSeason(e.target.value)}>
          <option value="All">All Seasons</option>
          {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="name">Name</option>
          <option value="brand">Brand</option>
          <option value="rating">Rating</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="empty-state">
          {fragrances.length === 0
            ? 'Your collection is empty — add your first fragrance!'
            : 'No fragrances match your filters'}
        </p>
      ) : (
        <div className="fragrance-grid">
          {filtered.map(frag => (
            <FragranceCard
              key={frag.id}
              fragrance={frag}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
