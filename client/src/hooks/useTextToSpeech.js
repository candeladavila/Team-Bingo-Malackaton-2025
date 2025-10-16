import { useState, useRef, useEffect } from 'react';

export const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechSynthesis = useRef(null);

  useEffect(() => {
    speechSynthesis.current = window.speechSynthesis;
    
    return () => {
      if (speechSynthesis.current) {
        speechSynthesis.current.cancel();
      }
    };
  }, []);

  const getPageText = () => {
    const mainContent = document.querySelector('main') || 
                       document.querySelector('.page-content') ||
                       document.body;
    
    const elementsToExclude = mainContent.querySelectorAll(
      'nav, footer, script, style, .no-read, [aria-hidden="true"], button, input, textarea'
    );
    
    const clone = mainContent.cloneNode(true);
    elementsToExclude.forEach(el => {
      const toRemove = clone.querySelector(
        `${el.tagName.toLowerCase()}${el.className ? '.' + el.className.split(' ')[0] : ''}`
      );
      if (toRemove) toRemove.remove();
    });
    
    return clone.textContent.replace(/\s+/g, ' ').trim();
  };

  const speak = () => {
    if (!speechSynthesis.current) {
      alert('Tu navegador no soporta la funcionalidad de texto a voz');
      return;
    }

    if (isSpeaking) {
      speechSynthesis.current.cancel();
      setIsSpeaking(false);
      return;
    }

    const text = getPageText();
    if (!text) {
      alert('No se encontró texto para leer en esta página');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    const voices = speechSynthesis.current.getVoices();
    const spanishVoice = voices.find(voice => 
      voice.lang.includes('es') || voice.lang === 'es-ES'
    );
    if (spanishVoice) {
      utterance.voice = spanishVoice;
    }
    
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechSynthesis.current.speak(utterance);
  };

  return {
    isSpeaking,
    speak
  };
};