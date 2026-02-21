import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { User } from '../hooks/useAuth';

interface DashboardScreenProps {
  user: User;
  onSignOut: () => void;
}

const modules = [
  {
    id: 'shopping',
    title: 'Shopping List',
    description: 'Manage groceries, stationery & household items',
    emoji: '🛒',
    colors: COLORS.modules.shopping,
  },
  {
    id: 'budget',
    title: 'Budget & Expenses',
    description: 'Track income, expenses & monthly summaries',
    emoji: '💰',
    colors: COLORS.modules.budget,
  },
  {
    id: 'recipes',
    title: 'Recipe Manager',
    description: 'Save & organize your favourite recipes',
    emoji: '👨‍🍳',
    colors: COLORS.modules.recipes,
  },
  {
    id: 'weekly',
    title: 'Weekly Planner',
    description: 'Plan tasks for each day of the week',
    emoji: '📅',
    colors: COLORS.modules.weekly,
  },
  {
    id: 'monthly',
    title: 'Monthly Planner',
    description: 'Set monthly goals, reminders & events',
    emoji: '📆',
    colors: COLORS.modules.monthly,
  },
  {
    id: 'yearly',
    title: 'Yearly Planner',
    description: 'Annual goals, exams, family events & projects',
    emoji: '🗓',
    colors: COLORS.modules.yearly,
  },
];

export default function DashboardScreen({ user, onSignOut }: DashboardScreenProps) {
  const now = new Date();
  const greeting =
    now.getHours() < 12
      ? 'Good Morning'
      : now.getHours() < 17
      ? 'Good Afternoon'
      : 'Good Evening';

  const displayName = user.name || 'there';

  const dateStr = now.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <LinearGradient colors={[COLORS.background, COLORS.white]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.appTitle}>Smart Life</Text>
            <Text style={styles.greeting}>
              {greeting}, {displayName}!
            </Text>
          </View>
          <TouchableOpacity onPress={onSignOut} activeOpacity={0.7} style={styles.signOutBtn}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Date Card */}
        <View style={styles.dateCard}>
          <Text style={styles.dateLabel}>Today</Text>
          <Text style={styles.dateValue}>{dateStr}</Text>
        </View>

        {/* Module Cards */}
        <View style={styles.grid}>
          {modules.map((mod) => (
            <TouchableOpacity
              key={mod.id}
              activeOpacity={0.8}
              style={[
                styles.moduleCard,
                {
                  backgroundColor: mod.colors.bg,
                  borderColor: mod.colors.border,
                },
              ]}
            >
              <View style={[styles.moduleIcon, { backgroundColor: mod.colors.iconBg }]}>
                <Text style={styles.moduleEmoji}>{mod.emoji}</Text>
              </View>
              <View style={styles.moduleInfo}>
                <Text style={[styles.moduleTitle, { color: mod.colors.text }]}>
                  {mod.title}
                </Text>
                <Text style={[styles.moduleDesc, { color: mod.colors.text, opacity: 0.7 }]}>
                  {mod.description}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  greeting: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  signOutBtn: {
    backgroundColor: '#fef2f2',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
  },
  signOutText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#dc2626',
  },
  dateCard: {
    backgroundColor: 'rgba(74, 144, 217, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 217, 0.12)',
    borderRadius: RADIUS.lg,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 24,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  dateValue: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 2,
  },
  grid: {
    gap: 12,
  },
  moduleCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    padding: 16,
    gap: 16,
  },
  moduleIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleEmoji: {
    fontSize: 24,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  moduleDesc: {
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
});
