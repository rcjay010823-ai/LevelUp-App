export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Daily Planner App
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Track your habits, plan your days, and achieve your goals
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Vision Board</h3>
            <p className="text-gray-600">Upload photos that inspire your dreams</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Daily Planning</h3>
            <p className="text-gray-600">Organize your day with habits and events</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Reflection</h3>
            <p className="text-gray-600">Journal and track your mood daily</p>
          </div>
        </div>

        <div className="mt-12">
          <a 
            href="/admin/users" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-block"
          >
            Admin Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}