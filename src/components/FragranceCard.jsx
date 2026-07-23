import { SCENT_FAMILIES } from '../data/categories';

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

export default function FragranceCard({ fragrance, isWinner, compact, onDelete }) {
  const color = FAMILY_COLORS[fragrance.scentFamily] || '#90a4ae';

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
      {onDelete && (
        <button className="delete-btn" onClick={() => onDelete(fragrance.id)} title="Remove from inventory">
          ✕
        </button>
      )}
    </div>
  );
}
