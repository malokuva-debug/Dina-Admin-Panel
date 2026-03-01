import { useEffect, useCallback, useRef } from 'react';

interface ShakeDetectionOptions {
  threshold?: number;      // strength required
  shakeCount?: number;     // how many shakes required
  interval?: number;       // time window for multiple shakes
  cooldown?: number;       // prevent retriggering
}

export function useShakeDetection(
  onShake: () => void,
  options: ShakeDetectionOptions = {}
) {
  const {
    threshold = 20,      // smaller, because vertical delta is usually lower
    shakeCount = 2,      // maybe only 2 vertical shakes
    interval = 800,
    cooldown = 2000
  } = options;

  const lastY = useRef<number | null>(null);
  const shakeCounter = useRef(0);
  const lastShakeTime = useRef(0);
  const lastTriggerTime = useRef(0);

  const handleMotion = useCallback(
    (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;

      const { y } = acc;
      if (y == null) return;

      if (lastY.current !== null) {
        const deltaY = Math.abs(lastY.current - y);
        if (deltaY > threshold) {
          const now = Date.now();

          if (now - lastShakeTime.current < interval) {
            shakeCounter.current++;
          } else {
            shakeCounter.current = 1;
          }

          lastShakeTime.current = now;

          if (shakeCounter.current >= shakeCount && now - lastTriggerTime.current > cooldown) {
            lastTriggerTime.current = now;
            shakeCounter.current = 0;

            // Blur active input to prevent iOS "Undo Typing"
            if (document.activeElement instanceof HTMLElement) {
              document.activeElement.blur();
            }

            onShake();
          }
        }
      }

      lastY.current = y;
    },
    [onShake, threshold, shakeCount, interval, cooldown]
  );

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

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [handleMotion]);
}