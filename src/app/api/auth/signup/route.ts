import { gatewayClient } from "@/lib/axios";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

interface Auth0SignupSuccess {
  _id: string;
  email: string;
  username?: string;
  email_verified: boolean;
}

interface Auth0SignupError {
  name?: string;
  code?: string;
  description?: string;
  message?: string;
  statusCode?: number;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, username, role } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters long." },
        { status: 400 },
      );
    }

    const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN;
    const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID;

    if (!domain || !clientId) {
      return NextResponse.json(
        { success: false, error: "Auth0 environment is not properly configured on server." },
        { status: 500 },
      );
    }

    // Call Auth0 Authentication API (/dbconnections/signup)
    const auth0Endpoint = `https://${domain}/dbconnections/signup`;
    const signupPayload = {
      client_id: clientId,
      email: email.trim(),
      password,
      connection: "Username-Password-Authentication",
      ...(username ? { username: username.trim() } : {}),
      user_metadata: {
        role: role,
      },
    };

    const auth0Res = await fetch(auth0Endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(signupPayload),
    });

    const data = (await auth0Res.json()) as Auth0SignupSuccess | Auth0SignupError;

    if (!auth0Res.ok) {
      const err = data as Auth0SignupError;
      let userFriendlyMessage = err.description || err.message || "Registration failed.";

      if (err.code === "user_exists") {
        userFriendlyMessage = "An account with this email address already exists. Please log in instead.";
      } else if (err.name === "PasswordStrengthError" || err.code === "invalid_password") {
        userFriendlyMessage =
          err.description || "Password does not meet complexity requirements (at least 8 chars, numbers & special characters).";
      }

      return NextResponse.json(
        {
          success: false,
          error: userFriendlyMessage,
          code: err.code || err.name,
        },
        { status: auth0Res.status || 400 },
      );
    }

    const createdUser = data as Auth0SignupSuccess;

    const userId = `auth0|${createdUser._id}`;
    const resolvedUsername = createdUser.username || createdUser.email.split("@")[0];

    // Provision user in User Service via gateway webhook (fire-and-forget, non-fatal)
    try {
      const webhookSecret = process.env.WEBHOOK_SECRET;

      if (!webhookSecret) {
        console.warn("[/api/auth/signup] WEBHOOK_SECRET is not set — skipping user provisioning webhook.");
      } else {
        const webhookPayload = {
          id: userId,
          email: createdUser.email,
          username: resolvedUsername
        };

        const webhook = await gatewayClient.post(`/user-social/api/users/webhook`, {
          ...webhookPayload,
        }, {
          headers: { "X-Webhook-Secret": webhookSecret }
        })
      }
    } catch (webhookError) {
      // Non-fatal — signup already succeeded in Auth0; log and continue.
      console.error("[/api/auth/signup] Error calling user provisioning webhook:", webhookError);
    }

    return NextResponse.json({
      success: true,
      message: "Account created successfully.",
      user: {
        id: userId,
        email: createdUser.email,
        username: resolvedUsername,
        emailVerified: createdUser.email_verified,
      },
    });
  } catch (error) {
    console.error("[/api/auth/signup] Unexpected error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error during registration.",
      },
      { status: 500 },
    );
  }
}
