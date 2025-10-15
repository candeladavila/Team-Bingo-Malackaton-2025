import { useState, useEffect, useRef } from "react";

export default function Chat() {
  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem("mental-health-chat-history");
    return saved ? JSON.parse(saved) : [
      { 
        role: "assistant", 
        content: "Hola, soy Acompaña 💚. Estoy aquí para escucharte y orientarte sobre salud mental en España. Tengo acceso a datos reales del sistema de salud. ¿En qué puedo ayudarte hoy?",
        timestamp: new Date().toISOString()
      }
    ];
  });
  
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [showDataInfo, setShowDataInfo] = useState(false);
  const endRef = useRef();

  // Efectos para persistencia y scroll
  useEffect(() => {
    sessionStorage.setItem("mental-health-chat-history", JSON.stringify(messages));
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
    setConnectionError(false);
    setShowDataInfo(false);

    try {
      const res = await fetch("/api/chat", {
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
        hasData: data.hasData
      };
      
      setMessages(prev => [...prev, assistantMsg]);
      
      // Mostrar info sobre datos si la respuesta incluye datos reales
      if (data.hasData) {
        setShowDataInfo(true);
      }

    } catch (err) {
      console.error("Error:", err);
      setConnectionError(true);
      
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

  function formatTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  function quickSuggestions() {
    const suggestions = [
      "Estadísticas de depresión por comunidad autónoma",
      "Datos de ansiedad en España",
      "Casos de salud mental en Madrid",
      "Recursos para crisis inmediata"
    ];

    return (
      <div className="quick-suggestions">
        <p className="suggestions-label">Puedes preguntar sobre:</p>
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
        <div className="data-info">
          <small>📊 Respuestas con datos reales del sistema de salud español</small>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-title">
          <div className="avatar">💚</div>
          <div>
            <h2>Acompaña</h2>
            <p className="subtitle">Asistente con datos reales de salud mental</p>
          </div>
        </div>
        <div className="connection-status">
          {connectionError && <span className="status-error">⚠️ Sin conexión</span>}
          {!connectionError && <span className="status-ok">✅ Conectado</span>}
        </div>
      </div>

      {/* Mensajes */}
      <div className="messages-container">
        {messages.map((msg, index) => (
          <div key={index} className={`message-wrapper ${msg.role}-message`}>
            <div className="message-content">
              {msg.role === "assistant" && (
                <div className="message-avatar">💚</div>
              )}
              <div className="message-bubble-container">
                <div className={`message-bubble ${msg.isUrgent ? 'urgent' : ''} ${msg.isError ? 'error' : ''} ${msg.hasData ? 'has-data' : ''}`}>
                  {msg.content.split('\n').map((line, i) => (
                    <p key={i} className="message-text">{line}</p>
                  ))}
                  {msg.hasData && (
                    <div className="data-badge">
                      📊 Datos reales del sistema de salud
                    </div>
                  )}
                </div>
                <div className="message-timestamp">
                  {formatTime(msg.timestamp)}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="message-wrapper assistant-message">
            <div className="message-content">
              <div className="message-avatar">💚</div>
              <div className="message-bubble-container">
                <div className="message-bubble typing-indicator">
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

      {/* Información sobre datos */}
      {showDataInfo && (
        <div className="data-alert">
          <span>📊 Esta respuesta incluye datos reales del sistema de salud español</span>
        </div>
      )}

      {/* Sugerencias rápidas */}
      {messages.length === 1 && quickSuggestions()}

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
            {loading ? "⏳" : "💚"}
          </button>
        </div>
        <div className="input-footer">
          <span className="char-count">{input.length}/500</span>
          <span className="security-notice">🔒 Conversación segura con datos reales</span>
        </div>
      </form>

      {/* Recursos de emergencia */}
      <div className="emergency-banner">
        <strong>¿Necesitas ayuda inmediata?</strong> Teléfono de la Esperanza: <a href="tel:717003717">717 003 717</a> • Emergencias: <a href="tel:112">112</a>
      </div>
    </div>
  );
}