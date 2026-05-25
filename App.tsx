/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet, StatusBar, Dimensions } from 'react-native';
import { GameStage, PitchType, GameStats } from './src/types/types';
import ScoreBoard from './src/components/ScoreBoard';
import GameView from './src/components/GameView';
import ControlPanel from './src/components/ControlPanel';
import { useMicLevel } from './src/hooks/useMicLevel';

export default function App() {
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    homeruns: 0,
    singles: 0,
    doubles: 0,
    triples: 0,
    strikes: 0,
    balls: 0,
    streak: 0,
    maxDistance: 0,
    totalPitches: 0,
  });

  const [stage, setStage] = useState<GameStage>(GameStage.PitcherWindup);
  const [pitchType, setPitchType] = useState<PitchType>(PitchType.Fastball);
  const [pitchSpeed, setPitchSpeed] = useState<number>(92);
  const [announceText, setAnnounceText] = useState<string>('Get Ready...');

  const [micEnabled, setMicEnabled] = useState<boolean>(false);
  const [triggerSwing, setTriggerSwing] = useState<boolean>(false);
  const [blowStrength, setBlowStrength] = useState<number>(50);

  // Audio mic trigger via custom hook
  useMicLevel({
    enabled: micEnabled,
    onBlowTriggered: (strength: number) => {
      setBlowStrength(strength);
      setTriggerSwing(true);
    },
  });

  // State transitions management (Result to Resetting)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (
      stage === GameStage.ResultStrike ||
      stage === GameStage.ResultBall ||
      stage === GameStage.ResultFoul ||
      stage === GameStage.ResultHit ||
      stage === GameStage.ResultHomerun
    ) {
      timer = setTimeout(() => {
        setStage(GameStage.Resetting);
      }, 3500);
    }
    return () => clearTimeout(timer);
  }, [stage]);

  // Resetting to PitcherWindup transitions
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (stage === GameStage.Resetting) {
      setAnnounceText('Preparing next pitch...');
      timer = setTimeout(() => {
        const pitches = [PitchType.Fastball, PitchType.Curveball, PitchType.Changeup];
        const nextPitch = pitches[Math.floor(Math.random() * pitches.length)];
        setPitchType(nextPitch);

        let speedMph = 92;
        if (nextPitch === PitchType.Curveball) speedMph = 78;
        else if (nextPitch === PitchType.Changeup) speedMph = 70;
        setPitchSpeed(speedMph);

        setStage(GameStage.PitcherWindup);
      }, 1200);
    }
    return () => clearTimeout(timer);
  }, [stage]);

  // Windup to Pitch releases
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (stage === GameStage.PitcherWindup) {
      setAnnounceText('PITCHER WINDING UP...');
      timer = setTimeout(() => {
        setStage(GameStage.InFlight);
        setAnnounceText('PITCH RELEASED!');
      }, 1500);
    }
    return () => clearTimeout(timer);
  }, [stage]);

  const handleManualSwing = () => {
    setBlowStrength(80);
    setTriggerSwing(true);
  };

  const handleSwingResult = (isHit: boolean, distance?: number) => {
    if (isHit && distance) {
      if (distance >= 400) {
        setStage(GameStage.ResultHomerun);
        setAnnounceText(`☄️ HOMERUN! ${distance} FT`);
        setStats((prev) => ({
          ...prev,
          score: prev.score + prev.streak + 1,
          homeruns: prev.homeruns + 1,
          streak: prev.streak + 1,
          totalPitches: prev.totalPitches + 1,
          maxDistance: Math.max(prev.maxDistance, distance),
        }));
      } else {
        setStage(GameStage.ResultHit);
        setAnnounceText(`⚾ SOLID HIT! ${distance} FT`);
        setStats((prev) => ({
          ...prev,
          singles: prev.singles + 1,
          score: prev.score + 1,
          streak: prev.streak + 1,
          totalPitches: prev.totalPitches + 1,
          maxDistance: Math.max(prev.maxDistance, distance),
        }));
      }
    } else {
      setStage(GameStage.ResultStrike);
      setAnnounceText('❌ STRIKE!');
      setStats((prev) => ({
        ...prev,
        strikes: prev.strikes + 1 >= 3 ? 0 : prev.strikes + 1,
        streak: 0,
        totalPitches: prev.totalPitches + 1,
      }));
    }
  };

  return (
    <SafeAreaView style={styles.background}>
      <StatusBar barStyle="light-content" backgroundColor="#030712" />
      
      <View style={styles.header}>
        <Text style={styles.title}>⚾ MICRO-SWING</Text>
        <Text style={styles.subtitle}>PORTRAIT REACT NATIVE CLI MODE</Text>
      </View>

      <View style={styles.container}>
        <ScoreBoard stats={stats} pitchSpeed={pitchSpeed} pitchType={pitchType} />
        
        <GameView
          stage={stage}
          pitchType={pitchType}
          pitchSpeed={pitchSpeed}
          announceText={announceText}
          triggerSwing={triggerSwing}
          setTriggerSwing={setTriggerSwing}
          blowStrength={blowStrength}
          onSwingResult={handleSwingResult}
        />

        <ControlPanel
          micEnabled={micEnabled}
          setMicEnabled={setMicEnabled}
          onManualSwing={handleManualSwing}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#030712',
  },
  header: {
    alignItems: 'center',
    marginVertical: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 1.5,
  },
  subtitle: {
    fontSize: 9,
    fontFamily: 'monospace',
    color: '#64748b',
    marginTop: 2,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
});
