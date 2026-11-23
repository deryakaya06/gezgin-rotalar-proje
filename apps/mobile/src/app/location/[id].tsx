import { useEffect, useState } from 'react';
import { Linking, Platform, Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import type { Location, WithId } from '@repo/shared';

import { LocationMap } from '@/components/location-map';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BackButton } from '@/components/ui/back-button';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tag } from '@/components/ui/tag';
import { ContentColumn, OnPhoto, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { directionsUrl, fetchLocation } from '@/services/locations';
import { photoThumbnail } from '@/services/photos';

export default function LocationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();

  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.set(e.contentOffset.y);
  });
  // Parallax: aşağı kaydırırken fotoğraf içerikten yavaş kayar; yukarı çekince esneyip büyür.
  const heroStyle = useAnimatedStyle(() => {
    const y = scrollY.get();
    return {
      transform: [
        { translateY: interpolate(y, [-HERO_HEIGHT, 0, HERO_HEIGHT], [-HERO_HEIGHT / 2, 0, HERO_HEIGHT * 0.4], Extrapolation.CLAMP) },
        { scale: interpolate(y, [-HERO_HEIGHT, 0], [2, 1], Extrapolation.CLAMP) },
      ],
    };
  });

  const [location, setLocation] = useState<WithId<Location> | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'notFound'>('loading');

  useEffect(() => {
    let cancelled = false;
    fetchLocation(id)
      .then((result) => {
        if (cancelled) return;
        setLocation(result);
        setStatus(result ? 'ready' : 'notFound');
      })
      .catch((error) => {
        console.log('Mekan yüklenemedi:', error.message);
        if (!cancelled) setStatus('notFound');
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (status !== 'ready' || !location) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={[styles.safeArea, styles.content]}>
          <BackButton />
          <ThemedText themeColor="textSecondary" style={styles.centered}>
            {status === 'loading' ? 'Yükleniyor...' : 'Mekan bulunamadı.'}
          </ThemedText>
        </SafeAreaView>
      </ThemedView>
    );
  }

  const coordinates = location.coordinates;

  const hasCover = !!location.coverPhotoUrl;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={hasCover ? ['left', 'right', 'bottom'] : undefined}>
        <Animated.ScrollView
          onScroll={onScroll}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled"
        >
          {hasCover ? (
            <View style={styles.hero}>
              <Animated.View style={[StyleSheet.absoluteFill, heroStyle]}>
                <Image
                  source={{ uri: photoThumbnail(location.coverPhotoUrl!, 1200, 900) }}
                  style={[StyleSheet.absoluteFill, { backgroundColor: theme.backgroundElement }]}
                  contentFit="cover"
                  transition={250}
                  accessibilityLabel={`${location.name} fotoğrafı`}
                />
              </Animated.View>
              {/* Üstte hafif koyu geçiş: saat ve pil simgeleri açık fotoğraflarda da okunur. */}
              <LinearGradient colors={[OnPhoto.scrim, 'transparent']} style={styles.heroTopShade} />
              <View style={[styles.heroBack, { top: insets.top + Spacing.two }]}>
                <BackButton floating />
              </View>
            </View>
          ) : null}

          <View
            style={[
              styles.content,
              hasCover && [styles.sheet, { backgroundColor: theme.background }],
            ]}
          >
            {hasCover ? null : <BackButton />}

            {location.coverPhotoCredit ? (
              <Pressable
                disabled={!location.coverPhotoSource}
                onPress={() => location.coverPhotoSource && Linking.openURL(location.coverPhotoSource)}
                hitSlop={6}
              >
                <ThemedText type="caption" themeColor="textSecondary">
                  Fotoğraf: {location.coverPhotoCredit}
                  {location.coverPhotoSource ? ' · Wikimedia Commons' : ''}
                </ThemedText>
              </Pressable>
            ) : null}

            <View style={styles.titleBlock}>
              <ThemedText type="subtitle">{location.name}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {[location.category, location.district].filter(Boolean).join(' · ')}
                {location.rating ? (
                  <ThemedText type="smallBold" style={{ color: theme.highlight }}>
                    {'  '}★ {location.rating.toFixed(1)}
                  </ThemedText>
                ) : null}
              </ThemedText>
              <View style={styles.tagRow}>
                {location.isSponsored ? <Tag label="Sponsorlu" /> : null}
                {location.isFree ? <Tag label="Ücretsiz Giriş" tone="accent" /> : null}
              </View>
            </View>

            <ThemedText>{location.description}</ThemedText>

            {location.isSponsored && location.sponsorInfo ? (
              <Card style={[styles.sponsorCard, { borderColor: theme.highlight }]}>
                <ThemedText type="smallBold">{location.sponsorInfo.name}</ThemedText>
                {location.sponsorInfo.offer ? (
                  <ThemedText type="small">{location.sponsorInfo.offer}</ThemedText>
                ) : null}
              </Card>
            ) : null}

            {coordinates ? (
              <>
                <LocationMap
                  locations={[location]}
                  interactive={false}
                  initialRegion={{ ...coordinates, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
                  style={styles.map}
                />
                <Button
                  title="Yol Tarifi Al"
                  variant="outline"
                  onPress={() => Linking.openURL(directionsUrl(location, Platform.OS))}
                />
              </>
            ) : null}

          </View>
        </Animated.ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const HERO_HEIGHT = 340;

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { ...ContentColumn, flex: 1 },
  content: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.five,
    gap: Spacing.three,
  },
  hero: { height: HERO_HEIGHT, overflow: 'hidden' },
  heroTopShade: { position: 'absolute', top: 0, left: 0, right: 0, height: 110 },
  heroBack: { position: 'absolute', left: Spacing.three },
  // İçerik, fotoğrafın üstüne hafifçe binen yuvarlak köşeli bir sayfa gibi başlar.
  sheet: {
    marginTop: -Spacing.four,
    borderTopLeftRadius: Radius.large + 6,
    borderTopRightRadius: Radius.large + 6,
    paddingTop: Spacing.four,
  },
  titleBlock: { gap: Spacing.one },
  tagRow: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.one },
  sponsorCard: { gap: Spacing.one },
  map: { height: 180 },
  centered: { textAlign: 'center' },
});
