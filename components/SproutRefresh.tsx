import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { palette } from '../lib/theme';

/**
 * PlantDoctor's custom pull-to-refresh: a growing sprout.
 *
 * The pull is scrubbed by finger distance — the sprout drops in and
 * grows (stem stretches, leaves unfurl) as the user pulls down past
 * the top; past the threshold, releasing plays the sway loop while data
 * returns, then the content settles with a spring. Never the stock
 * spinner. On web, where native pull-to-refresh doesn't exist, the
 * same animation is wired to the header refresh button (see the
 * `SproutButton` export).
 */

const THRESHOLD = 90;

function SproutVisual({
  fill,
  refreshing,
}: {
  /** 0–1 growth level while pulling; ignored while `refreshing` loops. */
  fill: SharedValue<number>;
  refreshing: boolean;
}) {
  const loop = useSharedValue(0);
  useEffect(() => {
    if (refreshing) {
      loop.value = withRepeat(
        withSequence(withTiming(1, { duration: 700 }), withTiming(0, { duration: 700 })),
        -1,
        false,
      );
    } else {
      loop.value = withTiming(0, { duration: 300 });
    }
  }, [refreshing, loop]);

  const stemStyle = useAnimatedStyle(() => {
    const level = refreshing ? 0.7 + loop.value * 0.3 : Math.min(1, Math.max(0.05, fill.value));
    return { height: 10 + level * 30 };
  });
  const leafStyle = useAnimatedStyle(() => {
    const level = refreshing ? 0.7 + loop.value * 0.3 : Math.min(1, Math.max(0, fill.value));
    return {
      opacity: level,
      transform: [{ scale: Math.max(0.2, level) }, { rotate: `${(1 - level) * -30}deg` }],
    };
  });
  const swayStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: refreshing ? `${-6 + loop.value * 12}deg` : '0deg' }],
  }));

  return (
    <View style={styles.sproutWrap}>
      <Animated.View style={[styles.sprout, swayStyle]}>
        <Animated.View style={[styles.leaf, styles.leafLeft, leafStyle]}>
          <Text style={styles.leafGlyph}>🍃</Text>
        </Animated.View>
        <Animated.View style={[styles.leaf, styles.leafRight, leafStyle]}>
          <Text style={styles.leafGlyph}>🍃</Text>
        </Animated.View>
        <Animated.View style={[styles.stem, stemStyle]} />
        <View style={styles.pot}>
          <Text style={styles.potGlyph}>🌱</Text>
        </View>
      </Animated.View>
    </View>
  );
}

/** The header refresh visual on web — same sprout, same loop. Wrap it
 *  in the parent's own pressable; this component is visual only. */
export function SproutButton({ refreshing }: { refreshing: boolean }) {
  const fill = useSharedValue(0);
  useEffect(() => {
    fill.value = withSpring(refreshing ? 1 : 0, { damping: 14, stiffness: 200 });
  }, [refreshing, fill]);
  return <SproutVisual fill={fill} refreshing={refreshing} />;
}

export function PullToRefresh({
  refreshing,
  onRefresh,
  children,
}: {
  refreshing: boolean;
  onRefresh: () => void;
  children: React.ReactNode;
}) {
  // 0–1 pull progress; the sprout growth reads it directly.
  const pull = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      pull.value = Math.min(1, Math.max(0, -event.contentOffset.y / THRESHOLD));
    },
    onEndDrag: (event) => {
      if (event.contentOffset.y < -THRESHOLD) {
        runOnJS(onRefresh)();
      }
    },
  });

  const indicatorStyle = useAnimatedStyle(() => ({
    height: refreshing ? 76 : pull.value * 76,
    opacity: refreshing || pull.value > 0.08 ? 1 : 0,
  }));

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.indicator, indicatorStyle]}>
        <SproutVisual fill={pull} refreshing={refreshing} />
      </Animated.View>
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {children}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  indicator: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  content: { paddingBottom: 120 },
  sproutWrap: { alignItems: 'center', justifyContent: 'center' },
  sprout: {
    alignItems: 'center',
    height: 64,
    justifyContent: 'flex-end',
    position: 'relative',
    width: 96,
  },
  stem: {
    backgroundColor: palette.accent,
    borderRadius: 3,
    width: 5,
  },
  leaf: { position: 'absolute', top: 2 },
  leafLeft: { left: 18 },
  leafRight: { right: 18, transform: [{ scaleX: -1 }] },
  leafGlyph: { fontSize: 22 },
  pot: {
    alignItems: 'center',
    backgroundColor: palette.primarySoft,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  potGlyph: { fontSize: 22 },
});
