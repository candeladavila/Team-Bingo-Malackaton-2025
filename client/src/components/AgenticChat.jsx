import { useState, useEffect, useRef } from "react";

export default function AgenticChat() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://insight-server-rose.vercel.app'
  
  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem("agentic-chat-history");
    return saved ? JSON.parse(saved) : [
      { 
        role: "assistant", 
        content: "Hola, soy Acompaña 💚. Usando inteligencia artificial, puedo consultar datos reales de salud mental en España y explicártelos de forma comprensible. ¿En qué puedo ayudarte?",
        timestamp: new Date().toISOString()
      }
    ];
  });
  
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [systemInfo, setSystemInfo] = useState(null);
  const endRef = useRef();

  // Cargar información del sistema al inicio
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/health`)
      .then(res => res.json())
      .then(data => setSystemInfo(data))
      .catch(console.error);
  }, []);

  // Guardar historial
  useEffect(() => {
    sessionStorage.setItem("agentic-chat-history", JSON.stringify(messages));
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e) {
    e?.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || loading) return;

    const userMsg = { 
      role: "user", 
      content: trimmedInput,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: trimmedInput, 
          history: messages.slice(-6)
        })
      });

      if (!res.ok) throw new Error("Error del servidor");

      const data = await res.json();
      const assistantMsg = { 
        role: "assistant", 
        content: data.reply,
        timestamp: new Date().toISOString(),
        isUrgent: data.isUrgent,
        usedData: data.usedData,
        provider: data.provider
      };
      
      setMessages(prev => [...prev, assistantMsg]);

    } catch (err) {
      console.error("Error:", err);
      
      const errorMsg = { 
        role: "assistant", 
        content: "💙 Lo siento, hay un problema de conexión. Si es urgente, contacta con el Teléfono de la Esperanza: 717 003 717",
        timestamp: new Date().toISOString(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  }

  function QuickSuggestions() {
    const suggestions = [
      "¿Cuántos casos de depresión hay en Madrid?",
      "Estadísticas de ansiedad por comunidad",
      "Enfermedades más comunes en Cataluña",
      "Comparar salud mental entre regiones"
    ];

    return (
      <div className="quick-suggestions">
        <p className="suggestions-label">
          💡 Preguntas que activan consultas inteligentes a la base de datos:
        </p>
        <div className="suggestions-grid">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              className="suggestion-chip"
              onClick={() => setInput(suggestion)}
              disabled={loading}
            >
              {suggestion}
            </button>
          ))}
        </div>
        {systemInfo && (
          <div className="system-info">
            <small>
              🤖 {systemInfo.ai_provider} | 
              🗄️ {systemInfo.database} | 
              🟢 {systemInfo.status}
            </small>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="chat-container">
      {/* Header con info del sistema */}
      <div className="chat-header">
        <div className="chat-title">
          <div className="avatar">🤖</div>
          <div>
            <h2>Acompaña Agentic</h2>
            <p className="subtitle">IA + Oracle para salud mental España</p>
          </div>
        </div>
        <div className="system-badge">
          {systemInfo?.ai_provider && `Powered by ${systemInfo.ai_provider}`}
        </div>
      </div>

      {/* Mensajes */}
      <div className="messages-container">
        {messages.map((msg, index) => (
          <div key={index} className={`message-wrapper ${msg.role}-message`}>
            <div className="message-content">
              {msg.role === "assistant" && (
                <div className="message-avatar">🤖</div>
              )}
              <div className="message-bubble-container">
                <div className={`message-bubble ${msg.isUrgent ? 'urgent' : ''} ${msg.isError ? 'error' : ''} ${msg.usedData ? 'has-data' : ''}`}>
                  {msg.content.split('\n').map((line, i) => (
                    <p key={i} className="message-text">{line}</p>
                  ))}
                  {msg.usedData && (
                    <div className="agentic-badge">
                      📊 Consulta inteligente a base de datos
                    </div>
                  )}
                </div>
                <div className="message-metadata">
                  <span className="message-timestamp">
                    {new Date(msg.timestamp).toLocaleTimeString('es-ES')}
                  </span>
                  {msg.provider && (
                    <span className="message-provider">{msg.provider}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="message-wrapper assistant-message">
            <div className="message-content">
              <div className="message-avatar">🤖</div>
              <div className="message-bubble-container">
                <div className="message-bubble typing-indicator">
                  <span>🤖 Generando consulta SQL y analizando datos...</span>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={endRef} />
      </div>

      {/* Sugerencias para consultas agentic */}
      {messages.length === 1 && <QuickSuggestions />}

      {/* Input */}
      <form onSubmit={sendMessage} className="input-container">
        <div className="input-wrapper">
          <input
            className="message-input"
            placeholder="Pregunta sobre datos de salud mental en España..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            maxLength={500}
          />
          <button 
            className="send-button" 
            type="submit" 
            disabled={!input.trim() || loading}
            aria-label="Enviar mensaje"
          >
            {loading ? "⏳" : "🤖"}
          </button>
        </div>
        <div className="input-footer">
          <span className="char-count">{input.length}/500</span>
          <span className="security-notice">
            🔒 Sistema agentic con Oracle + IA Generativa
          </span>
        </div>
      </form>

      {/* Recursos de emergencia */}
      <div className="emergency-banner">
        <strong>¿Necesitas ayuda inmediata?</strong> Teléfono de la Esperanza: <a href="tel:717003717">717 003 717</a> • Emergencias: <a href="tel:112">112</a>
      </div>
    </div>
  );
}