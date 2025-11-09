import { Canvas } from "@react-three/fiber";
import { Experience } from "./components/Experience";
import { useState } from "react";
import { useSpeechSynthesis } from "./hooks/useSpeechSynthesis";
import { useSpeechRecognition } from "./hooks/useSpeechRecognition";
import VoiceSelector from "./components/VoiceSelector";
import ControlButtons from "./components/ControlButtons";
import MicrophoneControl from "./components/MicrophoneControl";
import { askAgent } from "./api/agentApi";

function App() {
  const [animation, setAnimation] = useState('Idle');
  const [speakingText, setSpeakingText] = useState('');
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);

  // Speech Synthesis hook
  const {
    availableVoices,
    selectedVoice,
    speak,
    testVoice,
    selectVoice,
    selectNamMinhVoice
  } = useSpeechSynthesis();

  // Speech Recognition hook
  const { isListening, startListening } = useSpeechRecognition(async (transcript) => {
    setAnimation("Idle");
    setSpeakingText("Tôi đang suy nghĩ");

    const answer = await askAgent(transcript);
    console.log("answer", answer);
    handleSpeech(answer);
  });

  const handleSpeech = (text) => {
    setSpeakingText(text);
    const utterance = speak(text);

    if (utterance) {
      utterance.onend = () => {
        setAnimation("Idle");
        setSpeakingText("");
      };
    }
  };

  const handleMicrophone = () => {
    if (!isListening) {
      setAnimation("Greeting");
    }
    startListening();
  };

  const toggleVoiceSelector = () => {
    setShowVoiceSelector(!showVoiceSelector);
  };

  return (
    <>
      <Canvas shadows camera={{ position: [0, 0, 8], fov: 42 }}>
        <color attach="background" args={["#ececec"]} />
        <Experience
          animation={animation}
          setAnimation={setAnimation}
          speakingText={speakingText}
        />
      </Canvas>

      <ControlButtons
        onSpeech={handleSpeech}
        onVoiceSelector={toggleVoiceSelector}
        showVoiceSelector={showVoiceSelector}
        selectedVoice={selectedVoice}
      />

      <MicrophoneControl
        isListening={isListening}
        onMicrophone={handleMicrophone}
      />

      <VoiceSelector
        availableVoices={availableVoices}
        selectedVoice={selectedVoice}
        showVoiceSelector={showVoiceSelector}
        onClose={() => setShowVoiceSelector(false)}
        onSelectVoice={selectVoice}
        onTestVoice={testVoice}
      />
    </>
  );
}

export default App;
