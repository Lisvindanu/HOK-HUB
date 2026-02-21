import { useParams, Link } from '@tanstack/react-router';
import { ArrowLeft, Shield, Swords, Zap, Target, X, ChevronLeft, ChevronRight, Users, Crosshair } from 'lucide-react';
import { useState } from 'react';
import { useHeroById } from '../hooks/useHeroes';
import { Loading } from '../components/ui/Loading';
import { getTierColor } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function HeroDetailPage() {
  const { heroId } = useParams({ from: '/heroes/$heroId' });
  const { data: hero, isLoading } = useHeroById(parseInt(heroId));
  const [selectedSkinIndex, setSelectedSkinIndex] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading message="Loading hero details..." />
      </div>
    );
  }

  if (!hero) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-display font-bold mb-4">Hero Not Found</h1>
          <p className="text-gray-400 mb-8">The hero you're looking for doesn't exist.</p>
          <Link to="/heroes" className="px-6 py-3 bg-white text-dark-400 rounded-xl font-medium hover:bg-gray-100 transition-colors">
            Back to Heroes
          </Link>
        </div>
      </div>
    );
  }

  const hasAttributes = hero.survivalPercentage && hero.survivalPercentage !== '0%';

  return (
    <div className="min-h-screen bg-dark-400">
      {/* Hero Header */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src={hero.icon}
            alt={hero.name}
            className="w-full h-full object-cover blur-xl scale-125 opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-dark-400/50 via-dark-400/70 to-dark-400" />
          <div className="absolute inset-0 bg-gradient-to-r from-dark-400/80 via-transparent to-dark-400/80" />
        </div>

        {/* Content */}
        <div className="relative container mx-auto px-6 lg:px-8 pt-28 pb-8">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Link
              to="/heroes"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to Heroes</span>
            </Link>
          </motion.div>

          {/* Hero Info */}
          <div className="mt-6">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
              {/* Hero Image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl">
                  <img
                    src={hero.icon}
                    alt={hero.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Tier badge */}
                <div className={`absolute -bottom-3 -right-3 px-4 py-2 rounded-xl bg-dark-400/90 backdrop-blur-sm border border-white/10 font-bold text-lg ${getTierColor(hero.stats.tier)}`}>
                  {hero.stats.tier}
                </div>
              </motion.div>

              {/* Hero Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex-1"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 rounded-lg bg-white/10 text-white/80 text-sm font-medium">
                    {hero.role}
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-white/5 text-white/60 text-sm">
                    {hero.lane}
                  </span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-4">
                  {hero.name}
                </h1>

                {/* Quick Stats */}
                <div className="flex items-center gap-5">
                  <div>
                    <p className="text-xl font-bold text-green-400">{hero.stats.winRate}</p>
                    <p className="text-xs text-gray-500">Win Rate</p>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div>
                    <p className="text-xl font-bold text-blue-400">{hero.stats.pickRate}</p>
                    <p className="text-xs text-gray-500">Pick Rate</p>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div>
                    <p className="text-xl font-bold text-red-400">{hero.stats.banRate}</p>
                    <p className="text-xs text-gray-500">Ban Rate</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Grid */}
      <section className="py-8">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Attributes */}
              {hasAttributes && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="p-6 bg-dark-300/50 border border-white/5 rounded-2xl"
                >
                  <h2 className="text-xl font-semibold text-white mb-6">Attributes</h2>
                  <div className="grid grid-cols-2 gap-6">
                    <AttributeBar
                      icon={Shield}
                      label="Survival"
                      value={hero.survivalPercentage || '0%'}
                      color="blue"
                    />
                    <AttributeBar
                      icon={Swords}
                      label="Attack"
                      value={hero.attackPercentage || '0%'}
                      color="red"
                    />
                    <AttributeBar
                      icon={Zap}
                      label="Ability"
                      value={hero.abilityPercentage || '0%'}
                      color="purple"
                    />
                    <AttributeBar
                      icon={Target}
                      label="Difficulty"
                      value={hero.difficultyPercentage || '0%'}
                      color="yellow"
                    />
                  </div>
                </motion.div>
              )}

              {/* Skins Gallery */}
              {hero.skins && hero.skins.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className="p-6 bg-dark-300/50 border border-white/5 rounded-2xl"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white">Skins</h2>
                    <span className="text-sm text-gray-500">{hero.skins.length} available</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {hero.skins.map((skin, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedSkinIndex(index)}
                        className="group relative overflow-hidden rounded-xl bg-dark-200/50 transition-all duration-300 hover:ring-2 hover:ring-primary-500/50"
                      >
                        <div className="aspect-[3/4] relative overflow-hidden">
                          <img
                            src={skin.skinCover || skin.skinImage || skin.skinImg || ''}
                            alt={skin.skinName}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/400x600?text=No+Image';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-dark-400 via-transparent to-transparent" />

                          {/* Skin name */}
                          <div className="absolute bottom-0 left-0 right-0 p-3">
                            <p className="text-sm font-medium text-white truncate">
                              {skin.skinName}
                            </p>
                            {skin.skinSeries && (
                              <p className="text-xs text-gray-400 truncate mt-0.5">
                                {skin.skinSeries}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Lore */}
              {hero.world && (hero.world.region || hero.world.identity) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="p-6 bg-dark-300/50 border border-white/5 rounded-2xl"
                >
                  <h2 className="text-lg font-semibold text-white mb-4">Lore</h2>
                  <div className="space-y-4">
                    {hero.world.region && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Region</p>
                        <p className="text-white">{hero.world.region}</p>
                      </div>
                    )}
                    {hero.world.identity && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Identity</p>
                        <p className="text-white">{hero.world.identity}</p>
                      </div>
                    )}
                    {hero.world.energy && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Energy</p>
                        <p className="text-white">{hero.world.energy}</p>
                      </div>
                    )}
                    {hero.world.height && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Height</p>
                        <p className="text-white">{hero.world.height}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Best Partners */}
              {hero.bestPartners && Object.keys(hero.bestPartners).length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.25 }}
                  className="p-6 bg-dark-300/50 border border-white/5 rounded-2xl"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-4 h-4 text-blue-400" />
                    <h2 className="text-lg font-semibold text-white">Best Partners</h2>
                  </div>
                  <div className="space-y-2">
                    {Object.values(hero.bestPartners).slice(0, 5).map((partner, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors">
                        <img
                          src={partner.thumbnail}
                          alt={partner.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <span className="text-sm text-white">{partner.name}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Strong Against */}
              {hero.suppressingHeroes && Object.keys(hero.suppressingHeroes).length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className="p-6 bg-dark-300/50 border border-white/5 rounded-2xl"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Crosshair className="w-4 h-4 text-green-400" />
                    <h2 className="text-lg font-semibold text-white">Strong Against</h2>
                  </div>
                  <div className="space-y-2">
                    {Object.values(hero.suppressingHeroes).slice(0, 5).map((counter, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors">
                        <img
                          src={counter.thumbnail}
                          alt={counter.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <span className="text-sm text-white">{counter.name}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Weak Against */}
              {hero.suppressedHeroes && Object.keys(hero.suppressedHeroes).length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.35 }}
                  className="p-6 bg-dark-300/50 border border-white/5 rounded-2xl"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="w-4 h-4 text-red-400" />
                    <h2 className="text-lg font-semibold text-white">Weak Against</h2>
                  </div>
                  <div className="space-y-2">
                    {Object.values(hero.suppressedHeroes).slice(0, 5).map((counter, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors">
                        <img
                          src={counter.thumbnail}
                          alt={counter.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <span className="text-sm text-white">{counter.name}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Skin Gallery Modal */}
      <AnimatePresence>
        {selectedSkinIndex !== null && hero.skins && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
            onClick={() => setSelectedSkinIndex(null)}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedSkinIndex(null)}
              className="absolute top-6 right-6 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Previous button */}
            {selectedSkinIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSkinIndex(selectedSkinIndex - 1);
                }}
                className="absolute left-6 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Next button */}
            {selectedSkinIndex < hero.skins.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSkinIndex(selectedSkinIndex + 1);
                }}
                className="absolute right-6 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {/* Main content */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image */}
              <div className="relative rounded-2xl overflow-hidden">
                <img
                  src={
                    hero.skins[selectedSkinIndex].skinCover ||
                    hero.skins[selectedSkinIndex].skinImage ||
                    hero.skins[selectedSkinIndex].skinImg ||
                    ''
                  }
                  alt={hero.skins[selectedSkinIndex].skinName}
                  className="w-full max-h-[70vh] object-contain"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/800x1200?text=No+Image';
                  }}
                />
              </div>

              {/* Info */}
              <div className="mt-6 text-center">
                <h3 className="text-2xl font-semibold text-white">
                  {hero.skins[selectedSkinIndex].skinName}
                </h3>
                {hero.skins[selectedSkinIndex].skinSeries && (
                  <p className="text-primary-400 mt-1">
                    {hero.skins[selectedSkinIndex].skinSeries}
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  {selectedSkinIndex + 1} of {hero.skins.length}
                </p>
              </div>

              {/* Thumbnail navigation */}
              <div className="mt-6 flex justify-center gap-2 overflow-x-auto pb-2">
                {hero.skins.map((skin, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedSkinIndex(index)}
                    className={`flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden transition-all ${
                      index === selectedSkinIndex
                        ? 'ring-2 ring-primary-500 opacity-100'
                        : 'opacity-40 hover:opacity-70'
                    }`}
                  >
                    <img
                      src={skin.skinCover || skin.skinImage || skin.skinImg || ''}
                      alt={skin.skinName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/100x150?text=No';
                      }}
                    />
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Attribute Bar Component
function AttributeBar({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: 'blue' | 'red' | 'purple' | 'yellow';
}) {
  const colorClasses = {
    blue: 'text-blue-400 bg-blue-500',
    red: 'text-red-400 bg-red-500',
    purple: 'text-purple-400 bg-purple-500',
    yellow: 'text-yellow-400 bg-yellow-500',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${colorClasses[color].split(' ')[0]}`} />
          <span className="text-sm text-gray-400">{label}</span>
        </div>
        <span className="text-sm font-medium text-white">{value}</span>
      </div>
      <div className="h-1.5 bg-dark-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${colorClasses[color].split(' ')[1]}`}
          style={{ width: value }}
        />
      </div>
    </div>
  );
}
