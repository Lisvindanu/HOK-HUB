import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Github, ExternalLink, Mail, MessageSquarePlus } from 'lucide-react';
import { FeedbackModal } from './FeedbackModal';
import { useTranslation } from 'react-i18next';

export function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const [showFeedback, setShowFeedback] = useState(false);

  const quickLinks = [
    { name: t('footer.links.heroes'), path: '/heroes' },
    { name: t('footer.links.tierList'), path: '/tier-list' },
    { name: t('footer.links.patchNotes'), path: '/patch-notes' },
    { name: t('footer.links.counters'), path: '/counters' },
  ];

  const resources = [
    { name: t('footer.links.about'), path: '/about' },
    { name: t('footer.links.contribute'), path: '/contribute' },
    { name: t('footer.links.contributors'), path: '/contributors' },
    { name: t('footer.links.apiDocs'), href: 'https://hokapi.project-n.site/', external: true },
    { name: t('footer.links.topUp'), href: 'https://magertopup.com', external: true },
  ];

  const community = [
    { name: 'GitHub', href: 'https://github.com/Lisvindanu', icon: Github },
  ];

  return (
    <>
    <footer className="bg-dark-400 border-t border-white/5 mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center space-x-2.5 mb-4">
              <img
                src="/hokhub.webp"
                alt=""
                aria-hidden="true"
                className="w-10 h-10 object-contain"
              />
              <span className="text-xl font-display font-semibold text-white">
                <span className="text-primary-400">HoK</span> Hub
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              {t('footer.tagline')}
            </p>
            <div className="flex items-center space-x-3">
              {community.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-dark-300 flex items-center justify-center text-gray-400 hover:text-white hover:bg-dark-200 transition-all"
                  aria-label={item.name}
                >
                  <item.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {t('footer.quickLinks')}
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-sm text-gray-400 hover:text-primary-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {t('footer.resources')}
            </h3>
            <ul className="space-y-3">
              {resources.map((link) => (
                <li key={link.name}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-400 hover:text-primary-400 transition-colors inline-flex items-center gap-1"
                    >
                      {link.name}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <Link
                      to={link.path!}
                      className="text-sm text-gray-400 hover:text-primary-400 transition-colors"
                    >
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {t('footer.support')}
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:anaphygon@protonmail.com"
                  className="text-sm text-gray-400 hover:text-primary-400 transition-colors inline-flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  anaphygon@protonmail.com
                </a>
              </li>
              <li>
                <button
                  onClick={() => setShowFeedback(true)}
                  className="text-sm text-gray-400 hover:text-primary-400 transition-colors inline-flex items-center gap-2"
                >
                  <MessageSquarePlus className="w-4 h-4" />
                  {t('footer.feedbackBtn')}
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-white/5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-400 text-center md:text-left">
              {t('footer.copyright', { year: currentYear })}
              <span className="hidden sm:inline"> • </span>
              <br className="sm:hidden" />
              {t('footer.disclaimer')}
            </p>
            <p className="text-xs text-gray-400">
              {t('footer.trademark')}
            </p>
          </div>
        </div>
      </div>
    </footer>

    {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}
    </>
  );
}
