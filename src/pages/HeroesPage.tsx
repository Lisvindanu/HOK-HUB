import { useState, useMemo } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';
import { useHeroes } from '../hooks/useHeroes';
import { HeroCard } from '../components/hero/HeroCard';
import { Loading } from '../components/ui/Loading';
import { filterHeroes, sortHeroes } from '../lib/utils';
import { motion } from 'framer-motion';
import type { HeroFilter, HeroSortOption, HeroRole } from '../types/hero';

const roles: (HeroRole | 'All')[] = ['All', 'Tank', 'Fighter', 'Assassin', 'Mage', 'Marksman', 'Support'];
const lanes = ['All', 'Clash Lane', 'Jungling', 'Mid Lane', 'Farm Lane', 'Roaming'];
const tiers = ['All', 'S+', 'S', 'A', 'B', 'C', 'D'];

const LANE_ICONS: Record<string, string> = {
  'Clash Lane': '/assets/lanes/clash-lane.webp',
  'Jungling': '/assets/lanes/jungle.webp',
  'Mid Lane': '/assets/lanes/mid-lane.webp',
  'Farm Lane': '/assets/lanes/farm-lane.webp',
  'Roaming': '/assets/lanes/roamer.webp',
};

const formatLaneLabel = (lane: string): string => {
  if (lane === 'All') return 'All Lanes';
  if (lane === 'Jungling') return 'Jungle';
  if (lane === 'Roaming') return 'Roam';
  return lane.replace(' Lane', '');
};

export function HeroesPage() {
  const { data: heroes, isLoading } = useHeroes();
  const [filter, setFilter] = useState<HeroFilter>({
    role: 'All',
    lane: 'All',
    tier: 'All',
    search: '',
  });
  const [sort, setSort] = useState<HeroSortOption>({
    field: 'name',
    order: 'asc',
  });
  const [showFilters, setShowFilters] = useState(false);

  const filteredAndSortedHeroes = useMemo(() => {
    if (!heroes) return [];
    const filtered = filterHeroes(heroes, filter);
    return sortHeroes(filtered, sort);
  }, [heroes, filter, sort]);

  const resetFilters = () => {
    setFilter({
      role: 'All',
      lane: 'All',
      tier: 'All',
      search: '',
    });
  };

  const hasActiveFilters = filter.role !== 'All' || filter.lane !== 'All' || filter.tier !== 'All' || filter.search !== '';
  const activeFilterCount = [filter.role !== 'All', filter.lane !== 'All', filter.tier !== 'All'].filter(Boolean).length;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading message="Loading heroes..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-400">
      {/* Header Section */}
      <section className="pt-20 md:pt-28 pb-8 md:pb-12 border-b border-white/5">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-4">
              Heroes
            </h1>
            <p className="text-gray-400 text-lg max-w-xl">
              Explore all {heroes?.length || 0} heroes with stats, abilities, and tier rankings
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search & Filters Section */}
      <section className="sticky top-16 md:top-20 z-30 bg-dark-400/95 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-3 md:py-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search heroes..."
                value={filter.search}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                className="w-full pl-12 pr-4 py-3 bg-dark-300/50 border border-white/10 rounded-xl focus:outline-none focus:border-primary-500/50 focus:bg-dark-300 text-white placeholder-gray-500 transition-all"
              />
              {filter.search && (
                <button
                  onClick={() => setFilter({ ...filter, search: '' })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>

            {/* Role Tabs - Desktop */}
            <div className="hidden lg:flex items-center gap-1 bg-dark-300/50 p-1 rounded-xl border border-white/5">
              {roles.map((role) => (
                <button
                  key={role}
                  onClick={() => setFilter({ ...filter, role })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter.role === role
                      ? 'bg-white text-dark-400'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            {/* Filter Button - Mobile */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center justify-center gap-2 px-4 py-3 bg-dark-300/50 border border-white/10 rounded-xl text-gray-300 hover:border-white/20 transition-colors"
            >
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="px-2 py-0.5 bg-primary-500 text-white text-xs rounded-full">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={`${sort.field}-${sort.order}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-') as [HeroSortOption['field'], HeroSortOption['order']];
                  setSort({ field, order });
                }}
                className="appearance-none px-4 py-3 pr-10 bg-dark-300/50 border border-white/10 rounded-xl focus:outline-none focus:border-primary-500/50 text-white text-sm cursor-pointer transition-all"
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="winRate-desc">Win Rate ↓</option>
                <option value="winRate-asc">Win Rate ↑</option>
                <option value="pickRate-desc">Pick Rate ↓</option>
                <option value="banRate-desc">Ban Rate ↓</option>
                <option value="tier-desc">Tier (Best)</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Mobile Filters Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden mt-4 pt-4 border-t border-white/5"
            >
              <div className="space-y-4">
                {/* Role Filter */}
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Role</p>
                  <div className="flex flex-wrap gap-2">
                    {roles.map((role) => (
                      <button
                        key={role}
                        onClick={() => setFilter({ ...filter, role })}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          filter.role === role
                            ? 'bg-white text-dark-400'
                            : 'bg-dark-300/50 text-gray-400 hover:text-white'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Lane Filter */}
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Lane</p>
                  <div className="flex flex-wrap gap-2">
                    {lanes.map((lane) => (
                      <button
                        key={lane}
                        onClick={() => setFilter({ ...filter, lane })}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          filter.lane === lane
                            ? 'bg-white text-dark-400'
                            : 'bg-dark-300/50 text-gray-400 hover:text-white'
                        }`}
                        title={lane === 'All' ? 'All Lanes' : lane}
                      >
                        {LANE_ICONS[lane] ? (
                          <img src={LANE_ICONS[lane]} alt={lane} className="w-5 h-5 object-contain" />
                        ) : (
                          <span>{formatLaneLabel(lane)}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tier Filter */}
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Tier</p>
                  <div className="flex flex-wrap gap-2">
                    {tiers.map((tier) => (
                      <button
                        key={tier}
                        onClick={() => setFilter({ ...filter, tier: tier as any })}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          filter.tier === tier
                            ? 'bg-white text-dark-400'
                            : 'bg-dark-300/50 text-gray-400 hover:text-white'
                        }`}
                      >
                        {tier}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Desktop Lane & Tier Filters */}
          <div className="hidden lg:flex items-center gap-6 mt-4">
            {/* Lane Pills */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Lane:</span>
              <div className="flex items-center gap-1">
                {lanes.map((lane) => (
                  <button
                    key={lane}
                    onClick={() => setFilter({ ...filter, lane })}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      filter.lane === lane
                        ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                    title={lane === 'All' ? 'All Lanes' : lane}
                  >
                    {LANE_ICONS[lane] ? (
                      <img src={LANE_ICONS[lane]} alt={lane} className="w-5 h-5 object-contain" />
                    ) : (
                      <span>{formatLaneLabel(lane)}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Tier Pills */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Tier:</span>
              <div className="flex items-center gap-1">
                {tiers.map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setFilter({ ...filter, tier: tier as any })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      filter.tier === tier
                        ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <X className="w-3 h-3" />
                <span>Clear filters</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-8">
        <div className="container mx-auto px-6 lg:px-8">
          {/* Results Count */}
          <div className="mb-6">
            <p className="text-sm text-gray-500">
              Showing <span className="text-white font-medium">{filteredAndSortedHeroes.length}</span> heroes
            </p>
          </div>

          {/* Heroes Grid */}
          {filteredAndSortedHeroes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <p className="text-gray-400 text-lg mb-4">No heroes found</p>
              <button
                onClick={resetFilters}
                className="px-6 py-3 bg-white text-dark-400 rounded-xl font-medium hover:bg-gray-100 transition-colors"
              >
                Clear Filters
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4"
            >
              {filteredAndSortedHeroes.map((hero, index) => (
                <motion.div
                  key={hero.heroId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(index * 0.02, 0.3) }}
                >
                  <HeroCard hero={hero} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
