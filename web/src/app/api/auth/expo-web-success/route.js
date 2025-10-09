import { getToken } from '@auth/core/jwt';

export async function GET(request) {
  try {
    const [token, jwt] = await Promise.all([
      getToken({
        req: request,
        secret: process.env.AUTH_SECRET,
        secureCookie: process.env.AUTH_URL?.startsWith('https') || false,
        raw: true,
      }),
      getToken({
        req: request,
        secret: process.env.AUTH_SECRET,
        secureCookie: process.env.AUTH_URL?.startsWith('https') || false,
      }),
    ]);

    if (!jwt) {
      return new Response(
        `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Authentication Error</title>
        </head>
        <body>
          <script>
            window.parent.postMessage({
              type: 'AUTH_ERROR',
              error: 'Authentication failed. Please try again.'
            }, '*');
          </script>
          <div style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h2>Authentication Error</h2>
            <p>Unable to authenticate. Please try again.</p>
          </div>
        </body>
        </html>
        `,
        {
          headers: {
            'Content-Type': 'text/html',
          },
        }
      );
    }

    // Success - send the JWT to the parent window (for Expo Web development)
    return new Response(
      `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Authentication Success</title>
      </head>
      <body>
        <script>
          window.parent.postMessage({
            type: 'AUTH_SUCCESS',
            jwt: '${token}',
            user: ${JSON.stringify({
              id: jwt.sub,
              email: jwt.email,
              name: jwt.name,
            })}
          }, '*');
        </script>
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h2>Authentication Successful!</h2>
          <p>Redirecting you back to the app...</p>
        </div>
      </body>
      </html>
      `,
      {
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );
  } catch (error) {
    console.error('Auth expo-web-success error:', error);
    return new Response(
      `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Authentication Error</title>
      </head>
      <body>
        <script>
          window.parent.postMessage({
            type: 'AUTH_ERROR',
            error: 'Authentication system error. Please try again.'
          }, '*');
        </script>
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h2>Authentication Error</h2>
          <p>Something went wrong. Please try again.</p>
        </div>
      </body>
      </html>
      `,
      {
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );
  }
}