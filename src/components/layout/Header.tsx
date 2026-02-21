import { Link } from '@tanstack/react-router';
import { Menu, X, ChevronDown, LogOut, LogIn, LayoutDashboard, BarChart3, Shield, Trophy, UserPlus } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useUser } from '../../hooks/useUser';

const mainNav = [
  { name: 'Heroes', href: '/heroes' },
  { name: 'Tier List', href: '/tier-list' },
  { name: 'Skins', href: '/skins' },
];

const moreNav = [
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Counter Picks', href: '/counters', icon: Shield },
  { name: 'Contributors', href: '/contributors', icon: Trophy },
  { name: 'Contribute', href: '/contribute', icon: UserPlus },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, logout: authLogout } = useAuth();
  const { data: user } = useUser();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    authLogout();
    setUserMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-dark-400/90 backdrop-blur-xl border-b border-white/5'
          : 'bg-transparent'
      }`}
    >
      <nav className="container mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <span className="text-lg font-bold font-display text-white">HK</span>
            </div>
            <span className="text-xl font-display font-semibold text-white">
              HoK Hub
            </span>
          </Link>

          {/* Desktop Navigation - Center */}
          <div className="hidden md:flex items-center space-x-1">
            {mainNav.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="px-5 py-2.5 text-[15px] text-gray-300 hover:text-white transition-colors duration-200"
                activeProps={{
                  className: 'text-white',
                }}
              >
                {item.name}
              </Link>
            ))}

            {/* More Dropdown */}
            <div className="relative" ref={moreMenuRef}>
              <button
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className="flex items-center gap-1.5 px-5 py-2.5 text-[15px] text-gray-300 hover:text-white transition-colors duration-200"
              >
                <span>More</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${moreMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {moreMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-52 bg-dark-300/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                  <div className="py-2">
                    {moreNav.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                        onClick={() => setMoreMenuOpen(false)}
                      >
                        <item.icon className="w-4 h-4 text-gray-500" />
                        <span>{item.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Auth */}
          <div className="hidden md:flex items-center">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-white/5 transition-colors duration-200"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-[15px] text-gray-300">{user.name}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-dark-300/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                      <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Signed in as</p>
                        <p className="font-medium text-white truncate mt-1">{user.name}</p>
                      </div>
                      <div className="py-2">
                        <Link
                          to="/dashboard"
                          className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <LayoutDashboard className="w-4 h-4 text-gray-500" />
                          <span>Dashboard</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
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
              <Link
                to="/auth"
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-dark-400 rounded-xl text-[15px] font-medium hover:bg-gray-100 transition-colors duration-200"
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-6 border-t border-white/5">
            <div className="flex flex-col space-y-1">
              {mainNav.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="px-4 py-3.5 text-lg text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                  activeProps={{ className: 'text-white bg-white/5' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              <div className="h-px bg-white/10 my-3" />

              {moreNav.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center gap-3 px-4 py-3.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              ))}

              <div className="h-px bg-white/10 my-3" />

              {isAuthenticated && user ? (
                <>
                  <div className="px-4 py-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Account</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                        <span className="font-semibold text-white">{user.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <span className="font-medium text-white">{user.name}</span>
                    </div>
                  </div>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-3 px-4 py-3.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    <span>Dashboard</span>
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                    className="flex items-center gap-3 px-4 py-3.5 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  className="flex items-center justify-center gap-2 mx-4 py-3.5 bg-white text-dark-400 rounded-xl font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LogIn className="w-5 h-5" />
                  <span>Login / Register</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
