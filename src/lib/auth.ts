import { JWTPayload, SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { config } from './config';




export interface SessionData extends JWTPayload {
  sessionId: string;
  userName: string;
  albumIds: string[];
  createdAt: number;
  expiresAt: number;
}

export async function createSession(userName: string): Promise<string> {
   const SECRET_KEY = new TextEncoder().encode(
  config.jwtSecret
);

  const sessionId = generateSessionId();
  const now = Date.now();
  const expiresAt = now + (7 * 24 * 60 * 60 * 1000); // 7 days
  
  const sessionData: SessionData = {
    sessionId,
    userName,
    albumIds: [],
    createdAt: now,
    expiresAt
  };

  const token = await new SignJWT(sessionData)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(SECRET_KEY);

  return token;
}

export async function verifySession(token: string): Promise<SessionData | null> {
   const SECRET_KEY = new TextEncoder().encode(
  config.jwtSecret
);

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    const sessionData = payload as unknown as SessionData;
    
    // Check if session is expired
    if (sessionData.expiresAt < Date.now()) {
      return null;
    }
    
    return sessionData;
  } catch (error) {
    console.error('Session verification failed:', error);
    return null;
  }
}

export function verifyInvitationCode(code: string): boolean {
const INVITATION_CODE = config.invitationCode;
  return code === INVITATION_CODE;
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  
  if (!token) {
    return null;
  }
  
  return verifySession(token);
}

export async function updateSessionAlbums(sessionId: string, albumId: string): Promise<void> {
   const SECRET_KEY = new TextEncoder().encode(
  config.jwtSecret
);
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  
  if (!token) {
    return;
  }
  
  const sessionData = await verifySession(token);
  if (!sessionData || sessionData.sessionId !== sessionId) {
    return;
  }
  
  // Add album to session if not already present
  if (!sessionData.albumIds.includes(albumId)) {
    sessionData.albumIds.push(albumId);
    
    // Create new token with updated data
    const newToken = await new SignJWT(sessionData)
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(SECRET_KEY);
    
    // Update cookie
    cookieStore.set('session', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });
  }
}

function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}