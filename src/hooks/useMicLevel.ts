import { useState, useEffect } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import SoundLevel from 'react-native-sound-level';

interface UseMicLevelProps {
  enabled: boolean;
  onBlowTriggered: (strength: number) => void;
}

const catchNativeError = (
  result: unknown,
  onError: (err: unknown) => void,
) => {
  if (
    result &&
    typeof result === 'object' &&
    'catch' in result &&
    typeof result.catch === 'function'
  ) {
    result.catch(onError);
  }
};

export function useMicLevel({ enabled, onBlowTriggered }: UseMicLevelProps) {
  const [hasPermission, setHasPermission] = useState<boolean>(false);

  useEffect(() => {
    const requestPermission = async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            {
              title: 'Microphone Permission',
              message: 'MicroSwing Baseball needs your mic to register blow-swings.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          setHasPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
        } catch (err) {
          console.warn('Android permission error:', err);
        }
      } else {
        setHasPermission(true);
      }
    };

    if (enabled) {
      requestPermission();
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !hasPermission) {
      return;
    }

    // Lower latency blow detection: peak window + adaptive noise floor.
    const COOLDOWN_MS = 300;
    const ABS_THRESHOLD_DB = -28; // easier for "blow" than -20
    const RISE_THRESHOLD_DB = 10; // trigger when above noise floor by this delta

    let noiseFloorDb = -45;
    let lastTriggerTime = 0;
    let isListening = true;

    // track a tiny burst window (react-native-sound-level frame rate varies)
    let windowMaxDb = -Infinity;
    let windowStartTs = Date.now();
    const WINDOW_MS = 220;

    const listener = (data: any) => {
      const decibelRaw = data?.value;
      const decibel =
        typeof decibelRaw === 'number' ? decibelRaw : Number(decibelRaw);

      if (!Number.isFinite(decibel)) {
        return;
      }

      const now = Date.now();

      // Update noise floor (EMA). Smaller alpha = smoother, slower adaptation.
      const alpha = decibel < noiseFloorDb ? 0.06 : 0.02;
      noiseFloorDb =
        noiseFloorDb + (decibel - noiseFloorDb) * alpha;

      // Update peak window
      if (now - windowStartTs > WINDOW_MS) {
        windowStartTs = now;
        windowMaxDb = decibel;
      } else {
        windowMaxDb = Math.max(windowMaxDb, decibel);
      }

      const aboveNoise = windowMaxDb - noiseFloorDb >= RISE_THRESHOLD_DB;
      const aboveAbs = decibel >= ABS_THRESHOLD_DB;

      // Trigger on a peak (fast), then cooldown prevents double-triggers.
      if ((aboveNoise || aboveAbs) && now - lastTriggerTime > COOLDOWN_MS) {
        const levelPercent = Math.min(
          100,
          Math.max(30, Math.round(((decibel + 40) / 40) * 100)),
        );

        onBlowTriggered(levelPercent);
        lastTriggerTime = now;

        // reset window so the next blow isn't delayed by stale peak
        windowStartTs = now;
        windowMaxDb = -Infinity;
      }
    };

    SoundLevel.onNewFrame = listener;
    catchNativeError(
      SoundLevel.start(),
      (err: unknown) => {
        if (isListening) {
          console.warn('Microphone monitor failed to start:', err);
          setHasPermission(false);
        }
      },
    );

    return () => {
      isListening = false;
      SoundLevel.onNewFrame = () => {};
      catchNativeError(
        SoundLevel.stop(),
        (err: unknown) => {
          console.warn('Microphone monitor failed to stop:', err);
        },
      );
    };
  }, [enabled, hasPermission, onBlowTriggered]);


  return { hasPermission };
}
