import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../constants/colors';

interface AudioVisualizerProps {
  isPlaying: boolean;
  barCount?: number;
}

export default function AudioVisualizer({ isPlaying, barCount = 20 }: AudioVisualizerProps) {
  const [bars] = useState(() => 
    Array.from({ length: barCount }, () => new Animated.Value(0.3))
  );

  useEffect(() => {
    if (isPlaying) {
      const animations = bars.map((bar, index) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(bar, {
              toValue: Math.random() * 0.7 + 0.3,
              duration: 150 + Math.random() * 200,
              useNativeDriver: false,
            }),
            Animated.timing(bar, {
              toValue: Math.random() * 0.4 + 0.2,
              duration: 150 + Math.random() * 200,
              useNativeDriver: false,
            }),
          ])
        );
      });
      
      animations.forEach(anim => anim.start());
      
      return () => {
        animations.forEach(anim => anim.stop());
      };
    } else {
      bars.forEach(bar => {
        Animated.timing(bar, {
          toValue: 0.2,
          duration: 300,
          useNativeDriver: false,
        }).start();
      });
    }
  }, [isPlaying]);

  return (
    <View style={styles.container}>
      {bars.map((bar, index) => (
        <Animated.View
          key={index}
          style={[
            styles.bar,
            {
              height: bar.interpolate({
                inputRange: [0, 1],
                outputRange: ['10%', '100%'],
              }),
              backgroundColor: index % 3 === 0 ? COLORS.primary : index % 3 === 1 ? COLORS.secondary : COLORS.gold,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 60,
    paddingHorizontal: 20,
    gap: 3,
  },
  bar: {
    width: 4,
    borderRadius: 2,
    minHeight: 6,
  },
});
