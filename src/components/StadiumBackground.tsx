import React from 'react';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  RadialGradient,
  Rect,
  Ellipse,
  Path,
  Circle,
  G,
  Polygon,
} from 'react-native-svg';

interface StadiumBackgroundProps {
  width: number;
  height: number;
}

export default function StadiumBackground({ width, height }: StadiumBackgroundProps) {
  const W = width;
  const H = height;

  const horizon = H * 0.40;
  const grassStart = horizon;
  const vp = { x: W * 0.5, y: H * 0.38 };

  const fieldLeft  = -W * 0.1;
  const fieldRight = W * 1.1;
  const fieldBottom = H;

  const dirtTrapezoid = [
    `${W * 0.08},${H * 0.98}`,   // bottom-left
    `${W * 0.92},${H * 0.98}`,   // bottom-right
    `${W * 0.72},${H * 0.44}`,   // top-right (near pitcher)
    `${W * 0.28},${H * 0.44}`,   // top-left
  ].join(' ');

  const homeX  = W * 0.50;  const homeY  = H * 0.87;
  const firstX = W * 0.73;  const firstY = H * 0.65;
  const secondX = W * 0.50; const secondY = H * 0.46;
  const thirdX = W * 0.27;  const thirdY = H * 0.65;
  const baselinePath = `
    M ${homeX} ${homeY}
    L ${firstX} ${firstY}
    L ${secondX} ${secondY}
    L ${thirdX} ${thirdY}
    Z
  `;
  const moundX = W * 0.50;
  const moundY = H * 0.55;

  return (
    <Svg width={W} height={H} style={{ position: 'absolute', top: 0, left: 0 }}>
      <Defs>
        <LinearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%"   stopColor="#020b1a" stopOpacity="1" />
          <Stop offset="40%"  stopColor="#03183a" stopOpacity="1" />
          <Stop offset="100%" stopColor="#071e4a" stopOpacity="1" />
        </LinearGradient>
        <LinearGradient id="grassGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%"   stopColor="#1a5c1a" stopOpacity="1" />
          <Stop offset="100%" stopColor="#2d8c2d" stopOpacity="1" />
        </LinearGradient>
        <LinearGradient id="dirtGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%"   stopColor="#7a4820" stopOpacity="1" />
          <Stop offset="100%" stopColor="#c47a35" stopOpacity="1" />
        </LinearGradient>
        <LinearGradient id="nearGrassGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%"   stopColor="#2d8c2d" stopOpacity="1" />
          <Stop offset="100%" stopColor="#3aaa3a" stopOpacity="1" />
        </LinearGradient>

        <RadialGradient id="lightGlowL" cx="30%" cy="0%" r="30%">
          <Stop offset="0%"  stopColor="#a8d8ff" stopOpacity="0.55" />
          <Stop offset="100%" stopColor="#a8d8ff" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="lightGlowR" cx="70%" cy="0%" r="30%">
          <Stop offset="0%"  stopColor="#a8d8ff" stopOpacity="0.55" />
          <Stop offset="100%" stopColor="#a8d8ff" stopOpacity="0" />
        </RadialGradient>

        <RadialGradient id="fieldLight" cx="50%" cy="42%" r="70%">
          <Stop offset="0%"   stopColor="#ffffff" stopOpacity="0.12" />
          <Stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="moundGrad" cx="50%" cy="40%" r="50%">
          <Stop offset="0%"   stopColor="#d4935a" stopOpacity="1" />
          <Stop offset="100%" stopColor="#9a5520" stopOpacity="1" />
        </RadialGradient>
      </Defs>
      <Rect x="0" y="0" width={W} height={H} fill="url(#skyGrad)" />

      <Rect x="0" y="0" width={W} height={H * 0.5} fill="url(#lightGlowL)" />
      <Rect x="0" y="0" width={W} height={H * 0.5} fill="url(#lightGlowR)" />

      <G opacity="0.7">
        <Ellipse cx={W * 0.12} cy={H * 0.08} rx={W * 0.10} ry={H * 0.035} fill="#0d2a5a" />
        <Ellipse cx={W * 0.08} cy={H * 0.075} rx={W * 0.07} ry={H * 0.03} fill="#0d2a5a" />
        <Ellipse cx={W * 0.18} cy={H * 0.07} rx={W * 0.06} ry={H * 0.025} fill="#0d2a5a" />

        <Ellipse cx={W * 0.88} cy={H * 0.07} rx={W * 0.10} ry={H * 0.035} fill="#0d2a5a" />
        <Ellipse cx={W * 0.82} cy={H * 0.065} rx={W * 0.07} ry={H * 0.028} fill="#0d2a5a" />
        <Ellipse cx={W * 0.94} cy={H * 0.075} rx={W * 0.06} ry={H * 0.025} fill="#0d2a5a" />

        <Ellipse cx={W * 0.52} cy={H * 0.12} rx={W * 0.08} ry={H * 0.022} fill="#0c2550" />
      </G>

      <G fill="#0a1f45" opacity="0.9">
        <Rect x={W * 0.02}  y={horizon - H * 0.18} width={W * 0.05} height={H * 0.18} />
        <Rect x={W * 0.06}  y={horizon - H * 0.13} width={W * 0.04} height={H * 0.13} />
        <Rect x={W * 0.09}  y={horizon - H * 0.22} width={W * 0.035} height={H * 0.22} />
        <Rect x={W * 0.12}  y={horizon - H * 0.15} width={W * 0.045} height={H * 0.15} />
        <Rect x={W * 0.16}  y={horizon - H * 0.10} width={W * 0.03}  height={H * 0.10} />
        <Rect x={W * 0.19}  y={horizon - H * 0.17} width={W * 0.04}  height={H * 0.17} />
        <Rect x={W * 0.79}  y={horizon - H * 0.17} width={W * 0.04}  height={H * 0.17} />
        <Rect x={W * 0.83}  y={horizon - H * 0.10} width={W * 0.03}  height={H * 0.10} />
        <Rect x={W * 0.86}  y={horizon - H * 0.15} width={W * 0.045} height={H * 0.15} />
        <Rect x={W * 0.90}  y={horizon - H * 0.22} width={W * 0.035} height={H * 0.22} />
        <Rect x={W * 0.93}  y={horizon - H * 0.13} width={W * 0.04}  height={H * 0.13} />
        <Rect x={W * 0.96}  y={horizon - H * 0.18} width={W * 0.05}  height={H * 0.18} />
      </G>

      <G fill="#4a9eff" opacity="0.6">
        <Rect x={W * 0.03}  y={horizon - H * 0.16} width={2} height={2} />
        <Rect x={W * 0.05}  y={horizon - H * 0.16} width={2} height={2} />
        <Rect x={W * 0.03}  y={horizon - H * 0.12} width={2} height={2} />
        <Rect x={W * 0.10}  y={horizon - H * 0.20} width={2} height={2} />
        <Rect x={W * 0.12}  y={horizon - H * 0.17} width={2} height={2} />
        <Rect x={W * 0.10}  y={horizon - H * 0.14} width={2} height={2} />
        <Rect x={W * 0.20}  y={horizon - H * 0.15} width={2} height={2} />
        <Rect x={W * 0.22}  y={horizon - H * 0.12} width={2} height={2} />
        {/* Right buildings windows */}
        <Rect x={W * 0.80}  y={horizon - H * 0.15} width={2} height={2} />
        <Rect x={W * 0.82}  y={horizon - H * 0.12} width={2} height={2} />
        <Rect x={W * 0.87}  y={horizon - H * 0.13} width={2} height={2} />
        <Rect x={W * 0.90}  y={horizon - H * 0.20} width={2} height={2} />
        <Rect x={W * 0.92}  y={horizon - H * 0.16} width={2} height={2} />
        <Rect x={W * 0.94}  y={horizon - H * 0.12} width={2} height={2} />
      </G>
      <G fill="#ffe080" opacity="0.5">
        <Rect x={W * 0.04}  y={horizon - H * 0.09} width={2} height={2} />
        <Rect x={W * 0.11}  y={horizon - H * 0.08} width={2} height={2} />
        <Rect x={W * 0.21}  y={horizon - H * 0.09} width={2} height={2} />
        <Rect x={W * 0.79}  y={horizon - H * 0.09} width={2} height={2} />
        <Rect x={W * 0.88}  y={horizon - H * 0.08} width={2} height={2} />
        <Rect x={W * 0.94}  y={horizon - H * 0.08} width={2} height={2} />
      </G>

      <G fill="#1a5c1a" opacity="0.85">
        <Ellipse cx={W * 0.24} cy={horizon - 2} rx={W * 0.045} ry={H * 0.028} />
        <Ellipse cx={W * 0.30} cy={horizon - 4} rx={W * 0.05}  ry={H * 0.030} />
        <Ellipse cx={W * 0.20} cy={horizon}     rx={W * 0.035} ry={H * 0.022} />
        <Ellipse cx={W * 0.76} cy={horizon - 2} rx={W * 0.045} ry={H * 0.028} />
        <Ellipse cx={W * 0.70} cy={horizon - 4} rx={W * 0.05}  ry={H * 0.030} />
        <Ellipse cx={W * 0.80} cy={horizon}     rx={W * 0.035} ry={H * 0.022} />
      </G>

      <Rect
        x={W * 0.05} y={horizon - 3}
        width={W * 0.90} height={8}
        rx={3}
        fill="#2255aa"
        opacity="0.9"
      />
      <Rect
        x={W * 0.05} y={horizon - 3}
        width={W * 0.90} height={3}
        rx={2}
        fill="#4488dd"
        opacity="0.6"
      />

      <Path
        d={`M ${W * 0.05} ${horizon + 5}
            L ${W * 0.28} ${H * 0.44}
            L ${W * 0.72} ${H * 0.44}
            L ${W * 0.95} ${horizon + 5}
            Z`}
        fill="url(#grassGrad)"
      />

      <G opacity="0.12">
        {[0.44, 0.47, 0.50, 0.53, 0.56, 0.59, 0.62].map((y, i) => (
          <Rect key={i} x={0} y={H * y} width={W} height={H * 0.015} fill={i % 2 === 0 ? '#000' : '#fff'} />
        ))}
      </G>

      <Rect x="0" y={horizon} width={W} height={H - horizon} fill="url(#fieldLight)" />

      <Polygon points={dirtTrapezoid} fill="url(#dirtGrad)" />

      <Path
        d={`M 0 ${H} L ${W * 0.08} ${H * 0.98} L 0 ${H * 0.98} Z`}
        fill="url(#nearGrassGrad)"
      />
      <Path
        d={`M ${W} ${H} L ${W * 0.92} ${H * 0.98} L ${W} ${H * 0.98} Z`}
        fill="url(#nearGrassGrad)"
      />
      <Path
        d={`M ${fieldLeft} ${fieldBottom}
            L ${W * 0.08} ${H * 0.98}
            L ${W * 0.28} ${H * 0.44}
            L ${W * 0.05} ${horizon + 5}
            Z`}
        fill="url(#nearGrassGrad)"
      />
      <Path
        d={`M ${fieldRight} ${fieldBottom}
            L ${W * 0.92} ${H * 0.98}
            L ${W * 0.72} ${H * 0.44}
            L ${W * 0.95} ${horizon + 5}
            Z`}
        fill="url(#nearGrassGrad)"
      />

      <Path
        d={baselinePath}
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="2"
        fill="none"
      />

      <Rect
        x={firstX - 5} y={firstY - 4}
        width={10} height={8}
        rx={1}
        fill="white"
        opacity="0.92"
      />
      <Rect
        x={secondX - 4} y={secondY - 3}
        width={8} height={6}
        rx={1}
        fill="white"
        opacity="0.92"
      />
      <Rect
        x={thirdX - 5} y={thirdY - 4}
        width={10} height={8}
        rx={1}
        fill="white"
        opacity="0.92"
      />

      <Ellipse
        cx={moundX} cy={moundY}
        rx={W * 0.055} ry={H * 0.022}
        fill="url(#moundGrad)"
      />
      <Ellipse
        cx={moundX} cy={moundY - H * 0.005}
        rx={W * 0.025} ry={H * 0.009}
        fill="rgba(220,180,130,0.5)"
      />
      <Rect
        x={moundX - 6} y={moundY - 2}
        width={12} height={4}
        rx={1}
        fill="white"
        opacity="0.8"
      />

      <Rect
        x={homeX - 22} y={homeY - 18}
        width={18} height={28}
        stroke="rgba(255,255,255,0.45)"
        strokeWidth="1.5"
        fill="none"
      />
      <Rect
        x={homeX + 4} y={homeY - 18}
        width={18} height={28}
        stroke="rgba(255,255,255,0.45)"
        strokeWidth="1.5"
        fill="none"
      />

      <G>
        <Rect x={W * 0.29 - 3} y={H * 0.06} width={6} height={H * 0.34} rx={2} fill="#334466" />
        <Rect x={W * 0.29 - 22} y={H * 0.06} width={44} height={8} rx={3} fill="#445577" />
        <Ellipse cx={W * 0.29 - 14} cy={H * 0.06 + 4} rx={5} ry={4} fill="#fffde0" opacity="0.95" />
        <Ellipse cx={W * 0.29}      cy={H * 0.06 + 4} rx={5} ry={4} fill="#fffde0" opacity="0.95" />
        <Ellipse cx={W * 0.29 + 14} cy={H * 0.06 + 4} rx={5} ry={4} fill="#fffde0" opacity="0.95" />
        <Ellipse cx={W * 0.29 - 14} cy={H * 0.06 + 4} rx={11} ry={9} fill="#a0d8ff" opacity="0.30" />
        <Ellipse cx={W * 0.29}      cy={H * 0.06 + 4} rx={11} ry={9} fill="#a0d8ff" opacity="0.30" />
        <Ellipse cx={W * 0.29 + 14} cy={H * 0.06 + 4} rx={11} ry={9} fill="#a0d8ff" opacity="0.30" />
      </G>
      <G>
        <Rect x={W * 0.71 - 3} y={H * 0.06} width={6} height={H * 0.34} rx={2} fill="#334466" />
        <Rect x={W * 0.71 - 22} y={H * 0.06} width={44} height={8} rx={3} fill="#445577" />
        <Ellipse cx={W * 0.71 - 14} cy={H * 0.06 + 4} rx={5} ry={4} fill="#fffde0" opacity="0.95" />
        <Ellipse cx={W * 0.71}      cy={H * 0.06 + 4} rx={5} ry={4} fill="#fffde0" opacity="0.95" />
        <Ellipse cx={W * 0.71 + 14} cy={H * 0.06 + 4} rx={5} ry={4} fill="#fffde0" opacity="0.95" />
        <Ellipse cx={W * 0.71 - 14} cy={H * 0.06 + 4} rx={11} ry={9} fill="#a0d8ff" opacity="0.30" />
        <Ellipse cx={W * 0.71}      cy={H * 0.06 + 4} rx={11} ry={9} fill="#a0d8ff" opacity="0.30" />
        <Ellipse cx={W * 0.71 + 14} cy={H * 0.06 + 4} rx={11} ry={9} fill="#a0d8ff" opacity="0.30" />
      </G>

      <Path
        d={`M ${W * 0.29} ${H * 0.07} L ${W * 0.15} ${H * 0.42} L ${W * 0.43} ${H * 0.42} Z`}
        fill="#a8d8ff"
        opacity="0.04"
      />
      <Path
        d={`M ${W * 0.71} ${H * 0.07} L ${W * 0.57} ${H * 0.42} L ${W * 0.85} ${H * 0.42} Z`}
        fill="#a8d8ff"
        opacity="0.04"
      />
    </Svg>
  );
}
