import React from 'react';
import MicrophoneIcon from '../assets/microphone-icon.svg?react';

const MicrophoneButton = ({ isListening, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className={isListening ? 'mic-button' : ''}
      style={{
        width: 60,
        height: 60,
        borderRadius: '50%',
        border: 'none',
        backgroundColor: isListening ? '#ff4444' : '#2e2c2cff',
        color: 'white',
        fontSize: 20,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 8px rgba(141, 68, 68, 0.2)'
      }}
      title={isListening ? "Đang nghe..." : "Nhấn để nói"}
    >
      <MicrophoneIcon style={{ width: 24, height: 24 }} />
    </button>
  );
};

export default MicrophoneButton;
