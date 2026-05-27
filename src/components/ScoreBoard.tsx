import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

import { GameStats } from '../types/types';

interface Props {
  stats: GameStats;
  pitchSpeed: number;
  timeText: string;
}

export default function ScoreBoard({
  stats,
  pitchSpeed,
  timeText,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <Text style={styles.baseball}>⚾</Text>
      </View>

      <View style={styles.centerSection}>
        <Text style={styles.scoreLabel}>
          SCORE
        </Text>

        <Text style={styles.score}>
          {stats.score}
        </Text>
      </View>

      <View style={styles.rightSection}>
        <View style={styles.timerBox}>
          <Text style={styles.timerText}>
            ⏱ {timeText}
          </Text>
        </View>

        <View style={styles.speedBox}>
          <Text style={styles.speedText}>
            {pitchSpeed} MPH
          </Text>
        </View>

        <View style={styles.strikeRow}>
          <Text style={styles.strikeLabel}>
            S
          </Text>

          {[0, 1, 2].map(index => (
            <View
              key={index}
              style={[
                styles.dot,
                index < stats.strikes &&
                  styles.dotActive,
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '95%',
    height: 115,

    backgroundColor:
      'rgba(71, 102, 133, 0.88)',

    borderRadius: 24,

    paddingHorizontal: 18,
    paddingVertical: 14,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.35,
    shadowRadius: 12,

    elevation: 10,

    marginBottom: 8,
  },

  leftSection: {
    width: 56,
    height: 56,

    borderRadius: 16,

    backgroundColor:
      'rgba(255,255,255,0.08)',

    alignItems: 'center',
    justifyContent: 'center',
  },

  baseball: {
    fontSize: 30,
  },

  centerSection: {
    flex: 1,
    alignItems: 'center',
  },

  scoreLabel: {
    color: '#d4d4d4',
    fontSize: 13,
    letterSpacing: 2,
    marginBottom: -2,
  },

  score: {
    color: 'white',
    fontSize: 64,
    fontWeight: '900',
    lineHeight: 68,
  },

  rightSection: {
    width: 125,
    alignItems: 'flex-end',
  },

  timerBox: {
    backgroundColor:
      'rgba(0,0,0,0.25)',

    paddingHorizontal: 12,
    paddingVertical: 6,

    borderRadius: 10,

    marginBottom: 8,
  },

  timerText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },

  speedBox: {
    backgroundColor: '#2f6f31',

    paddingHorizontal: 14,
    paddingVertical: 8,

    borderRadius: 10,
  },

  speedText: {
    color: '#dcfce7',
    fontSize: 14,
    fontWeight: '800',
  },

  strikeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },

  strikeLabel: {
    color: '#e5e7eb',
    fontWeight: '700',
    marginRight: 6,
    fontSize: 12,
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: 10,

    backgroundColor:
      'rgba(255,255,255,0.18)',

    marginHorizontal: 3,
  },

  dotActive: {
    backgroundColor: '#fda4af',
  },
});