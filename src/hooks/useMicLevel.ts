/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import SoundLevel from 'react-native-sound-level';

interface UseMicLevelProps {
  enabled: boolean;
  onBlowTriggered: (strength: number) => void;
}

export function useMicLevel({ enabled, onBlowTriggered }: UseMicLevelProps) {
  const [hasPermission, setHasPermission] = useState<boolean>(false);

  // Request system microphone permissions
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
        // iOS handled automatically during initialization
        setHasPermission(true);
      }
    };

    if (enabled) {
      requestPermission();
    }
  }, [enabled]);

  // Hook SoundLevel listener of react-native-sound-level
  useEffect(() => {
    if (!enabled || !hasPermission) {
      return;
    }

    let lastTriggerTime = 0;

    // Start monitoring audio levels
    SoundLevel.start();

    const listener = (data: any) => {
      // SoundLevel returns frame decibel values: -160 (complete silence) to 0 (loudest)
      const decibel = data.value;
      
      if (decibel > -20) {
        const now = Date.now();
        // Cooldown period of 750ms between swings to let it cool down 
        if (now - lastTriggerTime > 750) {
          // Normalize sound level percent: -20 to 0dB becomes 40 to 100%
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
