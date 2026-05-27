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

export default function ScoreBoard({ stats }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.leftIcon}>
        <Text style={styles.icon}>⚾</Text>
      </View>

      <View style={styles.scoreWrap}>
        <Text style={styles.score}>{stats.home} - {stats.away}</Text>
      </View>

      <View style={styles.rightWrap}>
        <Text style={styles.smallLabel}>INNING</Text>
        <View style={styles.inningRow}>
          <View style={styles.pill}><Text style={styles.pillText}>TOP 9</Text></View>
          <Text style={styles.gear}>⚙️</Text>
        </View>
        <View style={styles.dotsRow}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '95%',
    alignSelf: 'center',
    backgroundColor: 'rgba(15,23,42,0.95)',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#0ea5b7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  icon: {
    fontSize: 18,
  },
  scoreWrap: {
    flex: 1,
    alignItems: 'center',
  },
  score: {
    color: 'white',
    fontWeight: '800',
    fontSize: 36,
  },
  rightWrap: {
    width: 140,
    alignItems: 'flex-end',
  },
  smallLabel: {
    color: '#94a3b8',
    fontSize: 10,
    marginBottom: 6,
  },
  inningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pill: {
    backgroundColor: '#16a34a',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  pillText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 12,
  },
  gear: {
    fontSize: 18,
    marginLeft: 6,
  },
  dotsRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: '#334155',
  },
  dotActive: {
    backgroundColor: '#fda4af',
  },
});
