'use client';
import { useGLTF } from '@react-three/drei';

const Experience = () => {
    const gltf = useGLTF('/models/robot.glb');
  return (
    <>
      <primitive object={gltf.scene} />
    </>
  );
};

export { Experience };