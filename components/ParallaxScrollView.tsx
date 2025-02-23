import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  useColorScheme,
  type ColorValue,
  type ScrollViewProps,
} from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

const HEADER_HEIGHT = 200;

type Props = ScrollViewProps & {
  headerBackgroundColor: {
    light: string;
    dark: string;
  };
  headerImage?: React.ReactNode;
};

export default function ParallaxScrollView({
  children,
  headerBackgroundColor,
  headerImage,
  ...props
}: Props) {
  const colorScheme = useColorScheme();
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerStyle = useAnimatedStyle(() => {
    return {
      height: HEADER_HEIGHT,
      backgroundColor: interpolateColor(
        scrollY.value,
        [0, HEADER_HEIGHT],
        [
          headerBackgroundColor[colorScheme ?? 'light'],
          headerBackgroundColor[colorScheme ?? 'light'],
        ]
      ) as ColorValue,
      opacity: interpolateColor(
        scrollY.value,
        [0, HEADER_HEIGHT],
        [1, 0.8]
      ) as number,
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.header, headerStyle]}>
        {headerImage}
      </Animated.View>
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        {...props}>
        {children}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    zIndex: -1,
  },
});
