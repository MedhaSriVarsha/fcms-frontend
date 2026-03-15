import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../api';

const CATEGORIES = ['Fraud', 'Loan Issue', 'Insurance Claim', 'Account Issue', 'Transaction Dispute', 'KYC Issue', 'Other'];

const CreateComplaint = () => {
  const navigate = useNavigate();
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [portalLink, setPortalLink] = useState('');
  const [form, setForm] = useState({
    institutionName: '',
    institutionId: '',
    category: '',
    description: '',
    status: 'Submitted',
  });

  useEffect(() => {
    API.get('/institutions').then((r) => setInstitutions(r.data.data)).catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === 'institutionName') {
      const inst = institutions.find((i) => i.name === value);
      if (inst) {
        setForm((f) => ({ ...f, institutionName: value, institutionId: inst._id }));
        setPortalLink(inst.complaintPortalLink);
      } else {
        setPortalLink('');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.institutionName || !form.category || !form.description)
      return toast.error('Please fill all required fields');
    if (form.description.length < 20)
      return toast.error('Description must be at least 20 characters');

    setLoading(true);
    try {
      await API.post('/complaints', form);
      toast.success('Complaint filed successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <button onClick={() => navigate('/dashboard')} className="text-sm text-slate-400 hover:text-slate-600 mb-3 flex items-center gap-1">
          ← Back to Dashboard
        </button>
        <h1 className="font-display text-2xl font-bold text-slate-900">File a Complaint</h1>
        <p className="text-slate-500 text-sm mt-1">Submit a complaint against a bank or insurance company</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Institution */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Institution <span className="text-red-400">*</span>
            </label>
            <select name="institutionName" value={form.institutionName} onChange={handleChange} className="input-field">
              <option value="">Select a bank or insurer...</option>
              {['Bank', 'Insurance', 'NBFC', 'Payments'].map((type) => (
                <optgroup key={type} label={type}>
                  {institutions.filter((i) => i.type === type).map((i) => (
                    <option key={i._id} value={i.name}>{i.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>

            {/* Portal link */}
            {portalLink && (
              <div className="mt-2 p-3 bg-indigo-50 rounded-xl flex items-start gap-2">
                <span className="text-indigo-500 text-xs mt-0.5">🔗</span>
                <div>
                  <p className="text-xs font-semibold text-indigo-700">Official Complaint Portal</p>
                  <a href={portalLink} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline break-all">
                    {portalLink}
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Category <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setForm({ ...form, category: cat })}
                  className={`text-xs font-medium py-2 px-3 rounded-xl border transition-all ${
                    form.category === cat
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              name="description"
              rows={5}
              placeholder="Describe your complaint in detail (minimum 20 characters)..."
              value={form.description}
              onChange={handleChange}
              className="input-field resize-none"
            />
            <p className="text-xs text-slate-400 mt-1 text-right">{form.description.length} / 2000</p>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Submit as</label>
            <div className="flex gap-3">
              {['Draft', 'Submitted'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm({ ...form, status: s })}
                  className={`text-sm font-medium py-2 px-4 rounded-xl border transition-all ${
                    form.status === s
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  {s === 'Draft' ? '📝 Save as Draft' : '🚀 Submit Now'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate('/dashboard')} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Submitting...' : form.status === 'Draft' ? 'Save Draft' : 'Submit Complaint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateComplaint;
