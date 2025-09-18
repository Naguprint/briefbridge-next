'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [briefs, setBriefs] = useState([]);
  const router = useRouter();

  // Simple password check (in production, use proper auth)
  const handleLogin = (e) => {
    e.preventDefault();
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || password === 'your-secure-password') {
      setIsAuthenticated(true);
      localStorage.setItem('adminAuth', 'true');
    } else {
      alert('Wrong password');
    }
  };

  useEffect(() => {
    // Check if already authenticated
    if (localStorage.getItem('adminAuth') === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      // Fetch briefs
      fetch('/api/briefs')
        .then(res => res.json())
        .then(data => setBriefs(data.briefs));
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow">
          <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password"
            className="w-full p-2 border rounded mb-4"
          />
          <button type="submit" className="w-full bg-indigo-600 text-white p-2 rounded">
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Briefs ({briefs.length})</h2>
          <div className="space-y-4">
            {briefs.map(brief => (
              <div key={brief.id} className="border p-4 rounded">
                <div className="font-semibold">{brief.title}</div>
                <div className="text-sm text-gray-600">
                  Category: {brief.category} | Budget: €{brief.budgetMin}-{brief.budgetMax}
                </div>
                <div className="text-sm mt-2">{brief.details}</div>
                {brief.email && (
                  <div className="text-sm text-blue-600 mt-2">Contact: {brief.email}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={() => {
            localStorage.removeItem('adminAuth');
            router.push('/');
          }}
          className="mt-8 bg-red-600 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>
    </div>
  );
}