import { NextRequest, NextResponse } from 'next/server';
import { createSession, verifyInvitationCode, getSession } from '@/lib/auth';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rateLimit';
import { availableLanguages, Language } from '@/lib/translations';

export async function POST(req: NextRequest) {
  const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  
  // Rate limit auth attempts per IP
  const rateLimit = checkRateLimit(`auth-${clientIP}`, 5, 15 * 60 * 1000); // 5 attempts per 15 minutes
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'tooManyAuthAttempts' },
      { 
        status: 429,
        headers: getRateLimitHeaders(rateLimit)
      }
    );
  }

  try {
    const { invitationCode, userName, language } = await req.json();
    
    if (!invitationCode || !userName) {
      return NextResponse.json(
        { error: 'invitationCodeAndNameRequired' },
        { status: 400 }
      );
    }
    
    if (!verifyInvitationCode(invitationCode)) {
      return NextResponse.json(
        { error: 'invalidInvitationCode' },
        { status: 401 }
      );
    }
    
    // Create session
    const sessionToken = await createSession(userName.trim());
    
    // Set cookie
    const response = NextResponse.json({
      success: true,
      message: 'Authentication successful'
    });
    
    response.cookies.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });
    
    // Set language cookie if provided and valid
    if (language && availableLanguages.includes(language as Language)) {
      response.cookies.set('immich-share-language', language, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365, // 1 year
        sameSite: 'lax'
      });
    }
    
    return response;
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'authenticationFailed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }
    
    return NextResponse.json({
      authenticated: true,
      sessionId: session.sessionId,
      userName: session.userName,
      albumIds: session.albumIds
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { authenticated: false },
      { status: 500 }
    );
  }
}