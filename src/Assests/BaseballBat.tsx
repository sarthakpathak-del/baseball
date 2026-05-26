import React from 'react';

import {
  Animated,
  StyleSheet,
  View,
} from 'react-native';

import Svg, {
  Path,
} from 'react-native-svg';

export const BAT_WIDTH = 30;
export const BAT_HEIGHT = 30;
export const BAT_PIVOT_X = 11;
export const BAT_PIVOT_Y = 32;
export const BAT_HANDLE_X = 11;
export const BAT_HANDLE_Y = 28;
export const BAT_BARREL_X = 21;
export const BAT_BARREL_Y = 3;
export const BAT_SWING_OFFSET_X = -2;
export const BAT_SWING_OFFSET_Y = -3;

interface Props {
  plateX: number;
  plateY: number;
  batSwing: Animated.Value;
  batRotate: any;
}

export default function BaseballBat({
  plateX,
  plateY,
  batSwing,
  batRotate,
}: Props) {
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.pivot,
        {
          left: plateX,
          top: plateY,

          transform: [
            {
              translateX: batSwing.interpolate({
                inputRange: [0, 1],
                outputRange: [0, BAT_SWING_OFFSET_X],
              }),
            },
            {
              translateY: batSwing.interpolate({
                inputRange: [0, 1],
                outputRange: [0, BAT_SWING_OFFSET_Y],
              }),
            },
            { rotate: batRotate },
          ],
        },
      ]}
    >
      <View style={styles.container}>
        <Svg
          width={BAT_WIDTH}
          height={BAT_HEIGHT}
          viewBox="-0.01 0 41.877 41.877"
        >
          <Path
            d="M84.9,242.457l.108.109-.376.333a2.983,2.983,0,0,1-.325.405,18.649,18.649,0,0,1-1.766,1.422c-2.741,2.373-7.3,6.236-11.245,9.185-8.819,6.59-7.6,4.816-13.81,9.907a60.474,60.474,0,0,0-8.4,8.218c.844,1.177,1.16,2.285.7,2.749-.614.614-2.357-.135-3.894-1.672s-2.286-3.281-1.672-3.894c.407-.407,1.312-.2,2.323.423a66.746,66.746,0,0,0,7.671-7.987c5.145-6.246,3.979-4.578,10.056-13.86a63.743,63.743,0,0,1,10.3-11.548,10.5,10.5,0,0,1,1.126-1.563c1.389-1.389,6.444-2.585,8.824-.2C86.538,236.507,85.969,240.467,84.9,242.457Z"
            transform="translate(-44.001 -233.123)"
            fill="#d1b771"
          />
        </Svg>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pivot: {
    position: 'absolute',
    width: 0,
    height: 0,
    zIndex: 50,
  },

  container: {
    position: 'absolute',
    left: -BAT_PIVOT_X,
    top: -BAT_PIVOT_Y,
    width: BAT_WIDTH,
    height: BAT_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
});
