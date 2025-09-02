import { getSession } from '@/lib/auth';
import { config } from '@/lib/config';
import { SignJWT } from 'jose';
import { NextResponse } from 'next/server';

const SECRET_KEY = new TextEncoder().encode(
  config.jwtSecret
);

export async function GET() {
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json({ error: 'authenticationRequired' }, { status: 401 });
  }
  
  // Generate CSRF token
  const csrfToken = await new SignJWT({ 
    sessionId: session.sessionId,
    purpose: 'csrf',
    timestamp: Date.now()
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1h')
    .sign(SECRET_KEY);
  
  return NextResponse.json({ csrfToken });
}