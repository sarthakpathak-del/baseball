/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, Easing, Platform, Image, TouchableOpacity } from 'react-native';
import Svg, { Rect, Circle, Path, Ellipse, G } from 'react-native-svg';
import { GameStage, PitchType } from '../types/types';

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

const CANVAS_WIDTH = 380;
const CANVAS_HEIGHT = 480;

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

  // Real-time calibrateable state variables for pitch and mounds
  const [pitcherX, setPitcherX] = useState<number>(CANVAS_WIDTH * 0.50); // perfectly center
  const [pitcherY, setPitcherY] = useState<number>(CANVAS_HEIGHT * 0.77); // on mound (perfect field perspective)
  const [plateX, setPlateX] = useState<number>(CANVAS_WIDTH * 0.50); // center
  const [plateY, setPlateY] = useState<number>(CANVAS_HEIGHT * 0.94); // front batting (resting on grass turf)

  const [calibratorVisible, setCalibratorVisible] = useState<boolean>(false);

  const [ballX, setBallX] = useState<number>(0);
  const [ballY, setBallY] = useState<number>(0);
  const [ballScale, setBallScale] = useState<number>(0);

  // Handle active pitcher release triggers 
  useEffect(() => {
    if (stage === GameStage.InFlight) {
      pitchProgress.setValue(0);
      Animated.timing(pitchProgress, {
        toValue: 1,
        duration: 1700,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished) {
          onSwingResult(false);
        }
      });
    } else {
      pitchProgress.stopAnimation();
    }
  }, [stage]);

  // Map Animated pitch values into 3D-to-2D coordinates
  useEffect(() => {
    const listenerId = pitchProgress.addListener(({ value }) => {
      const startX = pitcherX;
      const startY = pitcherY - 14; // ball starts at the pitcher's release arm height
      const endX = plateX;
      const endY = plateY - 42;    // ball crosses exactly at hip-level inside strike-zone

      const currentX = startX + (endX - startX) * value;
      const currentY = startY + (endY - startY) * value;
      const scale = Math.max(2.5, 22 * value); // grows dynamically to give 3D depth

      setBallX(currentX);
      setBallY(currentY);
      setBallScale(scale);
    });

    return () => {
      pitchProgress.removeListener(listenerId);
    };
  }, [pitchProgress, pitcherX, pitcherY, plateX, plateY]);

  // React Native bat swing rotations handler
  useEffect(() => {
    if (triggerSwing) {
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

      // Test Contact sweet spot timing actively
      const p = (pitchProgress as any).__getValue();
      const isPerfectContact = p >= 0.86 && p <= 0.98;

      if (isPerfectContact && stage === GameStage.InFlight) {
        const basePower = blowStrength; 
        const randomBonus = Math.floor(Math.random() * 80);
        const distance = Math.round(150 + (basePower * 2.8) + randomBonus);
        onSwingResult(true, distance);
      }
    }
  }, [triggerSwing, blowStrength, pitcherX, pitcherY, plateX, plateY, stage]);

  const spinAngle = swingRotation.interpolate({
    inputRange: [-50, 120],
    outputRange: ['-50deg', '120deg'],
  });

  const isPitchingView =
    stage === GameStage.PitcherWindup ||
    stage === GameStage.InFlight ||
    stage === GameStage.ResultStrike ||
    stage === GameStage.ResultBall ||
    stage === GameStage.ResultFoul ||
    stage === GameStage.Resetting;

  return (
    <View style={styles.outerContainer}>
      <View style={styles.canvasWrapper}>
        {/* Real Stadium Image Background in React Native CLI */}
        <Image
          source={require('../assets/images/stadium_background_1779455268669.png')}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />

        <Svg width={CANVAS_WIDTH} height={CANVAS_HEIGHT} style={StyleSheet.absoluteFill}>
          {isPitchingView ? (
            <G>
              {/* Semi-transparent baseball grass guide line paths to subtly converge on the background field */}
              <Path
                d={`M ${plateX} ${pitcherY} L ${CANVAS_WIDTH * 0.95} ${CANVAS_HEIGHT} L ${CANVAS_WIDTH * 0.05} ${CANVAS_HEIGHT} Z`}
                fill="none"
              />

              {/* White pentagonal baseball Home Base Plate */}
              <Path
                d={`M ${plateX} ${plateY} L ${plateX + 14} ${plateY + 8} L ${plateX + 8} ${plateY + 18} L ${plateX - 8} ${plateY + 18} L ${plateX - 14} ${plateY + 8} Z`}
                fill="rgba(255, 255, 255, 0.9)"
                stroke="#475569"
                strokeWidth="1.5"
              />

              {/* Playable strike zone frame aligned perfectly with base plate dimensions */}
              <Rect
                x={plateX - 25}
                y={plateY - 110}
                width="50"
                height="80"
                stroke="rgba(6, 182, 212, 0.65)"
                strokeWidth="1.5"
                fill="none"
              />

              {/* Pitcher Mound shadow ellipse */}
              <Ellipse cx={pitcherX} cy={pitcherY + 4} rx="20" ry="5" fill="rgba(0, 0, 0, 0.35)" />

              {/* Detailed Pitcher jersey, skin and gear */}
              <Circle cx={pitcherX} cy={pitcherY - 22} r="5" fill="#fbcfe8" stroke="#1e293b" strokeWidth="1" />
              <Rect x={pitcherX - 7} y={pitcherY - 17} width="14" height="17" rx="2" fill="#ef4444" stroke="#991b1b" strokeWidth="1" />
              <Rect x={pitcherX - 6} y={pitcherY} width="12" height="5" fill="#ffffff" />
              {/* Pitcher glove element */}
              <Circle cx={pitcherX - 9} cy={pitcherY - 10} r="3" fill="#b45309" />

              {/* Flowing pitch baseball sphere */}
              {stage === GameStage.InFlight && (
                <G>
                  <Circle cx={ballX} cy={ballY} r={ballScale} fill="#ffffff" />
                  <Path d={`M ${ballX - ballScale * 0.4} ${ballY - ballScale * 0.6} Q ${ballX} ${ballY} ${ballX - ballScale * 0.4} ${ballY + ballScale * 0.6}`} stroke="#ef4444" strokeWidth="1" fill="none" />
                  <Path d={`M ${ballX + ballScale * 0.4} ${ballY - ballScale * 0.6} Q ${ballX} ${ballY} ${ballX + ballScale * 0.4} ${ballY + ballScale * 0.6}`} stroke="#ef4444" strokeWidth="1" fill="none" />
                </G>
              )}
            </G>
          ) : (
            <G>
              {/* Outfield view semi-transparent layouts */}
              <Rect x="0" y={CANVAS_HEIGHT * 0.62} width={CANVAS_WIDTH} height={CANVAS_HEIGHT * 0.38} fill="rgba(6, 78, 59, 0.35)" />
              <Rect x="0" y={CANVAS_HEIGHT * 0.62 + 15} width={CANVAS_WIDTH} height="8" fill="rgba(180, 83, 9, 0.35)" />
            </G>
          )}
        </Svg>

        {isPitchingView && (
          <View style={[styles.batterWrapper, { left: plateX - 54, top: plateY - 78 }]}>
            <View style={styles.batterHead} />
            <View style={styles.batterTorso} />
            
            {/* Batter legs and shoes standing on dirt */}
            <View style={styles.batterLegsContainer}>
              <View style={styles.batterLegLeft} />
              <View style={styles.batterLegRight} />
            </View>

            <Animated.View style={[styles.woodenBat, { transform: [{ rotate: spinAngle }] }]} />
          </View>
        )}

        {!isPitchingView && (
          <>
            <Text style={styles.svgLabelLeft}>LF 330 FT</Text>
            <Text style={styles.svgLabelCenter}>WALL 400 FT</Text>
            <Text style={styles.svgLabelRight}>RF 330 FT</Text>
          </>
        )}

        {/* Dynamic banner alerts */}
        <View style={styles.bannerWrapper}>
          <Text style={styles.bannerText}>{announceText.toUpperCase()}</Text>
        </View>
      </View>

      {/* Dynamic Calibration Interface to match the stadium image mound & base */}
      <View style={styles.tuningOuterPanel}>
        <TouchableOpacity 
          id="btn-calibrate-toggle"
          onPress={() => setCalibratorVisible(!calibratorVisible)}
          style={styles.calibrateHeaderBtn}
        >
          <Text style={styles.calibrateHeaderTxt}>
            {calibratorVisible ? '👁️ HIDE CALIBRATOR' : '⚙️ CALIBRATE PLAYER POSITIONS'}
          </Text>
        </TouchableOpacity>

        {calibratorVisible && (
          <View style={styles.controlsTuningGrid}>
            <Text style={styles.calibInstruction}>
              Tap arrows to position Pitcher & Batter perfectly on your image's pitch.
            </Text>

            {/* Pitcher adjustments */}
            <View style={styles.tuningSection}>
              <Text style={styles.sectionLabel}>
                PITCHER: ({Math.round(pitcherX)}, {Math.round(pitcherY)})
              </Text>
              <View style={styles.arrowsRow}>
                <TouchableOpacity onPress={() => setPitcherX(p => p - 4)} style={styles.arrowBtn}><Text style={styles.arrowLabel}>◀</Text></TouchableOpacity>
                <View style={styles.verticalArrows}>
                  <TouchableOpacity onPress={() => setPitcherY(p => p - 4)} style={styles.arrowBtn}><Text style={styles.arrowLabel}>▲</Text></TouchableOpacity>
                  <TouchableOpacity onPress={() => setPitcherY(p => p + 4)} style={styles.arrowBtn}><Text style={styles.arrowLabel}>▼</Text></TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => setPitcherX(p => p + 4)} style={styles.arrowBtn}><Text style={styles.arrowLabel}>▶</Text></TouchableOpacity>
              </View>
            </View>

            {/* Batter / Plate adjustments */}
            <View style={styles.tuningSection}>
              <Text style={styles.sectionLabel}>
                BATTER / HOME: ({Math.round(plateX)}, {Math.round(plateY)})
              </Text>
              <View style={styles.arrowsRow}>
                <TouchableOpacity onPress={() => setPlateX(p => p - 4)} style={styles.arrowBtn}><Text style={styles.arrowLabel}>◀</Text></TouchableOpacity>
                <View style={styles.verticalArrows}>
                  <TouchableOpacity onPress={() => setPlateY(p => p - 4)} style={styles.arrowBtn}><Text style={styles.arrowLabel}>▲</Text></TouchableOpacity>
                  <TouchableOpacity onPress={() => setPlateY(p => p + 4)} style={styles.arrowBtn}><Text style={styles.arrowLabel}>▼</Text></TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => setPlateX(p => p + 4)} style={styles.arrowBtn}><Text style={styles.arrowLabel}>▶</Text></TouchableOpacity>
              </View>
            </View>

            {/* Reset Button */}
            <TouchableOpacity 
              onPress={() => {
                setPitcherX(CANVAS_WIDTH * 0.50);
                setPitcherY(CANVAS_HEIGHT * 0.77);
                setPlateX(CANVAS_WIDTH * 0.50);
                setPlateY(CANVAS_HEIGHT * 0.94);
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
    backgroundColor: '#020617',
    borderRadius: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  batterWrapper: {
    position: 'absolute',
    width: 80,
    height: 100,
    alignItems: 'center',
  },
  batterHead: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#fed7aa',
    borderWidth: 1.5,
    borderColor: '#0284c7',
    marginBottom: 2,
  },
  batterTorso: {
    width: 20,
    height: 40,
    borderRadius: 6,
    backgroundColor: '#0284c7',
    borderWidth: 1.5,
    borderColor: '#0369a1',
  },
  batterLegsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 16,
    height: 22,
    marginTop: -1,
  },
  batterLegLeft: {
    width: 6,
    height: 22,
    backgroundColor: '#cbd5e1', // white/grey baseball custom pants
    borderBottomWidth: 3,
    borderBottomColor: '#1e293b', // black athletic cleats details
  },
  batterLegRight: {
    width: 6,
    height: 22,
    backgroundColor: '#cbd5e1', // white/grey baseball custom pants
    borderBottomWidth: 3,
    borderBottomColor: '#1e293b', // black athletic cleats details
  },
  woodenBat: {
    position: 'absolute',
    width: 6,
    height: 62,
    backgroundColor: '#d97706',
    borderRadius: 3,
    top: 25,
    transformOrigin: 'top center',
    borderWidth: 1,
    borderColor: '#78350f',
  },
  bannerWrapper: {
    position: 'absolute',
    bottom: 20,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(7, 11, 22, 0.9)',
    borderColor: '#27354a',
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
    borderColor: '#27354a',
    borderWidth: 1.5,
    borderRadius: 8,
    padding: 8,
  },
  calibrateHeaderBtn: {
    paddingVertical: 6,
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
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
    borderTopColor: '#27354a',
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
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
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

