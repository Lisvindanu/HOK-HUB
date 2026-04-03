import { useState } from 'react';
import { X, MessageSquarePlus, Send, CheckCircle, Loader2 } from 'lucide-react';
import { submitFeedback, type FeedbackCategory } from '../../api/tierLists';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const CATEGORY_EMOJIS: Record<string, string> = {
  bug: '🐛',
  feature: '✨',
  suggestion: '💡',
  criticism: '📝',
  compliment: '❤️',
  other: '💬',
};
const CATEGORY_VALUES: FeedbackCategory[] = ['bug', 'feature', 'suggestion', 'criticism', 'compliment', 'other'];

interface FeedbackModalProps {
  onClose: () => void;
}

export function FeedbackModal({ onClose }: FeedbackModalProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [category, setCategory] = useState<FeedbackCategory>('suggestion');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setLoading(true);
    setError('');
    try {
      await submitFeedback({ name: name.trim() || undefined, category, message });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengirim feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-dark-300 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-500/20 rounded-lg">
              <MessageSquarePlus className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{t('feedback.title')}</h2>
              <p className="text-xs text-gray-400">{t('feedback.subtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {submitted ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">{t('feedback.thankYou')}</h3>
              <p className="text-gray-400 text-sm mb-6">
                {t('feedback.thankYouMsg')}
              </p>
              <button onClick={onClose} className="btn-primary">
                {t('common.close')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  {t('feedback.name')} <span className="text-gray-500">({t('feedback.optional')})</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Anonymous"
                  maxLength={50}
                  className="w-full px-4 py-2.5 bg-dark-50 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 text-white placeholder-gray-500 text-sm"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  {t('feedback.category')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORY_VALUES.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setCategory(val)}
                      className={`flex flex-col items-center gap-1 p-2.5 rounded-lg border text-xs font-medium transition-all ${
                        category === val
                          ? 'border-primary-500 bg-primary-500/20 text-primary-300'
                          : 'border-white/10 bg-dark-50 text-gray-400 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <span className="text-base">{CATEGORY_EMOJIS[val]}</span>
                      {t(`feedback.categories.${val}`)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  {t('feedback.message')} <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t('feedback.message')}
                  required
                  rows={4}
                  maxLength={2000}
                  className="w-full px-4 py-2.5 bg-dark-50 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 text-white placeholder-gray-500 text-sm resize-none"
                />
                <p className="text-xs text-gray-500 mt-1 text-right">{message.length}/2000</p>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !message.trim()}
                className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {loading ? t('feedback.sending') : t('feedback.send')}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
