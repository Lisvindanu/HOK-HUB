import { useState } from 'react';
import { User, Mail, LogIn, UserPlus, Loader2, Lock } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import type { CredentialResponse } from '@react-oauth/google';
import { registerContributor, loginContributor } from '../api/tierLists';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

const API_BASE = 'https://hokapi.project-n.site';

export function AuthPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!loginEmail.trim()) {
      setError(t('auth.errors.enterEmail'));
      return;
    }

    if (!loginPassword) {
      setError(t('auth.errors.enterPassword'));
      return;
    }

    setIsLoading(true);
    try {
      const { contributor, token } = await loginContributor(loginEmail.trim(), loginPassword);
      login(token, { id: contributor.id, name: contributor.name, email: contributor.email || '' });
      navigate({ to: '/' });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) return;
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('auth.errors.googleFailed'));
      login(data.token, {
        id: data.contributor.id,
        name: data.contributor.name,
        email: data.contributor.email || '',
        avatar: data.contributor.avatar,
      });
      navigate({ to: '/' });
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
      setError(t('auth.errors.enterName'));
      return;
    }

    if (!registerEmail.trim()) {
      setError(t('auth.errors.enterEmail'));
      return;
    }

    if (!registerPassword || registerPassword.length < 6) {
      setError(t('auth.errors.passwordLength'));
      return;
    }

    setIsLoading(true);
    try {
      const { contributor, token } = await registerContributor({
        name: registerName.trim(),
        email: registerEmail.trim(),
        password: registerPassword,
      });

      login(token, { id: contributor.id, name: contributor.name, email: contributor.email || '' });
      navigate({ to: '/' });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-400">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 pt-20 md:pt-28 pb-12">
      <div className="max-w-md mx-auto">
        <div className="card-hover p-5 md:p-8">
          {/* Header */}
          <div className="flex items-center justify-center mb-4 md:mb-6">
            <div className="p-2.5 md:p-3 bg-primary-500/20 rounded-full">
              <User className="w-10 h-10 md:w-12 md:h-12 text-primary-400" />
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold mb-2 text-center">
            {activeTab === 'login' ? t('auth.welcomeBack') : t('auth.joinHub')}
          </h1>
          <p className="text-gray-400 text-center mb-8">
            {activeTab === 'login'
              ? t('auth.loginSubtitle')
              : t('auth.registerSubtitle')}
          </p>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 p-1 bg-dark-50 rounded-lg">
            <button
              onClick={() => { setActiveTab('login'); setError(''); }}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'login'
                  ? 'bg-primary-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {t('auth.login')}
            </button>
            <button
              onClick={() => { setActiveTab('register'); setError(''); }}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'register'
                  ? 'bg-primary-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {t('auth.register')}
            </button>
          </div>

          {/* Login Form */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  {t('auth.emailAddress')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder={t('auth.emailPlaceholder')}
                    className="w-full pl-11 pr-4 py-3 bg-dark-50 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 text-white"
                    disabled={isLoading}
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  {t('auth.password')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder={t('auth.passwordPlaceholder')}
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
                disabled={isLoading || !loginEmail.trim() || !loginPassword}
                className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('auth.loggingIn')}
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    {t('auth.login')}
                  </>
                )}
              </button>
            </form>
          )}

          {/* Register Form */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  {t('auth.displayName')} <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    placeholder={t('auth.namePlaceholder')}
                    className="w-full pl-11 pr-4 py-3 bg-dark-50 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 text-white"
                    disabled={isLoading}
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  {t('auth.emailAddress')} <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder={t('auth.emailPlaceholder')}
                    className="w-full pl-11 pr-4 py-3 bg-dark-50 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 text-white"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  {t('auth.password')} <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder={t('auth.minPasswordPlaceholder')}
                    className="w-full pl-11 pr-4 py-3 bg-dark-50 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 text-white"
                    disabled={isLoading}
                  />
                </div>
                <p className="mt-1.5 text-xs text-gray-500">
                  {t('auth.minPasswordHint')}
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !registerName.trim() || !registerEmail.trim() || !registerPassword || registerPassword.length < 6}
                className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('auth.creatingAccount')}
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    {t('auth.createAccount')}
                  </>
                )}
              </button>
            </form>
          )}

          {/* Google Login */}
          <div className="mt-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-gray-500">{t('auth.orContinueWith')}</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError(t('auth.errors.googleFailed'))}
                theme="filled_black"
                shape="pill"
                size="large"
                text="continue_with"
              />
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-white/10">
            <p className="text-[10px] md:text-xs text-gray-500 text-center">
              {t('auth.termsNotice')}
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
