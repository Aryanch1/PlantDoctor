import { BlurView } from 'expo-blur';
import React from 'react';
import { Image, Platform, StyleSheet, Text, View } from 'react-native';

import { getDiagnosisPhoto } from '../lib/photos';
import { palette, radii, spacing, type } from '../lib/theme';
import type { Diagnosis, Severity } from '../lib/types';
import { GlassCard, LiveBadge } from './ui';

/** Plant-health disclaimer shown on every diagnosis screen. */
export const DISCLAIMER =
  'General care guidance only — not a professional diagnosis. For valuable or severely ill plants, ask a local nursery or extension service.';

const SEVERITY_LABEL: Record<Severity, string> = {
  mild: 'Mild',
  moderate: 'Moderate',
  serious: 'Serious',
};

const SEVERITY_STYLE: Record<Severity, { bg: string; fg: string }> = {
  mild: { bg: palette.accentSoft, fg: palette.accentDeep },
  moderate: { bg: palette.warningSoft, fg: palette.warning },
  serious: { bg: palette.errorSoft, fg: palette.error },
};

/**
 * Diagnosis "prescription" card: likely cause, severity pill, numbered
 * care steps, watering + light guidance, source badge, disclaimer.
 * The severity chip is the one frosted-glass overlay in the app — built
 * with the two-layer structure (outer bg+shadow, inner overflow-hidden
 * view clipping the BlurView) so Android never paints a white plate.
 */
export function DiagnosisDetail({ diagnosis }: { diagnosis: Diagnosis }) {
  const sev = SEVERITY_STYLE[diagnosis.severity];
  return (
    <View style={styles.root}>
      <View style={styles.photoWrap}>
        <Image source={getDiagnosisPhoto(diagnosis)} style={styles.photo} resizeMode="cover" />
        <View style={styles.chipShadow}>
          <View style={styles.chipClip}>
            {Platform.OS === 'web' ? (
              <BlurView intensity={18} tint="light" style={StyleSheet.absoluteFill} />
            ) : null}
            <View style={[styles.severityChip, { backgroundColor: sev.bg }]}>
              <Text style={[styles.severityText, { color: sev.fg }]}>
                {SEVERITY_LABEL[diagnosis.severity]} · {diagnosis.plantType}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <GlassCard style={styles.card}>
        <View style={styles.headRow}>
          <Text style={styles.kicker}>LIKELY CAUSE</Text>
          {diagnosis.source === 'live' ? <LiveBadge /> : <DemoBadge />}
        </View>
        <Text style={styles.cause}>{diagnosis.likelyCause}</Text>
        <Text style={styles.symptom}>“{diagnosis.symptomText}”</Text>
        {diagnosis.hasPhoto ? (
          <Text style={styles.photoNote}>📷 Photo attached with this diagnosis.</Text>
        ) : null}
      </GlassCard>

      <GlassCard style={styles.card}>
        <Text style={styles.kicker}>CARE PLAN — {diagnosis.careSteps.length} STEPS</Text>
        {diagnosis.careSteps.map((step, i) => (
          <View key={`${diagnosis.id}-step-${i}`} style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{i + 1}</Text>
            </View>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </GlassCard>

      <GlassCard style={styles.card}>
        <View style={styles.guideRow}>
          <Text style={styles.guideLabel}>💧 Watering</Text>
          <Text style={styles.guideText}>{diagnosis.watering}</Text>
        </View>
        <View style={styles.guideRow}>
          <Text style={styles.guideLabel}>☀️ Light</Text>
          <Text style={styles.guideText}>{diagnosis.light}</Text>
        </View>
      </GlassCard>

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>{DISCLAIMER}</Text>
      </View>
    </View>
  );
}

function DemoBadge() {
  return (
    <View style={styles.demoBadge}>
      <Text style={styles.demoBadgeText}>DEMO CARE GUIDE</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.md },
  photoWrap: { position: 'relative' },
  photo: {
    borderRadius: radii.card,
    height: 240,
    width: '100%',
  },
  chipShadow: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: radii.pill,
    bottom: 12,
    left: 12,
    position: 'absolute',
    shadowColor: '#2E2118',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  chipClip: {
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderColor: 'rgba(255,255,255,0.75)',
    borderRadius: radii.pill,
    borderWidth: 1,
    overflow: 'hidden',
  },
  severityChip: { paddingHorizontal: 14, paddingVertical: 8 },
  severityText: { fontSize: 13, fontWeight: '800' },
  card: { padding: spacing.md },
  headRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  kicker: { ...type.label, color: palette.primary },
  cause: { ...type.subtitle, color: palette.ink, marginBottom: 8 },
  symptom: { ...type.body, color: palette.body, fontStyle: 'italic' },
  photoNote: { ...type.caption, color: palette.muted, marginTop: 8 },
  step: { alignItems: 'flex-start', flexDirection: 'row', gap: 12, marginTop: 12 },
  stepNumber: {
    alignItems: 'center',
    backgroundColor: palette.primary,
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  stepNumberText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  stepText: { ...type.body, color: palette.ink, flex: 1 },
  guideRow: { gap: 2, marginTop: 10 },
  guideLabel: { ...type.bodyStrong, color: palette.ink },
  guideText: { ...type.body, color: palette.body },
  disclaimer: {
    backgroundColor: palette.warningSoft,
    borderRadius: radii.card,
    padding: spacing.md,
  },
  disclaimerText: { ...type.body, color: palette.warning },
  demoBadge: {
    backgroundColor: palette.primarySoft,
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  demoBadgeText: { color: palette.primary, fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
});
