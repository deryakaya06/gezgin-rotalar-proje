import { StyleSheet, useColorScheme, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { AccountType } from '@repo/shared';

import { useTheme } from '@/hooks/use-theme';

/**
 * Profil görseli: Instagram'daki gibi gri daire içinde sade bir siluet.
 * accountType şimdilik yalnızca erişilebilirlik etiketinde kullanılır.
 */
export function Avatar({ accountType, size }: { accountType?: AccountType; size: number }) {
  const theme = useTheme();
  const scheme = useColorScheme();
  const label = accountType === 'couple' ? 'Çift hesabı' : 'Arkadaş grubu';

  return (
    <View
      style={[
        styles.fallback,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: theme.backgroundSelected },
      ]}
      accessibilityLabel={`${label}, profil görseli`}
    >
      {/* Siluet biraz aşağıda durur; omuzlar dairenin kenarında kesilir. */}
      <Ionicons
        name="person"
        size={size * 0.8}
        color={scheme === 'dark' ? theme.placeholder : theme.background}
        style={{ marginTop: size * 0.28 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { alignItems: 'center', overflow: 'hidden' },
});
