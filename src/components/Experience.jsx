import { Environment, OrbitControls, useTexture } from "@react-three/drei";
import { Avatar } from "./Avatar";
import { useThree } from "@react-three/fiber";

export const Experience = ({ animation, setAnimation, speakingText }) => {
  // Lấy giờ hiện tại
  const hour = new Date().getHours();
  // Chọn background theo giờ
  const bgFile = (hour >= 6 && hour < 18) ? '/textures/bg.jpg' : '/textures/bg_night.jpg';
  const texture = useTexture(bgFile);
  const viewport = useThree((state) => state.viewport);
  return (
    <>
      <ambientLight intensity={1} />
      <pointLight position={[10, 10, 10]} />
      <Avatar
        animation={animation}
        setAnimation={setAnimation}
        speakingText={speakingText}
        position={[0, -3, 5]}
        scale={2}
      />
      <OrbitControls />

      <Environment preset="sunset" />
      <mesh>
        <planeGeometry args={[viewport.width, viewport.height]} />
        <meshBasicMaterial map={texture} />
      </mesh>
    </>
  );
};
