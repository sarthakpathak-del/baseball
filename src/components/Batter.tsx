import React from 'react';
import { Dimensions, View, Animated } from 'react-native';
import Svg, {
  G,
  Circle,
  Ellipse,
  Path,
  Line,
} from 'react-native-svg';

const { height } = Dimensions.get('window');
// Safe animated wrapper around the SVG Group element
const AnimatedG = Animated.createAnimatedComponent(G);

interface BatterProps {
  plateX: number;
  plateY: number;
  batSwing: Animated.Value;
}

export default function Batter({
  plateX,
  plateY,
  batSwing,
}: BatterProps) {
  const cx = plateX;
  const cy = plateY + 18; 
  const svgHeight = height;

  // The swing pivot should be at the player's core center (shoulder/chest axis)
  const pivotX = cx - 5;
  const pivotY = cy - 2;

  // INTERPOLATION: Sweeps from a back-shoulder stance (-35deg) all the way forward (+90deg)
  const rotation = batSwing.interpolate({
    inputRange: [0, 1],
    outputRange: ['-35deg', '90deg'],
  });

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 45,
        left: 0,
        right: 0,
        height: svgHeight,
        zIndex: 10,
      }}
    >
      <Svg width="100%" height={svgHeight} overflow="visible">
        <G>
          {/* 1. SHADOW UNDER FEET */}
          <Ellipse
            cx={cx}
            cy={cy + 75}
            rx={42}
            ry={9}
            fill="rgba(0,0,0,0.2)"
          />

          {/* 2. LEGS & FEET */}
          {/* Back Leg */}
          <Path
            d={`
              M ${cx - 20} ${cy + 18} 
              Q ${cx - 30} ${cy + 45} ${cx - 25} ${cy + 68}
            `}
            stroke="#163249"
            strokeWidth="15"
            strokeLinecap="round"
            fill="none"
          />
          {/* Back Sock */}
          <Path
            d={`M ${cx - 28} ${cy + 50} Q ${cx - 27} ${cy + 60} ${cx - 25} ${cy + 68}`}
            stroke="#ffffff"
            strokeWidth="11"
            fill="none"
          />
          {/* Back Shoe */}
          <Path
            d={`
              M ${cx - 40} ${cy + 75} 
              L ${cx - 15} ${cy + 75} 
              L ${cx - 15} ${cy + 67} 
              Q ${cx - 30} ${cy + 65} ${cx - 40} ${cy + 70} 
              Z
            `}
            fill="#163249"
          />
          <Path
            d={`M ${cx - 22} ${cy + 75} L ${cx - 15} ${cy + 75} L ${cx - 15} ${cy + 67} Q ${cx - 18} ${cy + 67} ${cx - 22} ${cy + 71} Z`}
            fill="#ffffff"
          />

          {/* Front Leg */}
          <Path
            d={`
              M ${cx + 5} ${cy + 18} 
              Q ${cx + 18} ${cy + 45} ${cx + 12} ${cy + 68}
            `}
            stroke="#1a3a52"
            strokeWidth="15"
            strokeLinecap="round"
            fill="none"
          />
          {/* Front Sock */}
          <Path
            d={`M ${cx + 15} ${cy + 50} Q ${cx + 14} ${cy + 60} ${cx + 12} ${cy + 68}`}
            stroke="#ffffff"
            strokeWidth="11"
            fill="none"
          />
          {/* Front Shoe */}
          <Path
            d={`
              M ${cx - 2} ${cy + 75} 
              L ${cx + 25} ${cy + 75} 
              L ${cx + 25} ${cy + 67} 
              Q ${cx + 10} ${cy + 65} ${cx - 2} ${cy + 70} 
              Z
            `}
            fill="#1a3a52"
          />
          <Path
            d={`M ${cx + 16} ${cy + 75} L ${cx + 25} ${cy + 75} L ${cx + 25} ${cy + 67} Q ${cx + 20} ${cy + 67} ${cx + 16} ${cy + 71} Z`}
            fill="#ffffff"
          />

          {/* 3. TORSO */}
          <Ellipse
            cx={cx - 6}
            cy={cy - 6}
            rx={23}
            ry={28}
            fill="#0077c8"
          />

          {/* 4. HEAD BACKGROUND ELEMENTS */}
          {/* Neck */}
          <Line
            x1={cx - 2}
            y1={cy - 34}
            x2={cx - 2}
            y2={cy - 22}
            stroke="#c8a882"
            strokeWidth="12"
            strokeLinecap="round"
          />

          {/* Head Base skin shape */}
          <Circle
            cx={cx}
            cy={cy - 44}
            r={18}
            fill="#c8a882"
          />

          {/* Nose & Jaw Profile Skin */}
          <Path
            d={`
              M ${cx + 10} ${cy - 52}
              L ${cx + 21} ${cy - 44}
              L ${cx + 14} ${cy - 38}
              Q ${cx + 12} ${cy - 28} ${cx} ${cy - 28}
              L ${cx - 8} ${cy - 28}
              Z
            `}
            fill="#c8a882"
          />

          {/* 5. HELMET BASE LAYERS */}
          {/* Main Helmet Dome Shell */}
          <Path
            d={`
              M ${cx - 20} ${cy - 46}
              A 21 21 0 1 1 ${cx + 17} ${cy - 46}
              Z
            `}
            fill="#33465a"
          />

          {/* Helmet Visor / Bill extension */}
          <Path
            d={`
              M ${cx + 12} ${cy - 50}
              L ${cx + 27} ${cy - 46}
              Q ${cx + 18} ${cy - 42} ${cx + 8} ${cy - 43}
              Z
            `}
            fill="#33465a"
          />

          {/* Helmet Ear Protector Flap */}
          <Circle
            cx={cx - 3}
            cy={cy - 42}
            r={10.5}
            fill="#33465a"
          />

          {/* Ear Cover Embossed Groove */}
          <Circle
            cx={cx - 3}
            cy={cy - 42}
            r={8.5}
            fill="none"
            stroke="#233242"
            strokeWidth="3"
          />

          {/* Helmet Top Ridge Line */}
          <Path
            d={`M ${cx - 12} ${cy - 63} Q ${cx + 5} ${cy - 62} ${cx + 13} ${cy - 52}`}
            stroke="#475f7a"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />

          <Path
            d={`
              M ${cx - 5} ${cy - 44} 
              A 4.5 5.5 0 0 1 ${cx - 2} ${cy - 36}
              L ${cx - 5} ${cy - 38} 
              Z
            `}
            fill="#c8a882"
            stroke="#b2936f"
            strokeWidth="1.5"
          />
          <Path
            d={`
              M ${cx + 8} ${cy - 46} 
              Q ${cx + 11} ${cy - 48} ${cx + 14} ${cy - 45}
              Q ${cx + 11} ${cy - 43} ${cx + 8} ${cy - 46}
              Z
            `}
            fill="#ffffff"
          />
          <Circle
            cx={cx + 11}
            cy={cy - 45.5}
            r="1.8"
            fill="#1a1a1a"
          />

          <Path
            d={`M ${cx + 7} ${cy - 51} Q ${cx + 11} ${cy - 53} ${cx + 14} ${cy - 50}`}
            stroke="#1a1a1a"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d={`M ${cx + 13} ${cy - 34} Q ${cx + 9} ${cy - 35} ${cx + 11} ${cy - 37}`}
            stroke="#cda67e"
            strokeWidth="1.5"
            fill="none"
          />

          <AnimatedG
            style={{
              transform: [
                { translateX: pivotX },
                { translateY: pivotY },
                { rotate: rotation },
                { translateX: -pivotX },
                { translateY: -pivotY },
              ],
            }}
          >
            <Line
              x1={cx - 30}
              y1={cy - 75}
              x2={cx - 2}
              y2={cy + 10}
              stroke="#9c7a52"
              strokeWidth="14"
              strokeLinecap="round"
            />
            <Line
              x1={cx - 28}
              y1={cy - 72}
              x2={cx - 4}
              y2={cy + 7}
              stroke="#cbb393"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            <Line
              x1={cx - 10}
              y1={cy - 12}
              x2={cx - 2}
              y2={cy + 10}
              stroke="#6e5033"
              strokeWidth="8.5"
            />

            <Path
              d={`
                M ${cx - 18} ${cy - 8} 
                Q ${cx - 24} ${cy + 12} ${cx - 3} ${cy + 8}
              `}
              stroke="#baa080"
              strokeWidth="12"
              strokeLinecap="round"
              fill="none"
            />
            <Circle
              cx={cx - 3}
              cy={cy + 8}
              r={7.5}
              fill="#baa080"
            />

            <Path
              d={`
                M ${cx + 10} ${cy - 6} 
                Q ${cx + 4} ${cy + 10} ${cx - 2} ${cy + 5}
              `}
              stroke="#c8a882"
              strokeWidth="13"
              strokeLinecap="round"
              fill="none"
            />
            <Circle
              cx={cx - 2}
              cy={cy + 5}
              r={8}
              fill="#c8a882"
            />
          </AnimatedG>
        </G>
      </Svg>
    </View>
  );
}