/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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
      <View style={styles.metricsWrapper}>
        {/* Score Column */}
        <View style={styles.metricColumn}>
          <Text style={styles.metricLabel}>SCORE</Text>
          <Text style={[styles.metricValue, { color: '#06b6d4' }]}>
            {stats.score}
          </Text>
        </View>

        {/* Homerun Column */}
        <View style={styles.metricColumn}>
          <Text style={styles.metricLabel}>HOMERS</Text>
          <Text style={[styles.metricValue, { color: '#ef4444' }]}>
            {stats.homeruns}
          </Text>
        </View>

        {/* Streak Column */}
        <View style={styles.metricColumn}>
          <Text style={styles.metricLabel}>STREAK</Text>
          <Text style={[styles.metricValue, { color: '#f59e0b' }]}>
            {stats.streak}
          </Text>
        </View>
      </View>

      {/* Speed Radar Panel */}
      <View style={styles.radarWrapper}>
        <Text style={styles.radarText}>
          PITCH: {pitchSpeed} MPH {pitchType?.toUpperCase()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0c1220',
    borderColor: '#27354a',
    borderWidth: 1.5,
    borderRadius: 8,
    padding: 10,
    width: '100%',
    marginBottom: 10,
  },
  metricsWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 6,
  },
  metricColumn: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: 'bold',
    color: '#94a3b8',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Courier-Bold' : 'monospace',
    fontWeight: 'bold',
  },
  radarWrapper: {
    borderTopColor: '#1e293b',
    borderTopWidth: 1,
    paddingTop: 4,
    alignItems: 'center',
  },
  radarText: {
    fontSize: 10,
    color: '#94a3b8',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: 'bold',
  },
});
