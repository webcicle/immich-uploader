import { Metadata } from 'next';
import ImmichUploader from './components/Uploader';
import AuthGate from './components/AuthGate';

export const metadata: Metadata = {
  title: 'Share Photos - Immich',
  description: 'Upload photos to create shared albums',
  viewport: 'width=device-width, initial-scale=1',
  
  // PWA meta tags for iPhone (iOS ignores manifest.json)
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Share Photos'
  },
  icons: {
    apple: '/share/api/icon',
    icon: '/share/api/icon'
  },
  // Android PWA support
  themeColor: '#2563eb',
  manifest: '/share/manifest.json'
};

export default function SharePage() {
  return (
    <AuthGate>
      <ImmichUploader />
    </AuthGate>
  );
}