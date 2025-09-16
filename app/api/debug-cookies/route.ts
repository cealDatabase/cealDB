import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

export async function GET(request: NextRequest) {
  try {
    console.log("🍪 COOKIE DEBUG API CALLED");
    console.log("🌐 URL:", request.url);
    
    // Get cookies using official Next.js cookies API
    const cookieStore = await cookies();
    const requestCookies = request.cookies;
    
    // Get all cookies using official methods
    const serverCookies = cookieStore.getAll();
    const requestCookiesAll = requestCookies.getAll();
    
    // Test JWT verification if session cookie exists
    let jwtDebug = null;
    const sessionCookie = cookieStore.get('session');
    if (sessionCookie) {
      try {
        const secret = process.env.AUTH_SECRET || 'fallback-secret-change-in-production';
        const { payload } = await jwtVerify(
          sessionCookie.value,
          new TextEncoder().encode(secret)
        );
        jwtDebug = {
          success: true,
          payload: payload,
          username: payload.username,
          payloadKeys: Object.keys(payload)
        };
      } catch (jwtError) {
        jwtDebug = {
          success: false,
          error: jwtError instanceof Error ? jwtError.message : String(jwtError)
        };
      }
    }
    
    const debugInfo = {
      timestamp: new Date().toISOString(),
      jwtVerification: jwtDebug,
      serverCookies: {
        count: serverCookies.length,
        cookies: serverCookies.map(c => ({
          name: c.name,
          value: c.value.length > 50 ? c.value.substring(0, 50) + '...' : c.value,
          hasValue: !!c.value
        }))
      },
      requestCookies: {
        count: requestCookiesAll.length,
        cookies: requestCookiesAll.map(c => ({
          name: c.name,
          value: c.value.length > 50 ? c.value.substring(0, 50) + '...' : c.value,
          hasValue: !!c.value
        }))
      },
      specificCookies: {
        session: {
          server: !!cookieStore.get('session'),
          request: !!requestCookies.get('session')
        },
        uinf: {
          server: !!cookieStore.get('uinf'),
          request: !!requestCookies.get('uinf'),
          serverValue: cookieStore.get('uinf')?.value,
          requestValue: requestCookies.get('uinf')?.value
        },
        role: {
          server: !!cookieStore.get('role'),
          request: !!requestCookies.get('role'),
          serverValue: cookieStore.get('role')?.value,
          requestValue: requestCookies.get('role')?.value
        }
      }
    };
    
    console.log("🍪 DEBUG INFO:", JSON.stringify(debugInfo, null, 2));
    
    return NextResponse.json({
      success: true,
      debugInfo
    });
    
  } catch (error) {
    console.error("❌ Cookie debug error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
