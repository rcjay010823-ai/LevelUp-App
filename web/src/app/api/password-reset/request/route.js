import { sendEmail } from "@/app/api/utils/send-email";
import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user exists
    const users = await sql`SELECT id FROM auth_users WHERE email = ${email}`;
    
    if (users.length === 0) {
      // Don't reveal if email exists - return success anyway for security
      return Response.json({ 
        message: "If an account with that email exists, we've sent a password reset link." 
      });
    }

    const user = users[0];

    // Generate secure token
    const crypto = await import('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    
    // Set expiration to 1 hour from now
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store token in database
    await sql`
      INSERT INTO password_reset_tokens (token, user_id, expires_at)
      VALUES (${token}, ${user.id}, ${expiresAt})
    `;

    // Create reset link
    const resetUrl = `${process.env.NEXT_PUBLIC_CREATE_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    // Send email
    try {
      await sendEmail({
        to: email,
        subject: "Reset Your Password",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Reset Your Password</h2>
            <p>You requested a password reset for your account. Click the link below to set a new password:</p>
            <a href="${resetUrl}" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Reset Password</a>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this reset, you can safely ignore this email.</p>
          </div>
        `,
        text: `Reset your password by visiting: ${resetUrl}\n\nThis link will expire in 1 hour. If you didn't request this reset, you can safely ignore this email.`
      });
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError);
      return Response.json({ 
        error: "Failed to send reset email. Please make sure your RESEND_API_KEY is configured." 
      }, { status: 500 });
    }

    return Response.json({ 
      message: "If an account with that email exists, we've sent a password reset link." 
    });

  } catch (error) {
    console.error('Password reset request error:', error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}