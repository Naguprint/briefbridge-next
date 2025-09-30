'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [briefs, setBriefs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('briefs');
  const [editingBrief, setEditingBrief] = useState(null);
  const router = useRouter();

  // Featured professionals (hardcoded for now, can be made dynamic later)
  const [professionals, setProfessionals] = useState([
    { id: 1, name: 'Northwind Studio', tags: ['Web', 'Branding'], rating: 4.8, projects: 126 },
    { id: 2, name: 'Pixel&Paper', tags: ['E-com', 'UI/UX'], rating: 4.6, projects: 98 },
    { id: 3, name: 'Bold Web Co', tags: ['Webflow', 'SEO'], rating: 4.9, projects: 203 },
    { id: 4, name: 'Aurora Creative', tags: ['Logo', 'Illustration'], rating: 4.7, projects: 152 },
  ]);

  const handleLogin = (e) => {
    e.preventDefault();
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
    const res = await fetch('/api/briefs', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    
    if (res.ok) {
      fetchBriefs();
    } else {
      const error = await res.json();
      console.error('Delete error:', error);
      alert(`Failed to delete: ${error.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Delete error:', error);
    alert('Failed to delete');
  }
  setLoading(false);
};

  const handleEditBrief = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/briefs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief: editingBrief })
      });
      
      if (res.ok) {
        fetchBriefs();
        setEditingBrief(null);
      }
    } catch (error) {
      alert('Failed to update');
    }
    setLoading(false);
  };

  const exportBriefs = () => {
    const csv = [
      ['Title', 'Category', 'Budget Min', 'Budget Max', 'Email', 'Date'],
      ...briefs.map(b => [
        b.title,
        b.category,
        b.budgetMin,
        b.budgetMax,
        b.email || '',
        new Date(b.createdAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `briefs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
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
          <div className="flex gap-2">
            {activeTab === 'briefs' && (
              <button 
                onClick={exportBriefs}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Export CSV
              </button>
            )}
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
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('briefs')}
            className={`px-4 py-2 rounded ${activeTab === 'briefs' ? 'bg-indigo-600 text-white' : 'bg-white'}`}
          >
            Briefs ({briefs.length})
          </button>
          <button
            onClick={() => setActiveTab('professionals')}
            className={`px-4 py-2 rounded ${activeTab === 'professionals' ? 'bg-indigo-600 text-white' : 'bg-white'}`}
          >
            Featured Professionals
          </button>
        </div>

        {/* Edit Modal */}
        {editingBrief && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full">
              <h2 className="text-xl font-bold mb-4">Edit Brief</h2>
              <form onSubmit={handleEditBrief}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium">Title</label>
                    <input
                      value={editingBrief.title}
                      onChange={(e) => setEditingBrief({...editingBrief, title: e.target.value})}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Category</label>
                    <select
                      value={editingBrief.category}
                      onChange={(e) => setEditingBrief({...editingBrief, category: e.target.value})}
                      className="w-full p-2 border rounded"
                    >
                      <option>Websites</option>
                      <option>E-commerce</option>
                      <option>Logos & Branding</option>
                      <option>UI/UX</option>
                      <option>Graphic Design</option>
                      <option>Copywriting</option>
                      <option>SEO</option>
                      <option>Programming</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">
                      Save
                    </button>
                    <button 
                      type="button"
                      onClick={() => setEditingBrief(null)}
                      className="bg-gray-300 px-4 py-2 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Content */}
        {activeTab === 'briefs' ? (
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
                      <td className="p-2 space-x-2">
                        <button
                          onClick={() => setEditingBrief(brief)}
                          className="text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
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
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Featured Professionals</h2>
            <p className="text-gray-600 mb-4">
              To edit these, update the FeaturedPros function in app/page.js
            </p>
            <div className="space-y-2">
              {professionals.map(pro => (
                <div key={pro.id} className="flex justify-between p-2 border-b">
                  <div>
                    <div className="font-medium">{pro.name}</div>
                    <div className="text-sm text-gray-600">{pro.tags.join(', ')}</div>
                  </div>
                  <div className="text-sm">
                    Rating: {pro.rating} | Projects: {pro.projects}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}