import { Link } from '@tanstack/react-router';
import { ArrowRight, Shield, Users, TrendingUp, Code } from 'lucide-react';
import { motion } from 'framer-motion';

export function AboutPage() {
  return (
    <div className="min-h-screen bg-dark-400 py-12 md:py-20">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
            About HoK Hub
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Your complete Honor of Kings resource hub, built by the community for the community
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto space-y-12">
          {/* What is HoK Hub */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="p-8 rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.08]"
          >
            <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-6">
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
          </motion.section>

          {/* Features Grid */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-8 text-center">
              What We Offer
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  icon: Users,
                  title: 'Community-Driven',
                  description: 'Built by players, for players. Submit contributions, vote on tier lists, and shape the meta together.',
                  color: 'from-blue-500 to-blue-700'
                },
                {
                  icon: TrendingUp,
                  title: 'Real-Time Updates',
                  description: 'Stay ahead with live patch notes, meta trends, and instant tier list updates from the community.',
                  color: 'from-green-500 to-emerald-700'
                },
                {
                  icon: Shield,
                  title: 'Comprehensive Data',
                  description: '111+ heroes, 1000+ skins, complete item & arcana database, all in one place.',
                  color: 'from-purple-500 to-indigo-700'
                },
                {
                  icon: Code,
                  title: 'Open & Transparent',
                  description: 'Open contribution system, public API, and community-first approach to everything we build.',
                  color: 'from-orange-500 to-rose-700'
                }
              ].map((feature, i) => (
                <motion.div
                  key={feature.title}
                  className="p-6 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] hover:bg-white/[0.06] transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* FAQ Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-8 text-center">
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
                },
                {
                  q: 'Is HoK Hub free to use?',
                  a: 'Yes, absolutely! All features on HoK Hub are completely free. We believe in providing accessible, high-quality resources to all Honor of Kings players.'
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
          </motion.section>

          {/* CTA */}
          <motion.section
            className="text-center pt-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-2xl font-display font-bold text-white mb-4">
              Ready to level up?
            </h3>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Start exploring our tools and join the community today
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/heroes"
                className="group flex items-center gap-3 px-8 py-4 bg-primary-500 text-white rounded-2xl text-lg font-semibold hover:bg-primary-600 transition-all duration-300"
              >
                <span>Explore Heroes</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/contribute"
                className="flex items-center gap-3 px-8 py-4 text-gray-300 hover:text-white transition-colors"
              >
                <span>Start Contributing</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
