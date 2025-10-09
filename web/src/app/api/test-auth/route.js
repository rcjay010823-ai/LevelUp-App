export async function GET(request) {
  try {
    // Check if AUTH_SECRET exists
    const authSecret = process.env.AUTH_SECRET;
    const authUrl = process.env.AUTH_URL;
    
    return Response.json({
      success: true,
      environment: {
        hasAuthSecret: !!authSecret,
        authSecretLength: authSecret ? authSecret.length : 0,
        authUrl: authUrl || 'not set',
        nodeEnv: process.env.NODE_ENV,
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}