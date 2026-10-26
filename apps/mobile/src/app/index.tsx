import { StyleSheet, Text, View } from 'react-native';

import { db } from '@/firebase';

/** Sprint 0: kurulumun tamamlandığını ve Firebase bağlantısını gösteren başlangıç ekranı. */
export default function SetupScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gezgin Rotalar</Text>
      <Text style={styles.text}>Kurulum tamamlandı.</Text>
      <Text style={styles.text}>Firebase projesi: {db.app.options.projectId}</Text>
      <Text style={styles.note}>Kayıt ve giriş ekranları Sprint 1&apos;de eklenecek.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 24 },
  title: { fontSize: 28, fontWeight: '700' },
  text: { fontSize: 16 },
  note: { fontSize: 14, opacity: 0.6, marginTop: 8, textAlign: 'center' },
});
