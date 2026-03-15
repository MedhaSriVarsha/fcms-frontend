const statusStyles = {
  Draft:        'bg-slate-100 text-slate-600',
  Submitted:    'bg-blue-100 text-blue-700',
  'Under Review': 'bg-amber-100 text-amber-700',
  Resolved:     'bg-green-100 text-green-700',
  Escalated:    'bg-red-100 text-red-700',
};

const statusDots = {
  Draft:        'bg-slate-400',
  Submitted:    'bg-blue-500',
  'Under Review': 'bg-amber-500',
  Resolved:     'bg-green-500',
  Escalated:    'bg-red-500',
};

const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[status] || statusStyles.Draft}`}>
    <span className={`w-1.5 h-1.5 rounded-full ${statusDots[status] || statusDots.Draft}`} />
    {status}
  </span>
);

export default StatusBadge;
