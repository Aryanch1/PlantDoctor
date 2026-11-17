import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, Platform, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AuroraBackground } from '../components/AuroraBackground';
import { PlantCard } from '../components/PlantCard';
import { PullToRefresh, SproutButton } from '../components/SproutRefresh';
import { TabBar } from '../components/TabBar';
import { GlassCard, GhostButton, PrimaryButton, SectionHeader, SpringPress } from '../components/ui';
import { CARE_LIBRARY } from '../lib/plants';
import { PHOTOS } from '../lib/photos';
import { useApp } from '../lib/store';
import { palette, radii, spacing, type, useResponsive } from '../lib/theme';

export default function GardenScreen() {
  const router = useRouter();
  const {
    refreshCurrent,
    current,
    loading,
    history,
    applyHistory,
    todaysTasks,
    plants,
    user,
    guest,
    toggleTask,
  } = useApp();
  const r = useResponsive();
  const [refreshing, setRefreshing] = useState(false);
  const [openingId, setOpeningId] = useState<string | null>(null);

  const onRefresh = async () => {
    if (!current) return;
    setRefreshing(true);
    await refreshCurrent();
    setRefreshing(false);
  };

  const openHistory = async (entryId: string) => {
    const entry = history.find((h) => h.id === entryId);
    if (!entry) return;
    setOpeningId(entryId);
    await applyHistory(entry);
    setOpeningId(null);
    router.push('/diagnose');
  };

  const greeting = user ? `Hello, ${user.name ?? 'gardener'}` : guest ? 'Hello, guest' : 'Hello, gardener';
  const dueToday = todaysTasks.slice(0, 3);

  return (
    <View style={styles.root}>
      <AuroraBackground />
      <PullToRefresh refreshing={refreshing || loading} onRefresh={onRefresh}>
        <View style={[styles.shell, { maxWidth: r.contentMaxWidth, paddingHorizontal: r.pad }]}>
          {/* Typographic hero — huge Bricolage headline, no photo hero. */}
          <Animated.View entering={FadeInDown.springify()}>
            <Text style={styles.kicker}>{greeting.toUpperCase()}</Text>
            <Text style={[styles.heroTitle, r.display]}>What&apos;s wrong with your plant?</Text>
            <Text style={styles.heroSub}>
              Describe the symptoms — or snap a photo — and PlantDoctor will work out what is
              wrong and what to do about it.
            </Text>
            {Platform.OS === 'web' ? (
              <View style={styles.webRefresh}>
                <SpringPress onPress={() => void onRefresh()} haptic>
                  <SproutButton refreshing={refreshing || loading} />
                </SpringPress>
              </View>
            ) : null}
          </Animated.View>

          {/* Big "Diagnose a plant" arch card. */}
          <Animated.View entering={FadeInDown.delay(80).springify()}>
            <SpringPress onPress={() => router.push('/diagnose')}>
              <View style={styles.diagnoseCard}>
                <Image source={PHOTOS['ailing-leaf']} style={styles.diagnosePhoto} resizeMode="cover" />
                <View style={styles.diagnoseBody}>
                  <Text style={styles.diagnoseTitle}>Diagnose a plant</Text>
                  <Text style={styles.diagnoseText}>
                    Yellow leaves, brown spots, drooping stems — tell us what you see.
                  </Text>
                  <View style={styles.diagnoseCta}>
                    <Text style={styles.diagnoseCtaText}>Start a diagnosis →</Text>
                  </View>
                </View>
              </View>
            </SpringPress>
          </Animated.View>

          {/* Care-tasks strip. */}
          <Animated.View entering={FadeInDown.delay(140).springify()}>
            <SectionHeader kicker="Today" title="Care tasks" />
            {dueToday.length === 0 ? (
              <GlassCard style={styles.taskEmpty}>
                <Text style={styles.taskEmptyText}>
                  Nothing due today — your garden is all caught up. 🌿
                </Text>
                <GhostButton label="Open care schedule" onPress={() => router.push('/care')} />
              </GlassCard>
            ) : (
              dueToday.map(({ plant, task }) => (
                <SpringPress key={task.id} onPress={() => router.push('/care')}>
                  <GlassCard style={styles.taskRow}>
                    <SpringPress
                      onPress={() => toggleTask(plant.id, task.id)}
                      style={styles.taskCheck}
                    >
                      <View style={[styles.checkCircle, task.done && styles.checkCircleDone]}>
                        <Text style={styles.checkText}>{task.done ? '✓' : ''}</Text>
                      </View>
                    </SpringPress>
                    <View style={styles.taskBody}>
                      <Text style={styles.taskName}>{task.label}</Text>
                      <Text style={styles.taskMeta}>
                        {plant.name} · due {task.due}
                      </Text>
                    </View>
                    <Text style={styles.taskArrow}>›</Text>
                  </GlassCard>
                </SpringPress>
              ))
            )}
          </Animated.View>

          {/* My Plants — arch-top photo tiles. */}
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <SectionHeader kicker="Your garden" title="My plants" />
            {plants.length === 0 ? (
              <GlassCard style={styles.taskEmpty}>
                <Text style={styles.taskEmptyText}>
                  No plants yet. Add your first plant from its care card, or diagnose a problem
                  and save the result to your garden.
                </Text>
              </GlassCard>
            ) : (
              <View
                style={[
                  styles.plantGrid,
                  r.columns > 1 && styles.plantGridWide,
                ]}
              >
                {plants.map((plant, i) => (
                  <View key={plant.id} style={r.columns > 1 ? styles.plantCellWide : styles.plantCell}>
                    <PlantCard
                      plant={plant}
                      index={i}
                      onPress={() => router.push(`/plant/${plant.id}`)}
                    />
                  </View>
                ))}
              </View>
            )}
          </Animated.View>

          {/* Recent diagnoses — one tap re-opens from History. */}
          {history.length > 0 ? (
            <Animated.View entering={FadeInDown.delay(260).springify()}>
              <SectionHeader kicker="History" title="Diagnosed recently" />
              {history.slice(0, 4).map((h) => (
                <SpringPress key={h.id} onPress={() => void openHistory(h.id)}>
                  <GlassCard style={styles.historyRow}>
                    <Text style={styles.historyName}>
                      {h.plantType} — {h.likelyCause.slice(0, 60)}
                      {h.likelyCause.length > 60 ? '…' : ''}
                    </Text>
                    <Text style={styles.historyTime}>
                      {new Date(h.at).toLocaleDateString()} ·{' '}
                      {openingId === h.id ? 'Opening…' : 'tap to re-open'}
                    </Text>
                  </GlassCard>
                </SpringPress>
              ))}
            </Animated.View>
          ) : null}

          {/* Care library preview. */}
          <Animated.View entering={FadeInDown.delay(320).springify()}>
            <SectionHeader kicker="Care library" title="Know your plants" />
            {CARE_LIBRARY.slice(0, 3).map((entry) => {
              const match = plants.find((p) => p.type === entry.type);
              return (
              <SpringPress
                key={entry.type}
                onPress={() => {
                  if (match) router.push(`/plant/${match.id}`);
                  else router.push('/care');
                }}
                style={styles.libraryRowPress}
              >
                <GlassCard style={styles.libraryRow}>
                  <Image source={PHOTOS[entry.type as keyof typeof PHOTOS]} style={styles.libraryPhoto} resizeMode="cover" />
                  <View style={styles.libraryBody}>
                    <Text style={styles.libraryName}>{entry.label}</Text>
                    <Text style={styles.libraryMeta}>
                      {entry.light} · {entry.water}
                    </Text>
                  </View>
                </GlassCard>
              </SpringPress>
              );
            })}
            <View style={styles.libraryMore}>
              <GhostButton label="Open the full care library" onPress={() => router.push('/care')} />
            </View>
          </Animated.View>

          <View style={styles.ctaBlock}>
            <PrimaryButton label="Diagnose a plant" onPress={() => router.push('/diagnose')} />
          </View>
        </View>
      </PullToRefresh>
      <TabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  shell: { alignSelf: 'center', paddingTop: 20, width: '100%' },
  kicker: { ...type.label, color: palette.primary, marginBottom: 6 },
  heroTitle: { color: palette.ink, marginBottom: 10 },
  heroSub: { ...type.body, color: palette.body, marginBottom: spacing.lg, maxWidth: 560 },
  webRefresh: { alignItems: 'flex-start', marginBottom: spacing.md },
  diagnoseCard: {
    backgroundColor: palette.primary,
    borderRadius: radii.card,
    flexDirection: 'row',
    marginBottom: spacing.xl,
    overflow: 'hidden',
    ...{ shadowColor: '#8A3E1F', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.28, shadowRadius: 24, elevation: 8 },
  },
  diagnosePhoto: {
    borderTopRightRadius: radii.arch,
    height: 168,
    width: 132,
  },
  diagnoseBody: { flex: 1, gap: 6, justifyContent: 'center', padding: spacing.md },
  diagnoseTitle: { ...type.title, color: '#FFFFFF' },
  diagnoseText: { ...type.body, color: 'rgba(255,255,255,0.88)' },
  diagnoseCta: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: radii.pill,
    marginTop: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  diagnoseCtaText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  taskEmpty: { alignItems: 'center', gap: 12, padding: spacing.md },
  taskEmptyText: { ...type.body, color: palette.body, textAlign: 'center' },
  taskRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  taskCheck: {},
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
  taskArrow: { color: palette.muted, fontSize: 24 },
  plantGrid: { gap: 14 },
  plantGridWide: { flexDirection: 'row', flexWrap: 'wrap' },
  plantCell: { width: '100%' },
  plantCellWide: { flex: 1, minWidth: 260 },
  historyRow: { marginBottom: spacing.sm, padding: spacing.md },
  historyName: { ...type.bodyStrong, color: palette.ink },
  historyTime: { ...type.caption, color: palette.muted, marginTop: 2 },
  libraryRowPress: { marginBottom: spacing.sm },
  libraryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    padding: spacing.md,
  },
  libraryPhoto: { borderRadius: 24, height: 56, width: 56 },
  libraryBody: { flex: 1 },
  libraryName: { ...type.bodyStrong, color: palette.ink },
  libraryMeta: { ...type.body, color: palette.body },
  libraryMore: { marginTop: spacing.sm },
  ctaBlock: { marginTop: spacing.xl },
});
