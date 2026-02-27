import { Link } from '@tanstack/react-router';
import { ArrowRight, ArrowDown, Users, Crown, Palette, Shield, Zap, Layers, Package, BarChart2, AlertTriangle, X, Music2 } from 'lucide-react';
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

      {/* OST Spotlight Section */}
      <section className="py-20 relative overflow-hidden border-t border-white/5">
        {/* Glow background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/[0.10] rounded-full blur-[130px]" />
          <div className="absolute top-1/2 right-1/3 -translate-y-1/2 w-[400px] h-[400px] bg-pink-600/[0.07] rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

            {/* Vinyl + Album Art */}
            <motion.div
              className="flex-shrink-0"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative" style={{ width: 300, height: 240 }}>
                {/* Spinning vinyl disc */}
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    width: 240, height: 240,
                    left: 0, top: 0,
                    background: 'radial-gradient(circle at center, #2a2a2a 28%, #111 28.5%, #1a1a1a 35%, #111 35.5%, #1a1a1a 42%, #111 42.5%, #1a1a1a 49%, #111 49.5%, #222 50%)',
                    boxShadow: '0 0 0 2px rgba(255,255,255,0.05), 0 20px 60px rgba(0,0,0,0.8), 0 0 80px rgba(147,51,234,0.15)',
                    zIndex: 1,
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                >
                  {[28, 42, 56, 70, 84].map(r => (
                    <div key={r} className="absolute inset-0 rounded-full border"
                      style={{ margin: r * 240 / 320, borderColor: 'rgba(255,255,255,0.03)' }} />
                  ))}
                  <div className="absolute inset-0 rounded-full"
                    style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 50%, rgba(0,0,0,0.2) 100%)' }} />
                  <div className="absolute rounded-full" style={{
                    width: 14, height: 14, top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: '#080808',
                    boxShadow: '0 0 0 2px rgba(255,255,255,0.06)',
                  }} />
                </motion.div>

                {/* Static album art */}
                <div className="absolute rounded-2xl overflow-hidden" style={{
                  width: 200, height: 200,
                  left: 100, top: 20,
                  zIndex: 2,
                  boxShadow: '-16px 0 40px rgba(0,0,0,0.7), 0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)',
                }}>
                  <img
                    src="https://img.youtube.com/vi/HaIKxmA5Jso/hqdefault.jpg"
                    alt="Born to Rise"
                    className="w-full h-full object-cover"
                  />
                  {/* Now playing overlay */}
                  <div className="absolute bottom-0 left-0 right-0 px-3 py-2"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)' }}>
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-end gap-0.5 h-3">
                        {[0, 0.2, 0.1].map((d, i) => (
                          <motion.div key={i} className="w-0.5 rounded-full bg-purple-400"
                            animate={{ height: ['4px', '10px', '4px'] }}
                            transition={{ duration: 0.8, delay: d, repeat: Infinity }} />
                        ))}
                      </div>
                      <span className="text-[10px] text-white/70 font-medium">Born to Rise</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              className="flex-1 text-center lg:text-left"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5"
                style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)' }}>
                <Music2 className="w-3.5 h-3.5" style={{ color: '#c084fc' }} />
                <span className="text-xs font-semibold tracking-wide uppercase" style={{ color: '#c084fc' }}>Official Soundtrack</span>
              </div>

              <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-3">
                Honor of Kings OST
              </h2>
              <p className="text-gray-400 leading-relaxed mb-8 max-w-md mx-auto lg:mx-0">
                Stream 34 official tracks — from global anthems by Joe Hisaishi to character themes,
                cinematic scores & collab soundtracks. All in one player.
              </p>

              {/* Album category pills */}
              <div className="grid grid-cols-2 gap-2 mb-8 max-w-sm mx-auto lg:mx-0">
                {[
                  { label: 'Global & Anniversary', count: '8 tracks', c: 'rgba(251,191,36,0.1)', b: 'rgba(251,191,36,0.2)', t: '#fbbf24' },
                  { label: 'Cinematic Scores',      count: '8 tracks', c: 'rgba(99,102,241,0.1)',  b: 'rgba(99,102,241,0.2)',  t: '#818cf8' },
                  { label: 'Champion Themes',       count: '8 tracks', c: 'rgba(34,197,94,0.1)',   b: 'rgba(34,197,94,0.2)',   t: '#4ade80' },
                  { label: 'Events & Collabs',      count: '10 tracks', c: 'rgba(236,72,153,0.1)', b: 'rgba(236,72,153,0.2)',  t: '#f472b6' },
                ].map(({ label, count, c, b, t }) => (
                  <div key={label} className="flex flex-col px-3 py-2.5 rounded-xl text-left"
                    style={{ background: c, border: `1px solid ${b}` }}>
                    <span className="text-[11px] font-semibold" style={{ color: t }}>{count}</span>
                    <span className="text-xs font-medium text-white/80 mt-0.5 leading-tight">{label}</span>
                  </div>
                ))}
              </div>

              <Link
                to="/ost"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl font-semibold text-sm text-white transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_12px_40px_rgba(147,51,234,0.5)]"
                style={{ background: 'linear-gradient(135deg, #9333ea, #ec4899)', boxShadow: '0 8px 28px rgba(147,51,234,0.35)' }}
              >
                <Music2 className="w-4 h-4" />
                Listen Now
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="py-20 border-t border-white/5 bg-gradient-to-b from-dark-400 to-dark-300/50">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-6 text-center">
                Your Complete Honor of Kings Resource Hub
              </h2>
              <div className="space-y-5 text-gray-300 leading-relaxed">
                <p>
                  <strong className="text-white">HoK Hub</strong> is the ultimate community-driven platform for <strong className="text-white">Honor of Kings</strong> players in Indonesia and globally. Whether you're looking for detailed <Link to="/heroes" className="text-primary-400 hover:text-primary-300 underline">hero guides</Link>, the latest <Link to="/tier-list" className="text-primary-400 hover:text-primary-300 underline">tier list rankings</Link>, or mastering <Link to="/counters" className="text-primary-400 hover:text-primary-300 underline">counter picks</Link> to dominate your lane, we've got you covered.
                </p>
                <p>
                  Explore our comprehensive database of <strong className="text-white">111+ heroes</strong> with complete stats, skill breakdowns, <Link to="/items" className="text-primary-400 hover:text-primary-300 underline">equipment builds</Link>, and <Link to="/arcana" className="text-primary-400 hover:text-primary-300 underline">arcana recommendations</Link>. Our <Link to="/skins" className="text-primary-400 hover:text-primary-300 underline">skin gallery</Link> features over 1,000 skins including exclusive limited editions, series collections, and collaboration skins. Stay up-to-date with every buff, nerf, and meta shift through our detailed <Link to="/patch-notes" className="text-primary-400 hover:text-primary-300 underline">patch notes</Link> tracker.
                </p>
                <p>
                  Practice your drafting strategy with our interactive <Link to="/draft" className="text-primary-400 hover:text-primary-300 underline">draft simulator</Link>, analyze win rates and pick rates on our <Link to="/analytics" className="text-primary-400 hover:text-primary-300 underline">analytics dashboard</Link>, and contribute to the community through our <Link to="/contribute" className="text-primary-400 hover:text-primary-300 underline">open contribution system</Link>. Join thousands of players using HoK Hub to improve their gameplay and climb the ranked ladder.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section with Schema Markup */}
      <section className="py-20 border-t border-white/5">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-10 text-center">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {[
                  {
                    q: 'What is HoK Hub?',
                    a: 'HoK Hub is a comprehensive community-driven platform for Honor of Kings players, offering hero guides, tier lists, counter picks, skin galleries, patch notes, and more. All tools are free and updated regularly.'
                  },
                  {
                    q: 'How often is the tier list updated?',
                    a: 'Our tier list is community-voted and updates in real-time as players vote. We also track meta changes after each patch and major tournament results to ensure accuracy.'
                  },
                  {
                    q: 'Can I contribute to HoK Hub?',
                    a: 'Yes! HoK Hub is community-driven. You can submit new skins, report counters, contribute hero data, and participate in tier list voting. Visit our Contribute page to get started.'
                  },
                  {
                    q: 'Is HoK Hub affiliated with Level Infinite or TiMi Studios?',
                    a: 'No, HoK Hub is an independent fan-made community resource and is not officially affiliated with Level Infinite, TiMi Studios, or Tencent Games.'
                  },
                  {
                    q: 'How do I find the best counter for a hero?',
                    a: 'Visit our Counter Picks page, search for any hero, and you\'ll see detailed matchup data including strong counters, synergies, and heroes they counter. All data is sourced from community contributions and official statistics.'
                  }
                ].map((faq, i) => (
                  <motion.details
                    key={i}
                    className="group p-5 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] hover:bg-white/[0.06] transition-all duration-300"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                  >
                    <summary className="cursor-pointer text-base font-semibold text-white group-hover:text-primary-300 transition-colors flex items-center justify-between">
                      {faq.q}
                      <ArrowRight className="w-4 h-4 group-open:rotate-90 transition-transform" />
                    </summary>
                    <p className="mt-3 text-sm text-gray-400 leading-relaxed">{faq.a}</p>
                  </motion.details>
                ))}
              </div>
            </motion.div>
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
