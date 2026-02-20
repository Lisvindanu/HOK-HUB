import { useParams, Link } from '@tanstack/react-router';
import { ArrowLeft, Shield, Swords, Zap, Target, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useHeroById } from '../hooks/useHeroes';
import { Loading } from '../components/ui/Loading';
import { getRoleColor, getTierColor } from '../lib/utils';

export function HeroDetailPage() {
  const { heroId } = useParams({ from: '/heroes/$heroId' });
  const { data: hero, isLoading } = useHeroById(parseInt(heroId));
  const [selectedSkinIndex, setSelectedSkinIndex] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Loading message="Loading hero details..." />
      </div>
    );
  }

  if (!hero) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-display font-bold mb-4">Hero Not Found</h1>
          <p className="text-gray-400 mb-8">The hero you're looking for doesn't exist.</p>
          <Link to="/heroes" className="btn-primary">
            Back to Heroes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <div className="relative h-[60vh] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={hero.icon}
            alt={hero.name}
            className="w-full h-full object-cover blur-sm scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-300 via-dark-300/80 to-dark-300/20"></div>
        </div>

        {/* Content */}
        <div className="relative h-full container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between h-full py-8">
            {/* Back Button */}
            <Link to="/heroes" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors w-fit">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Heroes</span>
            </Link>

            {/* Hero Info */}
            <div className="flex items-end space-x-8">
              <img
                src={hero.icon}
                alt={hero.name}
                className="w-48 h-48 rounded-xl border-4 border-primary-500 shadow-2xl"
              />
              <div className="pb-4">
                <div className="flex items-center space-x-3 mb-2">
                  <span className={`px-3 py-1 rounded-full bg-dark-400/90 backdrop-blur-sm border border-white/10 ${getRoleColor(hero.role)} text-sm font-semibold`}>
                    {hero.role}
                  </span>
                  <span className={`px-3 py-1 rounded-full bg-dark-400/90 backdrop-blur-sm border border-white/10 ${getTierColor(hero.stats.tier)} font-bold text-sm`}>
                    Tier {hero.stats.tier}
                  </span>
                </div>
                <h1 className="text-5xl md:text-6xl font-display font-bold mb-2">
                  {hero.name}
                </h1>
                <p className="text-xl text-gray-300">{hero.lane}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats */}
            <div className="card p-6">
              <h2 className="text-2xl font-display font-bold mb-6">Statistics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-1">{hero.stats.winRate}</div>
                  <div className="text-sm text-gray-400">Win Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-1">{hero.stats.pickRate}</div>
                  <div className="text-sm text-gray-400">Pick Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-400 mb-1">{hero.stats.banRate}</div>
                  <div className="text-sm text-gray-400">Ban Rate</div>
                </div>
                <div className="text-center">
                  <div className={`text-3xl font-bold mb-1 ${getTierColor(hero.stats.tier)}`}>{hero.stats.tier}</div>
                  <div className="text-sm text-gray-400">Tier Rank</div>
                </div>
              </div>
            </div>

            {/* Attributes */}
            {hero.survivalPercentage && hero.survivalPercentage !== '0%' && (
            <div className="card p-6">
              <h2 className="text-2xl font-display font-bold mb-6">Attributes</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-300">Survival</span>
                    </div>
                    <span className="text-white font-semibold">{hero.survivalPercentage}</span>
                  </div>
                  <div className="w-full bg-dark-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: hero.survivalPercentage }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Swords className="w-4 h-4 text-red-400" />
                      <span className="text-gray-300">Attack</span>
                    </div>
                    <span className="text-white font-semibold">{hero.attackPercentage}</span>
                  </div>
                  <div className="w-full bg-dark-200 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: hero.attackPercentage }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-purple-400" />
                      <span className="text-gray-300">Ability</span>
                    </div>
                    <span className="text-white font-semibold">{hero.abilityPercentage}</span>
                  </div>
                  <div className="w-full bg-dark-200 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: hero.abilityPercentage }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4 text-yellow-400" />
                      <span className="text-gray-300">Difficulty</span>
                    </div>
                    <span className="text-white font-semibold">{hero.difficultyPercentage}</span>
                  </div>
                  <div className="w-full bg-dark-200 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{ width: hero.difficultyPercentage }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            )}

            {/* Skins Gallery */}
            {hero.skins && hero.skins.length > 0 && (
              <div className="card p-6">
                <h2 className="text-2xl font-display font-bold mb-6">
                  Skins <span className="text-primary-500">({hero.skins.length})</span>
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {hero.skins.map((skin, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedSkinIndex(index)}
                      className="group relative overflow-hidden rounded-xl bg-dark-200 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary-500/20"
                    >
                      <div className="aspect-[3/4] relative overflow-hidden">
                        <img
                          src={skin.skinCover || skin.skinImage || skin.skinImg || ''}
                          alt={skin.skinName}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/400x600?text=No+Image';
                          }}
                        />
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* View text on hover */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="bg-primary-500/90 px-4 py-2 rounded-full text-white text-sm font-semibold">
                            View Full
                          </div>
                        </div>
                      </div>

                      {/* Skin name */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                        <p className="text-sm font-semibold text-white text-center">
                          {skin.skinName}
                        </p>
                        {skin.skinSeries && (
                          <p className="text-xs text-gray-300 text-center mt-1">
                            {skin.skinSeries}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Lore */}
            {hero.world && (
              <div className="card p-6">
                <h2 className="text-xl font-display font-bold mb-4">Lore</h2>
                <div className="space-y-3 text-sm">
                  {hero.world.region && (
                    <div>
                      <span className="text-gray-400">Region:</span>
                      <p className="text-white font-medium">{hero.world.region}</p>
                    </div>
                  )}
                  {hero.world.identity && (
                    <div>
                      <span className="text-gray-400">Identity:</span>
                      <p className="text-white font-medium">{hero.world.identity}</p>
                    </div>
                  )}
                  {hero.world.energy && (
                    <div>
                      <span className="text-gray-400">Energy:</span>
                      <p className="text-white font-medium">{hero.world.energy}</p>
                    </div>
                  )}
                  {hero.world.height && (
                    <div>
                      <span className="text-gray-400">Height:</span>
                      <p className="text-white font-medium">{hero.world.height}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Best Partners */}
            {hero.bestPartners && Object.keys(hero.bestPartners).length > 0 && (
              <div className="card p-6">
                <h2 className="text-xl font-display font-bold mb-4">Best Partners</h2>
                <div className="space-y-2">
                  {Object.values(hero.bestPartners).slice(0, 5).map((partner, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-dark-100 transition-colors">
                      <img
                        src={partner.thumbnail}
                        alt={partner.name}
                        className="w-10 h-10 rounded-lg"
                      />
                      <span className="text-sm font-medium">{partner.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Counters */}
            {hero.suppressingHeroes && Object.keys(hero.suppressingHeroes).length > 0 && (
              <div className="card p-6">
                <h2 className="text-xl font-display font-bold mb-4 text-green-400">Strong Against</h2>
                <div className="space-y-2">
                  {Object.values(hero.suppressingHeroes).slice(0, 5).map((counter, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-dark-100 transition-colors">
                      <img
                        src={counter.thumbnail}
                        alt={counter.name}
                        className="w-10 h-10 rounded-lg"
                      />
                      <span className="text-sm font-medium">{counter.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Weak Against */}
            {hero.suppressedHeroes && Object.keys(hero.suppressedHeroes).length > 0 && (
              <div className="card p-6">
                <h2 className="text-xl font-display font-bold mb-4 text-red-400">Weak Against</h2>
                <div className="space-y-2">
                  {Object.values(hero.suppressedHeroes).slice(0, 5).map((counter, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-dark-100 transition-colors">
                      <img
                        src={counter.thumbnail}
                        alt={counter.name}
                        className="w-10 h-10 rounded-lg"
                      />
                      <span className="text-sm font-medium">{counter.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Skin Gallery Modal */}
      {selectedSkinIndex !== null && hero.skins && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
          onClick={() => setSelectedSkinIndex(null)}
        >
          {/* Close button */}
          <button
            onClick={() => setSelectedSkinIndex(null)}
            className="absolute top-6 right-6 z-10 p-3 rounded-full bg-dark-400/80 hover:bg-dark-400 text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Previous button */}
          {selectedSkinIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedSkinIndex(selectedSkinIndex - 1);
              }}
              className="absolute left-6 z-10 p-4 rounded-full bg-dark-400/80 hover:bg-primary-500 text-white transition-all hover:scale-110"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          {/* Next button */}
          {selectedSkinIndex < hero.skins.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedSkinIndex(selectedSkinIndex + 1);
              }}
              className="absolute right-6 z-10 p-4 rounded-full bg-dark-400/80 hover:bg-primary-500 text-white transition-all hover:scale-110"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}

          {/* Main content */}
          <div
            className="relative max-w-5xl w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={
                  hero.skins[selectedSkinIndex].skinCover ||
                  hero.skins[selectedSkinIndex].skinImage ||
                  hero.skins[selectedSkinIndex].skinImg ||
                  ''
                }
                alt={hero.skins[selectedSkinIndex].skinName}
                className="w-full max-h-[80vh] object-contain"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/800x1200?text=No+Image';
                }}
              />
            </div>

            {/* Info */}
            <div className="mt-6 text-center">
              <h3 className="text-3xl font-display font-bold mb-2">
                {hero.skins[selectedSkinIndex].skinName}
              </h3>
              {hero.skins[selectedSkinIndex].skinSeries && (
                <p className="text-lg text-primary-400 mb-2">
                  {hero.skins[selectedSkinIndex].skinSeries}
                </p>
              )}
              <p className="text-gray-400">
                {selectedSkinIndex + 1} / {hero.skins.length}
              </p>
            </div>

            {/* Thumbnail navigation */}
            <div className="mt-6 flex justify-center gap-2 overflow-x-auto pb-2">
              {hero.skins.map((skin, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedSkinIndex(index)}
                  className={`flex-shrink-0 w-20 h-28 rounded-lg overflow-hidden transition-all ${
                    index === selectedSkinIndex
                      ? 'ring-4 ring-primary-500 scale-110'
                      : 'opacity-50 hover:opacity-100'
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
          </div>
        </div>
      )}
    </div>
  );
}
