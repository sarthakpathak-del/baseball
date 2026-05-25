import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';

import Svg, {
  Circle,
  G,
  Rect,
  Ellipse,
  Line,
} from 'react-native-svg';

import StadiumBackground from './StadiumBackground';
import { GameStage, PitchType } from '../types/types';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const CANVAS_WIDTH = width - 20;
const CANVAS_HEIGHT = height * 0.62;

interface Props {
  stage: GameStage;
  pitchType: PitchType;
  pitchSpeed: number;
  announceText: string;
  triggerSwing: boolean;
  setTriggerSwing: (v: boolean) => void;
  blowStrength: number;
  onSwingResult: (
    isHit: boolean,
    distance?: number,
    direction?: string,
  ) => void;
}

export default function GameView({
  stage,
  pitchType,
  announceText,
  triggerSwing,
  setTriggerSwing,
  blowStrength,
  onSwingResult,
}: Props) {
  const pitchProgress = useRef(new Animated.Value(0)).current;

  const [ballVisible, setBallVisible] = useState(false);

  const [ballX, setBallX] = useState(CANVAS_WIDTH / 2);
  const [ballY, setBallY] = useState(100);

  const [hitBall, setHitBall] = useState<any>(null);

  const pitcherX = CANVAS_WIDTH / 2;
  const pitcherY = CANVAS_HEIGHT * 0.42;

  const plateX = CANVAS_WIDTH / 2;
  const plateY = CANVAS_HEIGHT * 0.80;

  // FIELDERS

  const fielders = [
    { x: 80, y: 220 },
    { x: CANVAS_WIDTH / 2, y: 190 },
    { x: CANVAS_WIDTH - 80, y: 220 },
  ];

  // PITCH ANIMATION

  useEffect(() => {
    if (stage !== GameStage.InFlight) {
      return;
    }

    setBallVisible(true);

    pitchProgress.setValue(0);

    Animated.timing(pitchProgress, {
      toValue: 1,
      duration: 1300,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        setBallVisible(false);
        onSwingResult(false);
      }
    });
  }, [stage]);

  // BALL PATH

  useEffect(() => {
    const id = pitchProgress.addListener(({ value }) => {
      let curve = 0;

      if (pitchType === PitchType.Curveball) {
        curve = Math.sin(value * Math.PI) * 35;
      }

      if (pitchType === PitchType.Changeup) {
        curve = Math.sin(value * Math.PI) * 12;
      }

      const x = pitcherX + curve;

      const y =
        pitcherY + (plateY - pitcherY) * value;

      setBallX(x);
      setBallY(y);
    });

    return () => {
      pitchProgress.removeListener(id);
    };
  }, [pitchType]);

  // REAL HIT SYSTEM

  useEffect(() => {
    if (!triggerSwing) {
      return;
    }

    setTriggerSwing(false);

    const p = (pitchProgress as any).__getValue();

    let contactQuality = 0;

    if (p >= 0.91 && p <= 0.96) {
      contactQuality = 1.0;
    } else if (p >= 0.85 && p <= 0.99) {
      contactQuality = 0.75;
    } else if (p >= 0.78 && p <= 1.02) {
      contactQuality = 0.45;
    } else {
      contactQuality = 0;
    }

    const power = blowStrength / 100;

    const finalPower = contactQuality * power;

    // MISS

    if (finalPower <= 0.15) {
      onSwingResult(false);
      return;
    }

    // RANDOM DIRECTION

    let direction = 'CENTER FIELD';

    const rand = Math.random();

    if (rand < 0.33) {
      direction = 'LEFT FIELD';
    } else if (rand < 0.66) {
      direction = 'RIGHT FIELD';
    }

    // GROUND BALL

    if (finalPower <= 0.35) {
      animateGroundBall(direction);

      setTimeout(() => {
        onSwingResult(false);
      }, 1800);

      return;
    }

    // POPUP CATCH

    if (finalPower <= 0.5) {
      animatePopup(direction);

      setTimeout(() => {
        onSwingResult(false);
      }, 2200);

      return;
    }

    // SINGLE

    if (finalPower <= 0.70) {
      const distance =
        180 + Math.floor(finalPower * 120);

      animateLineDrive(direction);

      setTimeout(() => {
        onSwingResult(true, distance, direction);
      }, 1400);

      return;
    }

    // DOUBLE / TRIPLE

    if (finalPower <= 0.88) {
      const distance =
        280 + Math.floor(finalPower * 120);

      animateDeepFly(direction);

      setTimeout(() => {
        onSwingResult(true, distance, direction);
      }, 1800);

      return;
    }

    // HOMERUN

    if (
      contactQuality > 0.9 &&
      blowStrength > 80
    ) {
      const distance =
        420 + Math.floor(Math.random() * 60);

      animateHomerun(direction);

      setTimeout(() => {
        onSwingResult(true, distance, direction);
      }, 2500);

      return;
    }

    animateDeepFly(direction);

    setTimeout(() => {
      onSwingResult(true, 320, direction);
    }, 1800);
  }, [triggerSwing]);

  // GROUND BALL

  const animateGroundBall = (
    direction: string,
  ) => {
    let x = plateX;
    let y = plateY - 10;

    const targetX =
      direction === 'LEFT FIELD'
        ? 100
        : direction === 'RIGHT FIELD'
        ? CANVAS_WIDTH - 100
        : CANVAS_WIDTH / 2;

    const interval = setInterval(() => {
      x += (targetX - x) * 0.08;

      y -= 1;

      setHitBall({
        x,
        y,
      });

      if (
        Math.abs(targetX - x) < 5
      ) {
        clearInterval(interval);

        setTimeout(() => {
          setHitBall(null);
        }, 300);
      }
    }, 16);
  };

  // POPUP

  const animatePopup = (
    direction: string,
  ) => {
    let x = plateX;
    let y = plateY;

    const targetX =
      direction === 'LEFT FIELD'
        ? 120
        : direction === 'RIGHT FIELD'
        ? CANVAS_WIDTH - 120
        : CANVAS_WIDTH / 2;

    let velocity = -14;

    const gravity = 0.6;

    const interval = setInterval(() => {
      x += (targetX - x) * 0.03;

      velocity += gravity;

      y += velocity;

      setHitBall({
        x,
        y,
      });

      if (y > 220) {
        clearInterval(interval);

        setTimeout(() => {
          setHitBall(null);
        }, 300);
      }
    }, 16);
  };

  // LINE DRIVE

  const animateLineDrive = (
    direction: string,
  ) => {
    let x = plateX;
    let y = plateY;

    const targetX =
      direction === 'LEFT FIELD'
        ? 80
        : direction === 'RIGHT FIELD'
        ? CANVAS_WIDTH - 80
        : CANVAS_WIDTH / 2;

    const interval = setInterval(() => {
      x += (targetX - x) * 0.06;

      y -= 5;

      setHitBall({
        x,
        y,
      });

      if (y < 170) {
        clearInterval(interval);

        setTimeout(() => {
          setHitBall(null);
        }, 300);
      }
    }, 16);
  };

  // DEEP FLY

  const animateDeepFly = (
    direction: string,
  ) => {
    let x = plateX;
    let y = plateY;

    const targetX =
      direction === 'LEFT FIELD'
        ? 60
        : direction === 'RIGHT FIELD'
        ? CANVAS_WIDTH - 60
        : CANVAS_WIDTH / 2;

    let velocity = -18;

    const gravity = 0.45;

    const interval = setInterval(() => {
      x += (targetX - x) * 0.04;

      velocity += gravity;

      y += velocity;

      setHitBall({
        x,
        y,
      });

      if (y > 120 && velocity > 0) {
        clearInterval(interval);

        setTimeout(() => {
          setHitBall(null);
        }, 500);
      }
    }, 16);
  };

  // HOMERUN

  const animateHomerun = (
    direction: string,
  ) => {
    let x = plateX;
    let y = plateY;

    const targetX =
      direction === 'LEFT FIELD'
        ? 40
        : direction === 'RIGHT FIELD'
        ? CANVAS_WIDTH - 40
        : CANVAS_WIDTH / 2;

    let velocity = -22;

    const gravity = 0.32;

    const interval = setInterval(() => {
      x += (targetX - x) * 0.035;

      velocity += gravity;

      y += velocity;

      setHitBall({
        x,
        y,
      });

      if (y < -40) {
        clearInterval(interval);

        setTimeout(() => {
          setHitBall(null);
        }, 500);
      }
    }, 16);
  };

  return (
    <SafeAreaView style={styles.wrapper}>
      <StadiumBackground
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
      />

      <Svg
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={StyleSheet.absoluteFill}
      >
        {/* FIELDERS */}

        {fielders.map((f, index) => (
          <G key={index}>
            <Circle
              cx={f.x}
              cy={f.y}
              r={12}
              fill="#2563eb"
            />

            <Circle
              cx={f.x}
              cy={f.y - 16}
              r={7}
              fill="#f8c9a0"
            />
          </G>
        ))}

        {/* PITCHER */}

        <G>
          <Circle
            cx={pitcherX}
            cy={pitcherY - 16}
            r={8}
            fill="#f8c9a0"
          />

          <Rect
            x={pitcherX - 10}
            y={pitcherY - 10}
            width={20}
            height={30}
            rx={5}
            fill="#ef4444"
          />
        </G>

        {/* BATTER */}

        <G>
          <Circle
            cx={plateX + 28}
            cy={plateY - 45}
            r={8}
            fill="#f8c9a0"
          />

          <Rect
            x={plateX + 18}
            y={plateY - 38}
            width={20}
            height={34}
            rx={5}
            fill="#0284c7"
          />

          <Line
            x1={plateX + 35}
            y1={plateY - 62}
            x2={plateX + 50}
            y2={plateY - 18}
            stroke="#d97706"
            strokeWidth={6}
            strokeLinecap="round"
          />
        </G>

        {/* STRIKE ZONE */}

        <Rect
          x={plateX - 18}
          y={plateY - 82}
          width={36}
          height={58}
          stroke="rgba(0,255,255,0.5)"
          fill="rgba(0,255,255,0.05)"
          strokeDasharray="4,3"
        />

        {/* PITCH BALL */}

        {ballVisible && (
          <Circle
            cx={ballX}
            cy={ballY}
            r={7}
            fill="white"
          />
        )}

        {/* HIT BALL */}

        {hitBall && (
          <Circle
            cx={hitBall.x}
            cy={hitBall.y}
            r={8}
            fill="white"
          />
        )}
      </Svg>

      {/* BANNER */}

      <View style={styles.banner}>
        <Text style={styles.bannerText}>
          {announceText}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#020617',
  },

  banner: {
    position: 'absolute',
    bottom: 16,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },

  bannerText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
});