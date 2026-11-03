import { Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';

/**
 * Geri düğmesi. Sayfa doğrudan açıldıysa (web'de adres çubuğundan/yenileyerek)
 * geri gidilecek ekran yoktur; o zaman ana sekmelere dönülür.
 */
export function BackButton() {
  const router = useRouter();
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)'));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Geri"
      hitSlop={12}
      onPress={goBack}
      style={styles.inline}
    >
      <ThemedText type="linkPrimary">{'‹ Geri'}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  inline: { alignSelf: 'flex-start' },
});
