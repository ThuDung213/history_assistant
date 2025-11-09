import React from 'react';

const VoiceStatus = ({ selectedVoice }) => {
  if (!selectedVoice) return null;

  const isNamMinh = selectedVoice.name.toLowerCase().includes('namminh') || 
                   selectedVoice.name.toLowerCase().includes('nam minh');

  return (
    <div style={{
      position: 'absolute',
      top: 20,
      right: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      border: '1px solid #ddd',
      borderRadius: 8,
      padding: '10px 15px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      maxWidth: 250,
      fontSize: 12
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 5,
        marginBottom: 5 
      }}>
        <span style={{ 
          fontSize: 10, 
          color: '#666',
          textTransform: 'uppercase',
          fontWeight: 'bold'
        }}>
          Giọng hiện tại
        </span>
        {isNamMinh && <span style={{ color: '#FF6F00' }}>⭐</span>}
      </div>
      
      <div style={{ 
        fontWeight: 'bold', 
        color: isNamMinh ? '#FF6F00' : '#333',
        marginBottom: 3,
        fontSize: 13
      }}>
        {selectedVoice.name}
      </div>
      
      <div style={{ color: '#666', fontSize: 11 }}>
        {selectedVoice.lang} • {selectedVoice.localService ? 'Local' : 'Online'}
      </div>
    </div>
  );
};

export default VoiceStatus;
