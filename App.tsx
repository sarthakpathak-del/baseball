import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
 StyleSheet,
  StatusBar,
  Modal,
  TouchableOpacity,
  Vibration,
  Dimensions,
} from 'react-native';

import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  GameStage,
  PitchType,
  GameStats,
  SwingResultReason,
} from './src/types/types';

import ScoreBoard from './src/components/ScoreBoard';
import GameView from './src/components/GameView';
import ControlPanel from './src/components/ControlPanel';
import StadiumBackground from './src/components/StadiumBackground';

import { useMicLevel } from './src/hooks/useMicLevel';

import Sound from 'react-native-sound';

const { width, height } = Dimensions.get('window');

const INITIAL_STATS: GameStats = {
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
};

const GAME_DURATION_SECONDS = 60;

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default function App() {
  const [stats, setStats] = useState<GameStats>(INITIAL_STATS);

  const cheerSoundRef = useRef<Sound | null>(null);

  const [stage, setStage] = useState<GameStage>(
    GameStage.PitcherWindup,
  );

  const [pitchType, setPitchType] =
    useState<PitchType>(PitchType.Fastball);

  const [pitchSpeed, setPitchSpeed] =
    useState<number>(92);

  const [announceText, setAnnounceText] =
    useState<string>('GET READY');

  const [triggerSwing, setTriggerSwing] =
    useState(false);

  const [blowStrength, setBlowStrength] =
    useState(80);

  const [micEnabled, setMicEnabled] =
    useState(false);

  const [timeRemaining, setTimeRemaining] =
    useState(GAME_DURATION_SECONDS);

  const [showEndModal, setShowEndModal] =
    useState(false);

  const handleBlowTriggered = (
    strength: number,
  ) => {
    if (stage !== GameStage.InFlight) {
      return;
    }

    setBlowStrength(strength);
    setTriggerSwing(true);
  };

  const { hasPermission } = useMicLevel({
    enabled: micEnabled,
    onBlowTriggered: handleBlowTriggered,
  });

  useEffect(() => {
    Sound.setCategory('Playback', true);

    const cheerSound = new Sound(
      'cheer.wav',
      Sound.MAIN_BUNDLE,
      (error: unknown) => {
        if (error) {
          console.warn(
            'Failed to load homerun cheer:',
            error,
          );
        }
      },
    );

    cheerSoundRef.current = cheerSound;

    return () => {
      cheerSound.release();
      cheerSoundRef.current = null;
    };
  }, []);

  const playHomerunCheer = () => {
    const cheerSound = cheerSoundRef.current;

    if (!cheerSound || !cheerSound.isLoaded()) {
      return;
    }

    cheerSound.stop(() => {
      cheerSound.setCurrentTime(0);
      cheerSound.play();
    });
  };

  const vibrateStrike = () => {
    Vibration.vibrate(90);
  };

  const vibrateOut = () => {
    Vibration.vibrate([0, 140, 80, 220]);
  };

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

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
    if (
      stage === GameStage.ResultOut ||
      stage === GameStage.GameOver ||
      timeRemaining <= 0
    ) {
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev =>
        Math.max(0, prev - 1),
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [stage, timeRemaining]);

  useEffect(() => {
    if (
      timeRemaining > 0 ||
      stage === GameStage.GameOver ||
      stage === GameStage.ResultOut
    ) {
      return;
    }

    setTriggerSwing(false);
    setAnnounceText('GAME OVER');
    setStage(GameStage.GameOver);
    setShowEndModal(true);
  }, [stage, timeRemaining]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (stage === GameStage.Resetting) {
      setAnnounceText('NEXT PITCH');

      timer = setTimeout(() => {
        const all = [
          PitchType.Fastball,
          PitchType.Curveball,
          PitchType.Changeup,
        ];

        const next =
          all[Math.floor(Math.random() * all.length)];

        setPitchType(next);

        if (next === PitchType.Fastball) {
          setPitchSpeed(98);
        } else if (
          next === PitchType.Curveball
        ) {
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
    let timer: ReturnType<typeof setTimeout>;

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
    if (stage !== GameStage.InFlight) {
      return;
    }

    setBlowStrength(90);
    setTriggerSwing(true);
  };

  const handlePlayAgain = () => {
    setStats(INITIAL_STATS);
    setPitchType(PitchType.Fastball);
    setPitchSpeed(92);
    setAnnounceText('GET READY');
    setTriggerSwing(false);
    setBlowStrength(80);
    setTimeRemaining(GAME_DURATION_SECONDS);
    setShowEndModal(false);
    setStage(GameStage.PitcherWindup);
  };

  const handleExitGame = () => {
    setTriggerSwing(false);
    setAnnounceText('GAME OVER');
    setShowEndModal(false);
    setStage(GameStage.GameOver);
  };

  const handleSwingResult = (
    isHit: boolean,
    distance?: number,
    direction?: string,
    reason: SwingResultReason = isHit
      ? 'hit'
      : 'miss',
  ) => {
    if (isHit && distance) {
      if (distance >= 400) {
        setStage(GameStage.ResultHomerun);

        playHomerunCheer();

        setAnnounceText(
          `💥 HOMERUN • ${direction} • ${distance} FT`,
        );

        setStats(prev => ({
          ...prev,
          homeruns: prev.homeruns + 1,
          score: prev.score + 4,
          streak: prev.streak + 1,
          strikes: 0,
          maxDistance: Math.max(
            prev.maxDistance,
            distance,
          ),
          totalPitches:
            prev.totalPitches + 1,
        }));
      } else {
        setStage(GameStage.ResultHit);

        setAnnounceText(
          `⚾ ${direction} • ${distance} FT`,
        );

        setStats(prev => ({
          ...prev,
          singles: prev.singles + 1,
          score: prev.score + 1,
          streak: prev.streak + 1,
          strikes: 0,
          maxDistance: Math.max(
            prev.maxDistance,
            distance,
          ),
          totalPitches:
            prev.totalPitches + 1,
        }));
      }
    } else if (reason === 'fieldedOut') {
      setStage(GameStage.ResultOut);

      setShowEndModal(true);

      vibrateOut();

      setAnnounceText(
        `YOU ARE OUT • ${
          direction ?? 'FIELDER'
        }`,
      );

      setStats(prev => ({
        ...prev,
        strikes: 0,
        streak: 0,
        totalPitches:
          prev.totalPitches + 1,
      }));
    } else {
      const nextStrikes =
        stats.strikes + 1;

      const isStrikeout =
        nextStrikes >= 3;

      setStage(
        isStrikeout
          ? GameStage.ResultOut
          : GameStage.ResultStrike,
      );

      setShowEndModal(isStrikeout);

      if (isStrikeout) {
        vibrateOut();
      } else {
        vibrateStrike();
      }

      setAnnounceText(
        isStrikeout
          ? 'YOU ARE OUT'
          : `❌ STRIKE ${nextStrikes}`,
      );

      setStats(prev => ({
        ...prev,
        strikes: isStrikeout
          ? 0
          : nextStrikes,
        streak: 0,
        totalPitches:
          prev.totalPitches + 1,
      }));
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView
        edges={['top', 'right', 'bottom', 'left']}
        style={styles.root}
      >
        <StatusBar
          barStyle="light-content"
          backgroundColor="black"
        />

        <StadiumBackground
          width={width}
          height={height}
        />

        <View style={styles.overlay}>
          <ScoreBoard
            stats={stats}
            pitchType={pitchType}
            pitchSpeed={pitchSpeed}
            timeText={formatTime(
              timeRemaining,
            )}
          />

          <GameView
            stage={stage}
            pitchType={pitchType}
            pitchSpeed={pitchSpeed}
            announceText={announceText}
            triggerSwing={triggerSwing}
            setTriggerSwing={
              setTriggerSwing
            }
            blowStrength={blowStrength}
            onSwingResult={
              handleSwingResult
            }
          />

          <ControlPanel
            micEnabled={micEnabled}
            setMicEnabled={
              setMicEnabled
            }
            hasMicPermission={
              hasPermission
            }
            onManualSwing={
              handleManualSwing
            }
            canSwing={
              stage ===
              GameStage.InFlight
            }
          />
        </View>

        <Modal
          visible={showEndModal}
          transparent
          animationType="fade"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>
                {stage ===
                GameStage.ResultOut
                  ? 'YOU ARE OUT'
                  : 'GAME OVER'}
              </Text>

              <Text style={styles.modalSub}>
                Score {stats.score} •
                Pitches{' '}
                {stats.totalPitches}
              </Text>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleExitGame}
                  style={[
                    styles.modalButton,
                    styles.exitButton,
                  ]}
                >
                  <Text
                    style={
                      styles.exitButtonText
                    }
                  >
                    EXIT
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handlePlayAgain}
                  style={[
                    styles.modalButton,
                    styles.playButton,
                  ]}
                >
                  <Text
                    style={
                      styles.playButtonText
                    }
                  >
                    PLAY AGAIN
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'black',
  },

  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 12,
  },



  modalOverlay: {
    flex: 1,
    backgroundColor:
      'rgba(2,6,23,0.78)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#0f172a',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
  },

  modalTitle: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: 'bold',
  },

  modalSub: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 8,
    marginBottom: 18,
  },

  modalActions: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
  },

  modalButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  exitButton: {
    borderColor: '#64748b',
    borderWidth: 1,
    backgroundColor: 'transparent',
  },

  playButton: {
    backgroundColor: '#22c55e',
  },

  exitButtonText: {
    color: '#cbd5e1',
    fontWeight: 'bold',
    fontSize: 13,
  },

  playButtonText: {
    color: '#052e16',
    fontWeight: 'bold',
    fontSize: 13,
  },
});