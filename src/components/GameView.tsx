import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';

import Svg, {
  Circle,
  G,
  Rect,
} from 'react-native-svg';

import { GameStage, PitchType, SwingResultReason } from '../types/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import BaseballBat, {
  BAT_BARREL_X,
  BAT_BARREL_Y,
  BAT_HANDLE_X,
  BAT_HANDLE_Y,
  BAT_PIVOT_X,
  BAT_PIVOT_Y,
  BAT_SWING_OFFSET_X,
  BAT_SWING_OFFSET_Y,
} from '../Assests/BaseballBat';
import Batter from './Batter'; // ← NEW

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
    reason?: SwingResultReason,
  ) => void;
}

type Fielder = {
  x: number;
  y: number;
};

type FieldingPlay = 'groundBall' | 'popup';

const BASE_FIELDERS: Fielder[] = [
  { x: 90, y: 220 },
  { x: CANVAS_WIDTH / 2, y: 180 },
  { x: CANVAS_WIDTH - 90, y: 220 },
];

export default function GameView({
  stage,
  pitchType,
  announceText,
  triggerSwing,
  setTriggerSwing,
  blowStrength,
  onSwingResult,
}: Props) {

  const pitchProgress = useRef(
    new Animated.Value(0),
  ).current;

  const batSwing = useRef(
    new Animated.Value(0),
  ).current;

  const [ballVisible, setBallVisible] =
    useState(false);

  const [ballX, setBallX] = useState(
    CANVAS_WIDTH / 2,
  );

  const [ballY, setBallY] = useState(100);

  const [hitBall, setHitBall] =
    useState<any>(null);

  const [fielders, setFielders] = useState<Fielder[]>(
    BASE_FIELDERS,
  );
  const [activeFielder, setActiveFielder] =
    useState<number | null>(null);

  const swingActive = useRef(false);
  const swingResolved = useRef(false);

  const pitcherX = CANVAS_WIDTH / 2;
  const pitcherY = CANVAS_HEIGHT * 0.42;

  const plateX = CANVAS_WIDTH / 2;
  const plateY = CANVAS_HEIGHT * 0.80;

  useEffect(() => {
    if (stage !== GameStage.InFlight) {
      return;
    }

    setBallVisible(true);

    swingResolved.current = false;

    pitchProgress.setValue(0);

    Animated.timing(pitchProgress, {
      toValue: 1,
      duration: 1300,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (
        finished &&
        !swingResolved.current
      ) {
        setBallVisible(false);

        onSwingResult(false, undefined, undefined, 'miss');
      }
    });
  }, [stage]);

  useEffect(() => {
    const id = pitchProgress.addListener(
      ({ value }) => {

        let curve = 0;

        if (
          pitchType ===
          PitchType.Curveball
        ) {
          curve =
            Math.sin(value * Math.PI) *
            35;
        }

        if (
          pitchType ===
          PitchType.Changeup
        ) {
          curve =
            Math.sin(value * Math.PI) *
            12;
        }

        const x = pitcherX + curve;

        const y =
          pitcherY +
          (plateY - pitcherY) * value;

        setBallX(x);
        setBallY(y);

        if (
          swingActive.current &&
          !swingResolved.current &&
          stage === GameStage.InFlight
        ) {
          const swingValue =
            (batSwing as any).__getValue();

          if (
            detectBatHit(
              x,
              y,
              swingValue,
            )
          ) {
            swingResolved.current = true;

            swingActive.current = false;

            setBallVisible(false);

            processSwingHit();
          }
        }
      },
    );

    return () => {
      pitchProgress.removeListener(id);
    };
  }, [pitchType, stage]);


  useEffect(() => {
    if (!triggerSwing) {
      return;
    }
    setTriggerSwing(false);

    if (stage !== GameStage.InFlight) {
      swingActive.current = false;
      return;
    }

    swingActive.current = true;

    swingResolved.current = false;

    batSwing.setValue(0);

    Animated.sequence([
      Animated.timing(batSwing, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(
          Easing.cubic,
        ),
        useNativeDriver: true,
      }),

      Animated.timing(batSwing, {
        toValue: 0,
        duration: 260,
        easing: Easing.inOut(
          Easing.quad,
        ),
        useNativeDriver: true,
      }),
    ]).start(() => {
      swingActive.current = false;
    });
  }, [stage, triggerSwing]);

  const rotatePoint = (
    pointX: number,
    pointY: number,
    pivotX: number,
    pivotY: number,
    angle: number,
  ) => {
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);

    const dx = pointX - pivotX;
    const dy = pointY - pivotY;

    return {
      x:
        pivotX +
        dx * cos -
        dy * sin,

      y:
        pivotY +
        dx * sin +
        dy * cos,
    };
  };

  const getBatSegment = (
    angle: number,
  ) => {
    const pivotX = plateX;
    const pivotY = plateY;

    const handle = rotatePoint(
      plateX +
        BAT_HANDLE_X -
        BAT_PIVOT_X,
      plateY +
        BAT_HANDLE_Y -
        BAT_PIVOT_Y,
      pivotX,
      pivotY,
      angle,
    );

    const barrel = rotatePoint(
      plateX +
        BAT_BARREL_X -
        BAT_PIVOT_X,
      plateY +
        BAT_BARREL_Y -
        BAT_PIVOT_Y,
      pivotX,
      pivotY,
      angle,
    );

    return { handle, barrel };
  };

  const getDistanceToSegment = (
    px: number,
    py: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  ) => {
    const dx = x2 - x1;
    const dy = y2 - y1;

    if (dx === 0 && dy === 0) {
      return Math.hypot(
        px - x1,
        py - y1,
      );
    }

    const t =
      ((px - x1) * dx +
        (py - y1) * dy) /
      (dx * dx + dy * dy);

    const clamped = Math.max(
      0,
      Math.min(1, t),
    );

    const closestX =
      x1 + clamped * dx;

    const closestY =
      y1 + clamped * dy;

    return Math.hypot(
      px - closestX,
      py - closestY,
    );
  };

  const detectBatHit = (
    x: number,
    y: number,
    swingValue: number,
  ) => {
    const angleDeg = -3 - swingValue * 108;

    const angleRad = (angleDeg * Math.PI) / 180;

    const { handle, barrel } = getBatSegment(angleRad);

    const swingOffsetX =
      BAT_SWING_OFFSET_X * swingValue;
    const swingOffsetY =
      BAT_SWING_OFFSET_Y * swingValue;

    const s = {
      x: handle.x + swingOffsetX,
      y: handle.y + swingOffsetY,
    };
    const e = {
      x: barrel.x + swingOffsetX,
      y: barrel.y + swingOffsetY,
    };

    return (
      getDistanceToSegment(
        x,
        y,
        s.x,
        s.y,
        e.x,
        e.y,
      ) < 18
    );
  };

  const getFielderIndex = (
    direction: string,
  ) => {
    if (direction === 'LEFT FIELD') {
      return 0;
    }

    if (direction === 'RIGHT FIELD') {
      return 2;
    }

    return 1;
  };

  const getFieldingResult = (
    play: FieldingPlay,
    power: number,
  ) => {
    const outChance =
      play === 'popup'
        ? Math.max(0.55, 0.88 - power * 0.45)
        : Math.max(0.42, 0.78 - power * 0.65);

    const isOut = Math.random() < outChance;

    const safeDistance =
      play === 'popup'
        ? 110 + Math.floor(power * 120)
        : 70 + Math.floor(power * 150);

    return { isOut, safeDistance };
  };

  useEffect(() => {
    if (!hitBall || activeFielder === null) {
      return;
    }

    const interval = setInterval(() => {
      setFielders(prev =>
        prev.map((f, index) => {
          if (index !== activeFielder) {
            return f;
          }

          const dx = hitBall.x - f.x;
          const dy = hitBall.y - f.y;
          const distance = Math.hypot(dx, dy);

          if (distance < 4) {
            return f;
          }

          return {
            x: f.x + dx * 0.12,
            y: f.y + dy * 0.12,
          };
        }),
      );
    }, 16);

    return () => clearInterval(interval);
  }, [hitBall, activeFielder]);

  useEffect(() => {
    if (hitBall !== null) {
      return;
    }

    if (activeFielder === null) {
      return;
    }

    const resetTimeout = setTimeout(() => {
      setFielders(BASE_FIELDERS);
      setActiveFielder(null);
    }, 400);

    return () => clearTimeout(resetTimeout);
  }, [hitBall, activeFielder]);

  const processSwingHit = () => {
    const p =
      (pitchProgress as any).__getValue();

    let contactQuality = 0;

    if (p >= 0.91 && p <= 0.96) {
      contactQuality = 1;
    } else if (
      p >= 0.85 &&
      p <= 0.99
    ) {
      contactQuality = 0.75;
    } else {
      contactQuality = 0.45;
    }

    const power =
      (blowStrength / 100) *
      contactQuality;

    let direction = 'CENTER FIELD';

    const rand = Math.random();

    if (rand < 0.33) {
      direction = 'LEFT FIELD';
    } else if (rand < 0.66) {
      direction = 'RIGHT FIELD';
    }

    setActiveFielder(getFielderIndex(direction));

    if (power <= 0.38) {
      const result = getFieldingResult('groundBall', power);

      animateGroundBall(direction, power);

      setTimeout(() => {
        if (result.isOut) {
          onSwingResult(false, undefined, direction, 'fieldedOut');
        } else {
          onSwingResult(true, result.safeDistance, direction);
        }
      }, 1800);

      return;
    }

    if (power <= 0.55) {
      const result = getFieldingResult('popup', power);

      animatePopup(direction, power);

      setTimeout(() => {
        if (result.isOut) {
          onSwingResult(false, undefined, direction, 'fieldedOut');
        } else {
          onSwingResult(true, result.safeDistance, direction);
        }
      }, 2000);

      return;
    }

    if (power <= 0.75) {
      const distance =
        180 +
        Math.floor(power * 140);

      animateLineDrive(direction, power);

      setTimeout(() => {
        onSwingResult(
          true,
          distance,
          direction,
        );
      }, 1500);

      return;
    }

    if (power <= 0.92) {
      const distance =
        320 +
        Math.floor(power * 100);

      animateDeepFly(direction, power);

      setTimeout(() => {
        onSwingResult(
          true,
          distance,
          direction,
        );
      }, 1800);

      return;
    }

    const hrDistance =
      420 +
      Math.floor(Math.random() * 60);

    animateHomerun(direction, power);

    setTimeout(() => {
      onSwingResult(
        true,
        hrDistance,
        direction,
      );
    }, 2500);
  };

  const animateGroundBall = (
    direction: string,
    power: number,
  ) => {
    let x = ballX;
    let y = ballY;

    const targetX =
      direction === 'LEFT FIELD'
        ? 90
        : direction === 'RIGHT FIELD'
        ? CANVAS_WIDTH - 90
        : CANVAS_WIDTH / 2;

    const lerpFactor = 0.08 + power * 0.06;

    const interval = setInterval(() => {
      x += (targetX - x) * lerpFactor;

      y -= 1 + power * 2;

      setHitBall({ x, y });

      if (Math.abs(targetX - x) < 4) {
        clearInterval(interval);

        setTimeout(() => {
          setHitBall(null);
        }, 300);
      }
    }, 16);
  };

  const animatePopup = (
    direction: string,
    power: number,
  ) => {
    let x = ballX;
    let y = ballY;

    const targetX =
      direction === 'LEFT FIELD'
        ? 120
        : direction === 'RIGHT FIELD'
        ? CANVAS_WIDTH - 120
        : CANVAS_WIDTH / 2;

    let velocity = -13 * (1 + power);

    const gravity = Math.max(0.25, 0.65 * (1 - power * 0.4));

    const interval = setInterval(() => {
      x += (targetX - x) * (0.03 + power * 0.02);

      velocity += gravity;

      y += velocity;

      setHitBall({ x, y });

      if (y > 230) {
        clearInterval(interval);

        setTimeout(() => {
          setHitBall(null);
        }, 300);
      }
    }, 16);
  };

  const animateLineDrive = (
    direction: string,
    power: number,
  ) => {
    let x = ballX;
    let y = ballY;

    const targetX =
      direction === 'LEFT FIELD'
        ? 70
        : direction === 'RIGHT FIELD'
        ? CANVAS_WIDTH - 70
        : CANVAS_WIDTH / 2;

    const interval = setInterval(() => {
      x += (targetX - x) * (0.05 + power * 0.04);

      y -= 4.5 * (1 + power);

      setHitBall({ x, y });

      if (y < 180) {
        clearInterval(interval);

        setTimeout(() => {
          setHitBall(null);
        }, 300);
      }
    }, 16);
  };

  const animateDeepFly = (
    direction: string,
    power: number,
  ) => {
    let x = ballX;
    let y = ballY;

    const targetX =
      direction === 'LEFT FIELD'
        ? 40
        : direction === 'RIGHT FIELD'
        ? CANVAS_WIDTH - 40
        : CANVAS_WIDTH / 2;

    let velocity = -18 * (1 + power);

    const gravity = Math.max(0.18, 0.45 * (1 - power * 0.35));

    const interval = setInterval(() => {
      x += (targetX - x) * (0.04 + power * 0.03);

      velocity += gravity;

      y += velocity;

      setHitBall({ x, y });

      if (y > 100 && velocity > 0) {
        clearInterval(interval);

        setTimeout(() => {
          setHitBall(null);
        }, 500);
      }
    }, 16);
  };

  const animateHomerun = (
    direction: string,
    power: number,
  ) => {
    let x = ballX;
    let y = ballY;

    const targetX =
      direction === 'LEFT FIELD'
        ? 20
        : direction === 'RIGHT FIELD'
        ? CANVAS_WIDTH - 20
        : CANVAS_WIDTH / 2;

    let velocity = -22 * (1 + power);

    const gravity = Math.max(0.12, 0.32 * (1 - power * 0.35));

    const interval = setInterval(() => {
      x += (targetX - x) * (0.035 + power * 0.03);

      velocity += gravity;

      y += velocity;

      setHitBall({ x, y });

      if (y < -40) {
        clearInterval(interval);

        setTimeout(() => {
          setHitBall(null);
        }, 500);
      }
    }, 16);
  };

  // =========================
  // BAT ROTATION
  // =========================

  const batRotate =
    batSwing.interpolate({
      inputRange: [0, 1],
      outputRange: [
        '-3deg',
        '-111deg',
      ],
    });

  return (
    <SafeAreaView style={styles.wrapper}>

      {/* GAME */}

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
              r={14}
              fill="#2563eb"
            />

            <Circle
              cx={f.x}
              cy={f.y - 18}
              r={8}
              fill="#f8c9a0"
            />
          </G>
        ))}

        {/* PITCHER */}

        <G>
          <Circle
            cx={pitcherX}
            cy={pitcherY - 18}
            r={10}
            fill="#f8c9a0"
          />

          <Rect
            x={pitcherX - 12}
            y={pitcherY - 8}
            width={24}
            height={38}
            rx={6}
            fill="#ef4444"
          />
        </G>

        {/* ← BATTER <G> REMOVED — now rendered by <Batter> below */}

        {/* STRIKE ZONE — kept here so it renders under the ball */}

        <Rect
          x={plateX - 18}
          y={plateY - 82}
          width={36}
          height={58}
          stroke="rgba(0,255,255,0.45)"
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

      {/* NEW BATTER COMPONENT */}

    <Batter
  plateX={plateX}
  plateY={plateY}
  batSwing={batSwing} 
/>

      {/* BAT (existing swing overlay — keep as-is for hit detection alignment) */}

      {/* <BaseballBat
        plateX={plateX}
        plateY={plateY}
        batSwing={batSwing}
        batRotate={batRotate}
      /> */}

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
    borderRadius: 20,
    overflow: 'hidden',
    alignSelf: 'center',
    backgroundColor: 'transparent',
  },

  banner: {
    position: 'absolute',
    top: 16,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },

  bannerText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1,
  },
});