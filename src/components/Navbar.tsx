import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Music, LogOut, Menu, X, Coins } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

export const Navbar = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const tokenBalanceColor = profile && profile.token_balance < 50 ? 'text-red-400' : 'text-emerald-400';

  if (!user) return null;

  return (
    <nav className="bg-slate-900 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <Music className="w-8 h-8 text-blue-500" />
              <span className="text-xl font-bold text-white">Mureza</span>
            </Link>

            <div className="hidden md:flex ml-10 space-x-1">
              <Link
                to="/dashboard"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/dashboard')
                    ? 'bg-slate-800 text-white'
                    : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/studio"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/studio')
                    ? 'bg-slate-800 text-white'
                    : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                Studio
              </Link>
              <Link
                to="/history"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/history')
                    ? 'bg-slate-800 text-white'
                    : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                History
              </Link>
              <Link
                to="/billing"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/billing')
                    ? 'bg-slate-800 text-white'
                    : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                Billing
              </Link>
              <Link
                to="/settings"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/settings')
                    ? 'bg-slate-800 text-white'
                    : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                Settings
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/billing"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors ${tokenBalanceColor}`}
            >
              <Coins className="w-5 h-5" />
              <span className="font-semibold">{profile?.token_balance || 0}</span>
            </Link>

            <button
              onClick={handleSignOut}
              className="hidden md:flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-gray-300"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-300 hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/dashboard"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/dashboard')
                  ? 'bg-slate-800 text-white'
                  : 'text-gray-300 hover:bg-slate-800 hover:text-white'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/studio"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/studio')
                  ? 'bg-slate-800 text-white'
                  : 'text-gray-300 hover:bg-slate-800 hover:text-white'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Studio
            </Link>
            <Link
              to="/history"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/history')
                  ? 'bg-slate-800 text-white'
                  : 'text-gray-300 hover:bg-slate-800 hover:text-white'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              History
            </Link>
            <Link
              to="/billing"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/billing')
                  ? 'bg-slate-800 text-white'
                  : 'text-gray-300 hover:bg-slate-800 hover:text-white'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Billing
            </Link>
            <Link
              to="/settings"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/settings')
                  ? 'bg-slate-800 text-white'
                  : 'text-gray-300 hover:bg-slate-800 hover:text-white'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Settings
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-slate-800 hover:text-white"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
