'use client';

import React, { useEffect, useRef } from 'react';
import Common from '../../lib/fluidThree/modules/Common';
import Mouse from '../../lib/fluidThree/modules/Mouse';
import Output from '../../lib/fluidThree/modules/Output';

const FluidBackground: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>();

  useEffect(() => {
    const container = mountRef.current;
    if (!container || container.children.length > 0) return;

    let output: Output;

    try {
      // Setup
      Common.width = container.clientWidth;
      Common.height = container.clientHeight;
      Common.init();
      if (Common.renderer) {
        Common.renderer.setSize(Common.width, Common.height);
        container.appendChild(Common.renderer.domElement);
      }
      
      output = new Output();

      // Animation loop
      const loop = () => {
        Mouse.update();
        output.update();
        frameRef.current = requestAnimationFrame(loop);
      };

      // Mouse handler
      const handleMouseMove = (event: MouseEvent) => {
        Mouse.setCoords(event.clientX, event.clientY);
      };

      // Resize handler
      const resize = () => {
        if (container) {
          Common.width = container.clientWidth;
          Common.height = container.clientHeight;
          if (Common.renderer) {
            Common.renderer.setSize(Common.width, Common.height);
          }
          if (output) {
            output.resize();
          }
        }
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('resize', resize);
      frameRef.current = requestAnimationFrame(loop);

      return () => {
        if (frameRef.current) {
          cancelAnimationFrame(frameRef.current);
        }
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('resize', resize);
        if (Common.renderer?.domElement && container.contains(Common.renderer.domElement)) {
          container.removeChild(Common.renderer.domElement);
        }
      };
    } catch (error) {
      console.error('FluidBackground error:', error);
    }
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};

export default FluidBackground; 