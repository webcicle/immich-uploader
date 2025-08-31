import { Metadata } from 'next';
import ImmichUploader from './components/Uploader';

export const metadata: Metadata = {
  title: 'Share Photos - Immich',
  description: 'Upload photos to create shared albums',
  viewport: 'width=device-width, initial-scale=1',
  
  // PWA meta tags for iPhone
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Share Photos'
  },
  icons: {
    apple: '/api/icon'
  }
};

export default function SharePage() {
  return <ImmichUploader />;
}