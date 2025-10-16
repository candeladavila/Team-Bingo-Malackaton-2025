import React, { useState, useRef, useEffect } from 'react'
import './ChatbotPage.css'
import ListenButton from '../components/ListenButton'  // 👈 Importa el botón

const ChatbotPage = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?",
      sender: "bot",
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (inputMessage.trim() === '') return

    const newMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: "user",
      timestamp: new Date()
    }

    setMessages(prev => [...prev, newMessage])
    setInputMessage('')
    setIsTyping(true)

    // Simular respuesta del bot
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: "Gracias por tu mensaje. ¿Puedes ser más específico sobre lo que necesitas?",
        sender: "bot",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botResponse])
      setIsTyping(false)
    }, 1500)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="chatbot-page">
      <ListenButton />  {/* 👈 Añade el botón aquí */}
      <header className="page-header">
        <h1>Asistente Virtual</h1>
        <p>Pregúntame cualquier cosa sobre el análisis de datos</p>
      </header>
      
      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
            >
              <div className="message-content">
                <p>{message.text}</p>
                <span className="timestamp">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="message bot-message">
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <div className="chat-input">
          <div className="input-container">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu mensaje aquí..."
              rows="2"
            />
            <button 
              onClick={handleSendMessage}
              disabled={inputMessage.trim() === ''}
              className="send-button"
            >
              Enviar
            </button>
          </div>
        </div>
      </div>
      
      <aside className="chat-suggestions">
        <h3>Preguntas Frecuentes</h3>
        <div className="suggestion-buttons">
          <button onClick={() => setInputMessage("¿Cómo puedo importar datos?")}>
            ¿Cómo puedo importar datos?
          </button>
          <button onClick={() => setInputMessage("¿Qué tipos de gráficos puedo crear?")}>
            ¿Qué tipos de gráficos puedo crear?
          </button>
          <button onClick={() => setInputMessage("¿Cómo filtro mis datos?")}>
            ¿Cómo filtro mis datos?
          </button>
          <button onClick={() => setInputMessage("¿Puedes ayudarme con estadísticas?")}>
            ¿Puedes ayudarme con estadísticas?
          </button>
        </div>
      </aside>
    </div>
  )
}

export default ChatbotPage