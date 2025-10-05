import { Canvas } from "@react-three/fiber";
import { Experience } from "./components/Experience";
import { useState } from "react";

function App() {
  const [animation, setAnimation] = useState('Idle');
  const [speakingText, setSpeakingText] = useState('');

  const handleSpeech = (text) => {
    if ("speechSynthesis" in window) {
      setSpeakingText(text);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'vi-VN';

      /**
       * Called when the speech synthesis has finished speaking the text.
       * Resets the animation to "Idle" and clears the speaking text.
       */
      utterance.onend = () => {
        setAnimation("Idle");
        setSpeakingText("");
      };

      window.speechSynthesis.speak(utterance);
    } else {
      console.log("Web Speech API is not supported in this browser.");
    }
  }
  return (
    <>
      <Canvas shadows camera={{ position: [0, 0, 8], fov: 42 }}>
        <color attach="background" args={["#ececec"]} />
        <Experience animation={animation} setAnimation={setAnimation} speakingText={speakingText} />
      </Canvas>

      <div style={{ position: 'absolute', bottom: 20, left: 20, display: 'flex', gap: 10 }}>
        <button onClick={() => {

          handleSpeech("Xin chào, tôi là trợ lý ảo của bạn! Tổng Bí thư Tô Lâm yêu cầu công an phải là một trong những lực lượng chủ công, nòng cốt thực hiện các chủ trương chiến lược nhằm đưa đất nước bước vào kỷ nguyên phát triển, giàu mạnh.");
        }}>
          Nói: "Xin chào..."
        </button>
        <button onClick={() => {
          setAnimation("Angry"); // Hoặc sử dụng một animation khác
          handleSpeech("Chào bạn, tôi có thể giúp gì cho bạn?");
        }}>
          Nói: "Chào bạn..."
        </button>
      </div>

    </>

  );
}

export default App;
