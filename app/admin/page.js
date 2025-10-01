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
  const [siteContent, setSiteContent] = useState({});
  const [editingContent, setEditingContent] = useState(null);
  const router = useRouter();

  // Featured professionals (hardcoded for now)
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
      fetchSiteContent();
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

  const fetchSiteContent = async () => {
    try {
      const res = await fetch('/api/site-content');
      const data = await res.json();
      const contentObj = {};
      data.content.forEach(c => {
        contentObj[c.id] = c.content;
      });
      setSiteContent(contentObj);
    } catch (error) {
      console.error('Failed to fetch content:', error);
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
        alert(`Failed to delete: ${error.error}`);
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
      } else {
        alert('Failed to update');
      }
    } catch (error) {
      alert('Failed to update');
    }
    setLoading(false);
  };

  const handleSaveContent = async (contentId) => {
    try {
      const res = await fetch('/api/site-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: contentId, 
          content: editingContent 
        })
      });
      
      if (res.ok) {
        fetchSiteContent();
        setEditingContent(null);
        alert('Content updated successfully!');
      }
    } catch (error) {
      alert('Failed to update content');
    }
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
          <button
            onClick={() => setActiveTab('content')}
            className={`px-4 py-2 rounded ${activeTab === 'content' ? 'bg-indigo-600 text-white' : 'bg-white'}`}
          >
            Site Content
          </button>
        </div>

        {/* Edit Brief Modal */}
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
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium">Min Budget</label>
                      <input
                        type="number"
                        value={editingBrief.budgetMin || ''}
                        onChange={(e) => setEditingBrief({...editingBrief, budgetMin: parseInt(e.target.value)})}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Max Budget</label>
                      <input
                        type="number"
                        value={editingBrief.budgetMax || ''}
                        onChange={(e) => setEditingBrief({...editingBrief, budgetMax: parseInt(e.target.value)})}
                        className="w-full p-2 border rounded"
                      />
                    </div>
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

        {/* Content Tabs */}
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
        ) : activeTab === 'professionals' ? (
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
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Site Content</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Hero Section</h3>
                <div className="space-y-2">
                  <input
                    placeholder="Title"
                    value={editingContent?.title || siteContent.hero?.title || ''}
                    onChange={(e) => setEditingContent({...siteContent.hero, title: e.target.value})}
                    className="w-full p-2 border rounded"
                  />
                  <input
                    placeholder="Subtitle"
                    value={editingContent?.subtitle || siteContent.hero?.subtitle || ''}
                    onChange={(e) => setEditingContent({...siteContent.hero, subtitle: e.target.value})}
                    className="w-full p-2 border rounded"
                  />
                  <textarea
                    placeholder="Description"
                    value={editingContent?.description || siteContent.hero?.description || ''}
                    onChange={(e) => setEditingContent({...siteContent.hero, description: e.target.value})}
                    className="w-full p-2 border rounded"
                    rows="3"
                  />
                  <button
                    onClick={() => handleSaveContent('hero')}
                    className="bg-indigo-600 text-white px-4 py-2 rounded"
                  >
                    Save Hero Content
                  </button>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Footer</h3>
                <div className="space-y-2">
                  <input
                    placeholder="Company Name"
                    value={editingContent?.company_name || siteContent.footer?.company_name || ''}
                    onChange={(e) => setEditingContent({...siteContent.footer, company_name: e.target.value})}
                    className="w-full p-2 border rounded"
                  />
                  <input
                    placeholder="Tagline"
                    value={editingContent?.tagline || siteContent.footer?.tagline || ''}
                    onChange={(e) => setEditingContent({...siteContent.footer, tagline: e.target.value})}
                    className="w-full p-2 border rounded"
                  />
                  <button
                    onClick={() => handleSaveContent('footer')}
                    className="bg-indigo-600 text-white px-4 py-2 rounded"
                  >
                    Save Footer Content
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}