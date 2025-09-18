'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [briefs, setBriefs] = useState([]);
  const [editingBrief, setEditingBrief] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'your-secure-password') { // Change this
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
    const res = await fetch('/api/briefs');
    const data = await res.json();
    setBriefs(data.briefs || []);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this brief?')) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/briefs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      
      if (res.ok) {
        setBriefs(briefs.filter(b => b.id !== id));
      }
    } catch (error) {
      alert('Failed to delete');
    }
    setLoading(false);
  };

  const handleEdit = (brief) => {
    setEditingBrief(brief);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/briefs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief: editingBrief })
      });
      
      if (res.ok) {
        await fetchBriefs();
        setEditingBrief(null);
      }
    } catch (error) {
      alert('Failed to update');
    }
    setLoading(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password"
            className="w-full p-3 border rounded-lg mb-4"
            required
          />
          <button type="submit" className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700">
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <button 
            onClick={() => {
              localStorage.removeItem('adminAuth');
              router.push('/');
            }}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold">{briefs.length}</div>
            <div className="text-gray-600">Total Briefs</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold">
              {briefs.filter(b => b.category === 'Websites').length}
            </div>
            <div className="text-gray-600">Website Projects</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold">
              €{briefs.reduce((sum, b) => sum + (b.budgetMax || 0), 0).toLocaleString()}
            </div>
            <div className="text-gray-600">Total Budget</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold">
              {briefs.filter(b => b.email).length}
            </div>
            <div className="text-gray-600">With Contact</div>
          </div>
        </div>

        {/* Edit Modal */}
        {editingBrief && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Edit Brief</h2>
              <form onSubmit={handleSaveEdit}>
                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input
                      type="text"
                      value={editingBrief.title}
                      onChange={(e) => setEditingBrief({...editingBrief, title: e.target.value})}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Min Budget</label>
                      <input
                        type="number"
                        value={editingBrief.budgetMin || ''}
                        onChange={(e) => setEditingBrief({...editingBrief, budgetMin: parseInt(e.target.value)})}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Max Budget</label>
                      <input
                        type="number"
                        value={editingBrief.budgetMax || ''}
                        onChange={(e) => setEditingBrief({...editingBrief, budgetMax: parseInt(e.target.value)})}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Details</label>
                    <textarea
                      value={editingBrief.details}
                      onChange={(e) => setEditingBrief({...editingBrief, details: e.target.value})}
                      className="w-full p-2 border rounded"
                      rows="4"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Contact Email</label>
                    <input
                      type="email"
                      value={editingBrief.email || ''}
                      onChange={(e) => setEditingBrief({...editingBrief, email: e.target.value})}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingBrief(null)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Briefs Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {briefs.map(brief => (
                <tr key={brief.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium">{brief.title}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">{brief.details}</div>
                  </td>
                  <td className="px-6 py-4 text-sm">{brief.category}</td>
                  <td className="px-6 py-4 text-sm">
                    €{brief.budgetMin || 0} - €{brief.budgetMax || 0}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {brief.email ? (
                      <a href={`mailto:${brief.email}`} className="text-indigo-600 hover:underline">
                        {brief.email}
                      </a>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(brief.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => handleEdit(brief)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(brief.id)}
                      className="text-red-600 hover:text-red-900"
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
  );
}
// Add to your app/admin/page.js (add these to existing code)

export default function AdminPage() {
  // ... existing state ...
  const [professionals, setProfessionals] = useState([]);
  const [activeTab, setActiveTab] = useState('briefs'); // 'briefs' or 'professionals'
  const [editingPro, setEditingPro] = useState(null);

  // Fetch professionals
  const fetchProfessionals = async () => {
    const res = await fetch('/api/professionals');
    const data = await res.json();
    setProfessionals(data.pros || []);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchBriefs();
      fetchProfessionals();
    }
  }, [isAuthenticated]);

  // Export data as CSV
  const exportData = () => {
    const dataToExport = activeTab === 'briefs' ? briefs : professionals;
    
    // Convert to CSV
    const headers = activeTab === 'briefs' 
      ? ['ID', 'Title', 'Category', 'Budget Min', 'Budget Max', 'Email', 'Date']
      : ['ID', 'Name', 'Tags', 'Rating', 'Projects', 'Featured'];
    
    const csvContent = [
      headers.join(','),
      ...dataToExport.map(item => {
        if (activeTab === 'briefs') {
          return [
            item.id,
            `"${item.title}"`,
            item.category,
            item.budgetMin,
            item.budgetMax,
            item.email || '',
            new Date(item.createdAt).toLocaleDateString()
          ].join(',');
        } else {
          return [
            item.id,
            `"${item.name}"`,
            `"${item.tags?.join(', ') || ''}"`,
            item.rating,
            item.projects,
            item.featured
          ].join(',');
        }
      })
    ].join('\n');

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSavePro = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const method = editingPro.id ? 'PUT' : 'POST';
      const res = await fetch('/api/professionals', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ professional: editingPro })
      });
      
      if (res.ok) {
        await fetchProfessionals();
        setEditingPro(null);
      }
    } catch (error) {
      alert('Failed to save professional');
    }
    setLoading(false);
  };

  const handleDeletePro = async (id) => {
    if (!confirm('Delete this professional?')) return;
    
    try {
      await fetch('/api/professionals', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      await fetchProfessionals();
    } catch (error) {
      alert('Failed to delete');
    }
  };

  // ... existing login check ...

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Export button */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-2">
            <button 
              onClick={exportData}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Export {activeTab} as CSV
            </button>
            <button 
              onClick={() => {
                localStorage.removeItem('adminAuth');
                router.push('/');
              }}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('briefs')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'briefs' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Briefs ({briefs.length})
          </button>
          <button
            onClick={() => setActiveTab('professionals')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'professionals' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Professionals ({professionals.length})
          </button>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'briefs' ? (
          // Your existing briefs table here
          <div>{/* Existing briefs table code */}</div>
        ) : (
          // Professionals management
          <div>
            <button
              onClick={() => setEditingPro({ name: '', tags: [], rating: 5.0, projects: 0, featured: true })}
              className="mb-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              Add New Professional
            </button>

            {/* Edit Professional Modal */}
            {editingPro && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                  <h2 className="text-xl font-bold mb-4">
                    {editingPro.id ? 'Edit' : 'Add'} Professional
                  </h2>
                  <form onSubmit={handleSavePro}>
                    <div className="grid gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <input
                          type="text"
                          value={editingPro.name}
                          onChange={(e) => setEditingPro({...editingPro, name: e.target.value})}
                          className="w-full p-2 border rounded"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
                        <input
                          type="text"
                          value={editingPro.tags?.join(', ') || ''}
                          onChange={(e) => setEditingPro({
                            ...editingPro, 
                            tags: e.target.value.split(',').map(t => t.trim())
                          })}
                          className="w-full p-2 border rounded"
                          placeholder="Web, Design, SEO"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Rating</label>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="5"
                            value={editingPro.rating}
                            onChange={(e) => setEditingPro({...editingPro, rating: parseFloat(e.target.value)})}
                            className="w-full p-2 border rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Projects</label>
                          <input
                            type="number"
                            value={editingPro.projects}
                            onChange={(e) => setEditingPro({...editingPro, projects: parseInt(e.target.value)})}
                            className="w-full p-2 border rounded"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={editingPro.featured}
                            onChange={(e) => setEditingPro({...editingPro, featured: e.target.checked})}
                          />
                          <span className="text-sm font-medium">Featured on homepage</span>
                        </label>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-6">
                      <button
                        type="submit"
                        disabled={loading}
                        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                      >
                        {loading ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingPro(null)}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Professionals Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tags</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Projects</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Featured</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {professionals.map(pro => (
                    <tr key={pro.id}>
                      <td className="px-6 py-4 font-medium">{pro.name}</td>
                      <td className="px-6 py-4 text-sm">{pro.tags?.join(', ')}</td>
                      <td className="px-6 py-4 text-sm">{pro.rating}</td>
                      <td className="px-6 py-4 text-sm">{pro.projects}</td>
                      <td className="px-6 py-4 text-sm">
                        {pro.featured ? '✓' : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => setEditingPro(pro)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeletePro(pro.id)}
                          className="text-red-600 hover:text-red-900"
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
        )}
      </div>
    </div>
  );
}