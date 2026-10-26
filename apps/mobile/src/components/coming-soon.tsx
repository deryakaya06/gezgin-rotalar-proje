import { StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/card';
import { ContentColumn, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Sprint 1 demosunda henüz yapılmamış sekmelerin yer tutucusu: sekmenin hangi
 * sprintte ve hangi özelliklerle geleceğini anlatır.
 */
export function ComingSoon({
  title,
  sprint,
  icon,
  features,
}: {
  title: string;
  sprint: string;
  icon: keyof typeof Ionicons.glyphMap;
  features: string[];
}) {
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="subtitle">{title}</ThemedText>
        <Card style={styles.card}>
          <View style={[styles.icon, { backgroundColor: theme.primarySoft }]}>
            <Ionicons name={icon} size={30} color={theme.primary} />
          </View>
          <View style={[styles.badge, { backgroundColor: theme.highlightSoft }]}>
            <ThemedText type="caption" style={[styles.badgeText, { color: theme.highlight }]}>
              {sprint.toLocaleUpperCase('tr')}
            </ThemedText>
          </View>
          <ThemedText type="heading" style={styles.centered}>
            Bu bölüm henüz yapım aşamasında
          </ThemedText>
          <View style={styles.list}>
            {features.map((feature) => (
              <View key={feature} style={styles.item}>
                <Ionicons name="ellipse" size={6} color={theme.highlight} style={styles.bullet} />
                <ThemedText type="small" themeColor="textSecondary" style={styles.itemText}>
                  {feature}
                </ThemedText>
              </View>
            ))}
          </View>
        </Card>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: {
    ...ContentColumn,
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    gap: Spacing.four,
  },
  card: { alignItems: 'center', gap: Spacing.three, padding: Spacing.four },
  icon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: Radius.pill },
  badgeText: { fontWeight: 700, letterSpacing: 1.2 },
  centered: { textAlign: 'center' },
  list: { alignSelf: 'stretch', gap: Spacing.two },
  item: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two },
  bullet: { marginTop: 7 },
  itemText: { flex: 1 },
});
