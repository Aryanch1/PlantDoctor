import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AuroraBackground } from '../../components/AuroraBackground';
import { DiagnosisDetail } from '../../components/DiagnosisDetail';
import { TabBar } from '../../components/TabBar';
import { EmptyState, GhostButton, PrimaryButton } from '../../components/ui';
import { useApp } from '../../lib/store';
import { palette, spacing, type, useResponsive } from '../../lib/theme';

/**
 * Diagnosis result — the "prescription" card with numbered care steps,
 * plus Save to garden.
 */
export default function DiagnosisScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { diagnosisById, plants, saveCurrentToPlant, current } = useApp();
  const r = useResponsive();
  const [savedNote, setSavedNote] = useState<string | null>(null);

  const diagnosis = diagnosisById(id ?? '') ?? current;

  if (!diagnosis) {
    return (
      <View style={styles.root}>
        <AuroraBackground />
        <ScrollView contentContainerStyle={styles.scroll}>
          <EmptyState
            glyph="🌱"
            title="No diagnosis here"
            body="This diagnosis is gone — run a new one from the Diagnose tab."
            actionLabel="Diagnose a plant"
            onAction={() => router.replace('/diagnose')}
          />
        </ScrollView>
        <TabBar />
      </View>
    );
  }

  const save = (plantId: string) => {
    saveCurrentToPlant(plantId);
    const plant = plants.find((p) => p.id === plantId);
    setSavedNote(`Saved to ${plant?.name ?? 'your garden'} ✓`);
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
          <Text style={styles.kicker}>DIAGNOSIS</Text>
          <Text style={[styles.title, r.display]}>Your plant&apos;s prescription.</Text>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(80).springify()}>
          <DiagnosisDetail diagnosis={diagnosis} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(140).springify()}>
          <Text style={styles.saveTitle}>Save this diagnosis</Text>
          {plants.length === 0 ? (
            <Text style={styles.saveHint}>
              No plants in your garden yet — the diagnosis stays in History for now.
            </Text>
          ) : (
            plants.map((plant) => (
              <GhostButton
                key={plant.id}
                label={`Save to ${plant.name} · ${diagnosis.careSteps.length} steps`}
                onPress={() => save(plant.id)}
              />
            ))
          )}
          {savedNote ? <Text style={styles.savedNote}>{savedNote}</Text> : null}
        </Animated.View>

        <View style={styles.actions}>
          <PrimaryButton label="Diagnose another plant" onPress={() => router.push('/diagnose')} />
          <GhostButton label="Back to garden" onPress={() => router.replace('/')} />
        </View>
      </ScrollView>
      <TabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 140, width: '100%' },
  kicker: { ...type.label, color: palette.primary, marginBottom: 6 },
  title: { color: palette.ink, marginBottom: spacing.md },
  saveTitle: { ...type.subtitle, color: palette.ink, marginTop: spacing.lg, marginBottom: 10 },
  saveHint: { ...type.body, color: palette.body },
  savedNote: { ...type.bodyStrong, color: palette.success, marginTop: 12, textAlign: 'center' },
  actions: { gap: 12, marginTop: spacing.xl },
});
