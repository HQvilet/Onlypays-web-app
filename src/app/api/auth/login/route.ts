import { NextResponse } from "next/server";

interface Auth0TokenSuccess {
  access_token: string;
  id_token?: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope?: string;
}

interface Auth0Error {
  error: string;
  error_description?: string;
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64Url = parts[1]!;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = Buffer.from(base64, "base64").toString("utf-8");
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address." },
        { status: 400 },
      );
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { success: false, error: "Please enter your password." },
        { status: 400 },
      );
    }

    const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN;
    const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID;
    const audience = process.env.NEXT_PUBLIC_AUTH0_AUDIENCE;

    if (!domain || !clientId) {
      return NextResponse.json(
        { success: false, error: "Auth0 environment is not properly configured on server." },
        { status: 500 },
      );
    }

    // Call Auth0 Authentication API (/oauth/token) with password-realm grant
    const auth0Endpoint = `https://${domain}/oauth/token`;
    const payload = {
      grant_type: "http://auth0.com/oauth/grant-type/password-realm",
      username: email.trim(),
      password,
      realm: "Username-Password-Authentication",
      client_id: clientId,
      ...(audience ? { audience } : {}),
      scope: "openid profile email offline_access",
    };

    const auth0Res = await fetch(auth0Endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = (await auth0Res.json()) as Auth0TokenSuccess | Auth0Error;

    if (!auth0Res.ok || "error" in data) {
      const err = data as Auth0Error;
      let userFriendlyMessage = err.error_description || "Authentication failed.";

      if (err.error === "invalid_grant") {
        userFriendlyMessage = "Invalid email or password. Please verify your credentials.";
      } else if (err.error === "unauthorized_client") {
        userFriendlyMessage =
          "Password grant is not enabled for this Auth0 client. Please enable 'Password' grant in Auth0 Application Settings.";
      } else if (err.error === "access_denied") {
        userFriendlyMessage = "Access denied. Your account may be blocked or unverified.";
      } else if (err.error === "too_many_attempts") {
        userFriendlyMessage = "Your account has been temporarily locked due to too many failed login attempts.";
      }

      return NextResponse.json(
        {
          success: false,
          error: userFriendlyMessage,
          code: err.error,
        },
        { status: auth0Res.status || 401 },
      );
    }

    const tokenData = data as Auth0TokenSuccess;
    let userClaims: Record<string, unknown> | null = null;

    if (tokenData.id_token) {
      userClaims = decodeJwtPayload(tokenData.id_token);
    }

    const user = {
      sub: (userClaims?.sub as string) || `auth0|${email}`,
      email: (userClaims?.email as string) || email,
      name: (userClaims?.name as string) || (userClaims?.nickname as string) || email.split("@")[0],
      nickname: (userClaims?.nickname as string) || email.split("@")[0],
      picture: (userClaims?.picture as string) || null,
      email_verified: Boolean(userClaims?.email_verified),
    };

    return NextResponse.json({
      success: true,
      user,
      accessToken: tokenData.access_token,
      idToken: tokenData.id_token || null,
      refreshToken: tokenData.refresh_token || null,
      expiresIn: tokenData.expires_in,
    });
  } catch (error) {
    console.error("[/api/auth/login] Unexpected error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error during authentication.",
      },
      { status: 500 },
    );
  }
}
