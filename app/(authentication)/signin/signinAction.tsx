"use server";

const ROOT_URL =
  process.env.NODE_ENV !== "production"
    ? "http://localhost:3000"
    : "https://cealstats.org";

export default async function signinAction(
  currentState: any,
  formData: FormData
): Promise<any> {
  // Get data off form - using username field but treating it as email
  const usernameRaw = formData.get("email")?.toString() || formData.get("username")?.toString();
  const username = usernameRaw && usernameRaw.toLowerCase();
  const password = formData.get("password")?.toString();
  
  // Validate input
  if (!username || !password) {
    return {
      success: false,
      errorType: 'MISSING_CREDENTIALS',
      message: 'Both username and password are required.',
      hint: 'Please enter both your username and password to sign in.',
    };
  }

  try {
    // Send to our new Argon2id signin API route
    const res = await fetch(ROOT_URL + "/api/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: username, password }),
    });
    
    const json = await res.json();

    // Handle different response scenarios
    if (res.ok && json.success) {
      // Successful signin - cookies are already set by the API route
      console.log("✅ Signin successful, returning success for client-side redirect");
      return {
        success: true,
        message: json.message,
        redirectUrl: "/admin"
      };
    } else if (json.errorType === 'PASSWORD_RESET_REQUIRED') {
      // Password reset required - return specific response for frontend handling
      return {
        success: false,
        errorType: 'PASSWORD_RESET_REQUIRED',
        message: json.message,
        hint: json.hint,
        suggestions: json.suggestions,
        resetToken: json.resetToken,
        hasEmail: json.hasEmail
      };
    } else {
      // Other authentication failures
      return {
        success: false,
        errorType: json.errorType || 'AUTHENTICATION_FAILED',
        message: json.message || 'Authentication failed.',
        hint: json.hint || 'Please check your credentials and try again.',
        suggestions: json.suggestions || [
          'Verify your username and password',
          'Use "Forgot Password" if needed',
          'Contact CEAL admin if you continue having issues'
        ]
      };
    }
  } catch (error) {
    console.error('Signin action error:', error);
    return {
      success: false,
      errorType: 'NETWORK_ERROR',
      message: 'Unable to connect to authentication service.',
      hint: 'Please check your internet connection and try again.',
      suggestions: [
        'Check your internet connection',
        'Wait a moment and try again',
        'Contact CEAL admin if the problem persists'
      ]
    };
  }
}
