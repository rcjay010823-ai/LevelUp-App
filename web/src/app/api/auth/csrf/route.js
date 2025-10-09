import { randomBytes } from "crypto";

/**
 * CSRF Token endpoint for Auth.js
 * This endpoint generates and returns a CSRF token for authentication flows
 */
export async function GET(request) {
  try {
    // Generate a random CSRF token
    const csrfToken = randomBytes(32).toString("hex");

    return Response.json({
      csrfToken,
    });
  } catch (error) {
    console.error("[CSRF] Error generating token:", error);
    return Response.json(
      { error: "Failed to generate CSRF token" },
      { status: 500 }
    );
  }
}
