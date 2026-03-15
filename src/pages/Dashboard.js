import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import API from '../api';
import StatusBadge from '../components/StatusBadge';

const STATUSES = ['All', 'Draft', 'Submitted', 'Under Review', 'Resolved', 'Escalated'];

const StatCard = ({ label, value, color }) => (
  <div className="card flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <span className="text-xl font-bold text-white">{value}</span>
    </div>
    <div>
      <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-display font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({});
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const params = filter !== 'All' ? `?status=${filter}` : '';
      const [cRes, sRes] = await Promise.all([
        API.get(`/complaints${params}`),
        API.get('/complaints/stats'),
      ]);
      setComplaints(cRes.data.data);
      setStats(sRes.data.data);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this complaint?')) return;
    try {
      await API.delete(`/complaints/${id}`);
      toast.success('Complaint deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Welcome */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-slate-900">Welcome back, {user?.name} 👋</h1>
        <p className="text-slate-500 text-sm mt-1">Here's an overview of your complaints</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <div className="card col-span-2 sm:col-span-1 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">{stats.total || 0}</span>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Total</p>
            <p className="text-2xl font-display font-bold text-slate-800">{stats.total || 0}</p>
          </div>
        </div>
        {[
          { label: 'Submitted', color: 'bg-blue-500' },
          { label: 'Under Review', color: 'bg-amber-500' },
          { label: 'Resolved', color: 'bg-green-500' },
          { label: 'Escalated', color: 'bg-red-500' },
        ].map(({ label, color }) => (
          <StatCard key={label} label={label} value={stats[label] || 0} color={color} />
        ))}
      </div>

      {/* Complaints Table */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <h2 className="font-display font-bold text-slate-800 text-lg">My Complaints</h2>
          <div className="flex gap-2 flex-wrap">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
                  filter === s ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <button onClick={() => navigate('/create')} className="btn-primary text-sm whitespace-nowrap">
            + New Complaint
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading...</div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 text-sm">No complaints found.</p>
            <button onClick={() => navigate('/create')} className="btn-primary mt-4 text-sm">
              File Your First Complaint
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">Reference</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">Institution</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-slate-400 uppercase tracking-wide hidden sm:table-cell">Category</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">Status</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-slate-400 uppercase tracking-wide hidden md:table-cell">Date</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-2 font-mono text-xs text-indigo-600 font-medium">{c.referenceNumber}</td>
                    <td className="py-3 px-2 font-medium text-slate-700">{c.institutionName}</td>
                    <td className="py-3 px-2 text-slate-500 hidden sm:table-cell">{c.category}</td>
                    <td className="py-3 px-2"><StatusBadge status={c.status} /></td>
                    <td className="py-3 px-2 text-slate-400 text-xs hidden md:table-cell">{formatDate(c.createdDate)}</td>
                    <td className="py-3 px-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/track/${c._id}`)}
                          className="text-xs text-indigo-600 hover:underline font-medium"
                        >
                          Track
                        </button>
                        <button
                          onClick={() => handleDelete(c._id)}
                          className="text-xs text-red-400 hover:text-red-600 font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
