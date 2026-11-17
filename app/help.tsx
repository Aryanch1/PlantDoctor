import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AuroraBackground } from '../components/AuroraBackground';
import { TabBar } from '../components/TabBar';
import { GhostButton, GlassCard, SectionHeader } from '../components/ui';
import { DISCLAIMER } from '../components/DiagnosisDetail';
import { palette, spacing, type, useResponsive } from '../lib/theme';

/** Help — how PlantDoctor works, its limits, and the safety disclaimer. */
export default function HelpScreen() {
  const router = useRouter();
  const r = useResponsive();

  return (
    <View style={styles.root}>
      <AuroraBackground />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { maxWidth: r.contentMaxWidth, alignSelf: 'center' }]}
      >
        <SectionHeader kicker="Help" title="How PlantDoctor works" />

        <GlassCard style={styles.card}>
          <Text style={styles.step}>1 · Describe the symptoms</Text>
          <Text style={styles.body}>
            Type what you see — yellow leaves, brown spots, drooping stems — and add a photo if
            you can. Or tap a sample symptom on the Diagnose screen.
          </Text>
          <Text style={styles.step}>2 · Get a diagnosis</Text>
          <Text style={styles.body}>
            PlantDoctor works out the likely cause and how serious it is, then gives you a
            numbered care plan with watering and light guidance.
          </Text>
          <Text style={styles.step}>3 · Save it to your garden</Text>
          <Text style={styles.body}>
            Save the diagnosis to one of your plants so its care plan and history stay with it.
            Add watering and feeding tasks to your care schedule.
          </Text>
          <Text style={styles.step}>4 · Come back anytime</Text>
          <Text style={styles.body}>
            Every diagnosis is kept in History for one-tap re-opening, and the care library
            lists light, water and feeding needs for common plants.
          </Text>
        </GlassCard>

        <SectionHeader kicker="Important" title="What PlantDoctor is not" />
        <GlassCard style={styles.card}>
          <Text style={styles.body}>{DISCLAIMER}</Text>
          <Text style={styles.body}>
            PlantDoctor gives general care guidance — it is not a professional diagnosis, and
            it cannot see your plant the way a person at a nursery can.
          </Text>
        </GlassCard>

        <SectionHeader kicker="Your data" title="Privacy" />
        <GlassCard style={styles.card}>
          <Text style={styles.body}>
            Your plants, diagnoses and history stay on your device, and in your own account
            when signed in. PlantDoctor has no ads and no trackers, and never shares your
            garden with anyone.
          </Text>
        </GlassCard>

        <GhostButton label="← Back to garden" onPress={() => router.replace('/')} />
      </ScrollView>
      <TabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 120, width: '100%' },
  card: { marginBottom: spacing.xl, padding: spacing.md },
  step: { ...type.bodyStrong, color: palette.primary, marginTop: spacing.sm },
  body: { ...type.body, color: palette.body, marginTop: 4 },
});
