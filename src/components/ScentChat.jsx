import { useState, useRef, useEffect } from 'react';
import { getTimeOfDay } from '../data/categories';

export default function ScentChat({ fragrances, weather, onAdd }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: "👋 Hey, I'm Scenty! Ask me what to wear today, get recommendations, or just chat about fragrances!",
      }]);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg || loading) return;

    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setInput('');
    setLoading(true);

    // Add a placeholder
    setMessages(prev => [...prev, { role: 'assistant', content: '...', loading: true }]);

    try {
      const collection = fragrances.map(f =>
        `${f.name} by ${f.brand} (${f.scentFamily})`
      ).join(', ') || 'No fragrances in collection';

      const context = {
        weather: weather?.conditions || 'Unknown',
        temp: weather?.tempF || 'Unknown',
        timeOfDay: getTimeOfDay(),
        season: weather ? '' : 'Unknown',
        collection,
      };

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, context }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Request failed');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      let buffer = '';
      let addPayload = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n');
        buffer = parts.pop() || '';

        for (const part of parts) {
          if (!part.startsWith('data: ')) continue;
          const data = part.slice(6).trim();
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.content || '';
            if (content) {
              fullText += content;

              // Check for __ADD__ payload at the end of the content
              const addMatch = fullText.match(/__ADD__:\s*(\{.*\})/);
              if (addMatch) {
                try {
                  addPayload = JSON.parse(addMatch[1]);
                  fullText = fullText.replace(/__ADD__:\s*\{.*\}/, '').trim();
                } catch {}
              }

              setMessages(prev => {
                const copy = [...prev];
                copy[copy.length - 1] = { role: 'assistant', content: fullText };
                return copy;
              });
            }
          } catch {}
        }
      }

      // If there's an ADD payload, trigger it
      if (addPayload && onAdd) {
        const newFragrance = {
          id: Date.now().toString(),
          name: addPayload.name || 'Unknown',
          brand: addPayload.brand || 'Unknown',
          scentFamily: addPayload.scentFamily || 'Fresh',
          seasons: addPayload.seasons || [],
          occasions: addPayload.occasions || [],
          times: addPayload.times || [],
          rating: addPayload.rating || 3,
          notes: addPayload.notes || '',
          dateAdded: new Date().toISOString(),
        };
        onAdd(newFragrance);
        setMessages(prev => {
          const copy = [...prev];
          if (copy[copy.length - 1].role === 'assistant') {
            const current = copy[copy.length - 1].content;
            copy[copy.length - 1].content = `${current}\n\n✅ Added **${newFragrance.name}** (${newFragrance.brand}) to your collection!`;
          }
          return copy;
        });
      }
    } catch (err) {
      setMessages(prev => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          role: 'assistant',
          content: `⚠️ Sorry, I couldn't reach my brain right now. ${err.message}`,
        };
        return copy;
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <button
        className={`chat-fab ${open ? 'open' : ''}`}
        onClick={() => setOpen(!open)}
        title="Ask Scenty"
      >
        {open ? '✕' : '💬'}
      </button>

      {open && (
        <div className="chat-window">
          <div className="chat-header">
            <span>🧴 Scenty</span>
            <button className="btn-icon" onClick={() => setOpen(false)}>✕</button>
          </div>
          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`chat-msg ${m.role} ${m.loading ? 'loading' : ''}`}>
                {renderContent(m.content)}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <div className="chat-input-row">
            <input
              className="chat-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about what to wear..."
              disabled={loading}
            />
            <button
              className="btn btn-primary chat-send"
              onClick={handleSend}
              disabled={loading || !input.trim()}
            >
              {loading ? '...' : 'Send'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// Simple markdown parser for bold, italic, line breaks
function renderContent(text) {
  if (!text) return '';
  // Escape HTML first
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Line breaks
    .replace(/\n/g, '<br />');
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}
