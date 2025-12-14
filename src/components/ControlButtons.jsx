const ControlButtons = ({ 
  onSpeech
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
      
    </div>
  );
};

export default ControlButtons;
