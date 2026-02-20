import { useState, useMemo, useEffect, useRef } from 'react';
import { Search, X, ChevronLeft, ChevronRight, AlertCircle, Users, Grid3x3, List, Filter, Download } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { useHeroes } from '../hooks/useHeroes';
import { Loading } from '../components/ui/Loading';
import type { Hero, Skin } from '../types/hero';
import { animate, stagger } from 'animejs';

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
  const seriesGridRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

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
      if (!tierMap.has(tier)) {
        tierMap.set(tier, []);
      }
      tierMap.get(tier)!.push(skin);
    });

    // Sort by tier order
    return TIER_ORDER
      .map(tier => ({
        tier,
        skins: tierMap.get(tier) || []
      }))
      .filter(group => group.skins.length > 0);
  }, [allSkinsData]);

  // Filter skins by search and filters in all mode
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
          if (!seriesMap.has(series)) {
            seriesMap.set(series, []);
          }
          seriesMap.get(series)!.push({
            ...skin,
            hero: {
              name: hero.name,
              heroId: hero.heroId,
              icon: hero.icon,
            },
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

  // Get unique heroes for filter
  const heroOptions = useMemo(() => {
    if (!heroes) return [];
    return heroes
      .map(h => h.name)
      .sort();
  }, [heroes]);

  // Get unique series for filter
  const seriesOptions = useMemo(() => {
    if (!allSkinsData) return [];
    const series = new Set(allSkinsData.map(s => s.skinSeries).filter(Boolean));
    return Array.from(series).sort() as string[];
  }, [allSkinsData]);

  // Paginate skins in all view
  const paginatedSkinsByTier = useMemo(() => {
    if (viewMode !== 'all') return filteredSkinsByTier;

    // Flatten all skins across tiers
    const allFilteredSkins = filteredSkinsByTier.flatMap(group =>
      group.skins.map(skin => ({ ...skin, tier: group.tier }))
    );

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedSkins = allFilteredSkins.slice(startIndex, endIndex);

    // Group back by tier
    const tierMap = new Map<string, SkinWithHero[]>();
    paginatedSkins.forEach((skin) => {
      const tier = skin.tier;
      if (!tierMap.has(tier)) {
        tierMap.set(tier, []);
      }
      tierMap.get(tier)!.push(skin);
    });

    return TIER_ORDER
      .map(tier => ({
        tier,
        skins: tierMap.get(tier) || []
      }))
      .filter(group => group.skins.length > 0);
  }, [filteredSkinsByTier, currentPage, viewMode]);

  // Total pages calculation
  const totalPages = useMemo(() => {
    if (viewMode !== 'all') return 1;
    const totalSkins = filteredSkinsByTier.reduce((sum, group) => sum + group.skins.length, 0);
    return Math.ceil(totalSkins / ITEMS_PER_PAGE);
  }, [filteredSkinsByTier, viewMode]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedHero, selectedTier, selectedSeriesFilter]);

  // Download JSON function
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

  // Calculate completion stats
  const stats = useMemo(() => {
    if (!heroes) return { total: 0, withSeries: 0, withoutSeries: 0 };

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

  // Animate series cards when they load
  useEffect(() => {
    if (seriesGridRef.current && (viewMode === 'series' ? filteredSeries.length > 0 : filteredSkinsByTier.length > 0)) {
      const cards = seriesGridRef.current.querySelectorAll('.series-card, .tier-section');
      if (cards.length > 0) {
        animate(cards, {
          opacity: [0, 1],
          translateY: [60, 0],
          scale: [0.8, 1],
          delay: stagger(80, { start: 100 }),
          duration: 600,
          easing: 'outExpo',
        });
      }
    }
  }, [filteredSeries, filteredSkinsByTier, viewMode]);

  // Animate modal when it opens
  useEffect(() => {
    if (selectedSeries && modalRef.current) {
      animate(modalRef.current, {
        opacity: [0, 1],
        duration: 300,
        easing: 'outQuad',
      });

      animate(modalRef.current.querySelector('.modal-content'), {
        opacity: [0, 1],
        scale: [0.8, 1],
        duration: 500,
        delay: 100,
        easing: 'outExpo',
      });

      animate(modalRef.current.querySelectorAll('.modal-thumbnail'), {
        opacity: [0, 1],
        translateY: [20, 0],
        delay: stagger(30, { start: 300 }),
        duration: 400,
        easing: 'outExpo',
      });
    }
  }, [selectedSeries]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Loading message="Loading skins..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Community Contribution Banner */}
      {stats.withoutSeries > 0 && (
        <div className="mb-8 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-1">Data Incomplete - Help Us Complete It!</h3>
              <p className="text-gray-300 text-sm mb-3">
                {stats.withoutSeries} of {stats.total} skins ({100 - stats.completionRate}%) don't have series information yet.
                You can help by contributing missing data!
              </p>
              <Link
                to="/contribute"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Users className="w-4 h-4" />
                Contribute Data
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-4xl md:text-5xl font-display font-bold">
            Skin Gallery
          </h1>
          <button
            onClick={downloadJSON}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Download JSON
          </button>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <p className="text-gray-400 text-lg">
            {viewMode === 'series'
              ? `Explore ${seriesData.length} exclusive skin collections`
              : `Browse all ${stats.total} skins`
            }
          </p>
          <div className="flex items-center gap-2 text-sm">
            <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-green-400">
              {stats.withSeries} categorized
            </div>
            <div className="px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-full text-orange-400">
              {stats.withoutSeries} uncategorized
            </div>
            <div className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-400">
              {stats.completionRate}% complete
            </div>
          </div>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="inline-flex bg-dark-200 border border-white/10 rounded-lg p-1">
          <button
            onClick={() => setViewMode('series')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
              viewMode === 'series'
                ? 'bg-primary-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Grid3x3 className="w-4 h-4" />
            By Series
          </button>
          <button
            onClick={() => setViewMode('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
              viewMode === 'all'
                ? 'bg-primary-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <List className="w-4 h-4" />
            All Skins
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-auto sm:min-w-[300px]">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={viewMode === 'series' ? 'Search series...' : 'Search skins...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-dark-50 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 text-white placeholder-gray-500"
          />
        </div>
      </div>

      {/* Filters for All Skins View */}
      {viewMode === 'all' && (
        <div className="mb-6 flex flex-wrap gap-3">
          <div className="flex items-center gap-2 text-gray-400">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filters:</span>
          </div>

          {/* Hero Filter */}
          <select
            value={selectedHero}
            onChange={(e) => setSelectedHero(e.target.value)}
            className="px-4 py-2 bg-dark-200 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 text-white text-sm"
          >
            <option value="">All Heroes</option>
            {heroOptions.map((hero) => (
              <option key={hero} value={hero}>{hero}</option>
            ))}
          </select>

          {/* Tier Filter */}
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="px-4 py-2 bg-dark-200 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 text-white text-sm"
          >
            <option value="">All Tiers</option>
            {TIER_ORDER.map((tier) => (
              <option key={tier} value={tier}>{tier}</option>
            ))}
          </select>

          {/* Series Filter */}
          <select
            value={selectedSeriesFilter}
            onChange={(e) => setSelectedSeriesFilter(e.target.value)}
            className="px-4 py-2 bg-dark-200 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 text-white text-sm"
          >
            <option value="">All Series</option>
            {seriesOptions.map((series) => (
              <option key={series} value={series}>{series}</option>
            ))}
          </select>

          {/* Clear Filters */}
          {(selectedHero || selectedTier || selectedSeriesFilter || searchQuery) && (
            <button
              onClick={() => {
                setSelectedHero('');
                setSelectedTier('');
                setSelectedSeriesFilter('');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm font-medium hover:bg-red-500/30 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      )}

      {/* Series View */}
      {viewMode === 'series' && (
        <div ref={seriesGridRef} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredSeries.map((series) => (
            <button
              key={series.name}
              onClick={() => {
                setSelectedSeries(series);
                setSelectedSkinIndex(0);
              }}
              className="series-card group relative overflow-hidden rounded-xl bg-dark-200 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary-500/20 opacity-0"
            >
              <div className="aspect-[3/4] relative overflow-hidden">
                <img
                  src={series.coverImage}
                  alt={series.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/400x600?text=Series';
                  }}
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                {/* Series info */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-lg font-bold text-white mb-1">{series.name}</h3>
                  <p className="text-sm text-gray-300">
                    {series.skins.length} {series.skins.length === 1 ? 'Skin' : 'Skins'}
                  </p>
                </div>

                {/* Hover badge */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-primary-500/90 px-4 py-2 rounded-full text-white text-sm font-semibold">
                    View Series
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* All Skins View - Grouped by Tier */}
      {viewMode === 'all' && (
        <>
          <div ref={seriesGridRef} className="space-y-8">
            {paginatedSkinsByTier.map((tierGroup) => (
              <div key={tierGroup.tier} className="tier-section opacity-0">
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-2xl font-bold">{tierGroup.tier}</h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent" />
                  <span className="text-gray-400 text-sm">{tierGroup.skins.length} skins</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {tierGroup.skins.map((skin, idx) => (
                    <button
                      key={`${skin.hero.heroId}-${idx}`}
                      onClick={() => setSelectedSkin(skin)}
                      className="group relative overflow-hidden rounded-lg bg-dark-200 transition-all hover:scale-105 hover:shadow-xl cursor-pointer text-left"
                    >
                      <div className="aspect-[3/4] relative overflow-hidden">
                        <img
                          src={skin.skinCover || skin.skinImage}
                          alt={skin.skinName}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/300x400?text=Skin';
                          }}
                          loading="lazy"
                        />
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                        {/* Hover badge */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="bg-primary-500/90 px-3 py-1.5 rounded-full text-white text-xs font-semibold">
                            View Details
                          </div>
                        </div>

                        {/* Skin info */}
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <img
                              src={skin.hero.icon}
                              alt={skin.hero.name}
                              className="w-6 h-6 rounded-full border-2 border-white/50"
                            />
                            <span className="text-xs text-gray-300">{skin.hero.name}</span>
                          </div>
                          <h3 className="text-sm font-bold text-white line-clamp-2">{skin.skinName}</h3>
                          {skin.skinSeries && (
                            <p className="text-xs text-primary-400 mt-1 line-clamp-1">{skin.skinSeries}</p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-100 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                        currentPage === pageNum
                          ? 'bg-primary-500 text-white'
                          : 'bg-dark-200 border border-white/10 text-gray-400 hover:bg-dark-100 hover:text-white'
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
                className="px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-100 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <span className="ml-4 text-gray-400 text-sm">
                Page {currentPage} of {totalPages}
              </span>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {((viewMode === 'series' && filteredSeries.length === 0) ||
        (viewMode === 'all' && filteredSkinsByTier.length === 0)) && (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">
            No {viewMode === 'series' ? 'series' : 'skins'} found
            {(searchQuery || selectedHero || selectedTier || selectedSeriesFilter) && ' matching your filters'}
          </p>
        </div>
      )}

      {/* Individual Skin Modal */}
      {selectedSkin && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={() => setSelectedSkin(null)}
        >
          <div
            className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden bg-dark-300 rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedSkin(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Main image */}
            <div className="relative aspect-[16/9] overflow-hidden">
              <img
                src={selectedSkin.skinCover || selectedSkin.skinImage}
                alt={selectedSkin.skinName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/1200x675?text=Skin';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

              {/* Skin info overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={selectedSkin.hero.icon}
                    alt={selectedSkin.hero.name}
                    className="w-12 h-12 rounded-full border-2 border-white"
                  />
                  <div>
                    <p className="text-gray-300 text-sm">{selectedSkin.hero.name}</p>
                    <h2 className="text-4xl font-bold text-white">
                      {selectedSkin.skinName}
                    </h2>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  {selectedSkin.skinTier && (
                    <div className="px-3 py-1 bg-purple-500/30 border border-purple-500/50 rounded-full text-purple-300 text-sm font-medium">
                      {selectedSkin.skinTier}
                    </div>
                  )}
                  {selectedSkin.skinSeries && (
                    <div className="px-3 py-1 bg-blue-500/30 border border-blue-500/50 rounded-full text-blue-300 text-sm font-medium">
                      {selectedSkin.skinSeries}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Additional info */}
            {(selectedSkin.skinTier || selectedSkin.skinSeries) && (
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Hero</p>
                    <p className="text-white font-semibold">{selectedSkin.hero.name}</p>
                  </div>
                  {selectedSkin.skinTier && (
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Tier</p>
                      <p className="text-white font-semibold">{selectedSkin.skinTier}</p>
                    </div>
                  )}
                  {selectedSkin.skinSeries && (
                    <div className="col-span-2">
                      <p className="text-gray-400 text-sm mb-1">Series</p>
                      <p className="text-white font-semibold">{selectedSkin.skinSeries}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Series Modal */}
      {selectedSeries && (
        <div
          ref={modalRef}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 opacity-0"
          onClick={() => setSelectedSeries(null)}
        >
          <div
            className="modal-content relative w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-dark-300 rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedSeries(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Main image */}
            <div className="relative aspect-[16/9] overflow-hidden rounded-t-2xl">
              <img
                src={selectedSeries.skins[selectedSkinIndex]?.skinCover || selectedSeries.skins[selectedSkinIndex]?.skinImage}
                alt={selectedSeries.skins[selectedSkinIndex]?.skinName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/1200x675?text=Skin';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

              {/* Navigation arrows */}
              {selectedSeries.skins.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSkinIndex((prev) => (prev > 0 ? prev - 1 : selectedSeries.skins.length - 1));
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6 text-white" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSkinIndex((prev) => (prev < selectedSeries.skins.length - 1 ? prev + 1 : 0));
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                  >
                    <ChevronRight className="w-6 h-6 text-white" />
                  </button>
                </>
              )}

              {/* Skin info overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <h2 className="text-4xl font-bold text-white mb-2">
                  {selectedSeries.skins[selectedSkinIndex]?.skinName}
                </h2>
                <div className="flex items-center gap-3">
                  <img
                    src={selectedSeries.skins[selectedSkinIndex]?.hero.icon}
                    alt={selectedSeries.skins[selectedSkinIndex]?.hero.name}
                    className="w-10 h-10 rounded-full border-2 border-white"
                  />
                  <span className="text-lg text-gray-200">
                    {selectedSeries.skins[selectedSkinIndex]?.hero.name}
                  </span>
                </div>
              </div>
            </div>

            {/* Thumbnails */}
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">
                {selectedSeries.name}
                <span className="text-gray-400 text-base ml-2">
                  ({selectedSeries.skins.length} {selectedSeries.skins.length === 1 ? 'Skin' : 'Skins'})
                </span>
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                {selectedSeries.skins.map((skin, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedSkinIndex(index)}
                    className={`modal-thumbnail group relative aspect-[3/4] overflow-hidden rounded-lg transition-all opacity-0 ${
                      selectedSkinIndex === index
                        ? 'ring-4 ring-primary-500 scale-105'
                        : 'hover:scale-105 hover:ring-2 hover:ring-white/50'
                    }`}
                  >
                    <img
                      src={skin.skinCover || skin.skinImage}
                      alt={skin.skinName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/200x300?text=Skin';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <p className="text-xs text-white font-semibold line-clamp-2">{skin.skinName}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
