import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../api';
import StatusBadge from '../components/StatusBadge';

const TIMELINE = ['Draft', 'Submitted', 'Under Review', 'Resolved'];

const statusColors = {
  Draft: 'bg-slate-400',
  Submitted: 'bg-blue-500',
  'Under Review': 'bg-amber-500',
  Resolved: 'bg-green-500',
  Escalated: 'bg-red-500',
};

const TrackComplaint = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    API.get(`/complaints/${id}`)
      .then((r) => { setComplaint(r.data.data); setNewStatus(r.data.data.status); })
      .catch(() => toast.error('Complaint not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusUpdate = async () => {
    if (newStatus === complaint.status) return;
    setUpdating(true);
    try {
      const { data } = await API.put(`/complaints/${id}`, { status: newStatus });
      setComplaint(data.data);
      toast.success('Status updated!');
    } catch {
      toast.error('Failed to update');
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const getStepIndex = (status) => {
    if (status === 'Escalated') return TIMELINE.length;
    return TIMELINE.indexOf(status);
  };

  if (loading) return <div className="text-center py-20 text-slate-400">Loading...</div>;
  if (!complaint) return <div className="text-center py-20 text-slate-400">Complaint not found.</div>;

  const currentStep = getStepIndex(complaint.status);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <button onClick={() => navigate('/dashboard')} className="text-sm text-slate-400 hover:text-slate-600 mb-5 flex items-center gap-1">
        ← Back to Dashboard
      </button>

      {/* Header Card */}
      <div className="card mb-6">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Reference Number</p>
            <p className="font-mono font-bold text-indigo-600 text-lg">{complaint.referenceNumber}</p>
          </div>
          <StatusBadge status={complaint.status} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-slate-400 font-medium">Institution</p>
            <p className="font-semibold text-slate-700 mt-0.5">{complaint.institutionName}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Category</p>
            <p className="font-semibold text-slate-700 mt-0.5">{complaint.category}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-slate-400 font-medium">Filed On</p>
            <p className="font-semibold text-slate-700 mt-0.5">{formatDate(complaint.createdDate)}</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-400 font-medium mb-1">Description</p>
          <p className="text-sm text-slate-600 leading-relaxed">{complaint.description}</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="card mb-6">
        <h2 className="font-display font-bold text-slate-800 mb-6">Status Timeline</h2>
        <div className="relative">
          {/* Line */}
          <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-slate-100" />

          <div className="space-y-6">
            {TIMELINE.map((step, i) => {
              const isDone = i <= currentStep && complaint.status !== 'Escalated';
              const isCurrent = step === complaint.status;
              const historyEntry = complaint.statusHistory?.find((h) => h.status === step);

              return (
                <div key={step} className="flex items-start gap-4 relative">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 flex-shrink-0 border-2 transition-all ${
                    isCurrent ? `${statusColors[step]} border-transparent` :
                    isDone ? 'bg-indigo-600 border-transparent' :
                    'bg-white border-slate-200'
                  }`}>
                    {isDone || isCurrent ? (
                      <span className="text-white text-xs font-bold">{isDone && !isCurrent ? '✓' : i + 1}</span>
                    ) : (
                      <span className="text-slate-300 text-xs font-bold">{i + 1}</span>
                    )}
                  </div>
                  <div className="pt-1">
                    <p className={`text-sm font-semibold ${isCurrent ? 'text-indigo-700' : isDone ? 'text-slate-700' : 'text-slate-400'}`}>
                      {step}
                      {isCurrent && <span className="ml-2 text-xs font-normal text-indigo-500">(Current)</span>}
                    </p>
                    {historyEntry && (
                      <p className="text-xs text-slate-400 mt-0.5">{formatDate(historyEntry.changedAt)}</p>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Escalated step */}
            <div className="flex items-start gap-4 relative">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 flex-shrink-0 border-2 ${
                complaint.status === 'Escalated' ? 'bg-red-500 border-transparent' : 'bg-white border-slate-200'
              }`}>
                <span className={`text-xs font-bold ${complaint.status === 'Escalated' ? 'text-white' : 'text-slate-300'}`}>!</span>
              </div>
              <div className="pt-1">
                <p className={`text-sm font-semibold ${complaint.status === 'Escalated' ? 'text-red-600' : 'text-slate-400'}`}>
                  Escalated
                  {complaint.status === 'Escalated' && <span className="ml-2 text-xs font-normal text-red-400">(Current)</span>}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Update Status */}
      <div className="card">
        <h2 className="font-display font-bold text-slate-800 mb-4">Update Status</h2>
        <div className="flex gap-3 flex-wrap">
          {['Draft', 'Submitted', 'Under Review', 'Resolved', 'Escalated'].map((s) => (
            <button
              key={s}
              onClick={() => setNewStatus(s)}
              className={`text-xs font-medium py-2 px-3 rounded-xl border transition-all ${
                newStatus === s
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <button
          onClick={handleStatusUpdate}
          disabled={updating || newStatus === complaint.status}
          className="btn-primary mt-4 text-sm"
        >
          {updating ? 'Updating...' : 'Update Status'}
        </button>
      </div>
    </div>
  );
};

export default TrackComplaint;
