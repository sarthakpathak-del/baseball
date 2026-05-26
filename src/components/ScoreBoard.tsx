import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { GameStats, PitchType } from '../types/types';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props {
  stats: GameStats;
  pitchType: PitchType;
  pitchSpeed: number;
  timeText: string;
}

export default function ScoreBoard({
  stats,
  pitchType,
  pitchSpeed,
  timeText,
}: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <Stat label="SCORE" value={stats.score} emphasis />

      <View style={styles.pitchBox}>
        <Text style={styles.pitchSpeed}>{pitchSpeed}</Text>
        <Text style={styles.pitchType}>{pitchType}</Text>
      </View>

      <Stat label="STRIKES" value={`${stats.strikes}/3`} />
      <Stat label="TIME" value={timeText} warning />
    </SafeAreaView>
  );
}

function Stat({
  label,
  value,
  emphasis,
  warning,
}: {
  label: string;
  value: string | number;
  emphasis?: boolean;
  warning?: boolean;
}) {
  return (
    <View style={styles.stat}>
      <Text
        style={[
          styles.value,
          emphasis && styles.valueEmphasis,
          warning && styles.valueWarning,
        ]}
      >
        {value}
      </Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '95%',
    backgroundColor: 'rgba(15,23,42,0.95)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  value: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  valueEmphasis: {
    fontSize: 22,
  },
  valueWarning: {
    color: '#facc15',
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
    fontSize: 20,
    fontWeight: 'bold',
  },
  pitchType: {
    color: '#cbd5e1',
    fontSize: 10,
  },
});
