import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AuroraBackground } from '../../components/AuroraBackground';
import { DiagnosisDetail } from '../../components/DiagnosisDetail';
import { TabBar } from '../../components/TabBar';
import { EmptyState, GhostButton, GlassCard, SectionHeader } from '../../components/ui';
import { getPlantPhoto } from '../../lib/photos';
import { libraryEntryFor } from '../../lib/plants';
import { useApp } from '../../lib/store';
import { palette, radii, spacing, type, useResponsive } from '../../lib/theme';

/**
 * Plant detail — arch photo header, care guide (light / water / feeding),
 * its diagnoses, its care tasks, remove plant.
 */
export default function PlantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { plantById, removePlant, toggleTask, plants } = useApp();
  const r = useResponsive();
  const [removed, setRemoved] = useState(false);

  const plant = plantById(id ?? '');
  const library = plant ? libraryEntryFor(plant.type) : null;

  if (!plant || removed) {
    return (
      <View style={styles.root}>
        <AuroraBackground />
        <ScrollView contentContainerStyle={styles.scroll}>
          <EmptyState
            glyph="🌱"
            title={removed ? 'Plant removed' : 'Plant not found'}
            body="This plant is not in your garden any more."
            actionLabel="Back to garden"
            onAction={() => router.replace('/')}
          />
        </ScrollView>
        <TabBar />
      </View>
    );
  }

  const doRemove = () => {
    removePlant(plant.id);
    setRemoved(true);
  };

  return (
    <View style={styles.root}>
      <AuroraBackground />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { maxWidth: r.contentMaxWidth, alignSelf: 'center' },
        ]}
      >
        <Animated.View entering={FadeInDown.springify()}>
          <Image source={getPlantPhoto(plant.type)} style={styles.photo} resizeMode="cover" />
          <Text style={styles.kicker}>{plant.type.toUpperCase()}</Text>
          <Text style={[styles.title, r.display]}>{plant.name}</Text>
          <Text style={styles.location}>📍 {plant.location}</Text>
          {plant.notes ? <Text style={styles.notes}>{plant.notes}</Text> : null}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).springify()}>
          <SectionHeader kicker="Care guide" title="How to keep it happy" />
          <GlassCard style={styles.guideCard}>
            <GuideRow label="☀️ Light" value={plant.light} />
            <GuideRow label="💧 Water" value={plant.water} />
            <GuideRow label="🌿 Feeding" value={plant.feeding} />
            {library ? <GuideRow label="📖 Tip" value={library.notes} /> : null}
          </GlassCard>
        </Animated.View>

        {plant.tasks.length > 0 ? (
          <Animated.View entering={FadeInDown.delay(140).springify()}>
            <SectionHeader kicker="Care schedule" title="Tasks for this plant" />
            {plant.tasks.map((task) => (
              <GlassCard key={task.id} style={styles.taskRow}>
                <View
                  style={[styles.checkCircle, task.done && styles.checkCircleDone]}
                >
                  <Text
                    style={styles.checkText}
                    onPress={() => toggleTask(plant.id, task.id)}
                  >
                    {task.done ? '✓' : ''}
                  </Text>
                </View>
                <View style={styles.taskBody}>
                  <Text style={styles.taskName}>{task.label}</Text>
                  <Text style={styles.taskMeta}>Due {task.due}</Text>
                </View>
              </GlassCard>
            ))}
          </Animated.View>
        ) : null}

        {plant.diagnoses.length > 0 ? (
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <SectionHeader kicker="Health record" title="Past diagnoses" />
            {plant.diagnoses.map((d) => (
              <View key={d.id} style={styles.diagnosisBlock}>
                <DiagnosisDetail diagnosis={d} />
              </View>
            ))}
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <GlassCard style={styles.noDiag}>
              <Text style={styles.noDiagText}>
                No diagnoses for this plant yet — if something looks off, run a diagnosis and
                save it here.
              </Text>
              <GhostButton label="Diagnose this plant" onPress={() => router.push('/diagnose')} />
            </GlassCard>
          </Animated.View>
        )}

        <View style={styles.danger}>
          <GhostButton label="Remove this plant" onPress={doRemove} />
        </View>
        <Text style={styles.otherHint}>
          {plants.length > 1
            ? 'Other plants in your garden: ' +
              plants
                .filter((p) => p.id !== plant.id)
                .map((p) => p.name)
                .join(', ')
            : ''}
        </Text>
      </ScrollView>
      <TabBar />
    </View>
  );
}

function GuideRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.guideRow}>
      <Text style={styles.guideLabel}>{label}</Text>
      <Text style={styles.guideValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 140, width: '100%' },
  photo: {
    borderBottomLeftRadius: radii.card,
    borderBottomRightRadius: radii.card,
    borderTopLeftRadius: radii.arch,
    borderTopRightRadius: radii.arch,
    height: 320,
    marginBottom: spacing.md,
    width: '100%',
  },
  kicker: { ...type.label, color: palette.primary, marginBottom: 6 },
  title: { color: palette.ink, marginBottom: 6 },
  location: { ...type.body, color: palette.body, marginBottom: 8 },
  notes: { ...type.body, color: palette.body, fontStyle: 'italic', marginBottom: spacing.md },
  guideCard: { gap: 12, padding: spacing.md },
  guideRow: { gap: 2 },
  guideLabel: { ...type.bodyStrong, color: palette.ink },
  guideValue: { ...type.body, color: palette.body },
  taskRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  checkCircle: {
    alignItems: 'center',
    borderColor: palette.primary,
    borderRadius: 16,
    borderWidth: 2,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  checkCircleDone: { backgroundColor: palette.accent },
  checkText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  taskBody: { flex: 1 },
  taskName: { ...type.bodyStrong, color: palette.ink },
  taskMeta: { ...type.body, color: palette.body },
  diagnosisBlock: { marginBottom: spacing.lg },
  noDiag: { alignItems: 'center', gap: 12, padding: spacing.md },
  noDiagText: { ...type.body, color: palette.body, textAlign: 'center' },
  danger: { marginTop: spacing.lg },
  otherHint: { ...type.caption, color: palette.muted, marginTop: spacing.md, textAlign: 'center' },
});
