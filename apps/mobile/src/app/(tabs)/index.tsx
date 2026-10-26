import { ComingSoon } from '@/components/coming-soon';

export default function FeedScreen() {
  return (
    <ComingSoon
      title="Akış"
      sprint="Sprint 5"
      icon="newspaper-outline"
      features={[
        'Takip edilen çiftlerin ve arkadaş gruplarının check-in paylaşımları',
        '"Keşfet" ve "Takip Edilenler" sekmeleri',
        'Paylaşımları beğenme',
      ]}
    />
  );
}
