import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { getPlantPhoto } from '../lib/photos';
import { palette, radii, spacing, type } from '../lib/theme';
import type { SavedPlant } from '../lib/types';
import { GlassCard, SpringPress } from './ui';

/**
 * Arch-top plant tile: the photo sits in an arch frame (border-top
 * radius 999px), with the plant name and a small care line below.
 */
export function PlantCard({
  plant,
  index,
  onPress,
}: {
  plant: SavedPlant;
  index: number;
  onPress: () => void;
}) {
  const dueCount = plant.tasks.filter((t) => !t.done).length;
  return (
    <Animated.View entering={FadeInDown.delay(60 * index).springify()}>
      <SpringPress onPress={onPress}>
        <View style={styles.tile}>
          <Image source={getPlantPhoto(plant.type)} style={styles.photo} resizeMode="cover" />
          <View style={styles.body}>
            <Text style={styles.name} numberOfLines={1}>
              {plant.name}
            </Text>
            <Text style={styles.meta} numberOfLines={1}>
              {plant.type} · {plant.location}
            </Text>
            <View style={styles.pills}>
              <View style={[styles.pill, styles.pillWater]}>
                <Text style={styles.pillText}>💧 {plant.water}</Text>
              </View>
              {dueCount > 0 ? (
                <View style={[styles.pill, styles.pillDue]}>
                  <Text style={[styles.pillText, styles.pillDueText]}>
                    {dueCount} task{dueCount === 1 ? '' : 's'} due
                  </Text>
                </View>
              ) : (
                <View style={[styles.pill, styles.pillOk]}>
                  <Text style={[styles.pillText, styles.pillOkText]}>✓ All caught up</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </SpringPress>
    </Animated.View>
  );
}

export function PlantCardRow({ plant, onPress }: { plant: SavedPlant; onPress: () => void }) {
  return (
    <SpringPress onPress={onPress}>
      <GlassCard style={styles.row}>
        <Image source={getPlantPhoto(plant.type)} style={styles.rowPhoto} resizeMode="cover" />
        <View style={styles.rowBody}>
          <Text style={styles.rowName}>{plant.name}</Text>
          <Text style={styles.rowMeta}>
            {plant.type} · {plant.location}
          </Text>
        </View>
        <Text style={styles.rowArrow}>›</Text>
      </GlassCard>
    </SpringPress>
  );
}

const styles = StyleSheet.create({
  tile: {
    backgroundColor: palette.surface,
    borderColor: palette.line,
    borderRadius: radii.card,
    borderWidth: 1,
    overflow: 'hidden',
    ...{ shadowColor: '#8A3E1F', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.08, shadowRadius: 24, elevation: 4 },
  },
  photo: {
    borderBottomLeftRadius: radii.card,
    borderBottomRightRadius: radii.card,
    borderTopLeftRadius: radii.arch,
    borderTopRightRadius: radii.arch,
    height: 190,
    width: '100%',
  },
  body: { gap: 6, padding: spacing.md },
  name: { ...type.subtitle, color: palette.ink },
  meta: { ...type.caption, color: palette.muted },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  pill: {
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  pillWater: { backgroundColor: palette.primarySoft },
  pillDue: { backgroundColor: palette.warningSoft },
  pillOk: { backgroundColor: palette.accentSoft },
  pillText: { color: palette.primary, fontSize: 11, fontWeight: '800' },
  pillDueText: { color: palette.warning },
  pillOkText: { color: palette.accentDeep },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  rowPhoto: { borderRadius: 24, height: 56, width: 56 },
  rowBody: { flex: 1 },
  rowName: { ...type.bodyStrong, color: palette.ink },
  rowMeta: { ...type.body, color: palette.body },
  rowArrow: { color: palette.muted, fontSize: 24 },
});
