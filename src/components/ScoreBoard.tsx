import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { GameStats, PitchType } from '../types/types';

interface ScoreBoardProps {
  stats: GameStats;
  pitchSpeed: number;
  pitchType: PitchType;
}

export default function ScoreBoard({ stats, pitchSpeed, pitchType }: ScoreBoardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <StatCell label="SCORE" value={stats.score} accent />
        <StatCell label="HR" value={stats.homeruns} />
        <StatCell label="HITS" value={stats.singles} />
        <StatCell label="STREAK" value={stats.streak} accent />
      </View>
      <View style={styles.divider} />
      <View style={styles.row}>
        <StatCell label="STRIKES" value={stats.strikes} warn />
        <StatCell label="BALLS" value={stats.balls} />
        <View style={styles.pitchCell}>
          <Text style={styles.pitchSpeed}>{pitchSpeed} MPH</Text>
          <Text style={styles.pitchType}>{pitchType.toUpperCase()}</Text>
        </View>
        <StatCell label="MAX FT" value={stats.maxDistance} />
      </View>
    </View>
  );
}

function StatCell({ label, value, accent, warn }: { label: string; value: number; accent?: boolean; warn?: boolean }) {
  return (
    <View style={styles.statCell}>
      <Text style={[styles.statValue, accent && styles.accentValue, warn && styles.warnValue]}>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 380,
    backgroundColor: '#060e1e',
    borderColor: '#1e3a5f',
    borderWidth: 1.5,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#1e3a5f',
    marginVertical: 6,
  },
  statCell: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e2e8f0',
    fontFamily: Platform.OS === 'ios' ? 'Courier-Bold' : 'monospace',
  },
  accentValue: {
    color: '#38bdf8',
  },
  warnValue: {
    color: '#f87171',
  },
  statLabel: {
    fontSize: 8,
    color: '#64748b',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginTop: 1,
  },
  pitchCell: {
    alignItems: 'center',
    flex: 1,
  },
  pitchSpeed: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#facc15',
    fontFamily: Platform.OS === 'ios' ? 'Courier-Bold' : 'monospace',
  },
  pitchType: {
    fontSize: 8,
    color: '#64748b',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginTop: 1,
  },
});
