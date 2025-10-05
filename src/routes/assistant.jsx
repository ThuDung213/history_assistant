import React, { useState } from 'react';
import { Avatar } from '../components/Avatar';
import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';

const AvatarDemo = () => {
    const [animation, setAnimation] = useState('');

    const speak = (text) => {
        // Logic của bạn để sử dụng Web Speech API
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'vi-VN';
            utterance.onstart = () => setAnimation('Speaking');
            utterance.onend = () => setAnimation('Idle');
            window.speechSynthesis.speak(utterance);
        } else {
            console.log('Web Speech API is not supported in this browser.');
        }
    };

    return (
        <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h1>Avatar Demo Page</h1>
            <div style={{ flex: 1, width: '100%' }}>
                <Canvas>
                    <ambientLight intensity={1} />
                    <pointLight position={[10, 10, 10]} />
                    <Avatar animation={animation} position={[0, -1, 0]} />
                    <OrbitControls />
                </Canvas>
            </div>
            <div style={{ padding: '20px', display: 'flex', gap: '10px' }}>
                <button onClick={() => setAnimation('Idle')}>Idle</button>
                <button onClick={() => setAnimation('Angry')}>Angry</button>
                <button onClick={() => setAnimation('Greeting')}>Greeting</button>
                <button onClick={() => speak('Xin chào, tôi là trợ lý ảo của bạn!')}>Speak</button>
            </div>
        </div>
    );
};

export default AvatarDemo;