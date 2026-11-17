import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Image, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AuroraBackground } from '../components/AuroraBackground';
import { DISCLAIMER } from '../components/DiagnosisDetail';
import { TabBar } from '../components/TabBar';
import { GlassCard, PrimaryButton, SpringPress } from '../components/ui';
import { PHOTOS } from '../lib/photos';
import { SAMPLE_SYMPTOMS } from '../lib/plants';
import { useApp } from '../lib/store';
import { palette, radii, spacing, type, useResponsive } from '../lib/theme';

/**
 * Diagnose screen — describe symptoms in words and/or attach a photo,
 * then get a diagnosis + care plan.
 */
export default function DiagnoseScreen() {
  const router = useRouter();
  const {
    symptomText,
    setSymptomText,
    plantType,
    setPlantType,
    diagnose,
    current,
    loading,
    error,
    liveFailed,
  } = useApp();
  const r = useResponsive();
  const inputRef = useRef<{ focus: () => void } | null>(null);
  const autoNav = useRef(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  // After a diagnosis finishes, move to the result screen — visible
  // feedback where the user is looking, not a silent state change.
  useEffect(() => {
    if (current && autoNav.current) {
      autoNav.current = false;
      router.push(`/diagnosis/${current.id}`);
    }
  }, [current, router]);

  const doDiagnose = async (text?: string, type?: string) => {
    autoNav.current = true;
    await diagnose(text, type, photoUri != null);
    autoNav.current = false;
  };

  const pickPhoto = async (fromCamera: boolean) => {
    setPhotoError(null);
    try {
      const result = fromCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            quality: 0.7,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.7,
          });
      if (!result.canceled && result.assets[0]) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch {
      setPhotoError('Could not open the photo picker. Try again.');
    }
  };

  return (
    <View style={styles.root}>
      <AuroraBackground />
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { maxWidth: r.contentMaxWidth, alignSelf: 'center' },
        ]}
      >
        <Animated.View entering={FadeInDown.springify()}>
          <Text style={styles.kicker}>DIAGNOSE</Text>
          <Text style={[styles.title, r.display]}>Tell us what you see.</Text>
          <Text style={styles.sub}>
            Yellow leaves, brown spots, drooping stems, tiny bugs — describe it in your own
            words, and add a photo if you can.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).springify()}>
          <GlassCard style={styles.card}>
            <Image source={PHOTOS['ailing-leaf']} style={styles.examplePhoto} resizeMode="cover" />
            <Text style={styles.exampleCaption}>
              A leaf telling you something is wrong — yellowing edges and brown spots.
            </Text>
            <Text style={styles.inputLabel}>WHAT PLANT IS IT? (OPTIONAL)</Text>
            <TextInput
              style={styles.inputSingle}
              value={plantType}
              onChangeText={setPlantType}
              placeholder="e.g. Monstera, tomato, basil…"
              placeholderTextColor={palette.muted}
            />
            <Text style={styles.inputLabel}>WHAT IS WRONG WITH IT?</Text>
            <TextInput
              ref={(el) => {
                inputRef.current = el as unknown as { focus: () => void } | null;
              }}
              style={styles.input}
              value={symptomText}
              onChangeText={setSymptomText}
              placeholder="e.g. The lower leaves are turning yellow and feel soft…"
              placeholderTextColor={palette.muted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <View style={styles.photoRow}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.attachedPhoto} resizeMode="cover" />
              ) : null}
              <View style={styles.photoButtons}>
                <SpringPress onPress={() => void pickPhoto(false)}>
                  <View style={styles.photoButton}>
                    <Text style={styles.photoButtonText}>📷 Add a photo</Text>
                  </View>
                </SpringPress>
                {Platform.OS !== 'web' ? (
                  <SpringPress onPress={() => void pickPhoto(true)}>
                    <View style={styles.photoButton}>
                      <Text style={styles.photoButtonText}>📸 Take a photo</Text>
                    </View>
                  </SpringPress>
                ) : null}
                {photoUri ? (
                  <SpringPress onPress={() => setPhotoUri(null)}>
                    <View style={[styles.photoButton, styles.photoButtonRemove]}>
                      <Text style={styles.photoButtonText}>Remove photo</Text>
                    </View>
                  </SpringPress>
                ) : null}
              </View>
            </View>
            {photoError ? <Text style={styles.error}>{photoError}</Text> : null}
            <PrimaryButton
              label="Diagnose my plant"
              onPress={() => void doDiagnose()}
              loading={loading}
              disabled={!symptomText.trim()}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {liveFailed ? (
              <Text style={styles.notice}>
                The live service did not answer, so this is a built-in demo diagnosis — the care
                steps still work.
              </Text>
            ) : null}
            <Text style={styles.samplesTitle}>Try a sample symptom:</Text>
            <View style={styles.samples}>
              {SAMPLE_SYMPTOMS.map((s) => (
                <SpringPress
                  key={s.title}
                  onPress={() => {
                    setSymptomText(s.text);
                    setPlantType(s.plantType);
                    void doDiagnose(s.text, s.plantType);
                  }}
                  style={styles.samplePress}
                >
                  <View style={styles.sampleChip}>
                    <Text style={styles.sampleChipText}>{s.title}</Text>
                  </View>
                </SpringPress>
              ))}
            </View>
          </GlassCard>
        </Animated.View>

        <Text style={styles.disclaimer}>{DISCLAIMER}</Text>
      </Animated.ScrollView>
      <TabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 140, width: '100%' },
  kicker: { ...type.label, color: palette.primary, marginBottom: 6 },
  title: { color: palette.ink, marginBottom: 10 },
  sub: { ...type.body, color: palette.body, marginBottom: spacing.lg, maxWidth: 560 },
  card: { gap: 12, padding: spacing.md },
  examplePhoto: {
    borderRadius: radii.card,
    height: 180,
    width: '100%',
  },
  exampleCaption: { ...type.caption, color: palette.muted, textAlign: 'center' },
  inputLabel: { ...type.label, color: palette.primary },
  inputSingle: {
    backgroundColor: palette.primaryPale,
    borderRadius: radii.input,
    color: palette.ink,
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: 18,
  },
  input: {
    backgroundColor: palette.primaryPale,
    borderRadius: radii.input,
    color: palette.ink,
    fontSize: 16,
    lineHeight: 22,
    minHeight: 96,
    padding: 16,
  },
  photoRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  attachedPhoto: { borderRadius: 16, height: 72, width: 72 },
  photoButtons: { flex: 1, gap: 8 },
  photoButton: {
    backgroundColor: palette.primarySoft,
    borderRadius: radii.pill,
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  photoButtonRemove: { backgroundColor: palette.accentSoft },
  photoButtonText: { color: palette.primary, fontSize: 14, fontWeight: '700' },
  error: { ...type.bodyStrong, color: palette.error, textAlign: 'center' },
  notice: { ...type.body, color: palette.warning, textAlign: 'center' },
  samplesTitle: { ...type.caption, color: palette.muted, marginTop: 4 },
  samples: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  samplePress: {},
  sampleChip: {
    backgroundColor: palette.primarySoft,
    borderRadius: radii.pill,
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sampleChipText: { color: palette.primary, fontSize: 14, fontWeight: '700' },
  disclaimer: { ...type.caption, color: palette.muted, marginTop: spacing.lg, textAlign: 'center' },
});
