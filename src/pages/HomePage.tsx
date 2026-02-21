import { Link } from '@tanstack/react-router';
import { ArrowRight, ArrowDown, Users, Crown, Palette, Shield } from 'lucide-react';
import { useHeroes } from '../hooks/useHeroes';
import { motion } from 'framer-motion';

export function HomePage() {
  const { data: heroes } = useHeroes();

  const features = [
    {
      icon: Users,
      title: 'Hero Database',
      description: 'Complete database of all 111 heroes with detailed stats and abilities',
      href: '/heroes',
    },
    {
      icon: Crown,
      title: 'Tier List',
      description: 'Community-driven tier rankings updated for the current meta',
      href: '/tier-list',
    },
    {
      icon: Shield,
      title: 'Counter Picks',
      description: 'Find the best counters and synergies for any hero',
      href: '/counters',
    },
    {
      icon: Palette,
      title: 'Skin Gallery',
      description: 'Browse and explore all skins across every hero',
      href: '/skins',
    },
  ];

  const heroCount = heroes?.length || 111;
  const skinCount = heroes?.reduce((acc, h) => acc + (h.skins?.length || 0), 0) || 1394;

  return (
    <div className="min-h-screen bg-dark-400">
      {/* Hero Section - Full Height */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/wmremove-transformed.jpeg"
            alt="Honor of Kings Heroes"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-dark-400/70 via-dark-400/50 to-dark-400" />
          <div className="absolute inset-0 bg-gradient-to-r from-dark-400/80 via-transparent to-dark-400/80" />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-6 lg:px-8 text-center pt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-8">
              <span className="text-sm text-white/90 font-medium">Your Ultimate HoK Companion</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-bold text-white mb-6 tracking-tight">
              <span className="block">Master the</span>
              <span className="block bg-gradient-to-r from-primary-400 via-primary-300 to-blue-400 bg-clip-text text-transparent">
                Meta
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
              Everything you need to dominate Honor of Kings.
              Hero stats, tier lists, counters, and more.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/heroes"
                className="group flex items-center gap-3 px-8 py-4 bg-white text-dark-400 rounded-2xl text-lg font-semibold hover:bg-gray-100 transition-all duration-300"
              >
                <span>Explore Heroes</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/tier-list"
                className="flex items-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-2xl text-lg font-medium hover:bg-white/20 transition-all duration-300"
              >
                <Crown className="w-5 h-5" />
                <span>View Tier List</span>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
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
      <section className="py-20 border-b border-white/5">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-4xl md:text-5xl font-display font-bold text-white mb-2">
                {heroCount}
              </div>
              <p className="text-gray-500 text-sm uppercase tracking-wide">Heroes</p>
            </motion.div>
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="text-4xl md:text-5xl font-display font-bold text-white mb-2">
                {skinCount}+
              </div>
              <p className="text-gray-500 text-sm uppercase tracking-wide">Skins</p>
            </motion.div>
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="text-4xl md:text-5xl font-display font-bold text-white mb-2">
                6
              </div>
              <p className="text-gray-500 text-sm uppercase tracking-wide">Roles</p>
            </motion.div>
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="text-4xl md:text-5xl font-display font-bold text-white mb-2">
                24/7
              </div>
              <p className="text-gray-500 text-sm uppercase tracking-wide">Updated</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section - Clean Grid */}
      <section className="py-24">
        <div className="container mx-auto px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              Everything you need
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Comprehensive tools and data to help you improve your gameplay
            </p>
          </motion.div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  to={feature.href}
                  className="group block p-8 bg-dark-300/50 border border-white/5 rounded-2xl hover:bg-dark-300 hover:border-white/10 transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 group-hover:bg-white/10 transition-colors">
                    <feature.icon className="w-6 h-6 text-white/70" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-primary-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {feature.description}
                  </p>
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
