import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { palette, radii } from '../lib/theme';
import { useApp } from '../lib/store';
import { SpringPress } from './ui';

/**
 * Flat labeled bottom tab bar — solid cream bar with a top hairline
 * border and a terracotta pill indicator on the active tab. Deliberately
 * NOT the floating glass pill bar the earlier apps used.
 * Tabs: Garden, Diagnose, Care, Settings.
 */
const TABS = [
  { route: '/', label: 'Garden', glyph: '✿' },
  { route: '/diagnose', label: 'Diagnose', glyph: '🔍' },
  { route: '/care', label: 'Care', glyph: '💧' },
  { route: '/settings', label: 'Settings', glyph: '⚙' },
] as const;

export function TabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { todaysTasks } = useApp();

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <View style={styles.bar}>
        {TABS.map((tab) => {
          const active =
            pathname === tab.route || (tab.route === '/' && pathname === '/index');
          const badge = tab.route === '/care' ? todaysTasks.length : 0;
          return (
            <SpringPress
              key={tab.route}
              onPress={() => router.replace(tab.route as never)}
              style={styles.tabPress}
            >
              <View style={styles.tab}>
                <Text style={[styles.glyph, active && styles.glyphActive]}>{tab.glyph}</Text>
                <Text style={[styles.label, active && styles.labelActive]}>{tab.label}</Text>
                <View style={[styles.indicator, active && styles.indicatorActive]} />
                {badge > 0 ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{badge}</Text>
                  </View>
                ) : null}
              </View>
            </SpringPress>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: palette.background,
    borderTopColor: palette.line,
    borderTopWidth: 1,
    paddingTop: 6,
  },
  bar: {
    flexDirection: 'row',
  },
  tabPress: { flex: 1 },
  tab: {
    alignItems: 'center',
    gap: 2,
    justifyContent: 'center',
    minHeight: 52,
    position: 'relative',
  },
  glyph: { color: palette.muted, fontSize: 20, fontWeight: '700' },
  glyphActive: { color: palette.primary },
  label: { color: palette.muted, fontSize: 12, fontWeight: '700' },
  labelActive: { color: palette.primary },
  indicator: {
    backgroundColor: 'transparent',
    borderRadius: radii.pill,
    height: 4,
    marginTop: 2,
    width: 28,
  },
  indicatorActive: { backgroundColor: palette.primary },
  badge: {
    alignItems: 'center',
    backgroundColor: palette.primary,
    borderRadius: 10,
    height: 20,
    justifyContent: 'center',
    minWidth: 20,
    paddingHorizontal: 5,
    position: 'absolute',
    right: 14,
    top: 2,
  },
  badgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
});
