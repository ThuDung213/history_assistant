import { useState } from 'react';

export const useSpeechRecognition = (onResult) => {
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'vi-VN';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        
        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;
          const confidence = result[0].confidence;
          
          if (result.isFinal) {
            onResult(transcript);
          }
        }
      };

      recognition.onerror = (event) => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onaudiostart = () => {
        console.log('🔊 Bắt đầu nhận audio');
      };

      recognition.onaudioend = () => {
        console.log('🔇 Kết thúc nhận audio');
      };

      recognition.onspeechstart = () => {
        console.log('🗣️ Phát hiện giọng nói');
      };

      recognition.onspeechend = () => {
        console.log('🤐 Kết thúc giọng nói');
      };

      if (isListening) {
        console.log('⏹️ Dừng nghe...');
        recognition.stop();
      } else {
        console.log('▶️ Bắt đầu nghe...');
        recognition.start();
      }
    } else {
      console.error('❌ Speech Recognition API không được hỗ trợ');
      alert('Trình duyệt không hỗ trợ nhận dạng giọng nói');
    }
  };

  return {
    isListening,
    startListening
  };
};