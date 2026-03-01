import { useEffect, useRef, useCallback } from 'react';

export function useTiltDownUp(onTilt: () => void, threshold = 10, cooldown = 1000) {
  const lastY = useRef<number | null>(null);
  const tiltState = useRef<'none' | 'down' | 'up'>('none');
  const lastTriggerTime = useRef(0);

  const handleMotion = useCallback((event: DeviceMotionEvent) => {
    const acc = event.accelerationIncludingGravity;
    if (!acc || acc.y == null) return;

    const y = acc.y;
    const now = Date.now();

    // Prevent retriggering
    if (now - lastTriggerTime.current < cooldown) return;

    if (lastY.current !== null) {
      const deltaY = y - lastY.current;

      if (tiltState.current === 'none' && deltaY > threshold) {
        // Tilted down
        tiltState.current = 'down';
      } else if (tiltState.current === 'down' && deltaY < -threshold) {
        // Then tilted up
        tiltState.current = 'up';
        lastTriggerTime.current = now;
        tiltState.current = 'none';

        // Trigger the callback
        onTilt();
      }
    }

    lastY.current = y;
  }, [onTilt, threshold, cooldown]);

  useEffect(() => {
    const requestPermission = async () => {
      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        try {
          const permission = await (DeviceMotionEvent as any).requestPermission();
          if (permission === 'granted') {
            window.addEventListener('devicemotion', handleMotion);
          }
        } catch (err) {
          console.error('Motion permission error:', err);
        }
      } else {
        window.addEventListener('devicemotion', handleMotion);
      }
    };

    requestPermission();
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [handleMotion]);
}
