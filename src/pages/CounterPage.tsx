import { useState, useMemo } from 'react';
import { useHeroes } from '../hooks/useHeroes';
import { Loading } from '../components/ui/Loading';
import { Search, ChevronRight, Shield, Sword, AlertCircle } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import type { Hero } from '../types/hero';

export function CounterPage() {
  const { data: heroes, isLoading } = useHeroes();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHero, setSelectedHero] = useState<Hero | null>(null);

  // Filter heroes based on search
  const filteredHeroes = useMemo(() => {
    if (!heroes) return [];
    if (!searchQuery) return heroes;

    return heroes.filter(hero =>
      hero.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [heroes, searchQuery]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Loading message="Loading counter data..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
          Counter Picks
        </h1>
        <p className="text-gray-400 text-lg">
          Find out which heroes counter or get countered by your pick
        </p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for a hero..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-dark-50 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 text-white placeholder-gray-500"
          />
        </div>
      </div>

      {!selectedHero ? (
        <>
          {/* Hero Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredHeroes.map((hero) => (
              <button
                key={hero.heroId}
                onClick={() => setSelectedHero(hero)}
                className="group relative overflow-hidden rounded-lg bg-dark-200 transition-all hover:scale-105 hover:shadow-xl"
              >
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={hero.icon}
                    alt={hero.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <h3 className="text-sm font-bold text-white line-clamp-1">{hero.name}</h3>
                    <p className="text-xs text-gray-300">{hero.role}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {filteredHeroes.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">No heroes found matching "{searchQuery}"</p>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Selected Hero Section */}
          <div className="mb-8">
            <button
              onClick={() => setSelectedHero(null)}
              className="mb-4 px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white hover:bg-dark-100 transition-colors"
            >
              ← Back to all heroes
            </button>

            <div className="flex items-center gap-4 p-6 bg-dark-200 border border-white/10 rounded-xl">
              <img
                src={selectedHero.icon}
                alt={selectedHero.name}
                className="w-20 h-20 rounded-lg border-2 border-primary-500"
              />
              <div>
                <h2 className="text-3xl font-bold text-white">{selectedHero.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-gray-400">{selectedHero.role}</span>
                  <span className="text-gray-600">•</span>
                  <span className="text-gray-400">{selectedHero.lane}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Counter Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strong Against */}
            <div className="bg-dark-200 border border-white/10 rounded-xl overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4">
                <div className="flex items-center gap-2">
                  <Sword className="w-5 h-5 text-white" />
                  <h3 className="text-xl font-bold text-white">Strong Against</h3>
                </div>
                <p className="text-white/80 text-sm mt-1">
                  {selectedHero.name} counters these heroes
                </p>
              </div>

              <div className="p-4">
                {Object.keys(selectedHero.suppressedHeroes).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(selectedHero.suppressedHeroes).map(([key, relation]) => {
                      const counterHero = heroes?.find(h => h.name === relation.name);
                      return (
                      <Link
                        key={key}
                        to="/heroes/$heroId"
                        params={{ heroId: counterHero?.heroId.toString() || '0' }}
                        className="flex items-center gap-3 p-3 bg-dark-100 rounded-lg hover:bg-dark-50 transition-colors group"
                      >
                        <img
                          src={relation.thumbnail}
                          alt={relation.name}
                          className="w-12 h-12 rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-white group-hover:text-primary-400 transition-colors">
                            {relation.name}
                          </h4>
                          <p className="text-sm text-gray-400 line-clamp-1">{relation.description}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-primary-400 transition-colors" />
                      </Link>
                    )})}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-400">No counter data available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Weak Against */}
            <div className="bg-dark-200 border border-white/10 rounded-xl overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-orange-500 p-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-white" />
                  <h3 className="text-xl font-bold text-white">Weak Against</h3>
                </div>
                <p className="text-white/80 text-sm mt-1">
                  These heroes counter {selectedHero.name}
                </p>
              </div>

              <div className="p-4">
                {Object.keys(selectedHero.suppressingHeroes).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(selectedHero.suppressingHeroes).map(([key, relation]) => {
                      const counterHero = heroes?.find(h => h.name === relation.name);
                      return (
                      <Link
                        key={key}
                        to="/heroes/$heroId"
                        params={{ heroId: counterHero?.heroId.toString() || '0' }}
                        className="flex items-center gap-3 p-3 bg-dark-100 rounded-lg hover:bg-dark-50 transition-colors group"
                      >
                        <img
                          src={relation.thumbnail}
                          alt={relation.name}
                          className="w-12 h-12 rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-white group-hover:text-primary-400 transition-colors">
                            {relation.name}
                          </h4>
                          <p className="text-sm text-gray-400 line-clamp-1">{relation.description}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-primary-400 transition-colors" />
                      </Link>
                    )})}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-400">No counter data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Best Partners */}
          {Object.keys(selectedHero.bestPartners).length > 0 && (
            <div className="mt-6 bg-dark-200 border border-white/10 rounded-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4">
                <h3 className="text-xl font-bold text-white">Best Partners</h3>
                <p className="text-white/80 text-sm mt-1">
                  Heroes that synergize well with {selectedHero.name}
                </p>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(selectedHero.bestPartners).map(([key, relation]) => {
                    const partnerHero = heroes?.find(h => h.name === relation.name);
                    return (
                    <Link
                      key={key}
                      to="/heroes/$heroId"
                      params={{ heroId: partnerHero?.heroId.toString() || '0' }}
                      className="flex items-center gap-3 p-3 bg-dark-100 rounded-lg hover:bg-dark-50 transition-colors group"
                    >
                      <img
                        src={relation.thumbnail}
                        alt={relation.name}
                        className="w-12 h-12 rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-white group-hover:text-primary-400 transition-colors">
                          {relation.name}
                        </h4>
                        <p className="text-sm text-gray-400 line-clamp-1">{relation.description}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-primary-400 transition-colors" />
                    </Link>
                  )})}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
