import { useEffect, useRef } from 'react';

export function useTiltUndoShake(onShake: () => void, threshold = 15, cooldown = 1500) {
  const lastY = useRef<number | null>(null);
  const tiltState = useRef<'neutral' | 'down' | 'up'>('neutral');
  const lastTriggerTime = useRef(0);

  useEffect(() => {
    const handleMotion = (e: DeviceMotionEvent) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;
      const y = acc.y!;
      const now = Date.now();

      if (lastY.current !== null && now - lastTriggerTime.current > cooldown) {
        const deltaY = y - lastY.current;

        if (tiltState.current === 'neutral' && deltaY > threshold) {
          tiltState.current = 'down'; // moved down
        } else if (tiltState.current === 'down' && deltaY < -threshold) {
          tiltState.current = 'up'; // moved back up
          lastTriggerTime.current = now;

          // Blur input to avoid iOS shake undo
          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
          }

          onShake();
          tiltState.current = 'neutral'; // reset
        }
      }

      lastY.current = y;
    };

    const requestPermission = async () => {
      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        try {
          const permission = await (DeviceMotionEvent as any).requestPermission();
          if (permission === 'granted') {
            window.addEventListener('devicemotion', handleMotion);
          }
        } catch (err) {
          console.error(err);
        }
      } else {
        window.addEventListener('devicemotion', handleMotion);
      }
    };

    requestPermission();
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [onShake, threshold, cooldown]);
}