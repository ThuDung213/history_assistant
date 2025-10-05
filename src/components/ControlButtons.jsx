import React from 'react';

// Helper function để lấy tên giọng hiển thị
const getVoiceDisplayName = (voiceName) => {
  // Trích xuất tên chính từ tên đầy đủ
  if (voiceName.toLowerCase().includes('namminh')) {
    return 'NamMinh';
  } else if (voiceName.toLowerCase().includes('hoaimy')) {
    return 'HoaiMy';
  } else if (voiceName.toLowerCase().includes('microsoft')) {
    // Lấy phần tên sau "Microsoft"
    const parts = voiceName.split(' ');
    const microsoftIndex = parts.findIndex(part => part.toLowerCase().includes('microsoft'));
    if (microsoftIndex !== -1 && microsoftIndex + 1 < parts.length) {
      return parts[microsoftIndex + 1];
    }
  }
  
  // Fallback: lấy từ đầu tiên sau khi loại bỏ "Microsoft" và các từ phổ biến
  const cleanName = voiceName
    .replace(/Microsoft\s*/gi, '')
    .replace(/Online\s*/gi, '')
    .replace(/\(.*?\)/g, '') // Loại bỏ nội dung trong ngoặc
    .trim()
    .split(' ')[0];
    
  return cleanName || 'Voice';
};

const ControlButtons = ({ 
  onSpeech, 
  onVoiceSelector, 
  showVoiceSelector, 
  selectedVoice 
}) => {
  return (
    <div style={{ position: 'absolute', bottom: 20, left: 20, display: 'flex', gap: 10 }}>
      <button onClick={() => {
        onSpeech("Xin chào, tôi là trợ lý ảo của bạn! Tổng Bí thư Tô Lâm yêu cầu công an phải là một trong những lực lượng chủ công, nòng cốt thực hiện các chủ trương chiến lược nhằm đưa đất nước bước vào kỷ nguyên phát triển, giàu mạnh.");
      }}>
        Nói: "Xin chào..."
      </button>
      
      <button onClick={() => {
        onSpeech("Chào bạn, tôi có thể giúp gì cho bạn?");
      }}>
        Nói: "Chào bạn..."
      </button>
      
      <button onClick={onVoiceSelector}>
        {showVoiceSelector ? 'Ẩn giọng nói' : 'Chọn giọng nói'}
      </button>
      
      <div 
        style={{
          backgroundColor: selectedVoice ? '#4CAF50' : '#999',
          color: 'white',
          border: 'none',
          padding: '8px 12px',
          borderRadius: 4,
          fontSize: '14px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          minWidth: '120px',
          justifyContent: 'center'
        }}
      >
        {selectedVoice ? 
          `✓ ${getVoiceDisplayName(selectedVoice.name)}` : 
          'Chưa chọn giọng'
        }
      </div>
    </div>
  );
};

export default ControlButtons;
