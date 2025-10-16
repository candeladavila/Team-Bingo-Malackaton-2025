import React from 'react';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import './ListenButton.css';

const ListenButton = () => {
  const { isSpeaking, speak } = useTextToSpeech();

  return (
    <button
      onClick={speak}
      className={`listen-button ${isSpeaking ? 'speaking' : ''}`}
      aria-label={isSpeaking ? "Detener lectura" : "Escuchar página"}
      title={isSpeaking ? "Detener lectura" : "Escuchar toda la página en voz alta"}
    >
      {isSpeaking ? (
        <>
          <span className="icon">⏹️</span>
          Detener
        </>
      ) : (
        <>
          <span className="icon">🔊</span>
          Escuchar
        </>
      )}
    </button>
  );
};

export default ListenButton;