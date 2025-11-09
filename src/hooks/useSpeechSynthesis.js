import { useState, useEffect } from 'react';

export const useSpeechSynthesis = () => {
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setAvailableVoices(voices);
        
        if (!selectedVoice) {
          // Ưu tiên giọng Microsoft NamMinh
          const namMinhVoice = voices.find(voice => 
            voice.name.toLowerCase().includes('namminh') ||
            voice.name.toLowerCase().includes('nam minh')
          );
          
          const microsoftVietnameseVoice = voices.find(voice => 
            voice.name.toLowerCase().includes('microsoft') &&
            (voice.lang.includes('vi') || 
             voice.lang.toLowerCase().includes('vietnam') ||
             voice.name.toLowerCase().includes('vietnam') ||
             voice.name.toLowerCase().includes('vietnamese'))
          );
          
          const vietnameseVoice = voices.find(voice => 
            voice.lang.includes('vi') || 
            voice.lang.toLowerCase().includes('vietnam') ||
            voice.name.toLowerCase().includes('vietnam') ||
            voice.name.toLowerCase().includes('vietnamese')
          );
          
          if (namMinhVoice) {
            setSelectedVoice(namMinhVoice);
          } else if (microsoftVietnameseVoice) {
            setSelectedVoice(microsoftVietnameseVoice);
          } else if (vietnameseVoice) {
            setSelectedVoice(vietnameseVoice);
          }
        }
      } else {
        console.log('⏳ Đang chờ voices load...');
      }
    };

    loadVoices();
    
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, [selectedVoice]);

  const speak = (text) => {
    
    if ("speechSynthesis" in window) {
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'vi-VN';

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      } else {
        const voices = window.speechSynthesis.getVoices();
        
        const namMinhVoice = voices.find(voice => 
          voice.name.toLowerCase().includes('namminh') ||
          voice.name.toLowerCase().includes('nam minh') ||
          (voice.name.toLowerCase().includes('microsoft') && 
           voice.name.toLowerCase().includes('nam') &&
           voice.lang.includes('vi'))
        );
        
        const maleVietnameseVoice = voices.find(voice => 
          (voice.lang.includes('vi') || 
           voice.lang.toLowerCase().includes('vietnam') ||
           voice.name.toLowerCase().includes('vietnam') ||
           voice.name.toLowerCase().includes('vietnamese')) &&
          (voice.name.toLowerCase().includes('male') || 
           voice.name.toLowerCase().includes('nam') ||
           voice.name.toLowerCase().includes('man'))
        );
        
        const vietnameseVoice = voices.find(voice => 
          voice.lang.includes('vi') || 
          voice.lang.toLowerCase().includes('vietnam') ||
          voice.name.toLowerCase().includes('vietnam') ||
          voice.name.toLowerCase().includes('vietnamese')
        );

        if (namMinhVoice) {
          utterance.voice = namMinhVoice;
        } else if (maleVietnameseVoice) {
          utterance.voice = maleVietnameseVoice;
        } else if (vietnameseVoice) {
          utterance.voice = vietnameseVoice;
        } else {
        }
      }

      utterance.onstart = () => {
        console.log('🎵 Bắt đầu phát âm');
      };

      utterance.onend = () => {
        console.log('🔚 Kết thúc phát âm');
      };

      utterance.onerror = (event) => {
        console.error('❌ Lỗi Speech Synthesis:', event);
      };

      window.speechSynthesis.speak(utterance);
      return utterance;
    } else {
      return null;
    }
  };

  const testVoice = (voice) => {
    const testText = "Xin chào, đây là giọng nói thử nghiệm.";
    const utterance = new SpeechSynthesisUtterance(testText);
    utterance.voice = voice;
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  };

  const selectVoice = (voice) => {
    setSelectedVoice(voice);
  };

  const selectNamMinhVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    const namMinhVoice = voices.find(voice => 
      voice.name.toLowerCase().includes('namminh') ||
      voice.name.toLowerCase().includes('nam minh') ||
      (voice.name.toLowerCase().includes('microsoft') && 
       voice.name.toLowerCase().includes('nam') &&
       voice.lang.includes('vi'))
    );
    
    if (namMinhVoice) {
      setSelectedVoice(namMinhVoice);
      return true;
    } else {
      return false;
    }
  };

  return {
    availableVoices,
    selectedVoice,
    speak,
    testVoice,
    selectVoice,
    selectNamMinhVoice
  };
};