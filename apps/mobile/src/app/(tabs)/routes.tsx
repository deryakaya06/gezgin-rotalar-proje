import { ComingSoon } from '@/components/coming-soon';

export default function RoutesScreen() {
  return (
    <ComingSoon
      title="Rotalar"
      sprint="Sprint 4 ve 6"
      icon="map-outline"
      features={[
        'Mekanlarda check-in yapıp puan kazanma (Sprint 4)',
        'Geçmiş check-in\'lerin listesi',
        'Gezi takvimi ve günün rotasının haritada animasyonlu çizimi (Sprint 6)',
      ]}
    />
  );
}
