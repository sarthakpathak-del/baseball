import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GameStage, PitchType, GameStats } from './src/types/types';

import ScoreBoard from './src/components/ScoreBoard';
import GameView from './src/components/GameView';
import ControlPanel from './src/components/ControlPanel';

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

  const [announceText, setAnnounceText] = useState<string>('GET READY');

  const [triggerSwing, setTriggerSwing] = useState(false);
  const [blowStrength, setBlowStrength] = useState(80);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (
      stage === GameStage.ResultStrike ||
      stage === GameStage.ResultHit ||
      stage === GameStage.ResultHomerun ||
      stage === GameStage.ResultFoul
    ) {
      timer = setTimeout(() => {
        setStage(GameStage.Resetting);
      }, 2600);
    }

    return () => clearTimeout(timer);
  }, [stage]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (stage === GameStage.Resetting) {
      setAnnounceText('NEXT PITCH');

      timer = setTimeout(() => {
        const all = [
          PitchType.Fastball,
          PitchType.Curveball,
          PitchType.Changeup,
        ];

        const next = all[Math.floor(Math.random() * all.length)];

        setPitchType(next);

        if (next === PitchType.Fastball) {
          setPitchSpeed(98);
        } else if (next === PitchType.Curveball) {
          setPitchSpeed(82);
        } else {
          setPitchSpeed(75);
        }

        setStage(GameStage.PitcherWindup);
      }, 1000);
    }

    return () => clearTimeout(timer);
  }, [stage]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (stage === GameStage.PitcherWindup) {
      setAnnounceText('PITCHER READY');

      timer = setTimeout(() => {
        setStage(GameStage.InFlight);
        setAnnounceText('SWING NOW');
      }, 1400);
    }

    return () => clearTimeout(timer);
  }, [stage]);

  const handleManualSwing = () => {
    setBlowStrength(90);
    setTriggerSwing(true);
  };

  const handleSwingResult = (
    isHit: boolean,
    distance?: number,
    direction?: string,
  ) => {
    if (isHit && distance) {
      if (distance >= 400) {
        setStage(GameStage.ResultHomerun);

        setAnnounceText(`💥 HOMERUN • ${direction} • ${distance} FT`);

        setStats(prev => ({
          ...prev,
          homeruns: prev.homeruns + 1,
          score: prev.score + 4,
          streak: prev.streak + 1,
          maxDistance: Math.max(prev.maxDistance, distance),
          totalPitches: prev.totalPitches + 1,
        }));
      } else {
        setStage(GameStage.ResultHit);

        setAnnounceText(`⚾ ${direction} • ${distance} FT`);

        setStats(prev => ({
          ...prev,
          singles: prev.singles + 1,
          score: prev.score + 1,
          streak: prev.streak + 1,
          maxDistance: Math.max(prev.maxDistance, distance),
          totalPitches: prev.totalPitches + 1,
        }));
      }
    } else {
      setStage(GameStage.ResultStrike);

      setAnnounceText('❌ STRIKE');

      setStats(prev => ({
        ...prev,
        strikes: prev.strikes + 1,
        streak: 0,
        totalPitches: prev.totalPitches + 1,
      }));
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />

      <View style={styles.header}>
        <Text style={styles.title}>⚾ MICRO SWING</Text>
        <Text style={styles.sub}>ARCADE BASEBALL</Text>
      </View>

      <ScoreBoard
        stats={stats}
        pitchType={pitchType}
        pitchSpeed={pitchSpeed}
      />

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
        micEnabled={false}
        setMicEnabled={() => {}}
        onManualSwing={handleManualSwing}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#020617',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  title: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 22,
  },
  sub: {
    color: '#64748b',
    fontSize: 10,
    marginTop: 3,
  },
});