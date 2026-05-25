import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Platform, TouchableOpacity } from 'react-native';
import Svg, { Rect, Circle, Path, Ellipse, G } from 'react-native-svg';
import { GameStage, PitchType } from '../types/types';
import StadiumBackground from './StadiumBackground';

interface GameViewProps {
  stage: GameStage;
  pitchType: PitchType;
  pitchSpeed: number;
  announceText: string;
  triggerSwing: boolean;
  setTriggerSwing: (val: boolean) => void;
  blowStrength: number;
  onSwingResult: (isHit: boolean, distance?: number) => void;
}

const CANVAS_WIDTH  = 380;
const CANVAS_HEIGHT = 480;

// Pitcher on mound (center of canvas, ~55% down)
const DEFAULT_PITCHER_X = CANVAS_WIDTH  * 0.50;
const DEFAULT_PITCHER_Y = CANVAS_HEIGHT * 0.52;

// Home plate (center, ~82% down)
const DEFAULT_PLATE_X = CANVAS_WIDTH  * 0.50;
const DEFAULT_PLATE_Y = CANVAS_HEIGHT * 0.82;

export default function GameView({
  stage,
  pitchType,
  pitchSpeed,
  announceText,
  triggerSwing,
  setTriggerSwing,
  blowStrength,
  onSwingResult,
}: GameViewProps) {
  const pitchProgress = useRef(new Animated.Value(0)).current;
  const swingRotation = useRef(new Animated.Value(-50)).current;

  const [pitcherX, setPitcherX] = useState<number>(DEFAULT_PITCHER_X);
  const [pitcherY, setPitcherY] = useState<number>(DEFAULT_PITCHER_Y);
  const [plateX,   setPlateX]   = useState<number>(DEFAULT_PLATE_X);
  const [plateY,   setPlateY]   = useState<number>(DEFAULT_PLATE_Y);

  const [calibratorVisible, setCalibratorVisible] = useState<boolean>(false);

  const [ballX,     setBallX]     = useState<number>(0);
  const [ballY,     setBallY]     = useState<number>(0);
  const [ballScale, setBallScale] = useState<number>(0);

  // ── Pitch animation ──────────────────────────────────────────────────
  useEffect(() => {
    if (stage === GameStage.InFlight) {
      pitchProgress.setValue(0);
      Animated.timing(pitchProgress, {
        toValue: 1,
        duration: 1700,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished) onSwingResult(false);
      });
    } else {
      pitchProgress.stopAnimation();
    }
  }, [stage]);

  // ── Ball position listener ───────────────────────────────────────────
  useEffect(() => {
    const listenerId = pitchProgress.addListener(({ value }) => {
      const startX = pitcherX;
      const startY = pitcherY - 10;
      const endX   = plateX;
      const endY   = plateY - 30;

      const currentX = startX + (endX - startX) * value;
      const currentY = startY + (endY - startY) * value;
      const scale    = 3 + 11 * value;

      setBallX(currentX);
      setBallY(currentY);
      setBallScale(scale);
    });
    return () => pitchProgress.removeListener(listenerId);
  }, [pitchProgress, pitcherX, pitcherY, plateX, plateY]);

  // ── Swing handler ────────────────────────────────────────────────────
  useEffect(() => {
    if (!triggerSwing) return;
    setTriggerSwing(false);

    swingRotation.setValue(-50);
    Animated.timing(swingRotation, {
      toValue: 120,
      duration: 150,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        Animated.timing(swingRotation, {
          toValue: -50,
          duration: 150,
          easing: Easing.linear,
          useNativeDriver: true,
        }).start();
      }
    });

    const p = (pitchProgress as any).__getValue();
    const isPerfectContact = p >= 0.86 && p <= 0.98;

    if (isPerfectContact && stage === GameStage.InFlight) {
      const basePower   = blowStrength;
      const randomBonus = Math.floor(Math.random() * 80);
      const distance    = Math.round(150 + basePower * 2.8 + randomBonus);
      onSwingResult(true, distance);
    }
  }, [triggerSwing, blowStrength, pitcherX, pitcherY, plateX, plateY, stage]);

  const spinAngle = swingRotation.interpolate({
    inputRange: [-50, 120],
    outputRange: ['-50deg', '120deg'],
  });

  const isPitchingView =
    stage === GameStage.PitcherWindup ||
    stage === GameStage.InFlight      ||
    stage === GameStage.ResultStrike  ||
    stage === GameStage.ResultBall    ||
    stage === GameStage.ResultFoul    ||
    stage === GameStage.Resetting;

  const fieldDepth  = plateY - pitcherY;
  const figureScale = Math.max(0.55, fieldDepth / 110);

  const pitcherFigH  = Math.round(22 * figureScale);
  const pitcherFigW  = Math.round(10 * figureScale);
  const pitcherHeadR = Math.round(4  * figureScale);

  const batterFigH   = Math.round(26 * figureScale);
  const batterFigW   = Math.round(12 * figureScale);
  const batterHeadR  = Math.round(5  * figureScale);

  return (
    <View style={styles.outerContainer}>
      <View style={styles.canvasWrapper}>

        {/* ── Custom SVG stadium background ──────────────────────── */}
        <StadiumBackground width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />

        {/* ── SVG game overlay ───────────────────────────────────── */}
        <Svg width={CANVAS_WIDTH} height={CANVAS_HEIGHT} style={StyleSheet.absoluteFill}>
          {isPitchingView && (
            <G>
              {/* Pitcher shadow */}
              <Ellipse
                cx={pitcherX}
                cy={pitcherY + pitcherFigH * 0.55}
                rx={pitcherFigW * 1.4}
                ry={pitcherFigW * 0.45}
                fill="rgba(0,0,0,0.35)"
              />
              {/* Pitcher jersey */}
              <Rect
                x={pitcherX - pitcherFigW / 2}
                y={pitcherY - pitcherFigH * 0.1}
                width={pitcherFigW}
                height={pitcherFigH * 0.65}
                rx={pitcherFigW * 0.3}
                fill="#ef4444"
                stroke="#991b1b"
                strokeWidth="1"
              />
              {/* Pitcher head */}
              <Circle
                cx={pitcherX}
                cy={pitcherY - pitcherFigH * 0.18}
                r={pitcherHeadR}
                fill="#fbcfe8"
                stroke="#1e293b"
                strokeWidth="0.8"
              />
              {/* Glove */}
              <Circle
                cx={pitcherX - pitcherFigW * 0.9}
                cy={pitcherY + pitcherFigH * 0.05}
                r={pitcherHeadR * 0.75}
                fill="#b45309"
              />

              {/* Strike zone */}
              <Rect
                x={plateX - 20}
                y={plateY - 80}
                width="40"
                height="60"
                stroke="rgba(6,182,212,0.60)"
                strokeWidth="1.5"
                fill="rgba(6,182,212,0.04)"
                strokeDasharray="4,3"
              />

              {/* Home plate pentagon */}
              <Path
                d={`M ${plateX} ${plateY}
                    L ${plateX + 11} ${plateY + 6}
                    L ${plateX + 7}  ${plateY + 14}
                    L ${plateX - 7}  ${plateY + 14}
                    L ${plateX - 11} ${plateY + 6} Z`}
                fill="rgba(255,255,255,0.90)"
                stroke="#475569"
                strokeWidth="1.2"
              />

              {/* Batter shadow */}
              <Ellipse
                cx={plateX + batterFigW * 0.9}
                cy={plateY - batterFigH * 0.1 + batterFigH * 0.55}
                rx={batterFigW * 1.3}
                ry={batterFigW * 0.4}
                fill="rgba(0,0,0,0.30)"
              />
              {/* Batter torso */}
              <Rect
                x={plateX + batterFigW * 0.35}
                y={plateY - batterFigH * 0.1}
                width={batterFigW}
                height={batterFigH * 0.62}
                rx={batterFigW * 0.3}
                fill="#0284c7"
                stroke="#0369a1"
                strokeWidth="1"
              />
              {/* Batter head */}
              <Circle
                cx={plateX + batterFigW * 0.85}
                cy={plateY - batterFigH * 0.28}
                r={batterHeadR}
                fill="#fed7aa"
                stroke="#0284c7"
                strokeWidth="1"
              />

              {/* Flying baseball */}
              {stage === GameStage.InFlight && (
                <G>
                  <Circle cx={ballX} cy={ballY} r={ballScale} fill="#ffffff" />
                  <Path
                    d={`M ${ballX - ballScale * 0.4} ${ballY - ballScale * 0.55}
                        Q ${ballX} ${ballY}
                          ${ballX - ballScale * 0.4} ${ballY + ballScale * 0.55}`}
                    stroke="#ef4444" strokeWidth="0.9" fill="none"
                  />
                  <Path
                    d={`M ${ballX + ballScale * 0.4} ${ballY - ballScale * 0.55}
                        Q ${ballX} ${ballY}
                          ${ballX + ballScale * 0.4} ${ballY + ballScale * 0.55}`}
                    stroke="#ef4444" strokeWidth="0.9" fill="none"
                  />
                </G>
              )}
            </G>
          )}

          {!isPitchingView && (
            <G>
              <Rect
                x="0" y={CANVAS_HEIGHT * 0.62}
                width={CANVAS_WIDTH} height={CANVAS_HEIGHT * 0.38}
                fill="rgba(6,78,59,0.20)"
              />
            </G>
          )}
        </Svg>

        {/* ── Animated bat ───────────────────────────────────────── */}
        {isPitchingView && (
          <Animated.View
            style={[
              styles.woodenBat,
              {
                left: plateX + batterFigW * 0.35 - 3,
                top:  plateY - batterFigH * 0.1 - 20,
                transform: [{ rotate: spinAngle }],
              },
            ]}
          />
        )}

        {/* ── Outfield markers ───────────────────────────────────── */}
        {!isPitchingView && (
          <>
            <Text style={styles.svgLabelLeft}>LF 330 FT</Text>
            <Text style={styles.svgLabelCenter}>WALL 400 FT</Text>
            <Text style={styles.svgLabelRight}>RF 330 FT</Text>
          </>
        )}

        {/* ── Announcement banner ────────────────────────────────── */}
        <View style={styles.bannerWrapper}>
          <Text style={styles.bannerText}>{announceText.toUpperCase()}</Text>
        </View>
      </View>

      {/* ── Calibration panel ──────────────────────────────────────── */}
      <View style={styles.tuningOuterPanel}>
        <TouchableOpacity
          onPress={() => setCalibratorVisible(!calibratorVisible)}
          style={styles.calibrateHeaderBtn}
        >
          <Text style={styles.calibrateHeaderTxt}>
            {calibratorVisible ? '▲ HIDE CALIBRATOR' : '⚙ CALIBRATE PLAYER POSITIONS'}
          </Text>
        </TouchableOpacity>

        {calibratorVisible && (
          <View style={styles.controlsTuningGrid}>
            <Text style={styles.calibInstruction}>
              Tap arrows to position Pitcher and Batter on the mound and plate.
            </Text>

            <View style={styles.tuningSection}>
              <Text style={styles.sectionLabel}>
                PITCHER: ({Math.round(pitcherX)}, {Math.round(pitcherY)})
              </Text>
              <View style={styles.arrowsRow}>
                <TouchableOpacity onPress={() => setPitcherX(p => p - 4)} style={styles.arrowBtn}>
                  <Text style={styles.arrowLabel}>◀</Text>
                </TouchableOpacity>
                <View style={styles.verticalArrows}>
                  <TouchableOpacity onPress={() => setPitcherY(p => p - 4)} style={styles.arrowBtn}>
                    <Text style={styles.arrowLabel}>▲</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setPitcherY(p => p + 4)} style={styles.arrowBtn}>
                    <Text style={styles.arrowLabel}>▼</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => setPitcherX(p => p + 4)} style={styles.arrowBtn}>
                  <Text style={styles.arrowLabel}>▶</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.tuningSection}>
              <Text style={styles.sectionLabel}>
                BATTER / HOME: ({Math.round(plateX)}, {Math.round(plateY)})
              </Text>
              <View style={styles.arrowsRow}>
                <TouchableOpacity onPress={() => setPlateX(p => p - 4)} style={styles.arrowBtn}>
                  <Text style={styles.arrowLabel}>◀</Text>
                </TouchableOpacity>
                <View style={styles.verticalArrows}>
                  <TouchableOpacity onPress={() => setPlateY(p => p - 4)} style={styles.arrowBtn}>
                    <Text style={styles.arrowLabel}>▲</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setPlateY(p => p + 4)} style={styles.arrowBtn}>
                    <Text style={styles.arrowLabel}>▼</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => setPlateX(p => p + 4)} style={styles.arrowBtn}>
                  <Text style={styles.arrowLabel}>▶</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => {
                setPitcherX(DEFAULT_PITCHER_X);
                setPitcherY(DEFAULT_PITCHER_Y);
                setPlateX(DEFAULT_PLATE_X);
                setPlateY(DEFAULT_PLATE_Y);
              }}
              style={styles.resetValuesBtn}
            >
              <Text style={styles.resetValuesText}>RESET TO DEFAULTS</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  canvasWrapper: {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    backgroundColor: '#020b1a',
    borderRadius: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  woodenBat: {
    position: 'absolute',
    width: 5,
    height: 52,
    backgroundColor: '#d97706',
    borderRadius: 3,
    transformOrigin: 'top center',
    borderWidth: 1,
    borderColor: '#78350f',
  },
  bannerWrapper: {
    position: 'absolute',
    bottom: 20,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(2,11,26,0.92)',
    borderColor: '#1e3a5f',
    borderWidth: 1.5,
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  bannerText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ffffff',
    fontFamily: Platform.OS === 'ios' ? 'Courier-Bold' : 'monospace',
    textAlign: 'center',
  },
  svgLabelLeft: {
    position: 'absolute',
    left: 20,
    top: CANVAS_HEIGHT * 0.62 + 28,
    color: '#ffffff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  svgLabelCenter: {
    position: 'absolute',
    alignSelf: 'center',
    top: CANVAS_HEIGHT * 0.62 + 28,
    color: '#ffffff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  svgLabelRight: {
    position: 'absolute',
    right: 20,
    top: CANVAS_HEIGHT * 0.62 + 28,
    color: '#ffffff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  tuningOuterPanel: {
    marginTop: 10,
    width: CANVAS_WIDTH,
    backgroundColor: '#0c1220',
    borderColor: '#1e3a5f',
    borderWidth: 1.5,
    borderRadius: 8,
    padding: 8,
  },
  calibrateHeaderBtn: {
    paddingVertical: 6,
    alignItems: 'center',
    backgroundColor: 'rgba(59,130,246,0.10)',
    borderRadius: 4,
  },
  calibrateHeaderTxt: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#3b82f6',
    fontFamily: Platform.OS === 'ios' ? 'Courier-Bold' : 'monospace',
  },
  controlsTuningGrid: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1e3a5f',
  },
  calibInstruction: {
    fontSize: 9,
    color: '#94a3b8',
    marginBottom: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  tuningSection: {
    marginBottom: 10,
    alignItems: 'center',
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#e2e8f0',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  arrowsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
  },
  verticalArrows: {
    gap: 4,
  },
  arrowBtn: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
    borderWidth: 1,
    width: 32,
    height: 28,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowLabel: {
    color: '#3b82f6',
    fontSize: 12,
    fontWeight: 'bold',
  },
  resetValuesBtn: {
    backgroundColor: 'rgba(239,68,68,0.10)',
    borderColor: 'rgba(239,68,68,0.40)',
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: 6,
    alignItems: 'center',
    marginTop: 4,
  },
  resetValuesText: {
    fontSize: 9,
    color: '#ef4444',
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier-Bold' : 'monospace',
  },
});
