'use client';
import { Model } from './Robot';

const Experience = ({ isSpeaking }: { isSpeaking: boolean }) => {
  return (
    <>
      <Model isSpeaking={isSpeaking} />
    </>
  );
};

export { Experience };