

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ControlPanelProps {
  micEnabled: boolean;
  setMicEnabled: (val: boolean) => void;
  onManualSwing: () => void;
}

export default function ControlPanel({
  micEnabled,
  setMicEnabled,
  onManualSwing,
}: ControlPanelProps) {
  return (
    <SafeAreaView style={styles.container}>
      {/* <TouchableOpacity
        id="btn-mic-toggle"
        onPress={() => setMicEnabled(!micEnabled)}
        style={[
          styles.micButton,
          {
            borderColor: micEnabled ? '#10b981' : '#475569',
            backgroundColor: micEnabled ? 'rgba(16, 185, 129, 0.15)' : 'rgba(71, 85, 105, 0.1)',
          },
        ]}
      >
        <Text style={[styles.micIcon, { color: micEnabled ? '#34d399' : '#94a3b8' }]}>🎤</Text>
        {/* <Text style={styles.micLabel}>MIC DETECTOR:</Text> */}
        {/* <Text style={[styles.micStatus, { color: micEnabled ? '#10b981' : '#ef4444' }]}>
          {micEnabled ? 'ON' : 'OFF'}
        </Text>
      </TouchableOpacity> */} 

     <TouchableOpacity
        id="btn-big-swing"
        onPress={onManualSwing}
        activeOpacity={0.8}
        style={styles.swingBtn}
      >
        <Text style={styles.swingBtnText}>🔥 BIG SWING!</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  micButton: {
    width: '100%',
    maxWidth: 300,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderRadius: 8,
    gap: 8,
  },
  micIcon: {
    fontSize: 16,
  },
  micLabel: {
    color: '#cbd5e1',
    fontWeight: '600',
    fontSize: 12,
  },
  micStatus: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  swingBtn: {
    width: '100%',
    maxWidth: 300,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  swingBtnText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
