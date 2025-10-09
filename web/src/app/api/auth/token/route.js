import { getToken } from "@auth/core/jwt";

export async function GET(request) {
  console.log("🔑 Token endpoint called");

  try {
    const [token, jwt] = await Promise.all([
      getToken({
        req: request,
        secret: process.env.AUTH_SECRET,
        secureCookie: process.env.AUTH_URL?.startsWith("https") || false,
        raw: true,
      }),
      getToken({
        req: request,
        secret: process.env.AUTH_SECRET,
        secureCookie: process.env.AUTH_URL?.startsWith("https") || false,
      }),
    ]);

    console.log("🔍 Token validation:", {
      hasToken: !!token,
      hasJwt: !!jwt,
      jwtSub: jwt?.sub,
      jwtEmail: jwt?.email,
    });

    if (!jwt || !jwt.sub) {
      console.log("❌ No valid JWT found");
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: "No valid authentication session found",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Validate that we have all required user data
    if (!token || !jwt.sub) {
      console.log("❌ Missing required authentication data");
      return new Response(
        JSON.stringify({
          error: "Invalid authentication data",
          message: "Authentication data is incomplete",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    const responseData = {
      jwt: token,
      user: {
        id: jwt.sub,
        email: jwt.email || null,
        name: jwt.name || null,
      },
    };

    console.log("✅ Token exchange successful for user:", jwt.sub);

    return new Response(JSON.stringify(responseData), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("❌ Token endpoint error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: "Failed to process authentication token",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}
