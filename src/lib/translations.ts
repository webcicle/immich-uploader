// Translation configuration for the Immich Share application
// Supports English and Swedish languages

export type Language = 'en' | 'sv';

export interface Translations {
  // Page titles and metadata
  pageTitle: string;
  pageDescription: string;
  appTitle: string;
  
  // Authentication page
  accessRequired: string;
  enterInvitationCode: string;
  yourName: string;
  enterYourName: string;
  invitationCode: string;
  enterInvitationCodePlaceholder: string;
  authenticating: string;
  enterPhotoShare: string;
  forFriendsFamily: string;
  invitationCodeHelp: string;
  
  // Main uploader page
  sharePhotos: string;
  uploadPhotosToCreateAlbum: string;
  albumName: string;
  albumNamePlaceholder: string;
  tapToSelectPhotos: string;
  selectMultiplePhotos: string;
  selectedPhotos: string;
  createAlbumAndUpload: string;
  uploadingPhotos: string;
  
  // Results page
  uploadComplete: string;
  createdAlbumWith: string;
  photosText: string;
  photosAddedToAlbum: string;
  uploadMorePhotos: string;
  
  // Instructions
  howToUse: string;
  instructionStep1: string;
  instructionStep2: string;
  instructionStep3: string;
  instructionStep4: string;
  instructionStep5: string;
  instructionStep6: string;
  tipTitle: string;
  tipDescription: string;
  
  // Common elements
  loading: string;
  error: string;
  
  // Error messages
  pleaseEnterAlbumName: string;
  pleaseEnterBothFields: string;
  uploadFailed: string;
  authenticationFailed: string;
  connectionError: string;
  
  // Language selector
  language: string;
  english: string;
  swedish: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    // Page titles and metadata
    pageTitle: 'Share Photos - Immich',
    pageDescription: 'Upload photos to create shared albums',
    appTitle: 'Share Photos',
    
    // Authentication page
    accessRequired: 'Access Required',
    enterInvitationCode: 'Enter the invitation code to upload photos',
    yourName: 'Your Name',
    enterYourName: 'Enter your name',
    invitationCode: 'Invitation Code',
    enterInvitationCodePlaceholder: 'Enter invitation code',
    authenticating: 'Authenticating...',
    enterPhotoShare: 'Enter Photo Share',
    forFriendsFamily: 'For friends & family:',
    invitationCodeHelp: 'Ask the person who shared this link for the invitation code. This helps keep the photo sharing private and secure.',
    
    // Main uploader page
    sharePhotos: 'Share Photos',
    uploadPhotosToCreateAlbum: 'Upload photos to create a shared album',
    albumName: 'Album Name',
    albumNamePlaceholder: 'e.g., Beach Trip 2024',
    tapToSelectPhotos: 'Tap to select photos',
    selectMultiplePhotos: 'You can select multiple photos at once',
    selectedPhotos: 'Selected Photos',
    createAlbumAndUpload: 'Create Album & Upload',
    uploadingPhotos: 'Uploading Photos...',
    
    // Results page
    uploadComplete: 'Upload Complete!',
    createdAlbumWith: 'Created album',
    photosText: 'photos',
    photosAddedToAlbum: 'Your photos have been added to the shared album!',
    uploadMorePhotos: 'Upload More Photos',
    
    // Instructions
    howToUse: 'How to use:',
    instructionStep1: '1. Open your mobile browser',
    instructionStep2: '2. Navigate to this page',
    instructionStep3: '3. Tap "Select Photos" button',
    instructionStep4: '4. Choose multiple photos from your photo library',
    instructionStep5: '5. Enter your name and album name',
    instructionStep6: '6. Tap "Create Album & Upload"',
    tipTitle: 'Tip:',
    tipDescription: 'Add this page to your home screen for easy access! Look for "Add to Home Screen" in your browser\'s menu.',
    
    // Common elements
    loading: 'Loading...',
    error: 'Error',
    
    // Error messages
    pleaseEnterAlbumName: 'Please enter an album name',
    pleaseEnterBothFields: 'Please enter both invitation code and your name',
    uploadFailed: 'Upload failed. Please try again.',
    authenticationFailed: 'Authentication failed',
    connectionError: 'Connection error. Please try again.',
    
    // Language selector
    language: 'Language',
    english: 'English',
    swedish: 'Svenska'
  },
  
  sv: {
    // Page titles and metadata
    pageTitle: 'Dela Foton med Viktor',
    pageDescription: 'Ladda upp foton för att skapa ett delat album',
    appTitle: 'Dela Foton',
    
    // Authentication page
    accessRequired: 'Åtkomst Krävs',
    enterInvitationCode: 'Ange din inbjudningskod för att ladda upp foton',
    yourName: 'Ditt Namn',
    enterYourName: 'Ange ditt namn',
    invitationCode: 'Inbjudningskod',
    enterInvitationCodePlaceholder: 'Ange inbjudningskod',
    authenticating: 'Autentiserar...',
    enterPhotoShare: 'Gå in i Fotdelning',
    forFriendsFamily: 'För vänner och familj:',
    invitationCodeHelp: 'Be Viktor om inbjudningskoden. Koden är bara för dig och ska inte delas. Detta hjälper till att hålla fotdelningen privat och säker.',
    
    // Main uploader page
    sharePhotos: 'Dela Foton',
    uploadPhotosToCreateAlbum: 'Ladda upp foton för att skapa ett delat album',
    albumName: 'Albumnamn',
    albumNamePlaceholder: 't.ex. Sommaren 2025',
    tapToSelectPhotos: 'Tryck för att välja foton',
    selectMultiplePhotos: 'Du kan välja flera foton samtidigt',
    selectedPhotos: 'Valda Foton',
    createAlbumAndUpload: 'Skapa Album & Ladda upp',
    uploadingPhotos: 'Laddar upp Foton...',
    
    // Results page
    uploadComplete: 'Uppladdningen är klar!',
    createdAlbumWith: 'Skapade album',
    photosText: 'foton',
    photosAddedToAlbum: 'Dina foton har lagts till i det delade albumet!',
    uploadMorePhotos: 'Ladda upp Fler Foton',
    
    // Instructions
    howToUse: 'Så här använder du verktyget:',
    instructionStep1: '1. Öppna din mobilwebbläsare',
    instructionStep2: '2. Navigera till denna sida',
    instructionStep3: '3. Tryck på knappen "Välj Foton"',
    instructionStep4: '4. Välj ett eller flera foton från ditt fotobibliotek',
    instructionStep5: '5. Ange ett albumnamn',
    instructionStep6: '6. Tryck på "Skapa Album & Ladda upp"',
    tipTitle: 'Tips:',
    tipDescription: 'Lägg till denna sida på din startskärm för enkel åtkomst! Leta efter "Lägg till på startskärm" i din webbläsares meny.',
    
    // Common elements
    loading: 'Laddar...',
    error: 'Fel',
    
    // Error messages
    pleaseEnterAlbumName: 'Vänligen ange ett albumnamn',
    pleaseEnterBothFields: 'Vänligen ange både inbjudningskod och ditt namn',
    uploadFailed: 'Uppladdningen misslyckades. Försök igen.',
    authenticationFailed: 'Autentisering misslyckades',
    connectionError: 'Anslutningsfel. Försök igen.',
    
    // Language selector
    language: 'Språk',
    english: 'English',
    swedish: 'Svenska'
  }
};

export function getTranslations(language: Language): Translations {
  return translations[language] || translations.en;
}

export const defaultLanguage: Language = 'sv';
export const availableLanguages: Language[] = ['en', 'sv'];