import React from 'react';
import MicrophoneButton from './MicrophoneButton';

const MicrophoneControl = ({ isListening, onMicrophone }) => {
  return (
    <div style={{ 
      position: 'absolute', 
      bottom: 20, 
      right: 20, 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      gap: 10
    }}>
      <MicrophoneButton 
        isListening={isListening}
        onClick={onMicrophone}
      />
      <span style={{
        fontSize: 12,
        color: '#ffffffff',
        textAlign: 'center',
        fontWeight: 'bold'
      }}>
        {isListening ? "Đang nghe..." : "Nhấn để nói"}
      </span>
    </div>
  );
};

export default MicrophoneControl;
