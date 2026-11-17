import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AuroraBackground } from '../components/AuroraBackground';
import { TabBar } from '../components/TabBar';
import {
  EmptyState,
  GhostButton,
  GlassCard,
  PrimaryButton,
  SectionHeader,
  SpringPress,
} from '../components/ui';
import { CARE_LIBRARY } from '../lib/plants';
import { PHOTOS } from '../lib/photos';
import { useApp } from '../lib/store';
import { palette, radii, spacing, type, useResponsive } from '../lib/theme';

/**
 * Care screen — today's watering/feeding tasks, soonest first, with a
 * done toggle per task; add-task form; full care library.
 */
export default function CareScreen() {
  const router = useRouter();
  const { todaysTasks, plants, toggleTask, addTask, allDiagnoses } = useApp();
  const r = useResponsive();
  const [label, setLabel] = useState('');
  const [kind, setKind] = useState('water');
  const [due, setDue] = useState(new Date().toISOString().slice(0, 10));
  const [plantId, setPlantId] = useState(plants[0]?.id ?? '');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const add = () => {
    if (!label.trim()) return setError('Give the task a name first.');
    if (!plantId) return setError('Pick a plant for this task.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(due.trim())) {
      return setError('Due date must look like 2026-11-18.');
    }
    addTask(plantId, label.trim(), kind, due.trim());
    setLabel('');
    setError(null);
    setNotice('Task added — it shows up on the garden home too.');
  };

  const doneCount = plants.flatMap((p) => p.tasks).filter((t) => t.done).length;

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
          <Text style={styles.kicker}>CARE SCHEDULE</Text>
          <Text style={[styles.title, r.display]}>Keep them thriving.</Text>
          <Text style={styles.sub}>
            {todaysTasks.length} task{todaysTasks.length === 1 ? '' : 's'} waiting · {doneCount}{' '}
            done already
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).springify()}>
          <SectionHeader kicker="Up next" title="Today's tasks" />
          {todaysTasks.length === 0 ? (
            <EmptyState
              glyph="🌿"
              title="All caught up"
              body="No care tasks are waiting. Add one below, or check a plant's own tasks on its page."
            />
          ) : (
            todaysTasks.map(({ plant, task }) => (
              <SpringPress key={task.id} onPress={() => toggleTask(plant.id, task.id)}>
                <GlassCard style={styles.taskRow}>
                  <View style={[styles.checkCircle, task.done && styles.checkCircleDone]}>
                    <Text style={styles.checkText}>{task.done ? '✓' : ''}</Text>
                  </View>
                  <View style={styles.taskBody}>
                    <Text style={styles.taskName}>{task.label}</Text>
                    <Text style={styles.taskMeta}>
                      {plant.name} · due {task.due}
                    </Text>
                  </View>
                  <Text style={styles.taskKind}>{task.kind}</Text>
                </GlassCard>
              </SpringPress>
            ))
          )}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(140).springify()}>
          <SectionHeader kicker="Add a task" title="New care task" />
          <GlassCard style={styles.form}>
            <TextInput
              style={styles.input}
              value={label}
              onChangeText={setLabel}
              placeholder="e.g. Water Mona"
              placeholderTextColor={palette.muted}
            />
            <View style={styles.kindRow}>
              {['water', 'feed', 'prune', 'inspect'].map((k) => (
                <SpringPress key={k} onPress={() => setKind(k)}>
                  <View style={[styles.kindChip, kind === k && styles.kindChipActive]}>
                    <Text style={[styles.kindText, kind === k && styles.kindTextActive]}>{k}</Text>
                  </View>
                </SpringPress>
              ))}
            </View>
            <TextInput
              style={styles.input}
              value={due}
              onChangeText={setDue}
              placeholder="Due date (YYYY-MM-DD)"
              placeholderTextColor={palette.muted}
            />
            <View style={styles.plantRow}>
              {plants.map((p) => (
                <SpringPress key={p.id} onPress={() => setPlantId(p.id)}>
                  <View style={[styles.plantChip, plantId === p.id && styles.plantChipActive]}>
                    <Text style={[styles.plantText, plantId === p.id && styles.plantTextActive]}>
                      {p.name}
                    </Text>
                  </View>
                </SpringPress>
              ))}
            </View>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {notice ? <Text style={styles.notice}>{notice}</Text> : null}
            <PrimaryButton label="Add task" onPress={add} />
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <SectionHeader kicker="Care library" title="Every plant's needs" />
          {CARE_LIBRARY.map((entry) => (
            <GlassCard key={entry.type} style={styles.libraryRow}>
              <Image
                source={PHOTOS[entry.type as keyof typeof PHOTOS]}
                style={styles.libraryPhoto}
                resizeMode="cover"
              />
              <View style={styles.libraryBody}>
                <Text style={styles.libraryName}>{entry.label}</Text>
                <Text style={styles.libraryMeta}>
                  ☀️ {entry.light}
                  {'\n'}💧 {entry.water}
                  {'\n'}🌿 {entry.feeding}
                </Text>
                <Text style={styles.libraryNotes}>{entry.notes}</Text>
              </View>
            </GlassCard>
          ))}
        </Animated.View>

        {allDiagnoses.length > 0 ? (
          <Animated.View entering={FadeInDown.delay(260).springify()}>
            <SectionHeader kicker="Health record" title="All diagnoses" />
            {allDiagnoses.slice(0, 4).map((d) => (
              <SpringPress
                key={d.id}
                onPress={() => router.push(`/diagnosis/${d.id}`)}
              >
                <GlassCard style={styles.historyRow}>
                  <Text style={styles.historyName}>
                    {d.plantType} — {d.likelyCause.slice(0, 70)}
                    {d.likelyCause.length > 70 ? '…' : ''}
                  </Text>
                  <Text style={styles.historyTime}>
                    {new Date(d.at).toLocaleDateString()} · tap to open
                  </Text>
                </GlassCard>
              </SpringPress>
            ))}
          </Animated.View>
        ) : null}

        <View style={styles.bottom}>
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
  title: { color: palette.ink, marginBottom: 6 },
  sub: { ...type.body, color: palette.body, marginBottom: spacing.md },
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
  taskKind: { ...type.caption, color: palette.primary },
  form: { gap: 12, padding: spacing.md },
  input: {
    backgroundColor: palette.primaryPale,
    borderRadius: radii.input,
    color: palette.ink,
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: 18,
  },
  kindRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  kindChip: {
    backgroundColor: palette.primarySoft,
    borderRadius: radii.pill,
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  kindChipActive: { backgroundColor: palette.primary },
  kindText: { color: palette.primary, fontSize: 14, fontWeight: '700' },
  kindTextActive: { color: '#FFFFFF' },
  plantRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  plantChip: {
    backgroundColor: palette.accentSoft,
    borderRadius: radii.pill,
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  plantChipActive: { backgroundColor: palette.accent },
  plantText: { color: palette.accentDeep, fontSize: 14, fontWeight: '700' },
  plantTextActive: { color: '#FFFFFF' },
  error: { ...type.bodyStrong, color: palette.error, textAlign: 'center' },
  notice: { ...type.bodyStrong, color: palette.success, textAlign: 'center' },
  libraryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  libraryPhoto: { borderRadius: 24, height: 84, width: 84 },
  libraryBody: { flex: 1, gap: 2 },
  libraryName: { ...type.subtitle, color: palette.ink },
  libraryMeta: { ...type.body, color: palette.body },
  libraryNotes: { ...type.body, color: palette.body, fontStyle: 'italic', marginTop: 4 },
  historyRow: { marginBottom: spacing.sm, padding: spacing.md },
  historyName: { ...type.bodyStrong, color: palette.ink },
  historyTime: { ...type.caption, color: palette.muted, marginTop: 2 },
  bottom: { marginTop: spacing.lg },
});
