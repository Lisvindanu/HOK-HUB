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
        <div className="relative container mx-auto px-4 md:px-6 lg:px-8 pt-20 md:pt-28 pb-6 md:pb-8">
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
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="px-3 py-1 rounded-lg bg-white/10 text-white/80 text-sm font-medium">
                    {hero.role}
                  </span>
                  {(hero.lanes && hero.lanes.length > 0 ? hero.lanes : [hero.lane]).map((lane) => (
                    <span key={lane} className="px-3 py-1 rounded-lg bg-white/5 text-white/60 text-sm">
                      {lane}
                    </span>
                  ))}
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
      <section className="py-6 md:py-8">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6 md:space-y-8">
              {/* Attributes */}
              {hasAttributes && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="p-4 md:p-6 bg-dark-300/50 border border-white/5 rounded-2xl"
                >
                  <h2 className="text-lg md:text-xl font-semibold text-white mb-4 md:mb-6">Attributes</h2>
                  <div className="grid grid-cols-2 gap-4 md:gap-6">
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
                  className="p-4 md:p-6 bg-dark-300/50 border border-white/5 rounded-2xl"
                >
                  <div className="flex items-center justify-between mb-4 md:mb-6">
                    <h2 className="text-lg md:text-xl font-semibold text-white">Skins</h2>
                    <span className="text-xs md:text-sm text-gray-500">{hero.skins.length} available</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
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

                          {/* Tier Badge */}
                          {skin.tierName && (
                            <div
                              className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-lg"
                              style={{
                                backgroundColor: skin.tierColor || '#8B5CF6',
                                color: '#fff',
                                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                              }}
                            >
                              {skin.tierName}
                            </div>
                          )}

                          {/* Collab Badge */}
                          {skin.collab && (
                            <div
                              className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-lg"
                              style={{
                                backgroundColor: skin.collab.color || '#FFD700',
                                color: '#fff',
                                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                              }}
                            >
                              {skin.collab.name}
                            </div>
                          )}

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

              {/* Skills Section */}
              {hero.skill && hero.skill.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.32 }}
                  className="p-4 md:p-6 bg-dark-300/50 border border-white/5 rounded-2xl"
                >
                  <div className="flex items-center justify-between mb-4 md:mb-6">
                    <h2 className="text-lg md:text-xl font-semibold text-white">Skills</h2>
                    {hero.skill.length > 5 && (
                      <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-lg">
                        Multi-Mode Hero • {hero.skill.length} Skills
                      </span>
                    )}
                  </div>
                  <div className="space-y-3 md:space-y-4">
                    {hero.skill.map((skill, index) => {
                      // Detect skill type for better labeling
                      let skillLabel = '';
                      if (index === 0) {
                        skillLabel = 'Passive';
                      } else if (skill.skillName.toLowerCase().includes('awakening')) {
                        skillLabel = 'Ultimate';
                      } else {
                        // For multi-mode heroes (>5 skills), just show skill name
                        // For normal heroes, show "Skill 1, 2, 3, Ultimate"
                        if (hero.skill.length > 5) {
                          skillLabel = '';
                        } else {
                          skillLabel = index === 4 ? 'Ultimate' : `Skill ${index}`;
                        }
                      }

                      return (
                        <div
                          key={index}
                          className="flex gap-3 md:gap-4 p-3 md:p-4 bg-dark-200/50 rounded-xl border border-white/5 hover:border-primary-500/20 transition-all"
                        >
                          <div className="flex-shrink-0">
                            <img
                              src={skill.skillImg}
                              alt={skill.skillName}
                              className="w-12 h-12 md:w-14 md:h-14 rounded-xl border border-white/10"
                              onError={(e) => {
                                e.currentTarget.src = 'https://via.placeholder.com/56?text=?';
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-sm font-semibold text-white">
                                {skillLabel && `${skillLabel}: `}{skill.skillName}
                              </h3>
                            </div>
                            <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">
                              {skill.skillDesc}
                            </p>
                            <div className="flex gap-4 mt-2">
                              {skill.cooldown && skill.cooldown[0] > 0 && (
                                <span className="text-[10px] text-blue-400">
                                  CD: {skill.cooldown.join('/')}s
                                </span>
                              )}
                              {skill.cost && skill.cost[0] > 0 && (
                                <span className="text-[10px] text-cyan-400">
                                  Cost: {skill.cost.join('/')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Arcana Section */}
              {hero.arcana && hero.arcana.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.35 }}
                  className="p-4 md:p-6 bg-dark-300/50 border border-white/5 rounded-2xl"
                >
                  <div className="flex items-center justify-between mb-4 md:mb-6">
                    <h2 className="text-lg md:text-xl font-semibold text-white">Recommended Arcana</h2>
                    <span className="text-xs md:text-sm text-gray-500">{hero.arcana.length} slots</span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2 md:gap-3">
                    {hero.arcana.map((arcana, index) => (
                      <div
                        key={index}
                        className="group relative bg-dark-200/50 rounded-xl p-2 md:p-3 border border-white/5 hover:border-primary-500/30 transition-all"
                      >
                        <div className="flex flex-col items-center text-center">
                          <img
                            src={arcana.icon}
                            alt={arcana.name}
                            className="w-10 h-10 md:w-12 md:h-12 rounded-lg mb-1.5 md:mb-2"
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/48?text=?';
                            }}
                          />
                          <p className="text-xs font-medium text-white line-clamp-2">{arcana.name}</p>
                          <p className="text-[10px] text-gray-500 mt-1">Lv.{arcana.level}</p>
                        </div>
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-dark-400 border border-white/10 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 pointer-events-none">
                          <p className="text-xs text-white font-medium mb-1">{arcana.name}</p>
                          <p className="text-[10px] text-gray-400 whitespace-pre-line">{arcana.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Equipment Section */}
              {hero.recommendedEquipment && hero.recommendedEquipment.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  className="p-4 md:p-6 bg-dark-300/50 border border-white/5 rounded-2xl"
                >
                  <div className="flex items-center justify-between mb-4 md:mb-6">
                    <div>
                      <h2 className="text-lg md:text-xl font-semibold text-white">Recommended Build</h2>
                      {hero.buildTitle && (
                        <p className="text-xs md:text-sm text-gray-500 mt-1">{hero.buildTitle}</p>
                      )}
                    </div>
                    <span className="text-xs md:text-sm text-gray-500">{hero.recommendedEquipment.length} items</span>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2">
                    {hero.recommendedEquipment.map((item, index) => (
                      <div
                        key={index}
                        className="group relative"
                      >
                        <div className={`relative bg-dark-200/50 rounded-xl p-2 border transition-all ${
                          item.isCore
                            ? 'border-yellow-500/50 ring-1 ring-yellow-500/20'
                            : 'border-white/5 hover:border-primary-500/30'
                        }`}>
                          <img
                            src={item.icon}
                            alt={item.name}
                            className="w-full aspect-square rounded-lg"
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/48?text=?';
                            }}
                          />
                          {item.isCore && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                              <span className="text-[8px] text-black font-bold">★</span>
                            </div>
                          )}
                        </div>
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 bg-dark-400 border border-white/10 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 pointer-events-none">
                          <div className="flex items-start gap-2 mb-2">
                            <img src={item.icon} alt="" className="w-8 h-8 rounded" />
                            <div>
                              <p className="text-sm text-white font-medium">{item.name}</p>
                              <p className="text-xs text-yellow-500">{item.price} gold</p>
                            </div>
                          </div>
                          <p className="text-[10px] text-gray-400 whitespace-pre-line">{item.description}</p>
                          {item.passiveSkills && item.passiveSkills.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-white/10">
                              {item.passiveSkills.map((passive, i) => (
                                <p key={i} className="text-[10px] text-primary-400">{passive.name}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4 md:space-y-6">
              {/* Lore */}
              {hero.world && (hero.world.region || hero.world.identity) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="p-4 md:p-6 bg-dark-300/50 border border-white/5 rounded-2xl"
                >
                  <h2 className="text-base md:text-lg font-semibold text-white mb-3 md:mb-4">Lore</h2>
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
                  className="p-4 md:p-6 bg-dark-300/50 border border-white/5 rounded-2xl"
                >
                  <div className="flex items-center gap-2 mb-3 md:mb-4">
                    <Users className="w-4 h-4 text-blue-400" />
                    <h2 className="text-base md:text-lg font-semibold text-white">Best Partners</h2>
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
                  className="p-4 md:p-6 bg-dark-300/50 border border-white/5 rounded-2xl"
                >
                  <div className="flex items-center gap-2 mb-3 md:mb-4">
                    <Crosshair className="w-4 h-4 text-green-400" />
                    <h2 className="text-base md:text-lg font-semibold text-white">Strong Against</h2>
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
                  className="p-4 md:p-6 bg-dark-300/50 border border-white/5 rounded-2xl"
                >
                  <div className="flex items-center gap-2 mb-3 md:mb-4">
                    <Shield className="w-4 h-4 text-red-400" />
                    <h2 className="text-base md:text-lg font-semibold text-white">Weak Against</h2>
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 md:bg-black/90 backdrop-blur-sm"
            onClick={() => setSelectedSkinIndex(null)}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedSkinIndex(null)}
              className="absolute top-4 right-4 md:top-6 md:right-6 z-10 p-2 md:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
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
                className="absolute left-2 md:left-6 z-10 p-2 md:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            )}

            {/* Next button */}
            {selectedSkinIndex < hero.skins.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSkinIndex(selectedSkinIndex + 1);
                }}
                className="absolute right-2 md:right-6 z-10 p-2 md:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            )}

            {/* Main content */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl w-full mx-2 md:mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image */}
              <div className="relative rounded-xl md:rounded-2xl overflow-hidden">
                <img
                  src={
                    hero.skins[selectedSkinIndex].skinCover ||
                    hero.skins[selectedSkinIndex].skinImage ||
                    hero.skins[selectedSkinIndex].skinImg ||
                    ''
                  }
                  alt={hero.skins[selectedSkinIndex].skinName}
                  className="w-full max-h-[60vh] md:max-h-[70vh] object-contain"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/800x1200?text=No+Image';
                  }}
                />
              </div>

              {/* Info */}
              <div className="mt-4 md:mt-6 text-center px-2">
                <div className="flex items-center justify-center gap-2 md:gap-3 mb-2">
                  {hero.skins[selectedSkinIndex].tierName && (
                    <span
                      className="px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wide"
                      style={{
                        backgroundColor: hero.skins[selectedSkinIndex].tierColor || '#8B5CF6',
                        color: '#fff'
                      }}
                    >
                      {hero.skins[selectedSkinIndex].tierName}
                    </span>
                  )}
                  {hero.skins[selectedSkinIndex].collab && (
                    <span
                      className="px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wide"
                      style={{
                        backgroundColor: hero.skins[selectedSkinIndex].collab.color || '#FFD700',
                        color: '#fff'
                      }}
                    >
                      {hero.skins[selectedSkinIndex].collab.name}
                    </span>
                  )}
                </div>
                <h3 className="text-lg md:text-2xl font-semibold text-white">
                  {hero.skins[selectedSkinIndex].skinName}
                </h3>
                {hero.skins[selectedSkinIndex].skinSeries && (
                  <p className="text-sm md:text-base text-primary-400 mt-1">
                    {hero.skins[selectedSkinIndex].skinSeries}
                  </p>
                )}
                <p className="text-xs md:text-sm text-gray-500 mt-2">
                  {selectedSkinIndex + 1} of {hero.skins.length}
                </p>
              </div>

              {/* Thumbnail navigation */}
              <div className="mt-4 md:mt-6 flex justify-center gap-1.5 md:gap-2 overflow-x-auto pb-2 px-2">
                {hero.skins.map((skin, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedSkinIndex(index)}
                    className={`flex-shrink-0 w-12 h-16 md:w-16 md:h-20 rounded-lg overflow-hidden transition-all ${
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
