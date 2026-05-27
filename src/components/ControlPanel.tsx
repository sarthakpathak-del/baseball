import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ControlPanelProps {
  micEnabled: boolean;
  setMicEnabled: (val: boolean) => void;
  hasMicPermission: boolean;
  onManualSwing: () => void;
  canSwing: boolean;
}

export default function ControlPanel({
  micEnabled,
  setMicEnabled,
  hasMicPermission,
  onManualSwing,
  canSwing,
}: ControlPanelProps) {
  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setMicEnabled(!micEnabled)}
        style={[
          styles.micButton,
          {
            borderColor: micEnabled
              ? '#22c55e'
              : '#64748b',
            backgroundColor: micEnabled
              ? 'rgba(34,197,94,0.12)'
              : 'transparent',
          },
        ]}
      >
        <Text style={styles.micIcon}>🎤</Text>
        <View>
          <Text style={styles.micLabel}>
            {micEnabled
              ? 'Blow into phone to swing'
              : 'Tap to enable mic'}
          </Text>
          <Text
            style={[
              styles.micStatus,
              {
                color: micEnabled
                  ? '#16a34a'
                  : '#f59e0b',
              },
            ]}
          >
            {micEnabled
              ? hasMicPermission
                ? 'Mic enabled'
                : 'Waiting for permission'
              : 'Mic is off'}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        id="btn-big-swing"
        onPress={onManualSwing}
        disabled={!canSwing}
        activeOpacity={0.8}
        style={[
          styles.swingBtn,
          !canSwing && styles.swingBtnDisabled,
        ]}
      >
        <Text style={styles.swingBtnText}>
          {canSwing ? '🔥 BIG SWING!' : 'WAIT FOR PITCH'}
        </Text>
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
  swingBtnDisabled: {
    backgroundColor: '#475569',
    opacity: 0.65,
  },
  swingBtnText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
