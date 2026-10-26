import { ScrollView, StyleSheet, useColorScheme, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signOut } from 'firebase/auth';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ContentColumn, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { auth } from '@/firebase';
import { useTheme } from '@/hooks/use-theme';

export default function ProfileScreen() {
  const { user, profile } = useAuth();
  const theme = useTheme();
  const scheme = useColorScheme();

  const memberSince = profile?.createdAt?.toDate
    ? profile.createdAt.toDate().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';

  const rows = [
    { icon: 'mail-outline' as const, label: 'E-posta', value: user?.email ?? '—' },
    { icon: 'calendar-outline' as const, label: 'Üyelik tarihi', value: memberSince },
    {
      icon: (scheme === 'dark' ? 'moon-outline' : 'sunny-outline') as 'moon-outline' | 'sunny-outline',
      label: 'Tema',
      value: `${scheme === 'dark' ? 'Koyu' : 'Açık'} — cihaz ayarını izliyor`,
    },
    {
      icon: 'shield-checkmark-outline' as const,
      label: 'Oturum',
      value: 'Açık — uygulama kapatılıp açılsa da korunur',
    },
  ];

  function handleLogout() {
    // Yönlendirmeyi _layout'taki Stack.Protected yapar.
    signOut(auth);
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="subtitle">Profil</ThemedText>

          <Card style={styles.card}>
            <View style={[styles.avatar, { backgroundColor: theme.backgroundSelected }]}>
              <Ionicons
                name="person"
                size={70}
                color={scheme === 'dark' ? theme.placeholder : theme.background}
                style={styles.silhouette}
              />
            </View>
            <ThemedText type="heading">{profile?.displayName ?? 'Yükleniyor...'}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {profile?.accountType === 'couple' ? '💑 Çift Hesabı' : '👥 Arkadaş Grubu Hesabı'}
            </ThemedText>
          </Card>

          <Card style={styles.rows}>
            {rows.map((row, index) => (
              <View
                key={row.label}
                style={[styles.row, index > 0 && { borderTopColor: theme.border, borderTopWidth: StyleSheet.hairlineWidth }]}
              >
                <Ionicons name={row.icon} size={20} color={theme.highlight} />
                <View style={styles.rowText}>
                  <ThemedText type="caption" themeColor="textSecondary">
                    {row.label}
                  </ThemedText>
                  <ThemedText type="small">{row.value}</ThemedText>
                </View>
              </View>
            ))}
          </Card>

          <Button title="Çıkış Yap" variant="outline" onPress={handleLogout} />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { ...ContentColumn, flex: 1 },
  content: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.five,
    gap: Spacing.four,
  },
  card: { alignItems: 'center', gap: Spacing.one, padding: Spacing.four },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: Spacing.two,
  },
  silhouette: { marginTop: 24 },
  rows: { paddingVertical: 0 },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingVertical: Spacing.three },
  rowText: { flex: 1, gap: 2 },
});
