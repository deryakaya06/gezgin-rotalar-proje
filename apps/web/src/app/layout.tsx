import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gezgin Rotalar Yönetim',
  description: 'Mekanları ve sponsorlu içerikleri yönetme paneli',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          fontFamily: 'system-ui, sans-serif',
          background: '#F6F2EA',
          color: '#1E2A25',
        }}
      >
        {children}
      </body>
    </html>
  );
}
