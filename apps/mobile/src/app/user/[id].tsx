import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { doc, onSnapshot } from 'firebase/firestore';
import { COLLECTIONS, type UserProfile } from '@repo/shared';

import { FollowButton } from '@/components/follow-button';
import { ProfileSummary } from '@/components/profile-summary';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BackButton } from '@/components/ui/back-button';
import { ContentColumn, Spacing } from '@/constants/theme';
import { db } from '@/firebase';
import { useFollow } from '@/hooks/use-follow';

/** /user/[id] — başka bir kullanıcının profili ve takip butonu. */
export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [notFound, setNotFound] = useState(false);
  const { isFollowing } = useFollow(id);

  useEffect(() => {
    if (!id) return;
    return onSnapshot(doc(db, COLLECTIONS.users, id), (snap) => {
      if (snap.exists()) {
        setProfile(snap.data() as UserProfile);
      } else {
        setNotFound(true);
      }
    });
  }, [id]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <BackButton />
          {notFound ? (
            <ThemedText themeColor="textSecondary" style={styles.emptyText}>
              Kullanıcı bulunamadı.
            </ThemedText>
          ) : (
            // Takip durumu değişince takipçi sayısı yeniden hesaplanır.
            <ProfileSummary uid={id} profile={profile} followRefreshKey={isFollowing}>
              <View style={styles.followButtonWrap}>
                <FollowButton userId={id} large />
              </View>
            </ProfileSummary>
          )}
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
  followButtonWrap: { alignSelf: 'stretch', marginTop: Spacing.three },
  emptyText: { textAlign: 'center', marginTop: Spacing.four },
});
