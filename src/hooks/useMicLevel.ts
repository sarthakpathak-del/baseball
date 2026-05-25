import { useState, useEffect } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import SoundLevel from 'react-native-sound-level';

interface UseMicLevelProps {
  enabled: boolean;
  onBlowTriggered: (strength: number) => void;
}

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
    SoundLevel.start();

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

    return () => {
      SoundLevel.stop();
    };
  }, [enabled, hasPermission, onBlowTriggered]);

  return { hasPermission };
}
