import sql from "@/app/api/utils/sql";
import { hash } from "argon2";

export async function POST(request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return Response.json({ error: "Token and password are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return Response.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    // Check if token exists and is valid
    const tokens = await sql`
      SELECT user_id, used, expires_at 
      FROM password_reset_tokens 
      WHERE token = ${token}
    `;

    if (tokens.length === 0) {
      return Response.json({ error: "Invalid or expired reset token" }, { status: 400 });
    }

    const resetToken = tokens[0];

    // Check if token is already used
    if (resetToken.used) {
      return Response.json({ error: "Reset token has already been used" }, { status: 400 });
    }

    // Check if token is expired
    if (new Date() > new Date(resetToken.expires_at)) {
      return Response.json({ error: "Reset token has expired" }, { status: 400 });
    }

    // Hash the new password
    const hashedPassword = await hash(password);

    // Update user's password and mark token as used in a transaction
    await sql.transaction([
      sql`
        UPDATE auth_accounts 
        SET password = ${hashedPassword} 
        WHERE "userId" = ${resetToken.user_id} AND type = 'credentials'
      `,
      sql`
        UPDATE password_reset_tokens 
        SET used = true 
        WHERE token = ${token}
      `
    ]);

    return Response.json({ message: "Password successfully reset" });

  } catch (error) {
    console.error('Password reset error:', error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}