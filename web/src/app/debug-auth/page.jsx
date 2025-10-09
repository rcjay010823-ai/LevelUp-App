import { useState, useEffect } from "react";

function DebugAuthPage() {
  const [authTest, setAuthTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const testAuth = async () => {
      try {
        const response = await fetch('/api/test-auth');
        const data = await response.json();
        setAuthTest(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    testAuth();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Testing auth configuration...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Auth System Debug</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <strong>Error:</strong> {error}
          </div>
        )}

        {authTest && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Environment Check</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>AUTH_SECRET exists:</span>
                <span className={authTest.environment.hasAuthSecret ? 'text-green-600' : 'text-red-600'}>
                  {authTest.environment.hasAuthSecret ? '✓ Yes' : '✗ No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>AUTH_SECRET length:</span>
                <span>{authTest.environment.authSecretLength}</span>
              </div>
              <div className="flex justify-between">
                <span>AUTH_URL:</span>
                <span>{authTest.environment.authUrl}</span>
              </div>
              <div className="flex justify-between">
                <span>NODE_ENV:</span>
                <span>{authTest.environment.nodeEnv}</span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Sign-Up Test</h2>
          <p className="text-gray-600 mb-4">
            Use this form to test the sign-up process with detailed error logging.
          </p>
          <form 
            action="/account/signup" 
            method="get"
            className="space-y-4"
          >
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Go to Sign-Up Page
            </button>
          </form>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Troubleshooting Steps</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Check if AUTH_SECRET environment variable is set</li>
            <li>Verify AUTH_URL is configured correctly</li>
            <li>Test the web sign-up form directly</li>
            <li>Check browser developer tools for JavaScript errors</li>
            <li>Test mobile auth flow in the app</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default DebugAuthPage;