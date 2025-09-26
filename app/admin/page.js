'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [briefs, setBriefs] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Simple auth check
  const handleLogin = (e) => {
    e.preventDefault();
    // Change this password!
    if (password === 'admin123') {
      setIsAuthenticated(true);
      localStorage.setItem('adminAuth', 'true');
    } else {
      alert('Wrong password');
    }
  };

  useEffect(() => {
    if (localStorage.getItem('adminAuth') === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchBriefs();
    }
  }, [isAuthenticated]);

  const fetchBriefs = async () => {
    try {
      const res = await fetch('/api/briefs');
      const data = await res.json();
      setBriefs(data.briefs || []);
    } catch (error) {
      console.error('Failed to fetch briefs:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this brief?')) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/admin/briefs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      
      if (res.ok) {
        fetchBriefs();
      }
    } catch (error) {
      alert('Failed to delete');
    }
    setLoading(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow">
          <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <button 
            onClick={() => {
              localStorage.removeItem('adminAuth');
              router.push('/');
            }}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Briefs</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="text-left p-2">Title</th>
                  <th className="text-left p-2">Category</th>
                  <th className="text-left p-2">Budget</th>
                  <th className="text-left p-2">Email</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {briefs.map(brief => (
                  <tr key={brief.id} className="border-b">
                    <td className="p-2">{brief.title}</td>
                    <td className="p-2">{brief.category}</td>
                    <td className="p-2">€{brief.budgetMin}-{brief.budgetMax}</td>
                    <td className="p-2">{brief.email || '-'}</td>
                    <td className="p-2">
                      <button
                        onClick={() => handleDelete(brief.id)}
                        disabled={loading}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}