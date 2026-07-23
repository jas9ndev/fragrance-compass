import { useState, useRef, useEffect } from 'react';
import { getTimeOfDay } from '../data/categories';

export default function ScentChat({ fragrances, weather }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
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
              setMessages(prev => {
                const copy = [...prev];
                copy[copy.length - 1] = { role: 'assistant', content: fullText };
                return copy;
              });
            }
          } catch {}
        }
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
                {m.content}
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
