export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Test Page</h1>
      <p className="text-lg text-gray-600">
        If you can see this, the Next.js routing is working correctly.
      </p>
      
      <div className="mt-8 space-y-4">
        <div className="bg-white p-4 rounded shadow">
          <p className="font-semibold">Current Time:</p>
          <p>{new Date().toISOString()}</p>
        </div>
        
        <div className="bg-white p-4 rounded shadow">
          <a 
            href="/" 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}