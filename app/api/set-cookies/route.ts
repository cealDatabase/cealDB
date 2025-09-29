import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { libid, role } = body;

    if (!libid || !role) {
      return NextResponse.json(
        { error: "Both libid and role are required" },
        { status: 400 }
      );
    }

    const response = NextResponse.json({ success: true, message: "Cookies set successfully" });
    
    // Set cookies with proper options
    response.cookies.set("libid", String(libid), {
      httpOnly: false,
      secure: false, // Set to true in production with HTTPS
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/"
    });
    
    response.cookies.set("role", String(role), {
      httpOnly: false,
      secure: false, // Set to true in production with HTTPS
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/"
    });

    return response;
  } catch (error) {
    console.error("Error setting cookies:", error);
    return NextResponse.json(
      { error: "Failed to set cookies" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  
  return NextResponse.json({
    cookies: allCookies,
    libid: cookieStore.get("libid")?.value,
    role: cookieStore.get("role")?.value
  });
}
