import { Metadata, Viewport } from 'next';
import ImmichUploader from './components/Uploader';
import AuthGate from './components/AuthGate';

export const metadata: Metadata = {
  title: 'Share Photos - Immich',
  description: 'Upload photos to create shared albums',
  
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
  manifest: '/share/manifest.json'
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2563eb'
};

export default function SharePage() {
  return (
    <AuthGate>
      <ImmichUploader />
    </AuthGate>
  );
}