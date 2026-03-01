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
    threshold = 28,      // MUCH stronger than 15
    shakeCount = 3,      // require 3 shakes
    interval = 800,      // must happen within 800ms
    cooldown = 2000      // 2s cooldown after trigger
  } = options;

  const lastX = useRef<number | null>(null);
  const lastY = useRef<number | null>(null);
  const lastZ = useRef<number | null>(null);

  const shakeCounter = useRef(0);
  const lastShakeTime = useRef(0);
  const lastTriggerTime = useRef(0);

  const handleMotion = useCallback(
    (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;

      const { x, y, z } = acc;
      if (x == null || y == null || z == null) return;

      if (
        lastX.current !== null &&
        lastY.current !== null &&
        lastZ.current !== null
      ) {
        const deltaX = Math.abs(lastX.current - x);
        const deltaY = Math.abs(lastY.current - y);
        const deltaZ = Math.abs(lastZ.current - z);

        const totalDelta = deltaX + deltaY + deltaZ;

        if (totalDelta > threshold) {
          const now = Date.now();

          // Count shakes within interval
          if (now - lastShakeTime.current < interval) {
            shakeCounter.current++;
          } else {
            shakeCounter.current = 1;
          }

          lastShakeTime.current = now;

          if (
            shakeCounter.current >= shakeCount &&
            now - lastTriggerTime.current > cooldown
          ) {
            lastTriggerTime.current = now;
            shakeCounter.current = 0;

            // Blur active input to avoid iOS default shake undo
            if (document.activeElement instanceof HTMLElement) {
              document.activeElement.blur();
            }

            onShake();
          }
        }
      }

      lastX.current = x;
      lastY.current = y;
      lastZ.current = z;
    },
    [onShake, threshold, shakeCount, interval, cooldown]
  );

  useEffect(() => {
    const requestPermission = async () => {
      if (
        typeof (DeviceMotionEvent as any).requestPermission === 'function'
      ) {
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