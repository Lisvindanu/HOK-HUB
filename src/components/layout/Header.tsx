import { Link } from '@tanstack/react-router';
import { Menu, X, Home, Users, BarChart3, Palette, Shield, Crown, UserPlus, Trophy, User, LogOut, LogIn } from 'lucide-react';
import { useState } from 'react';
import { AuthModal } from '../auth/AuthModal';
import { useContributorStore } from '../../store/tierListStore';

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Heroes', href: '/heroes', icon: Users },
  { name: 'Tier List', href: '/tier-list', icon: Crown },
  { name: 'Counter Picks', href: '/counters', icon: Shield },
  { name: 'Skins', href: '/skins', icon: Palette },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Contributors', href: '/contributors', icon: Trophy },
  { name: 'Contribute', href: '/contribute', icon: UserPlus },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { contributorName, clearContributor } = useContributorStore();

  const handleLogout = () => {
    clearContributor();
    setUserMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-dark-400/80 backdrop-blur-md border-b border-white/5">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-xl font-bold font-display">HK</span>
            </div>
            <span className="text-xl font-display font-bold gradient-text">
              HoK Hub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-dark-50 transition-all duration-200 group"
                activeProps={{
                  className: 'text-primary-400 bg-dark-50',
                }}
              >
                <item.icon className="w-4 h-4" />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}

            {/* Auth Button / User Menu */}
            {contributorName ? (
              <div className="relative ml-2">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-dark-50 transition-all duration-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">
                      {contributorName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="font-medium">{contributorName}</span>
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-dark-300 border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
                      <div className="p-4 border-b border-white/10">
                        <p className="text-sm text-gray-400">Signed in as</p>
                        <p className="font-semibold text-white truncate">{contributorName}</p>
                      </div>
                      <div className="p-2">
                        <Link
                          to="/contributors"
                          className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-dark-50 rounded-lg transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Trophy className="w-4 h-4" />
                          <span>Leaderboard</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="ml-2 flex items-center space-x-2 px-4 py-2 rounded-lg bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 transition-all duration-200"
              >
                <LogIn className="w-4 h-4" />
                <span className="font-medium">Login</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-50"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/5">
            <div className="flex flex-col space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-dark-50 transition-all duration-200"
                  activeProps={{
                    className: 'text-primary-400 bg-dark-50',
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}

              {/* Mobile Auth */}
              <div className="pt-3 mt-3 border-t border-white/5">
                {contributorName ? (
                  <>
                    <div className="px-4 py-3 mb-2">
                      <p className="text-xs text-gray-400 mb-1">Signed in as</p>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold">
                            {contributorName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-semibold text-white">{contributorName}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setAuthModalOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 transition-all duration-200"
                  >
                    <LogIn className="w-5 h-5" />
                    <span className="font-medium">Login / Register</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </header>
  );
}
