import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLink = (path, label) => (
    <Link
      to={path}
      className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
        location.pathname === path
          ? 'bg-indigo-50 text-indigo-600'
          : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">FC</span>
          </div>
          <span className="font-display font-bold text-slate-800 text-lg">FCMS</span>
        </Link>

        {/* Nav Links */}
        {user && (
          <div className="hidden sm:flex items-center gap-1">
            {navLink('/dashboard', 'Dashboard')}
            {navLink('/create', 'New Complaint')}
          </div>
        )}

        {/* User */}
        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-slate-800">{user.name}</p>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
              <span className="text-indigo-700 font-bold text-sm">{user.name?.[0]?.toUpperCase()}</span>
            </div>
            <button onClick={handleLogout} className="text-sm text-slate-500 hover:text-red-500 transition-colors font-medium">
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
