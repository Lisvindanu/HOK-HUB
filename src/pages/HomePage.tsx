import { Link } from '@tanstack/react-router';
import { ArrowRight, Sparkles, BarChart3, Users, Palette, Shield } from 'lucide-react';
import { useHeroes } from '../hooks/useHeroes';
import { HeroCard } from '../components/hero/HeroCard';
import { Loading } from '../components/ui/Loading';
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';

export function HomePage() {
  const { data: heroes, isLoading } = useHeroes();
  const heroSectionRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  const features = [
    {
      icon: Users,
      title: 'Hero Database',
      description: 'Browse all 111 heroes with detailed stats, skills, and information',
      href: '/heroes',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: BarChart3,
      title: 'Meta Analytics',
      description: 'Track win rates, pick rates, and tier rankings with interactive charts',
      href: '/analytics',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Shield,
      title: 'Counter Picks',
      description: 'Find the best counter picks to dominate your matchups',
      href: '/counters',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: Palette,
      title: 'Skin Gallery',
      description: 'Explore 1,394+ stunning skins across all heroes',
      href: '/skins',
      color: 'from-green-500 to-emerald-500',
    },
  ];

  const topHeroes = heroes
    ?.filter((h) => h.stats.tier === 'S' || h.stats.tier === 'S+')
    .slice(0, 6);

  // Hero section animations
  useEffect(() => {
    if (heroSectionRef.current) {
      animate(heroSectionRef.current.querySelector('h1 span:first-child'), {
        opacity: [0, 1],
        translateY: [50, 0],
        duration: 1200,
        easing: 'outExpo',
      });

      animate(heroSectionRef.current.querySelector('h1 span:last-child'), {
        opacity: [0, 1],
        translateY: [50, 0],
        duration: 1200,
        delay: 200,
        easing: 'outExpo',
      });

      animate(heroSectionRef.current.querySelectorAll('.hero-button'), {
        opacity: [0, 1],
        translateY: [30, 0],
        delay: stagger(100, { start: 600 }),
        duration: 800,
        easing: 'outExpo',
      });
    }
  }, []);

  // Features cards animation
  useEffect(() => {
    if (featuresRef.current) {
      animate(featuresRef.current.querySelectorAll('.feature-card'), {
        opacity: [0, 1],
        translateY: [40, 0],
        scale: [0.9, 1],
        delay: stagger(150),
        duration: 800,
        easing: 'outExpo',
      });
    }
  }, []);

  // Stats counter animation
  useEffect(() => {
    if (statsRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const stats = [
                { el: '.stat-1', value: 111 },
                { el: '.stat-2', value: 466 },
                { el: '.stat-3', value: 6 },
              ];

              stats.forEach(({ el, value }) => {
                const element = entry.target.querySelector(el);
                if (element) {
                  animate(element, {
                    innerHTML: [0, value],
                    duration: 2000,
                    round: 1,
                    easing: 'outExpo',
                  });
                }
              });

              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );

      if (statsRef.current) {
        observer.observe(statsRef.current);
      }

      return () => observer.disconnect();
    }
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section ref={heroSectionRef} className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-dark-400 via-dark-300 to-dark-300">
          <div className="absolute inset-0 bg-[url('https://camp.honorofkings.com/manage_material/p/QGRC6bOP.png')] bg-cover bg-center opacity-10 blur-sm"></div>
        </div>

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-500/10 border border-primary-500/30 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-primary-400" />
              <span className="text-sm text-primary-400 font-semibold">Welcome to HoK Hub</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-display font-bold mb-6">
              <span className="block">MASTER THE META,</span>
              <span className="block gradient-text">RULE THE GORGE.</span>
            </h1>

            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Everything you need to dominate your game. Analytics, counters, skins, and more.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/heroes" className="hero-button btn-primary flex items-center space-x-2 text-lg">
                <span>Start Exploring</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/analytics" className="hero-button btn-secondary flex items-center space-x-2 text-lg">
                <BarChart3 className="w-5 h-5" />
                <span>View Analytics</span>
              </Link>
            </div>

            <div className="mt-12 flex items-center justify-center space-x-2 text-sm text-gray-400">
              <span>Scroll down to explore</span>
              <ArrowRight className="w-4 h-4 rotate-90 animate-bounce" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-20 bg-dark-400/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Everything you need to dominate your game
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Comprehensive tools and analytics to help you master Honor of Kings
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="feature-card opacity-0"
                initial={{ opacity: 0 }}
              >
                <Link to={feature.href} className="block group">
                  <div className="card-hover p-6 h-full">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary-400 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 text-sm">{feature.description}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Heroes Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-2">
                Top Meta Heroes
              </h2>
              <p className="text-gray-400">Dominating the current meta</p>
            </div>
            <Link to="/tier-list" className="text-primary-400 hover:text-primary-300 flex items-center space-x-2">
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <Loading message="Loading top heroes..." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {topHeroes?.map((hero) => (
                <HeroCard key={hero.heroId} hero={hero} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-20 bg-dark-400/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="stat-1 text-4xl md:text-5xl font-display font-bold gradient-text mb-2">
                0
              </div>
              <p className="text-gray-400">Heroes</p>
            </div>
            <div>
              <div className="stat-2 text-4xl md:text-5xl font-display font-bold gradient-text mb-2">
                0
              </div>
              <p className="text-gray-400">Skins</p>
            </div>
            <div>
              <div className="stat-3 text-4xl md:text-5xl font-display font-bold gradient-text mb-2">
                0
              </div>
              <p className="text-gray-400">Roles</p>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-display font-bold gradient-text mb-2">
                24/7
              </div>
              <p className="text-gray-400">Updated</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
