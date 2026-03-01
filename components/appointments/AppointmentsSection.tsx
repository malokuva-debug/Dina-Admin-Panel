import { useEffect, useRef } from 'react';

interface ShakeDetectionOptions {
  threshold?: number;   // how much Y-axis movement counts as a tilt
  cooldown?: number;    // minimum time between triggers
  maxInterval?: number; // max time for down→up sequence
}

export function useShakeDetection(
  onShake: () => void,
  options: ShakeDetectionOptions = {}
) {
  const { threshold = 8, cooldown = 2000, maxInterval = 1000 } = options;

  const lastY = useRef<number | null>(null);
  const lastTime = useRef(0);

  const state = useRef<'waitingDown' | 'waitingUp'>('waitingDown');
  const tiltStartTime = useRef(0);
  const lastTriggerTime = useRef(0);

  const handleMotion = (event: DeviceMotionEvent) => {
    const acc = event.accelerationIncludingGravity;
    if (!acc) return;

    const y = acc.y!;
    const now = Date.now();

    // small debounce to avoid too frequent updates
    if (now - lastTime.current < 50) return;
    lastTime.current = now;

    if (lastY.current === null) {
      lastY.current = y;
      return;
    }

    const deltaY = y - lastY.current;

    if (state.current === 'waitingDown') {
      // Detect intentional downward tilt
      if (deltaY > threshold) {
        state.current = 'waitingUp';
        tiltStartTime.current = now;
      }
    } else if (state.current === 'waitingUp') {
      // Detect upward tilt to complete the gesture
      if (deltaY < -threshold && now - tiltStartTime.current <= maxInterval) {
        if (now - lastTriggerTime.current > cooldown) {
          lastTriggerTime.current = now;

          // Blur active input to prevent iOS undo typing
          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
          }

          onShake();
        }
        state.current = 'waitingDown';
      } else if (now - tiltStartTime.current > maxInterval) {
        // Timeout: reset if user is too slow
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