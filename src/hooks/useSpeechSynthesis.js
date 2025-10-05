import { useState, useEffect } from 'react';

export const useSpeechSynthesis = () => {
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);

  // Load voices khi component mount
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        console.log('✅ Voices đã được load');
        setAvailableVoices(voices);
        
        // Tự động chọn giọng tiếng Việt đầu tiên nếu chưa có giọng nào được chọn
        if (!selectedVoice) {
          // Ưu tiên giọng Microsoft NamMinh
          const namMinhVoice = voices.find(voice => 
            voice.name.toLowerCase().includes('namminh') ||
            voice.name.toLowerCase().includes('nam minh')
          );
          
          // Ưu tiên giọng Microsoft Việt Nam
          const microsoftVietnameseVoice = voices.find(voice => 
            voice.name.toLowerCase().includes('microsoft') &&
            (voice.lang.includes('vi') || 
             voice.lang.toLowerCase().includes('vietnam') ||
             voice.name.toLowerCase().includes('vietnam') ||
             voice.name.toLowerCase().includes('vietnamese'))
          );
          
          // Giọng Việt Nam bất kỳ
          const vietnameseVoice = voices.find(voice => 
            voice.lang.includes('vi') || 
            voice.lang.toLowerCase().includes('vietnam') ||
            voice.name.toLowerCase().includes('vietnam') ||
            voice.name.toLowerCase().includes('vietnamese')
          );
          
          if (namMinhVoice) {
            setSelectedVoice(namMinhVoice);
            console.log(`🎤 Tự động chọn giọng NamMinh: ${namMinhVoice.name}`);
          } else if (microsoftVietnameseVoice) {
            setSelectedVoice(microsoftVietnameseVoice);
            console.log(`🎤 Tự động chọn giọng Microsoft Việt: ${microsoftVietnameseVoice.name}`);
          } else if (vietnameseVoice) {
            setSelectedVoice(vietnameseVoice);
            console.log(`🎤 Tự động chọn giọng Việt: ${vietnameseVoice.name}`);
          }
        }
      } else {
        console.log('⏳ Đang chờ voices load...');
      }
    };

    loadVoices();
    
    // Lắng nghe sự kiện voiceschanged
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, [selectedVoice]);

  const speak = (text) => {
    console.log('🗣️ Bắt đầu phát âm:', text);
    
    if ("speechSynthesis" in window) {
      console.log('✅ Speech Synthesis API được hỗ trợ');
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'vi-VN';

      // Sử dụng giọng đã chọn hoặc tìm giọng mặc định
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log('🎤 Sử dụng giọng đã chọn:', selectedVoice.name);
      } else {
        // Fallback logic để tìm giọng Việt Nam tốt nhất
        const voices = window.speechSynthesis.getVoices();
        
        // Ưu tiên tìm giọng Microsoft NamMinh
        const namMinhVoice = voices.find(voice => 
          voice.name.toLowerCase().includes('namminh') ||
          voice.name.toLowerCase().includes('nam minh') ||
          (voice.name.toLowerCase().includes('microsoft') && 
           voice.name.toLowerCase().includes('nam') &&
           voice.lang.includes('vi'))
        );
        
        // Tìm giọng nam Việt Nam khác
        const maleVietnameseVoice = voices.find(voice => 
          (voice.lang.includes('vi') || 
           voice.lang.toLowerCase().includes('vietnam') ||
           voice.name.toLowerCase().includes('vietnam') ||
           voice.name.toLowerCase().includes('vietnamese')) &&
          (voice.name.toLowerCase().includes('male') || 
           voice.name.toLowerCase().includes('nam') ||
           voice.name.toLowerCase().includes('man'))
        );
        
        // Tìm bất kỳ giọng Việt Nam nào
        const vietnameseVoice = voices.find(voice => 
          voice.lang.includes('vi') || 
          voice.lang.toLowerCase().includes('vietnam') ||
          voice.name.toLowerCase().includes('vietnam') ||
          voice.name.toLowerCase().includes('vietnamese')
        );

        if (namMinhVoice) {
          utterance.voice = namMinhVoice;
          console.log('🎤 Sử dụng giọng Microsoft NamMinh:', namMinhVoice.name);
        } else if (maleVietnameseVoice) {
          utterance.voice = maleVietnameseVoice;
          console.log('🎤 Sử dụng giọng nam Việt:', maleVietnameseVoice.name);
        } else if (vietnameseVoice) {
          utterance.voice = vietnameseVoice;
          console.log('🎤 Sử dụng giọng Việt:', vietnameseVoice.name);
        } else {
          console.log('⚠️ Không tìm thấy giọng tiếng Việt, sử dụng giọng mặc định');
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

      console.log('🔧 Cấu hình Speech Synthesis:', {
        text: text,
        lang: utterance.lang,
        voice: utterance.voice?.name || 'default',
        rate: utterance.rate,
        pitch: utterance.pitch,
        volume: utterance.volume
      });

      window.speechSynthesis.speak(utterance);
      return utterance;
    } else {
      console.error("❌ Web Speech API không được hỗ trợ trong trình duyệt này.");
      return null;
    }
  };

  const testVoice = (voice) => {
    const testText = "Xin chào, đây là giọng nói thử nghiệm.";
    const utterance = new SpeechSynthesisUtterance(testText);
    utterance.voice = voice;
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
    console.log(`🎤 Test giọng: ${voice.name} (${voice.lang})`);
  };

  const selectVoice = (voice) => {
    setSelectedVoice(voice);
    console.log(`✅ Đã chọn giọng: ${voice.name} (${voice.lang})`);
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
      console.log(`🎯 Đã chọn giọng NamMinh: ${namMinhVoice.name}`);
      return true;
    } else {
      console.log('❌ Không tìm thấy giọng Microsoft NamMinh');
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