import { useState, useEffect } from 'react';
import api from '../lib/api';

export default function ApiTest() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [healthData, setHealthData] = useState<any>(null);
  const [loginResult, setLoginResult] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    testApiConnection();
  }, []);

  const testApiConnection = async () => {
    try {
      // Test 1: Health check
      const health = await api.healthCheck();
      setHealthData(health);

      if (health.error) {
        setStatus('error');
        setError(health.error);
        return;
      }

      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const testLogin = async () => {
    try {
      const result = await api.login('admin', 'centswise2026');
      setLoginResult(result);

      if (result.error) {
        setError(result.error);
      } else {
        // After successful login, fetch dashboard
        fetchDashboard();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  const fetchDashboard = async () => {
    try {
      const result = await api.getDashboardMetrics();
      setDashboardData(result);

      if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Dashboard fetch failed');
    }
  };

  const logout = () => {
    api.logout();
    setLoginResult(null);
    setDashboardData(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">CentsWise API Test</h1>

        {/* Health Check Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">API Health Check</h2>
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                status === 'loading'
                  ? 'bg-yellow-500'
                  : status === 'success'
                  ? 'bg-green-500'
                  : 'bg-red-500'
              }`}
            />
            <span className="font-medium">
              {status === 'loading' && 'Connecting...'}
              {status === 'success' && 'Connected'}
              {status === 'error' && 'Connection Failed'}
            </span>
          </div>
          {healthData && (
            <pre className="mt-4 p-4 bg-gray-100 rounded text-sm overflow-auto">
              {JSON.stringify(healthData, null, 2)}
            </pre>
          )}
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded">
              Error: {error}
            </div>
          )}
        </div>

        {/* Login Test */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Login Test</h2>
          {!loginResult ? (
            <button
              onClick={testLogin}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Test Login (admin / centswise2026)
            </button>
          ) : (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="font-medium">Logged In</span>
                <button
                  onClick={logout}
                  className="ml-auto px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Logout
                </button>
              </div>
              <pre className="p-4 bg-gray-100 rounded text-sm overflow-auto">
                {JSON.stringify(loginResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Dashboard Data */}
        {dashboardData && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Dashboard Data</h2>
            <pre className="p-4 bg-gray-100 rounded text-sm overflow-auto">
              {JSON.stringify(dashboardData, null, 2)}
            </pre>
          </div>
        )}

        {/* API Endpoints */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Available API Endpoints</h2>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                GET /api/health
              </span>
              <span className="ml-2 text-gray-600">- Health check</span>
            </div>
            <div>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                POST /api/auth/login
              </span>
              <span className="ml-2 text-gray-600">- Login</span>
            </div>
            <div>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                GET /api/dashboard/metrics
              </span>
              <span className="ml-2 text-gray-600">- Dashboard metrics</span>
            </div>
            <div>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                GET /api/money/balance
              </span>
              <span className="ml-2 text-gray-600">- Financial balance</span>
            </div>
            <div>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                POST /api/money/credits
              </span>
              <span className="ml-2 text-gray-600">- Add donation</span>
            </div>
            <div>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                POST /api/property/items
              </span>
              <span className="ml-2 text-gray-600">- Add item</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
