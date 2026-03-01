import { useEffect, useCallback, useRef } from 'react';

interface ShakeDetectionOptions {
  threshold?: number;
  timeout?: number;
}

export function useShakeDetection(
  onShake: () => void,
  options: ShakeDetectionOptions = {}
) {
  const { threshold = 15, timeout = 500 } = options;
  const lastShakeTime = useRef<number>(0);

  const handleMotion = useCallback(
    (event: DeviceMotionEvent) => {
      const acceleration = event.accelerationIncludingGravity;
      if (!acceleration) return;

      const { x, y, z } = acceleration;
      if (x === null || y === null || z === null) return;

      // Calculate total acceleration magnitude
      const acceleration_magnitude = Math.sqrt(x * x + y * y + z * z);

      // Detect shake if acceleration exceeds threshold
      if (acceleration_magnitude > threshold) {
        const now = Date.now();
        // Prevent multiple triggers within timeout period
        if (now - lastShakeTime.current > timeout) {
          lastShakeTime.current = now;
          onShake();
        }
      }
    },
    [onShake, threshold, timeout]
  );

  useEffect(() => {
    // Request permission for iOS 13+ devices
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
          console.error('Error requesting motion permission:', error);
        }
      } else {
        // Non-iOS 13+ devices
        window.addEventListener('devicemotion', handleMotion);
      }
    };

    requestPermission();

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [handleMotion]);
}