import { ComingSoon } from '@/components/coming-soon';

export default function ExploreScreen() {
  return (
    <ComingSoon
      title="Keşfet"
      sprint="Sprint 3"
      icon="compass-outline"
      features={[
        'İstanbul mekanlarının listesi ve arama',
        'Puan, ücretsiz giriş ve ilçeye göre filtreler',
        'Harita görünümü ve mekan detay sayfası',
      ]}
    />
  );
}
