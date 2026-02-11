import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2 } from 'lucide-react';

function App() {
  const [messages, setMessages] = useState([
    { role: 'bot', content: 'Hi! 👋 What would you like to cook today?\nExamples: "Quick vegan dinner with tofu", "Gluten-free dessert with chocolate"' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    vegan: false,
    vegetarian: false,
    glutenFree: false,
    quick: false,
    highProtein: false,
  });

const [servings, setServings] = useState(2); // default 2 people

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Collect active preferences
    const activePrefs = [];
    if (preferences.vegan) activePrefs.push("vegan");
    if (preferences.vegetarian) activePrefs.push("vegetarian");
    if (preferences.glutenFree) activePrefs.push("gluten-free");
    if (preferences.quick) activePrefs.push("quick under 30 minutes");
    if (preferences.highProtein) activePrefs.push("high protein");

    const prefsText = activePrefs.length > 0 ?  `(${activePrefs.join(", ")})` : "";
    const servingsText = servings !== 2 ? `, for ${servings} people` : "";

    const fullQuery = input.trim() + prefsText + servingsText;

    // Show the enhanced query to the user
    const displayedQuery = fullQuery;

    const userMessage = { role: 'user', content: displayedQuery };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    console.log('[DEBUG] Starting fetch attempt...');

    try {
      console.log('[DEBUG] Sending request to:', 'http://localhost:8000/query');

      const res = await fetch('http://localhost:8000/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: fullQuery }),
      });

      console.log('[DEBUG] Response status:', res.status, res.ok);

      if (!res.ok) {
        const errorText = await res.text().catch(() => 'No error body');
        throw new Error(`API error ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      console.log('[DEBUG] Raw API response:', data);
      console.log('[DEBUG] Type of data:', typeof data);
      console.log('[DEBUG] data.response exists?', !!data?.response);
      console.log('[DEBUG] typeof data.response:', typeof data?.response);
      
      // ── Safe extraction ────────────────────────────────────────
      const answerText =
      typeof data?.response === 'string'
        ? data.response
        : typeof data === 'string'
        ? data
        : 'Invalid response format from server';

      const formatted = answerText.replace(/\n/g, '<br>');

      setMessages((prev) => [...prev, { role: 'bot', content: formatted }]);

      // Optional: show sources if your backend returns them
       if (data?.sources?.length > 0) {
        setMessages((prev) => [
          ...prev,
          { role: 'bot', content: `Sources: ${data.sources.join(' • ')}`, isSource: true },
        ]);
      }
    } catch (err) {
      console.error('[DEBUG] Fetch/Catch error:', err.message, err.stack);
      setMessages((prev) => [
        ...prev,
        { role: 'bot', content: `Error: ${err.message || 'Unknown error'}` },
      ]);
    } finally {
      setIsLoading(false);
      console.log('[DEBUG] handleSend finished');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-orange-600 text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold text-center">🍳 Recipe Advisor</h1>
        <p className="text-center text-sm opacity-90 mt-1">
          Ask for recipes based on ingredients, diet, time...
        </p>
      </header>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm flex items-start gap-3 ${
                msg.role === 'user'
                  ? 'bg-orange-600 text-white rounded-br-none'
                  : msg.isSource
                  ? 'bg-gray-200 text-gray-800 text-sm italic'
                  : 'bg-white text-gray-900 rounded-bl-none border border-gray-200'
              }`}
            >
              {msg.role === 'bot' && !msg.isSource && (
                <Bot className="w-5 h-5 mt-1 flex-shrink-0" />
              )}
              {msg.role === 'user' && (
                <User className="w-5 h-5 mt-1 flex-shrink-0" />
              )}
              <div
                className="prose prose-sm sm:prose lg:prose-lg max-w-none text-white"
                dangerouslySetInnerHTML={{ __html: msg.content }}
              />
              {/* <div className="whitespace-pre-wrap">{msg.content}</div> */}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl px-4 py-3 shadow-sm flex items-center gap-2 border border-gray-200">
              <Loader2 className="w-5 h-5 animate-spin text-orange-600" />
              <span className="text-gray-600">Thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Preferences */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-4 mb-3 text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.vegan}
                onChange={(e) => setPreferences(prev => ({ ...prev, vegan: e.target.checked }))}
                className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <span>Vegan</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.vegetarian}
                onChange={(e) => setPreferences(prev => ({ ...prev, vegetarian: e.target.checked }))}
                className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <span>Vegetarian</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.glutenFree}
                onChange={(e) => setPreferences(prev => ({ ...prev, glutenFree: e.target.checked }))}
                className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <span>Gluten-free</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.quick}
                onChange={(e) => setPreferences(prev => ({ ...prev, quick: e.target.checked }))}
                className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <span>Quick (&lt;30 min)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.highProtein}
                onChange={(e) => setPreferences(prev => ({ ...prev, highProtein: e.target.checked }))}
                className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <span>High protein</span>
            </label>
          </div>

          {/* Servings */}
          <div className="flex items-center gap-3 text-sm">
            <label htmlFor="servings" className="font-medium text-gray-700">
              Servings:
            </label>
            <input
              id="servings"
              type="number"
              min="1"
              max="10"
              value={servings}
              onChange={(e) => setServings(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-16 px-2 py-1 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <span className="text-gray-500">people</span>
          </div>
        </div>
      </div>  
      {/* Input area */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="flex gap-3 max-w-4xl mx-auto">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Your ingredients or recipe idea... (Shift+Enter for new line)"
            className="flex-1 resize-none rounded-full px-5 py-3 border border-gray-300 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-orange-500 max-h-32 min-h-[48px]"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-orange-600 text-white px-6 py-3 rounded-full hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Send className="w-5 h-5" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;