import { useState } from 'react';
import { X, User, Mail, LogIn, UserPlus, Loader2 } from 'lucide-react';
import { registerContributor, loginContributor } from '../../api/tierLists';
import { useContributorStore } from '../../store/tierListStore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
}

export function AuthModal({ isOpen, onClose, defaultTab = 'login' }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { setContributor } = useContributorStore();

  // Login form
  const [loginEmail, setLoginEmail] = useState('');

  // Register form
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!loginEmail.trim()) {
      setError('Please enter your email');
      return;
    }

    setIsLoading(true);
    try {
      const { contributor, token } = await loginContributor(loginEmail.trim());
      setContributor(contributor.id, contributor.name, token);

      // Reset form
      setLoginEmail('');
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!registerName.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsLoading(true);
    try {
      const { contributor, token } = await registerContributor({
        name: registerName.trim(),
        email: registerEmail.trim() || undefined,
      });

      setContributor(contributor.id, contributor.name, token);

      // Reset form
      setRegisterName('');
      setRegisterEmail('');
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    setLoginEmail('');
    setRegisterName('');
    setRegisterEmail('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-dark-300 border border-white/10 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold">
            {activeTab === 'login' ? 'Welcome Back' : 'Join HoK Hub'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => {
              setActiveTab('login');
              setError('');
            }}
            className={`flex-1 py-4 font-semibold transition-colors relative ${
              activeTab === 'login'
                ? 'text-primary-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <LogIn className="w-5 h-5 inline-block mr-2" />
            Login
            {activeTab === 'login' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-400" />
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab('register');
              setError('');
            }}
            className={`flex-1 py-4 font-semibold transition-colors relative ${
              activeTab === 'register'
                ? 'text-primary-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <UserPlus className="w-5 h-5 inline-block mr-2" />
            Register
            {activeTab === 'register' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-400" />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Login Form */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full pl-11 pr-4 py-3 bg-dark-50 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 text-white"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Login
                  </>
                )}
              </button>

              <p className="text-center text-sm text-gray-400">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className="text-primary-400 hover:text-primary-300 font-semibold"
                >
                  Register here
                </button>
              </p>
            </form>
          )}

          {/* Register Form */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Display Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    placeholder="Your name"
                    className="w-full pl-11 pr-4 py-3 bg-dark-50 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 text-white"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Email Address <span className="text-gray-500">(optional)</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full pl-11 pr-4 py-3 bg-dark-50 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 text-white"
                    disabled={isLoading}
                  />
                </div>
                <p className="mt-1.5 text-xs text-gray-500">
                  Email is optional but recommended for account recovery
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Create Account
                  </>
                )}
              </button>

              <p className="text-center text-sm text-gray-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="text-primary-400 hover:text-primary-300 font-semibold"
                >
                  Login here
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
