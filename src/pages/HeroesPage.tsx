import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useHeroes } from '../hooks/useHeroes';
import { HeroCard } from '../components/hero/HeroCard';
import { Loading } from '../components/ui/Loading';
import { filterHeroes, sortHeroes } from '../lib/utils';
import type { HeroFilter, HeroSortOption, HeroRole } from '../types/hero';

const roles: (HeroRole | 'All')[] = ['All', 'Tank', 'Fighter', 'Assassin', 'Mage', 'Marksman', 'Support'];
const lanes = ['All', 'Clash Lane', 'Jungling', 'Mid Lane', 'Farm Lane', 'Roaming'];
const tiers = ['All', 'S+', 'S', 'A', 'B', 'C', 'D'];

// Format lane name for display
const formatLaneLabel = (lane: string): string => {
  if (lane === 'All') return 'All';
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Loading message="Loading heroes..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
          Hero Database
        </h1>
        <p className="text-gray-400 text-lg">
          Browse all {heroes?.length || 0} heroes with detailed stats and information
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search heroes..."
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              className="w-full pl-12 pr-4 py-3 bg-dark-50 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 text-white placeholder-gray-500"
            />
          </div>

          {/* Filter Toggle Button (Mobile) */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden btn-secondary flex items-center justify-center space-x-2"
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span>Filters</span>
          </button>

          {/* Sort */}
          <select
            value={`${sort.field}-${sort.order}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-') as [HeroSortOption['field'], HeroSortOption['order']];
              setSort({ field, order });
            }}
            className="px-4 py-3 bg-dark-50 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 text-white"
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="winRate-desc">Win Rate (High to Low)</option>
            <option value="winRate-asc">Win Rate (Low to High)</option>
            <option value="pickRate-desc">Pick Rate (High to Low)</option>
            <option value="pickRate-asc">Pick Rate (Low to High)</option>
            <option value="banRate-desc">Ban Rate (High to Low)</option>
            <option value="tier-desc">Tier (Best First)</option>
          </select>
        </div>

        {/* Filter Options */}
        <div className={`mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 ${showFilters ? 'block' : 'hidden md:grid'}`}>
          {/* Role Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Role</label>
            <div className="grid grid-cols-4 gap-2">
              {roles.map((role) => (
                <button
                  key={role}
                  onClick={() => setFilter({ ...filter, role })}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter.role === role
                      ? 'bg-primary-600 text-white'
                      : 'bg-dark-50 text-gray-400 hover:bg-dark-100'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Lane Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Lane</label>
            <div className="grid grid-cols-3 gap-2">
              {lanes.map((lane) => (
                <button
                  key={lane}
                  onClick={() => setFilter({ ...filter, lane })}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter.lane === lane
                      ? 'bg-primary-600 text-white'
                      : 'bg-dark-50 text-gray-400 hover:bg-dark-100'
                  }`}
                >
                  {formatLaneLabel(lane)}
                </button>
              ))}
            </div>
          </div>

          {/* Tier Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Tier</label>
            <div className="grid grid-cols-4 gap-2">
              {tiers.map((tier) => (
                <button
                  key={tier}
                  onClick={() => setFilter({ ...filter, tier: tier as any })}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter.tier === tier
                      ? 'bg-primary-600 text-white'
                      : 'bg-dark-50 text-gray-400 hover:bg-dark-100'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="mt-4 flex items-center space-x-2">
            <span className="text-sm text-gray-400">Active filters:</span>
            <button
              onClick={resetFilters}
              className="flex items-center space-x-1 px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/20 text-sm"
            >
              <X className="w-3 h-3" />
              <span>Clear all</span>
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-gray-400">
          Showing <span className="text-white font-semibold">{filteredAndSortedHeroes.length}</span> of {heroes?.length || 0} heroes
        </p>
      </div>

      {/* Heroes Grid */}
      {filteredAndSortedHeroes.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg mb-4">No heroes found matching your filters</p>
          <button onClick={resetFilters} className="btn-primary">
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredAndSortedHeroes.map((hero) => (
            <HeroCard key={hero.heroId} hero={hero} />
          ))}
        </div>
      )}
    </div>
  );
}
