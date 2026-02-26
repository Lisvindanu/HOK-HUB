import { useState, useEffect } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchAdjustments, type HeroAdjustment } from '../api/heroes';
import { Loading } from '../components/ui/Loading';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  Filter,
  Calendar,
  Zap,
  Target,
  Ban,
  X,
  ArrowRight
} from 'lucide-react';

type FilterType = 'all' | 'buffs' | 'nerfs' | 'changes';

// Seasons available in the API (S6 is earliest we have data for)
const FIRST_AVAILABLE_SEASON = 6;


export function PatchNotesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedHero, setSelectedHero] = useState<HeroAdjustment | null>(null);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | null>(null); // null = current
  // Track the latest (max) season number so tabs don't shrink when browsing old seasons
  const [latestSeasonNum, setLatestSeasonNum] = useState<number | null>(null);

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['adjustments', selectedSeasonId],
    queryFn: () => fetchAdjustments(selectedSeasonId ?? undefined),
    placeholderData: keepPreviousData,
  });

  // Lock in the latest season number from the initial/current-season load only
  useEffect(() => {
    if (data && selectedSeasonId === null) {
      const num = parseInt(data.season.id, 10);
      setLatestSeasonNum(prev => (prev === null || num > prev) ? num : prev);
    }
  }, [data, selectedSeasonId]);

  // Build season tabs using the locked-in latest season, not the currently-viewed season
  const maxSeasonNum = latestSeasonNum ?? (data ? parseInt(data.season.id, 10) : null);
  const availableSeasons: { id: string; name: string }[] = maxSeasonNum
    ? Array.from({ length: maxSeasonNum - FIRST_AVAILABLE_SEASON + 1 }, (_, i) => {
        const num = FIRST_AVAILABLE_SEASON + i;
        return { id: String(num), name: `S${num}` };
      }).reverse() // newest first
    : [];

  // Extract version name from any adjustment that has it
  const versionName = data?.adjustments.find(a => a.versionName)?.versionName ?? '';

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 md:px-6 lg:px-8 pt-20 md:pt-28 pb-12">
        <Loading message="Loading patch notes..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-dark-400">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 pt-20 md:pt-28 pb-12">
          <div className="text-center text-red-400">
            Failed to load patch notes. Please try again later.
          </div>
        </div>
      </div>
    );
  }

  // Filter adjustments
  const filteredAdjustments = data.adjustments.filter((adj) => {
    const matchesSearch = adj.heroName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterType === 'all' ||
      (filterType === 'buffs' && adj.type === 'Stat Buffs') ||
      (filterType === 'nerfs' && adj.type === 'Stat Nerfs') ||
      (filterType === 'changes' && adj.type === 'Stat Changes');
    return matchesSearch && matchesFilter;
  });

  // Count by type
  const buffCount = data.adjustments.filter(a => a.type === 'Stat Buffs').length;
  const nerfCount = data.adjustments.filter(a => a.type === 'Stat Nerfs').length;
  const changeCount = data.adjustments.filter(a => a.type === 'Stat Changes').length;

  return (
    <div className="min-h-screen bg-dark-400">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 pt-20 md:pt-28 pb-24 md:pb-12">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <Calendar className="w-4 h-4" />
            <span>Season {data.season.name}</span>
            {versionName && (
              <>
                <span className="text-gray-600">|</span>
                <span className="text-primary-400">v{versionName}</span>
              </>
            )}
            <span className="text-gray-600">|</span>
            <span>{new Date(data.scrapedAt).toLocaleDateString()}</span>
            {isFetching && (
              <span className="w-3.5 h-3.5 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
            )}
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-bold mb-2 md:mb-4">
            Patch Notes
          </h1>
          <p className="text-gray-400 text-sm md:text-lg mb-4">
            Hero balance changes by season
          </p>

          {/* Season Selector */}
          {availableSeasons.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {availableSeasons.map((season) => {
                  const isActive = selectedSeasonId === season.id ||
                    (selectedSeasonId === null && season.id === String(maxSeasonNum));
                  return (
                    <button
                      key={season.id}
                      onClick={() => {
                        setSelectedSeasonId(season.id === String(maxSeasonNum) ? null : season.id);
                        setSearchQuery('');
                        setFilterType('all');
                      }}
                      className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                          : 'bg-dark-200 border border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                      }`}
                    >
                      {season.name}
                      {season.id === String(maxSeasonNum) && (
                        <span className={`ml-1.5 text-xs ${isActive ? 'text-white/70' : 'text-primary-400'}`}>
                          ●
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Stats Summary - Desktop */}
        <div className="hidden md:grid grid-cols-4 gap-4 mb-8">
          <div className="bg-dark-200 border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary-500/20 rounded-xl">
                <Zap className="w-6 h-6 text-primary-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.adjustments.length}</p>
                <p className="text-sm text-gray-400">Total Changes</p>
              </div>
            </div>
          </div>
          <div className="bg-dark-200 border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-400">{buffCount}</p>
                <p className="text-sm text-gray-400">Buffs</p>
              </div>
            </div>
          </div>
          <div className="bg-dark-200 border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-500/20 rounded-xl">
                <TrendingDown className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-400">{nerfCount}</p>
                <p className="text-sm text-gray-400">Nerfs</p>
              </div>
            </div>
          </div>
          <div className="bg-dark-200 border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Minus className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-400">{changeCount}</p>
                <p className="text-sm text-gray-400">Adjustments</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Summary - Mobile */}
        <div className="md:hidden grid grid-cols-3 gap-2 mb-4">
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-center">
            <TrendingUp className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-green-400">{buffCount}</p>
            <p className="text-xs text-gray-400">Buffs</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
            <TrendingDown className="w-5 h-5 text-red-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-red-400">{nerfCount}</p>
            <p className="text-xs text-gray-400">Nerfs</p>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-center">
            <Minus className="w-5 h-5 text-blue-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-blue-400">{changeCount}</p>
            <p className="text-xs text-gray-400">Changes</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search hero..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50 transition-colors"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
            <FilterButton
              active={filterType === 'all'}
              onClick={() => setFilterType('all')}
              icon={<Filter className="w-4 h-4" />}
              label="All"
              count={data.adjustments.length}
            />
            <FilterButton
              active={filterType === 'buffs'}
              onClick={() => setFilterType('buffs')}
              icon={<TrendingUp className="w-4 h-4" />}
              label="Buffs"
              count={buffCount}
              colorClass="text-green-400"
            />
            <FilterButton
              active={filterType === 'nerfs'}
              onClick={() => setFilterType('nerfs')}
              icon={<TrendingDown className="w-4 h-4" />}
              label="Nerfs"
              count={nerfCount}
              colorClass="text-red-400"
            />
            <FilterButton
              active={filterType === 'changes'}
              onClick={() => setFilterType('changes')}
              icon={<Minus className="w-4 h-4" />}
              label="Changes"
              count={changeCount}
              colorClass="text-blue-400"
            />
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-500 mb-4">
          Showing {filteredAdjustments.length} of {data.adjustments.length} heroes
        </p>

        {/* Hero Cards Grid */}
        <div className={`transition-opacity duration-200 ${isFetching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        {filteredAdjustments.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No heroes found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {filteredAdjustments.map((adjustment) => (
              <HeroAdjustmentCard
                key={adjustment.heroId}
                adjustment={adjustment}
                onClick={() => setSelectedHero(adjustment)}
              />
            ))}
          </div>
        )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedHero && (
        <HeroDetailModal
          hero={selectedHero}
          onClose={() => setSelectedHero(null)}
        />
      )}
    </div>
  );
}

interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count: number;
  colorClass?: string;
}

function FilterButton({ active, onClick, icon, label, count, colorClass }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
        active
          ? 'bg-primary-500 text-white'
          : `bg-dark-200 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 ${colorClass || ''}`
      }`}
    >
      {icon}
      <span>{label}</span>
      <span className={`px-1.5 py-0.5 rounded text-xs ${active ? 'bg-white/20' : 'bg-white/5'}`}>
        {count}
      </span>
    </button>
  );
}

interface HeroAdjustmentCardProps {
  adjustment: HeroAdjustment;
  onClick: () => void;
}

function HeroAdjustmentCard({ adjustment, onClick }: HeroAdjustmentCardProps) {
  const getTypeIcon = (type: string) => {
    if (type === 'Stat Buffs') return <TrendingUp className="w-3.5 h-3.5" />;
    if (type === 'Stat Nerfs') return <TrendingDown className="w-3.5 h-3.5" />;
    return <Minus className="w-3.5 h-3.5" />;
  };

  const getTypeColor = (type: string) => {
    if (type === 'Stat Buffs') return 'text-green-400 bg-green-500/20';
    if (type === 'Stat Nerfs') return 'text-red-400 bg-red-500/20';
    return 'text-blue-400 bg-blue-500/20';
  };

  const getTypeBorder = (type: string) => {
    if (type === 'Stat Buffs') return 'border-l-green-500';
    if (type === 'Stat Nerfs') return 'border-l-red-500';
    return 'border-l-blue-500';
  };

  const getWinRateColor = (rate: number) => {
    if (rate >= 52) return 'text-green-400';
    if (rate <= 48) return 'text-red-400';
    return 'text-gray-300';
  };

  return (
    <button
      onClick={onClick}
      className={`group w-full text-left bg-dark-200 border border-white/10 border-l-4 ${getTypeBorder(adjustment.type)} rounded-xl p-4 hover:bg-dark-100 transition-all`}
    >
      <div className="flex items-start gap-3">
        {/* Hero Icon */}
        <div className="relative flex-shrink-0">
          <img
            src={adjustment.heroIcon}
            alt={adjustment.heroName}
            className="w-14 h-14 md:w-16 md:h-16 rounded-xl object-cover bg-dark-100"
            onError={(e) => {
              e.currentTarget.src = '/hero-placeholder.png';
            }}
          />
          <div className={`absolute -bottom-1 -right-1 p-1 rounded-lg ${getTypeColor(adjustment.type)}`}>
            {getTypeIcon(adjustment.type)}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="font-bold text-white truncate group-hover:text-primary-400 transition-colors">
              {adjustment.heroName}
            </h3>
            {adjustment.skillChanges.length > 0 && (
              <span className="text-xs text-gray-500 flex-shrink-0">
                {adjustment.skillChanges.length} skill{adjustment.skillChanges.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Type Badge */}
          <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mb-2 ${getTypeColor(adjustment.type)}`}>
            {getTypeIcon(adjustment.type)}
            <span>{adjustment.type}</span>
          </div>

          {/* Short Description */}
          <p className="text-sm text-gray-400 line-clamp-2 mb-3">
            {adjustment.shortDesc}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1">
              <Target className="w-3 h-3 text-gray-500" />
              <span className={getWinRateColor(adjustment.stats.winRate)}>
                {adjustment.stats.winRate.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-gray-500" />
              <span className="text-gray-400">{adjustment.stats.pickRate.toFixed(1)}%</span>
            </div>
            <div className="flex items-center gap-1">
              <Ban className="w-3 h-3 text-gray-500" />
              <span className="text-gray-400">{adjustment.stats.banRate.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

interface HeroDetailModalProps {
  hero: HeroAdjustment;
  onClose: () => void;
}

function HeroDetailModal({ hero, onClose }: HeroDetailModalProps) {
  const getTypeIcon = (type: string) => {
    if (type === 'Stat Buffs') return <TrendingUp className="w-4 h-4" />;
    if (type === 'Stat Nerfs') return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTypeColor = (type: string) => {
    if (type === 'Stat Buffs') return 'text-green-400 bg-green-500/20';
    if (type === 'Stat Nerfs') return 'text-red-400 bg-red-500/20';
    return 'text-blue-400 bg-blue-500/20';
  };

  // Parse before/after values from description
  const parseChanges = (text: string) => {
    if (!text) return [];
    // Normalize <br> tags to newlines before splitting
    const normalized = text.replace(/<br\s*\/?>/gi, '\n');
    const lines = normalized.split('\n').filter(l => l.trim());
    const changes: { label: string; before: string; after: string }[] = [];

    let currentLabel = '';
    let beforeValue = '';

    for (const line of lines) {
      if (line.includes('Before:')) {
        const parts = line.split('Before:');
        if (parts[0].trim()) {
          currentLabel = parts[0].trim().replace(':', '');
        }
        beforeValue = parts[1]?.trim() || '';
      } else if (line.includes('Now:')) {
        const afterValue = line.split('Now:')[1]?.trim() || '';
        if (currentLabel && beforeValue) {
          changes.push({
            label: currentLabel,
            before: beforeValue,
            after: afterValue
          });
        }
        currentLabel = '';
        beforeValue = '';
      } else if (!line.includes('Before:') && !line.includes('Now:') && line.includes(':')) {
        // This might be a label line
        currentLabel = line.replace(':', '').trim();
      }
    }

    return changes;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full md:w-auto md:max-w-lg md:mx-4 max-h-[85vh] md:max-h-[80vh] bg-dark-300 border border-white/10 rounded-t-2xl md:rounded-2xl overflow-hidden animate-slide-up md:animate-fade-in">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center gap-4 p-4 md:p-5 border-b border-white/10 bg-dark-300">
          <img
            src={hero.heroIcon}
            alt={hero.heroName}
            className="w-14 h-14 md:w-16 md:h-16 rounded-xl object-cover bg-dark-100"
            onError={(e) => {
              e.currentTarget.src = '/hero-placeholder.png';
            }}
          />
          <div className="flex-1 min-w-0">
            <h2 className="text-xl md:text-2xl font-bold text-white truncate">{hero.heroName}</h2>
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium mt-1 ${getTypeColor(hero.type)}`}>
              {getTypeIcon(hero.type)}
              <span>{hero.type}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(85vh-100px)] md:max-h-[calc(80vh-100px)] p-4 md:p-5">
          {/* Short Description */}
          <p className="text-gray-300 mb-6">{hero.shortDesc}</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-dark-200 rounded-xl p-3 text-center">
              <Target className="w-5 h-5 text-gray-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{hero.stats.winRate.toFixed(1)}%</p>
              <p className="text-xs text-gray-500">Win Rate</p>
            </div>
            <div className="bg-dark-200 rounded-xl p-3 text-center">
              <Zap className="w-5 h-5 text-gray-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{hero.stats.pickRate.toFixed(1)}%</p>
              <p className="text-xs text-gray-500">Pick Rate</p>
            </div>
            <div className="bg-dark-200 rounded-xl p-3 text-center">
              <Ban className="w-5 h-5 text-gray-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{hero.stats.banRate.toFixed(1)}%</p>
              <p className="text-xs text-gray-500">Ban Rate</p>
            </div>
          </div>

          {/* Skill Changes */}
          {hero.skillChanges.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Skill Changes
              </h3>
              <div className="space-y-4">
                {hero.skillChanges.map((skill, idx) => {
                  const changes = parseChanges(skill.description);

                  return (
                    <div key={idx} className="bg-dark-200 rounded-xl p-4">
                      {/* Skill Header */}
                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src={skill.skillIcon}
                          alt={skill.skillName}
                          className="w-12 h-12 rounded-lg bg-dark-100"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <div>
                          <h4 className="font-bold text-white">{skill.skillName}</h4>
                        </div>
                      </div>

                      {/* Changes */}
                      {changes.length > 0 ? (
                        <div className="space-y-3">
                          {changes.map((change, cIdx) => (
                            <div key={cIdx} className="bg-dark-100 rounded-lg p-3">
                              <p className="text-xs text-gray-400 mb-2">{change.label}</p>
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-red-400 line-through opacity-70">{change.before}</span>
                                <ArrowRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
                                <span className="text-green-400 font-medium">{change.after}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400 whitespace-pre-line">
                          {skill.description.replace(/<br\s*\/?>/gi, '\n')}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {hero.skillChanges.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No detailed skill changes available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
