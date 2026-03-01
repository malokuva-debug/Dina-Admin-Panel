import { useEffect, useRef } from 'react';

interface ShakeDetectionOptions {
  threshold?: number;      // min movement in each direction
  cooldown?: number;       // prevent retriggering
  maxInterval?: number;    // max time between down and up
}

export function useShakeDetection(
  onShake: () => void,
  options: ShakeDetectionOptions = {}
) {
  const { threshold = 12, cooldown = 1500, maxInterval = 800 } = options;

  const lastY = useRef<number | null>(null);
  const lastTime = useRef(0);

  const state = useRef<'waitingDown' | 'waitingUp'>('waitingDown');
  const downTimestamp = useRef(0);

  const handleMotion = (event: DeviceMotionEvent) => {
    const acc = event.accelerationIncludingGravity;
    if (!acc) return;

    const y = acc.y!;
    const now = Date.now();

    if (now - lastTime.current < 50) return; // small debounce
    lastTime.current = now;

    if (lastY.current === null) {
      lastY.current = y;
      return;
    }

    const deltaY = y - lastY.current;

    if (state.current === 'waitingDown') {
      // Detect downward movement
      if (deltaY > threshold) {
        state.current = 'waitingUp';
        downTimestamp.current = now;
      }
    } else if (state.current === 'waitingUp') {
      // Detect upward movement within maxInterval
      if (deltaY < -threshold && now - downTimestamp.current <= maxInterval) {
        // Blur active input to prevent iOS undo typing
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }

        onShake();
        state.current = 'waitingDown';
      } else if (now - downTimestamp.current > maxInterval) {
        // Timeout, reset
        state.current = 'waitingDown';
      }
    }

    lastY.current = y;
  };

  useEffect(() => {
    const requestPermission = async () => {
      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        try {
          const permission = await (DeviceMotionEvent as any).requestPermission();
          if (permission === 'granted') {
            window.addEventListener('devicemotion', handleMotion);
          }
        } catch (error) {
          console.error('Motion permission error:', error);
        }
      } else {
        window.addEventListener('devicemotion', handleMotion);
      }
    };

    requestPermission();

    return () => window.removeEventListener('devicemotion', handleMotion);
  }, []);
}