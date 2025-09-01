import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { SignJWT } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
);

export async function GET() {
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
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