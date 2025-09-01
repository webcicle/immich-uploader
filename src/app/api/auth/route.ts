import { NextRequest, NextResponse } from 'next/server';
import { createSession, verifyInvitationCode, getSession } from '@/lib/auth';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  
  // Rate limit auth attempts per IP
  const rateLimit = checkRateLimit(`auth-${clientIP}`, 5, 15 * 60 * 1000); // 5 attempts per 15 minutes
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many authentication attempts. Please try again later.' },
      { 
        status: 429,
        headers: getRateLimitHeaders(rateLimit)
      }
    );
  }

  try {
    const { invitationCode, userName } = await req.json();
    
    if (!invitationCode || !userName) {
      return NextResponse.json(
        { error: 'Invitation code and name are required' },
        { status: 400 }
      );
    }
    
    if (!verifyInvitationCode(invitationCode)) {
      return NextResponse.json(
        { error: 'Invalid invitation code' },
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
    
    return response;
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
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