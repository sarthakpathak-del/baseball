import React from 'react';
import { Image, StyleSheet } from 'react-native';

const stadiumImage = require('../assets/stadium.png');

interface StadiumBackgroundProps {
  width: number;
  height: number;
}

export default function StadiumBackground({ width, height }: StadiumBackgroundProps) {
  return (
    <Image
      source={stadiumImage}
      style={[styles.background, { width, height }]}
      resizeMode="cover"
    />
  );
}

const styles = StyleSheet.create({
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
