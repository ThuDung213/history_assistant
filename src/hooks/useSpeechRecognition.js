import { useState } from 'react';

export const useSpeechRecognition = (onResult) => {
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    console.log('🎤 Bắt đầu xử lý microphone...');
    
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      console.log('✅ Speech Recognition API được hỗ trợ');
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'vi-VN';
      recognition.continuous = false;
      recognition.interimResults = true;
      
      console.log('🔧 Cấu hình Speech Recognition:', {
        lang: recognition.lang,
        continuous: recognition.continuous,
        interimResults: recognition.interimResults
      });

      recognition.onstart = () => {
        console.log('🎙️ Bắt đầu nghe...');
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        console.log('📝 Nhận được kết quả:', event);
        
        // Log tất cả các kết quả
        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;
          const confidence = result[0].confidence;
          
          console.log(`Kết quả ${i}:`, {
            transcript: transcript,
            confidence: confidence,
            isFinal: result.isFinal
          });
          
          // Chỉ xử lý kết quả cuối cùng
          if (result.isFinal) {
            console.log('✅ Kết quả cuối cùng:', transcript);
            onResult(transcript);
          }
        }
      };

      recognition.onerror = (event) => {
        console.error('❌ Lỗi Speech Recognition:', event.error);
        console.error('Chi tiết lỗi:', event);
        setIsListening(false);
      };

      recognition.onend = () => {
        console.log('🔚 Kết thúc nghe');
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