import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import type { UserProfile } from '@repo/shared';

import { Avatar } from '@/components/avatar';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Spacing } from '@/constants/theme';
import { useFollowCounts } from '@/hooks/use-follow-counts';

/** Profil kartı: avatar, ad, hesap türü, takipçi/takip sayıları. Kendi profilin ve başkalarınınki için ortak. */
export function ProfileSummary({
  uid,
  profile,
  followRefreshKey,
  children,
}: {
  uid: string | undefined;
  profile: UserProfile | null;
  /** Değiştiğinde takipçi/takip sayıları yeniden hesaplanır. */
  followRefreshKey?: unknown;
  /** Kartın altına eklenecek içerik (ör. takip butonu). */
  children?: ReactNode;
}) {
  const router = useRouter();
  const followCounts = useFollowCounts(uid, followRefreshKey);

  function openList(type: 'followers' | 'following') {
    if (!uid) return;
    router.push({ pathname: '/follows', params: { uid, type, name: profile?.displayName ?? '' } });
  }

  return (
    <Card style={styles.card}>
      <View style={styles.avatarWrap}>
        <Avatar accountType={profile?.accountType} size={88} />
      </View>
      <ThemedText type="heading">{profile?.displayName ?? 'Yükleniyor...'}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {profile?.accountType === 'couple' ? '💑 Çift Hesabı' : '👥 Arkadaş Grubu Hesabı'}
      </ThemedText>
      <View style={styles.followRow}>
        <Pressable
          onPress={() => openList('followers')}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`${followCounts.followers} takipçi, listeyi aç`}
        >
          <ThemedText type="small" style={styles.followLink}>
            <ThemedText type="smallBold">{followCounts.followers}</ThemedText> takipçi
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={() => openList('following')}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`${followCounts.following} takip, listeyi aç`}
        >
          <ThemedText type="small" style={styles.followLink}>
            <ThemedText type="smallBold">{followCounts.following}</ThemedText> takip
          </ThemedText>
        </Pressable>
      </View>
      {children}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { padding: Spacing.four, alignItems: 'center', gap: Spacing.one },
  avatarWrap: { alignItems: 'center', marginBottom: Spacing.two },
  followRow: { flexDirection: 'row', gap: Spacing.four, marginTop: Spacing.two },
  followLink: { textDecorationLine: 'underline' },
});
