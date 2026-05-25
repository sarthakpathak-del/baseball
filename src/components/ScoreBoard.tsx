import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { GameStats, PitchType } from '../types/types';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props {
  stats: GameStats;
  pitchType: PitchType;
  pitchSpeed: number;
}

export default function ScoreBoard({
  stats,
  pitchType,
  pitchSpeed,
}: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.row}>
        <Stat label="SCORE" value={stats.score} />
        <Stat label="HR" value={stats.homeruns} />
        <Stat label="STREAK" value={stats.streak} />
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <Stat label="MAX" value={stats.maxDistance} />

        <View style={styles.pitchBox}>
          <Text style={styles.pitchSpeed}>{pitchSpeed}</Text>
          <Text style={styles.pitchType}>{pitchType}</Text>
        </View>

        <Stat label="STRIKE" value={stats.strikes} />
      </View>
    </SafeAreaView>
  );
}

function Stat({ label, value }: any) {
  return (
    <View style={styles.stat}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '95%',
    backgroundColor: 'rgba(15,23,42,0.95)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#1e293b',
    marginVertical: 8,
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  value: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 22,
  },
  label: {
    color: '#64748b',
    fontSize: 10,
  },
  pitchBox: {
    flex: 1,
    alignItems: 'center',
  },
  pitchSpeed: {
    color: '#facc15',
    fontSize: 22,
    fontWeight: 'bold',
  },
  pitchType: {
    color: '#cbd5e1',
    fontSize: 10,
  },
});