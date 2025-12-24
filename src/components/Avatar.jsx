import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useGraph } from '@react-three/fiber';
import { useAnimations, useFBX, useGLTF } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';
import generateLipSyncFromText from '../utils/lipsync';

const corresponding = {
  A: "viseme_PP",
  B: "viseme_kk",
  C: "viseme_I",
  D: "viseme_AA",
  E: "viseme_O",
  F: "viseme_U",
  G: "viseme_FF",
  H: "viseme_TH",
  X: "viseme_PP",
};

export function Avatar({ animation, setAnimation, speakingText, ...props }) {
  const group = useRef();
  const { scene } = useGLTF('/models/assistant.glb');
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes, materials } = useGraph(clone);

  // --- Animation Setup (Giữ nguyên) ---
  const { animations: idleAnimation } = useFBX('/animation/Idle.fbx');
  const { animations: angryAnimation } = useFBX('/animation/Angry Gesture.fbx');
  const { animations: greetingAnimation } = useFBX('/animation/Standing Greeting.fbx');

  idleAnimation[0].name = "Idle";
  angryAnimation[0].name = "Angry";
  greetingAnimation[0].name = "Greeting";

  const allAnimations = useMemo(() => [idleAnimation[0], angryAnimation[0], greetingAnimation[0]], [idleAnimation, angryAnimation, greetingAnimation]);
  const { actions } = useAnimations(allAnimations, group);

  useEffect(() => {
    Object.values(actions).forEach(action => action.stop());
    if (actions[animation]) {
      actions[animation].reset().fadeIn(0.5).play();
    }
    return () => {
      if (actions[animation]) actions[animation].fadeOut(0.5);
    };
  }, [animation, actions]);

  // --- LOGIC LIPSYNC & SPEECH MỚI (FIX LỖI INTERRUPTED) ---

  const head = nodes.Wolf3D_Head;
  const teeth = nodes.Wolf3D_Teeth;
  
  const visemeIndex = useMemo(() => {
    const idx = {};
    for (const key in corresponding) {
      const morphName = corresponding[key];
      idx[key] = head.morphTargetDictionary[morphName];
    }
    return idx;
  }, [head]);

  const lipSyncData = useMemo(() => generateLipSyncFromText(speakingText), [speakingText]);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const startTime = useRef(0);
  
  // Dùng useRef để lưu trữ utterance, tránh bị Chrome dọn rác bộ nhớ (Garbage Collected)
  const utteranceRef = useRef(null);

  useEffect(() => {
    if (!speakingText) {
      setIsPlaying(false);
      return;
    }

    // 1. Hủy bỏ giọng nói cũ an toàn
    window.speechSynthesis.cancel();

    // 2. Tạo Utterance mới
    const utterance = new SpeechSynthesisUtterance(speakingText);
    utteranceRef.current = utterance; // Gán vào ref để "giữ sống" biến này

    utterance.lang = 'vi-VN';
    utterance.rate = 1.0; 
    utterance.volume = 1.0;

    // 3. Xử lý sự kiện
    utterance.onstart = () => {
      // Dùng setTimeout 0 để đảm bảo state update không xung đột với luồng sự kiện của browser
      setTimeout(() => {
        setIsPlaying(true);
        startTime.current = performance.now();
      }, 0);
    };

    utterance.onend = () => {
      setIsPlaying(false);
    };

    // Bắt lỗi để không crash app
    utterance.onerror = (event) => {
      console.warn("Speech Error:", event.error);
      if (event.error === 'interrupted' || event.error === 'canceled') {
        // Lỗi này bình thường khi người dùng đổi câu nói nhanh quá
        setIsPlaying(false);
      }
    };

    // 4. Bắt đầu nói
    window.speechSynthesis.speak(utterance);

    // Cleanup khi component unmount hoặc speakingText thay đổi
    return () => {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    };
  }, [speakingText]);

  useFrame(() => {
    // Reset morph targets
    head.morphTargetInfluences.fill(0);
    teeth.morphTargetInfluences.fill(0);

    if (!isPlaying || !speakingText) return;

    const t = (performance.now() - startTime.current) / 1000;
    const current = lipSyncData.findLast(e => e.time <= t);

    if (current && current.mouth && visemeIndex[current.mouth] !== undefined) {
      const index = visemeIndex[current.mouth];
      head.morphTargetInfluences[index] = 1;
      teeth.morphTargetInfluences[index] = 1;
    }
  });

  return (
    <group {...props} dispose={null} ref={group}>
      <primitive object={nodes.Hips} />
      <skinnedMesh geometry={nodes.Wolf3D_Hair.geometry} material={materials.Wolf3D_Hair} skeleton={nodes.Wolf3D_Hair.skeleton} />
      <skinnedMesh geometry={nodes.Wolf3D_Outfit_Top.geometry} material={materials.Wolf3D_Outfit_Top} skeleton={nodes.Wolf3D_Outfit_Top.skeleton} />
      <skinnedMesh geometry={nodes.Wolf3D_Outfit_Bottom.geometry} material={materials.Wolf3D_Outfit_Bottom} skeleton={nodes.Wolf3D_Outfit_Bottom.skeleton} />
      <skinnedMesh geometry={nodes.Wolf3D_Outfit_Footwear.geometry} material={materials.Wolf3D_Outfit_Footwear} skeleton={nodes.Wolf3D_Outfit_Footwear.skeleton} />
      <skinnedMesh geometry={nodes.Wolf3D_Body.geometry} material={materials.Wolf3D_Body} skeleton={nodes.Wolf3D_Body.skeleton} />
      <skinnedMesh name="EyeLeft" geometry={nodes.EyeLeft.geometry} material={materials.Wolf3D_Eye} skeleton={nodes.EyeLeft.skeleton} morphTargetDictionary={nodes.EyeLeft.morphTargetDictionary} morphTargetInfluences={nodes.EyeLeft.morphTargetInfluences} />
      <skinnedMesh name="EyeRight" geometry={nodes.EyeRight.geometry} material={materials.Wolf3D_Eye} skeleton={nodes.EyeRight.skeleton} morphTargetDictionary={nodes.EyeRight.morphTargetDictionary} morphTargetInfluences={nodes.EyeRight.morphTargetInfluences} />
      <skinnedMesh name="Wolf3D_Head" geometry={nodes.Wolf3D_Head.geometry} material={materials.Wolf3D_Skin} skeleton={nodes.Wolf3D_Head.skeleton} morphTargetDictionary={nodes.Wolf3D_Head.morphTargetDictionary} morphTargetInfluences={nodes.Wolf3D_Head.morphTargetInfluences} />
      <skinnedMesh name="Wolf3D_Teeth" geometry={nodes.Wolf3D_Teeth.geometry} material={materials.Wolf3D_Teeth} skeleton={nodes.Wolf3D_Teeth.skeleton} morphTargetDictionary={nodes.Wolf3D_Teeth.morphTargetDictionary} morphTargetInfluences={nodes.Wolf3D_Teeth.morphTargetInfluences} />
    </group>
  );
}

useGLTF.preload('/models/assistant.glb');