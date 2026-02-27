import { Link } from '@tanstack/react-router';
import { ArrowRight, ArrowDown, Users, Crown, Palette, Shield, Zap, Layers, Package, BarChart2, AlertTriangle, X } from 'lucide-react';
import { useHeroes } from '../hooks/useHeroes';
import { motion } from 'framer-motion';
import { useState } from 'react';

export function HomePage() {
  const { data: heroes } = useHeroes();
  const [bannerDismissed, setBannerDismissed] = useState(
    () => localStorage.getItem('incident-banner-dismissed') === '1'
  );

  const dismissBanner = () => {
    localStorage.setItem('incident-banner-dismissed', '1');
    setBannerDismissed(true);
  };

  const features = [
    {
      icon: Users,
      title: 'Hero Database',
      description: '111+ heroes with stats, skills, equipment & arcana recommendations',
      href: '/heroes',
      color: 'from-blue-500 to-blue-700',
    },
    {
      icon: Crown,
      title: 'Tier List',
      description: 'Community-voted tier rankings with voting, comments & meta discussions',
      href: '/tier-list',
      color: 'from-amber-400 to-orange-600',
    },
    {
      icon: Shield,
      title: 'Counter Picks',
      description: 'Find the best counters, synergies & strong-against matchups for any hero',
      href: '/counters',
      color: 'from-red-500 to-rose-700',
    },
    {
      icon: Palette,
      title: 'Skin Gallery',
      description: 'Browse 1000+ skins — exclusive, limited, series & collaboration filters',
      href: '/skins',
      color: 'from-pink-500 to-purple-600',
    },
    {
      icon: Zap,
      title: 'Patch Notes',
      description: 'Track every hero buff, nerf & adjustment across all patches',
      href: '/patch-notes',
      color: 'from-green-500 to-emerald-700',
    },
    {
      icon: Layers,
      title: 'Draft Simulator',
      description: 'Practice picks & bans before ranked matches with full draft mode',
      href: '/draft',
      color: 'from-violet-500 to-indigo-700',
    },
    {
      icon: Package,
      title: 'Items & Arcana',
      description: 'Complete database of all items and arcana builds for every role',
      href: '/items',
      color: 'from-cyan-500 to-teal-700',
    },
    {
      icon: BarChart2,
      title: 'Analytics',
      description: 'Win rates, pick rates & meta trends to sharpen your strategy',
      href: '/analytics',
      color: 'from-orange-400 to-rose-600',
    },
  ];

  const heroCount = heroes?.length || 111;
  const skinCount = heroes?.reduce((acc, h) => acc + (h.skins?.length || 0), 0) || 1394;

  return (
    <div className="min-h-screen bg-dark-400">

      {/* Incident Banner */}
      {!bannerDismissed && (
        <Link
          to="/incident"
          className="relative flex items-center justify-between gap-3 px-4 py-3"
          style={{ background: 'rgba(239,68,68,0.12)', borderBottom: '1px solid rgba(239,68,68,0.25)', display: 'flex' }}
        >
          <div className="flex items-start gap-2.5 flex-1">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#f87171' }} />
            <p className="text-sm leading-snug" style={{ color: '#fca5a5' }}>
              <strong style={{ color: '#fecaca' }}>Pemberitahuan penting:</strong>{' '}
              Terjadi kehilangan data tier list komunitas pada 26 Feb 2026.{' '}
              <span className="underline underline-offset-2 font-medium" style={{ color: '#fb923c' }}>
                Baca selengkapnya →
              </span>
            </p>
          </div>
          <button
            onClick={e => { e.preventDefault(); dismissBanner(); }}
            className="shrink-0 p-1 rounded"
            style={{ color: '#f87171' }}
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </Link>
      )}

      {/* Hero Section - Full Height */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/wmremove-transformed.webp"
            alt="Honor of Kings Heroes"
            className="w-full h-full object-cover"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-dark-400/70 via-dark-400/50 to-dark-400" />
          <div className="absolute inset-0 bg-gradient-to-r from-dark-400/80 via-transparent to-dark-400/80" />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 md:px-6 lg:px-8 text-center pt-16 md:pt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            {/* Badge */}
            <div className="inline-flex items-center px-3 md:px-4 py-1.5 md:py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-6 md:mb-8">
              <span className="text-xs md:text-sm text-white/90 font-medium">Your Ultimate HoK Companion</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-display font-bold text-white mb-4 md:mb-6 tracking-tight">
              <span className="block">Master the</span>
              <span className="block bg-gradient-to-r from-primary-400 via-primary-300 to-blue-400 bg-clip-text text-transparent">
                Meta
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base md:text-lg lg:text-xl text-white/70 max-w-2xl mx-auto mb-8 md:mb-10 leading-relaxed px-4">
              Everything you need to dominate Honor of Kings.
              Hero stats, tier lists, counters, and more.
            </p>

            {/* CTAs - Stack on mobile */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 px-4">
              <Link
                to="/heroes"
                className="group w-full sm:w-auto flex items-center justify-center gap-2 md:gap-3 px-6 md:px-8 py-3.5 md:py-4 bg-white text-dark-400 rounded-xl md:rounded-2xl text-base md:text-lg font-semibold hover:bg-gray-100 transition-all duration-300"
              >
                <span>Explore Heroes</span>
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/tier-list"
                className="w-full sm:w-auto flex items-center justify-center gap-2 md:gap-3 px-6 md:px-8 py-3.5 md:py-4 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl md:rounded-2xl text-base md:text-lg font-medium hover:bg-white/20 transition-all duration-300"
              >
                <Crown className="w-4 h-4 md:w-5 md:h-5" />
                <span>View Tier List</span>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator - Hidden on mobile */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden md:block"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <div className="flex flex-col items-center gap-3 text-white/50">
            <span className="text-sm tracking-wide uppercase">Scroll to explore</span>
            <ArrowDown className="w-5 h-5 animate-bounce" />
          </div>
        </motion.div>
      </section>

      {/* Stats Section - Minimal */}
      <section className="py-12 md:py-20 border-b border-white/5">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 lg:gap-12">
            <motion.div
              className="text-center p-4 md:p-0"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-1 md:mb-2">
                {heroCount}
              </div>
              <p className="text-gray-500 text-xs md:text-sm uppercase tracking-wide">Heroes</p>
            </motion.div>
            <motion.div
              className="text-center p-4 md:p-0"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-1 md:mb-2">
                {skinCount}+
              </div>
              <p className="text-gray-500 text-xs md:text-sm uppercase tracking-wide">Skins</p>
            </motion.div>
            <motion.div
              className="text-center p-4 md:p-0"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-1 md:mb-2">
                6
              </div>
              <p className="text-gray-500 text-xs md:text-sm uppercase tracking-wide">Roles</p>
            </motion.div>
            <motion.div
              className="text-center p-4 md:p-0"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-1 md:mb-2">
                24/7
              </div>
              <p className="text-gray-500 text-xs md:text-sm uppercase tracking-wide">Updated</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section - Glassmorphism */}
      <section className="py-24 relative overflow-hidden">
        {/* Background glow orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-primary-500/[0.07] rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-500/[0.07] rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-500/[0.05] rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              Everything you need
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              All the tools to dominate the Rift — hero guides, tier lists, drafts & more
            </p>
          </motion.div>

          {/* Feature Cards — glass grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.07 }}
                className="h-full"
              >
                <Link
                  to={feature.href}
                  className="group relative flex flex-col h-full p-5 md:p-6 rounded-3xl
                    bg-white/[0.04] backdrop-blur-xl
                    border border-white/[0.08]
                    shadow-[inset_0_1px_0_0_rgba(255,255,255,0.07)]
                    hover:bg-white/[0.08] hover:border-white/[0.16]
                    hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_24px_48px_-12px_rgba(0,0,0,0.4)]
                    transition-all duration-300"
                >
                  {/* Icon */}
                  <div className={`w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}>
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-sm md:text-base font-semibold text-white mb-1.5 group-hover:text-primary-300 transition-colors">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-gray-500 leading-relaxed flex-1">
                    {feature.description}
                  </p>

                  {/* Explore link */}
                  <div className="mt-4 flex items-center gap-1 text-xs text-gray-600 group-hover:text-primary-400 transition-all">
                    <span>Explore</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 border-t border-white/5">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6">
              Ready to climb the ranks?
            </h2>
            <p className="text-gray-400 text-lg mb-10">
              Join our community and start improving your gameplay today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/heroes"
                className="group flex items-center gap-3 px-8 py-4 bg-primary-500 text-white rounded-2xl text-lg font-semibold hover:bg-primary-600 transition-all duration-300"
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/contribute"
                className="flex items-center gap-3 px-8 py-4 text-gray-300 hover:text-white transition-colors"
              >
                <span>Contribute to HoK Hub</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
