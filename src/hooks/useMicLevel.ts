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

    let lastTriggerTime = 0;
    let isListening = true;

    const listener = (data: any) => {
      const decibel = data.value;
      
      if (decibel > -20) {
        const now = Date.now();
        if (now - lastTriggerTime > 750) {
          const levelPercent = Math.min(100, Math.max(30, Math.round(((decibel + 30) / 30) * 100)));
          onBlowTriggered(levelPercent);
          lastTriggerTime = now;
        }
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
