import { SizeLimit } from "next";

type NextMode = "standalone" | "export" | undefined;
interface AppConfig {
  // Required Immich configuration
  defaultLanguage: string;
  immichServerUrl: string;
  immichApiKey: string;
  jwtSecret: string;
  invitationCode: string;
  
  // Optional configuration
  basePath: string;
  nextMode: NextMode;
  bodySizeLimit: SizeLimit | undefined;
  languageCookieName: string;
  
  // Runtime environment
  nodeEnv: string;
}

function createConfig(): AppConfig {
  // Validate required environment variables
  const immichServerUrl = process.env.IMMICH_SERVER_URL;
  const immichApiKey = process.env.IMMICH_API_KEY;
  const jwtSecret = process.env.JWT_SECRET;
  const invitationCode = process.env.INVITATION_CODE;

  if (!immichServerUrl) {
    throw new Error('IMMICH_SERVER_URL environment variable is required. Please set it in your .env file.');
  }
  
  if (!immichApiKey) {
    throw new Error('IMMICH_API_KEY environment variable is required. Please set it in your .env file.');
  }

  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is required. Please set it in your .env file.');
  }

  if (!invitationCode) {
    throw new Error('INVITATION_CODE environment variable is required. Please set it in your .env file.');
  }
  
  return {
    // Required Immich configuration (validated above)
    defaultLanguage: process.env.DEFAULT_LANGUAGE ?? "en",
    immichServerUrl,
    immichApiKey,
    jwtSecret,
    invitationCode,
    // Optional configuration    
    basePath: process.env.BASE_PATH ?? '',
    nextMode: process.env.NEXT_MODE as NextMode,
    bodySizeLimit: (process.env.BODY_SIZE_LIMIT ?? "500mb") as SizeLimit,
    languageCookieName: process.env.LANGUAGE_COOKIE_NAME ?? "immich-share-language",

    // Runtime environment
    nodeEnv: process.env.NODE_ENV ?? 'development',
  };
}

export function hasBasePath(): boolean {
  return !!process.env.BASE_PATH && process.env.BASE_PATH !== '';
}

// Lazy-loaded config - only creates config when accessed on server side
let _config: AppConfig | null = null;

export const config = new Proxy({} as AppConfig, {
  get(target, prop) {
    if (typeof window !== 'undefined') {
      throw new Error('Server config cannot be accessed on client side');
    }
    if (!_config) {
      _config = createConfig();
    }
    return _config[prop as keyof AppConfig];
  }
});

// Export individual client-safe constants that don't require server validation
export const LANGUAGE_COOKIE_NAME = process.env.LANGUAGE_COOKIE_NAME ?? 'immich-share-language';