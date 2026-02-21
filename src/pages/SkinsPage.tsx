import { useState, useMemo, useEffect } from 'react';
import { Search, X, ChevronLeft, ChevronRight, ChevronDown, AlertCircle, Users, Grid3x3, List, Download } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { useHeroes } from '../hooks/useHeroes';
import { Loading } from '../components/ui/Loading';
import { motion, AnimatePresence } from 'framer-motion';
import type { Skin } from '../types/hero';

type ViewMode = 'series' | 'all';

interface SkinWithHero extends Skin {
  hero: {
    name: string;
    heroId: number;
    icon: string;
  };
}

interface SeriesData {
  name: string;
  skins: SkinWithHero[];
  coverImage: string;
}

const TIER_ORDER = ['Legendary', 'Epic', 'Limited', 'Rare', 'Common', 'No Tier'];
const ITEMS_PER_PAGE = 48;

export function SkinsPage() {
  const { data: heroes, isLoading } = useHeroes();
  const [viewMode, setViewMode] = useState<ViewMode>('series');
  const [selectedSeries, setSelectedSeries] = useState<SeriesData | null>(null);
  const [selectedSkinIndex, setSelectedSkinIndex] = useState<number>(0);
  const [selectedSkin, setSelectedSkin] = useState<SkinWithHero | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHero, setSelectedHero] = useState<string>('');
  const [selectedTier, setSelectedTier] = useState<string>('');
  const [selectedSeriesFilter, setSelectedSeriesFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);

  // All skins with hero info
  const allSkinsData = useMemo(() => {
    if (!heroes) return [];
    const skins: SkinWithHero[] = [];
    heroes.forEach((hero) => {
      hero.skins.forEach((skin) => {
        skins.push({
          ...skin,
          hero: {
            name: hero.name,
            heroId: hero.heroId,
            icon: hero.icon,
          },
        });
      });
    });
    return skins;
  }, [heroes]);

  // Group skins by tier
  const skinsByTier = useMemo(() => {
    if (!allSkinsData.length) return [];
    const tierMap = new Map<string, SkinWithHero[]>();
    allSkinsData.forEach((skin) => {
      const tier = skin.skinTier || 'No Tier';
      if (!tierMap.has(tier)) tierMap.set(tier, []);
      tierMap.get(tier)!.push(skin);
    });
    return TIER_ORDER
      .map(tier => ({ tier, skins: tierMap.get(tier) || [] }))
      .filter(group => group.skins.length > 0);
  }, [allSkinsData]);

  // Filter skins
  const filteredSkinsByTier = useMemo(() => {
    if (viewMode !== 'all') return skinsByTier;
    return skinsByTier.map(group => ({
      tier: group.tier,
      skins: group.skins.filter(skin => {
        const matchesSearch = !searchQuery ||
          skin.skinName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          skin.hero.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesHero = !selectedHero || skin.hero.name === selectedHero;
        const matchesTier = !selectedTier || (skin.skinTier || 'No Tier') === selectedTier;
        const matchesSeries = !selectedSeriesFilter || skin.skinSeries === selectedSeriesFilter;
        return matchesSearch && matchesHero && matchesTier && matchesSeries;
      })
    })).filter(group => group.skins.length > 0);
  }, [skinsByTier, searchQuery, selectedHero, selectedTier, selectedSeriesFilter, viewMode]);

  // Group skins by series
  const seriesData = useMemo(() => {
    if (!heroes) return [];
    const seriesMap = new Map<string, SkinWithHero[]>();
    heroes.forEach((hero) => {
      hero.skins.forEach((skin) => {
        const series = skin.skinSeries?.trim();
        if (series) {
          if (!seriesMap.has(series)) seriesMap.set(series, []);
          seriesMap.get(series)!.push({
            ...skin,
            hero: { name: hero.name, heroId: hero.heroId, icon: hero.icon },
          });
        }
      });
    });
    return Array.from(seriesMap.entries())
      .map(([name, skins]) => ({
        name,
        skins,
        coverImage: skins[0]?.skinCover || skins[0]?.skinImage || '',
      }))
      .sort((a, b) => b.skins.length - a.skins.length);
  }, [heroes]);

  // Filter series by search
  const filteredSeries = useMemo(() => {
    if (!searchQuery || viewMode !== 'series') return seriesData;
    return seriesData.filter((series) =>
      series.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [seriesData, searchQuery, viewMode]);

  // Get unique options for filters
  const heroOptions = useMemo(() => heroes?.map(h => h.name).sort() || [], [heroes]);
  const seriesOptions = useMemo(() => {
    const series = new Set(allSkinsData.map(s => s.skinSeries).filter(Boolean));
    return Array.from(series).sort() as string[];
  }, [allSkinsData]);

  // Paginate skins
  const paginatedSkinsByTier = useMemo(() => {
    if (viewMode !== 'all') return filteredSkinsByTier;
    const allFilteredSkins = filteredSkinsByTier.flatMap(group =>
      group.skins.map(skin => ({ ...skin, tier: group.tier }))
    );
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedSkins = allFilteredSkins.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    const tierMap = new Map<string, SkinWithHero[]>();
    paginatedSkins.forEach((skin) => {
      const tier = skin.tier;
      if (!tierMap.has(tier)) tierMap.set(tier, []);
      tierMap.get(tier)!.push(skin);
    });
    return TIER_ORDER
      .map(tier => ({ tier, skins: tierMap.get(tier) || [] }))
      .filter(group => group.skins.length > 0);
  }, [filteredSkinsByTier, currentPage, viewMode]);

  const totalPages = useMemo(() => {
    if (viewMode !== 'all') return 1;
    const totalSkins = filteredSkinsByTier.reduce((sum, group) => sum + group.skins.length, 0);
    return Math.ceil(totalSkins / ITEMS_PER_PAGE);
  }, [filteredSkinsByTier, viewMode]);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, selectedHero, selectedTier, selectedSeriesFilter]);

  const downloadJSON = () => {
    const jsonData = JSON.stringify(allSkinsData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hok-skins-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const stats = useMemo(() => {
    if (!heroes) return { total: 0, withSeries: 0, withoutSeries: 0, completionRate: 0 };
    const totalSkins = heroes.reduce((sum, h) => sum + h.skins.length, 0);
    const withSeries = heroes.reduce((sum, h) =>
      sum + h.skins.filter(s => s.skinSeries && s.skinSeries.trim()).length, 0
    );
    return {
      total: totalSkins,
      withSeries,
      withoutSeries: totalSkins - withSeries,
      completionRate: Math.round((withSeries / totalSkins) * 100)
    };
  }, [heroes]);

  const hasActiveFilters = searchQuery || selectedHero || selectedTier || selectedSeriesFilter;

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedHero('');
    setSelectedTier('');
    setSelectedSeriesFilter('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading message="Loading skins..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-400">
      {/* Header */}
      <section className="pt-28 pb-8 border-b border-white/5">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-3">
                  Skins
                </h1>
                <p className="text-gray-400 text-lg">
                  {viewMode === 'series'
                    ? `Explore ${seriesData.length} skin collections`
                    : `Browse all ${stats.total} skins`
                  }
                </p>
              </div>
              <button
                onClick={downloadJSON}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-sm transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export JSON</span>
              </button>
            </div>

            {/* Stats Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
                {stats.withSeries} categorized
              </span>
              <span className="px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-lg text-orange-400 text-sm">
                {stats.withoutSeries} uncategorized
              </span>
              <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 text-sm">
                {stats.completionRate}% complete
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contribution Banner */}
      {stats.withoutSeries > 0 && (
        <section className="py-4 border-b border-white/5">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="flex items-center gap-4 p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-gray-300">
                  <span className="text-white font-medium">{stats.withoutSeries} skins</span> are missing series data.
                </p>
              </div>
              <Link
                to="/contribute"
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Users className="w-4 h-4" />
                <span>Contribute</span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Controls */}
      <section className="sticky top-20 z-30 bg-dark-400/95 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
            {/* View Mode Tabs */}
            <div className="flex items-center gap-1 bg-dark-300/50 p-1 rounded-xl border border-white/5">
              <button
                onClick={() => setViewMode('series')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'series'
                    ? 'bg-white text-dark-400'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Grid3x3 className="w-4 h-4" />
                Series
              </button>
              <button
                onClick={() => setViewMode('all')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'all'
                    ? 'bg-white text-dark-400'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <List className="w-4 h-4" />
                All Skins
              </button>
            </div>

            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder={viewMode === 'series' ? 'Search series...' : 'Search skins or heroes...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-dark-300/50 border border-white/10 rounded-xl focus:outline-none focus:border-primary-500/50 focus:bg-dark-300 text-white placeholder-gray-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>

            {/* Filters (All Skins View) */}
            {viewMode === 'all' && (
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <select
                    value={selectedHero}
                    onChange={(e) => setSelectedHero(e.target.value)}
                    className="appearance-none px-4 py-3 pr-10 bg-dark-300/50 border border-white/10 rounded-xl focus:outline-none focus:border-primary-500/50 text-white text-sm cursor-pointer"
                  >
                    <option value="">All Heroes</option>
                    {heroOptions.map((hero) => (
                      <option key={hero} value={hero}>{hero}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                <div className="relative">
                  <select
                    value={selectedTier}
                    onChange={(e) => setSelectedTier(e.target.value)}
                    className="appearance-none px-4 py-3 pr-10 bg-dark-300/50 border border-white/10 rounded-xl focus:outline-none focus:border-primary-500/50 text-white text-sm cursor-pointer"
                  >
                    <option value="">All Tiers</option>
                    {TIER_ORDER.map((tier) => (
                      <option key={tier} value={tier}>{tier}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                <div className="relative">
                  <select
                    value={selectedSeriesFilter}
                    onChange={(e) => setSelectedSeriesFilter(e.target.value)}
                    className="appearance-none px-4 py-3 pr-10 bg-dark-300/50 border border-white/10 rounded-xl focus:outline-none focus:border-primary-500/50 text-white text-sm cursor-pointer"
                  >
                    <option value="">All Series</option>
                    {seriesOptions.map((series) => (
                      <option key={series} value={series}>{series}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1.5 px-3 py-2.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <X className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-8">
        <div className="container mx-auto px-6 lg:px-8">
          {/* Series View */}
          {viewMode === 'series' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
            >
              {filteredSeries.map((series, index) => (
                <motion.button
                  key={series.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(index * 0.02, 0.3) }}
                  onClick={() => {
                    setSelectedSeries(series);
                    setSelectedSkinIndex(0);
                  }}
                  className="group relative overflow-hidden rounded-2xl bg-dark-300/50 border border-white/5 hover:border-white/10 transition-all duration-300"
                >
                  <div className="aspect-[3/4] relative overflow-hidden">
                    <img
                      src={series.coverImage}
                      alt={series.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/400x600?text=Series';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-400 via-dark-400/30 to-transparent" />

                    {/* Series info */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="font-semibold text-white text-sm leading-tight mb-1 line-clamp-2 group-hover:text-primary-400 transition-colors">
                        {series.name}
                      </h3>
                      <p className="text-xs text-gray-400">
                        {series.skins.length} {series.skins.length === 1 ? 'skin' : 'skins'}
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}

          {/* All Skins View */}
          {viewMode === 'all' && (
            <div className="space-y-10">
              {paginatedSkinsByTier.map((tierGroup) => (
                <motion.div
                  key={tierGroup.tier}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <h2 className="text-xl font-semibold text-white">{tierGroup.tier}</h2>
                    <div className="h-px flex-1 bg-white/5" />
                    <span className="text-sm text-gray-500">{tierGroup.skins.length} skins</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {tierGroup.skins.map((skin, idx) => (
                      <motion.button
                        key={`${skin.hero.heroId}-${idx}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: Math.min(idx * 0.02, 0.2) }}
                        onClick={() => setSelectedSkin(skin)}
                        className="group relative overflow-hidden rounded-2xl bg-dark-300/50 border border-white/5 hover:border-white/10 transition-all duration-300 text-left"
                      >
                        <div className="aspect-[3/4] relative overflow-hidden">
                          <img
                            src={skin.skinCover || skin.skinImage}
                            alt={skin.skinName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/300x400?text=Skin';
                            }}
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-dark-400 via-dark-400/20 to-transparent" />

                          {/* Skin info */}
                          <div className="absolute bottom-0 left-0 right-0 p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <img
                                src={skin.hero.icon}
                                alt={skin.hero.name}
                                className="w-5 h-5 rounded-full"
                              />
                              <span className="text-xs text-gray-400 truncate">{skin.hero.name}</span>
                            </div>
                            <h3 className="text-sm font-medium text-white line-clamp-2 group-hover:text-primary-400 transition-colors">
                              {skin.skinName}
                            </h3>
                            {skin.skinSeries && (
                              <p className="text-xs text-gray-500 mt-1 truncate">{skin.skinSeries}</p>
                            )}
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-8">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2.5 bg-dark-300/50 border border-white/10 rounded-xl text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-dark-300 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) pageNum = i + 1;
                      else if (currentPage <= 3) pageNum = i + 1;
                      else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                      else pageNum = currentPage - 2 + i;

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${
                            currentPage === pageNum
                              ? 'bg-white text-dark-400'
                              : 'bg-dark-300/50 border border-white/10 text-gray-400 hover:text-white hover:bg-dark-300'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2.5 bg-dark-300/50 border border-white/10 rounded-xl text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-dark-300 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  <span className="ml-4 text-sm text-gray-500">
                    Page {currentPage} of {totalPages}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {((viewMode === 'series' && filteredSeries.length === 0) ||
            (viewMode === 'all' && filteredSkinsByTier.length === 0)) && (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg mb-4">
                No {viewMode === 'series' ? 'series' : 'skins'} found
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-white text-dark-400 rounded-xl font-medium hover:bg-gray-100 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Individual Skin Modal */}
      <AnimatePresence>
        {selectedSkin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={() => setSelectedSkin(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-dark-300 rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedSkin(null)}
                className="absolute top-4 right-4 z-10 p-2.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={selectedSkin.skinCover || selectedSkin.skinImage}
                  alt={selectedSkin.skinName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-300 via-transparent to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={selectedSkin.hero.icon}
                      alt={selectedSkin.hero.name}
                      className="w-10 h-10 rounded-full border-2 border-white/20"
                    />
                    <span className="text-gray-300">{selectedSkin.hero.name}</span>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-3">{selectedSkin.skinName}</h2>
                  <div className="flex flex-wrap gap-2">
                    {selectedSkin.skinTier && (
                      <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-300 text-sm">
                        {selectedSkin.skinTier}
                      </span>
                    )}
                    {selectedSkin.skinSeries && (
                      <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 text-sm">
                        {selectedSkin.skinSeries}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Series Modal */}
      <AnimatePresence>
        {selectedSeries && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={() => setSelectedSeries(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-dark-300 rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedSeries(null)}
                className="absolute top-4 right-4 z-10 p-2.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              {/* Main Image */}
              <div className="relative aspect-[16/9] overflow-hidden rounded-t-2xl">
                <img
                  src={selectedSeries.skins[selectedSkinIndex]?.skinCover || selectedSeries.skins[selectedSkinIndex]?.skinImage}
                  alt={selectedSeries.skins[selectedSkinIndex]?.skinName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-300 via-transparent to-transparent" />

                {/* Navigation */}
                {selectedSeries.skins.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSkinIndex((prev) => (prev > 0 ? prev - 1 : selectedSeries.skins.length - 1));
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-white" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSkinIndex((prev) => (prev < selectedSeries.skins.length - 1 ? prev + 1 : 0));
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-white" />
                    </button>
                  </>
                )}

                {/* Skin Info */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {selectedSeries.skins[selectedSkinIndex]?.skinName}
                  </h2>
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedSeries.skins[selectedSkinIndex]?.hero.icon}
                      alt={selectedSeries.skins[selectedSkinIndex]?.hero.name}
                      className="w-8 h-8 rounded-full border-2 border-white/20"
                    />
                    <span className="text-gray-300">
                      {selectedSeries.skins[selectedSkinIndex]?.hero.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Thumbnails */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">{selectedSeries.name}</h3>
                  <span className="text-sm text-gray-500">
                    {selectedSkinIndex + 1} of {selectedSeries.skins.length}
                  </span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                  {selectedSeries.skins.map((skin, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedSkinIndex(index)}
                      className={`aspect-[3/4] overflow-hidden rounded-lg transition-all ${
                        selectedSkinIndex === index
                          ? 'ring-2 ring-primary-500 opacity-100'
                          : 'opacity-50 hover:opacity-80'
                      }`}
                    >
                      <img
                        src={skin.skinCover || skin.skinImage}
                        alt={skin.skinName}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
