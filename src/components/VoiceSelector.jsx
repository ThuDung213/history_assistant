import React from 'react';

const VoiceSelector = ({ 
  availableVoices, 
  selectedVoice, 
  showVoiceSelector, 
  onClose, 
  onSelectVoice, 
  onTestVoice 
}) => {
  if (!showVoiceSelector) return null;

  const vietnameseVoices = availableVoices.filter(voice => 
    voice.lang.includes('vi') || 
    voice.lang.toLowerCase().includes('vietnam') ||
    voice.name.toLowerCase().includes('vietnam') ||
    voice.name.toLowerCase().includes('vietnamese')
  );

  return (
    <div style={{
      position: 'absolute',
      top: 20,
      left: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      border: '1px solid #ddd',
      borderRadius: 8,
      padding: 20,
      maxHeight: '60vh',
      overflowY: 'auto',
      minWidth: 400,
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 15 
      }}>
        <h3 style={{ margin: 0, color: '#333' }}>Chọn giọng nói</h3>
        <button 
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: 20,
            cursor: 'pointer',
            color: '#666'
          }}
        >
          ✕
        </button>
      </div>
      
      {selectedVoice && (
        <div style={{ 
          marginBottom: 15, 
          padding: 10, 
          backgroundColor: '#e8f5e8', 
          borderRadius: 5 
        }}>
          <strong>Giọng hiện tại:</strong> {selectedVoice.name} ({selectedVoice.lang})
        </div>
      )}

      <div style={{ display: 'grid', gap: 8 }}>
        {vietnameseVoices.length === 0 ? (
          <div style={{
            padding: 20,
            textAlign: 'center',
            color: '#666',
            fontStyle: 'italic'
          }}>
            ⚠️ Không tìm thấy giọng nói tiếng Việt trên hệ thống này.<br/>
            Hệ thống sẽ sử dụng giọng mặc định.
          </div>
        ) : (
          vietnameseVoices.map((voice, index) => {
            const isNamMinh = voice.name.toLowerCase().includes('namminh') || 
                             voice.name.toLowerCase().includes('nam minh');
            const isSelected = selectedVoice?.name === voice.name;
            
            return (
              <div 
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 10,
                  border: isSelected ? '2px solid #4CAF50' : 
                         isNamMinh ? '2px solid #FF9800' : '1px solid #ddd',
                  borderRadius: 5,
                  backgroundColor: isSelected ? '#f0f8f0' : 
                                 isNamMinh ? '#fff8e1' : 'white'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontWeight: 'bold', 
                    color: isNamMinh ? '#FF6F00' : '#333',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5
                  }}>
                    {isNamMinh && '⭐'} {voice.name}
                  </div>
                  <div style={{ fontSize: 12, color: '#666' }}>
                    {voice.lang} • {voice.localService ? 'Local' : 'Online'}
                    {isNamMinh && ' • Recommended'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 5 }}>
                  <button 
                    onClick={() => onTestVoice(voice)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#2196F3',
                      color: 'white',
                      border: 'none',
                      borderRadius: 3,
                      cursor: 'pointer',
                      fontSize: 12
                    }}
                  >
                    🔊 Test
                  </button>
                  <button 
                    onClick={() => onSelectVoice(voice)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: isSelected ? '#4CAF50' : '#FF9800',
                      color: 'white',
                      border: 'none',
                      borderRadius: 3,
                      cursor: 'pointer',
                      fontSize: 12
                    }}
                  >
                    {isSelected ? '✓ Đã chọn' : 'Chọn'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default VoiceSelector;
