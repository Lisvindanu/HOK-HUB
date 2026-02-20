import { useState, useMemo } from 'react';
import { useHeroes } from '../hooks/useHeroes';
import { Loading } from '../components/ui/Loading';
import { Link } from '@tanstack/react-router';
import { Filter, Plus, Save, X, Users } from 'lucide-react';
import type { Hero } from '../types/hero';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { createTierList, type TierListData } from '../api/tierLists';

const TIER_CONFIG = {
  'S+': { color: 'from-red-500 to-orange-500', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/30', textColor: 'text-red-400' },
  'S': { color: 'from-orange-500 to-yellow-500', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30', textColor: 'text-orange-400' },
  'A': { color: 'from-yellow-500 to-green-500', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/30', textColor: 'text-yellow-400' },
  'B': { color: 'from-green-500 to-blue-500', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/30', textColor: 'text-green-400' },
  'C': { color: 'from-blue-500 to-purple-500', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30', textColor: 'text-blue-400' },
  'D': { color: 'from-purple-500 to-gray-500', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/30', textColor: 'text-purple-400' },
};

const TIER_ORDER = ['S+', 'S', 'A', 'B', 'C', 'D'] as const;
type TierKey = typeof TIER_ORDER[number];

export function TierListPage() {
  const { data: heroes, isLoading } = useHeroes();
  const [mode, setMode] = useState<'create' | 'view'>('view');
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [selectedLane, setSelectedLane] = useState<string>('All');

  // Tier list builder state
  const [tierAssignments, setTierAssignments] = useState<Record<TierKey, number[]>>({
    'S+': [],
    'S': [],
    'A': [],
    'B': [],
    'C': [],
    'D': [],
  });
  const [activeDragHero, setActiveDragHero] = useState<Hero | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [tierListTitle, setTierListTitle] = useState('');
  const [creatorName, setCreatorName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Get unassigned heroes (heroes not in any tier)
  const unassignedHeroIds = useMemo(() => {
    if (!heroes) return new Set<number>();
    const assignedIds = new Set(Object.values(tierAssignments).flat());
    return new Set(heroes.map(h => h.heroId).filter(id => !assignedIds.has(id)));
  }, [heroes, tierAssignments]);

  const unassignedHeroes = useMemo(() => {
    if (!heroes) return [];
    return heroes.filter(h => unassignedHeroIds.has(h.heroId));
  }, [heroes, unassignedHeroIds]);

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const heroId = Number(active.id);
    const hero = heroes?.find(h => h.heroId === heroId);
    if (hero) {
      setActiveDragHero(hero);
    }
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragHero(null);

    if (!over) return;

    const heroId = Number(active.id);
    const targetTier = over.id as TierKey | 'pool';

    // Remove hero from all tiers first
    const newAssignments = { ...tierAssignments };
    TIER_ORDER.forEach(tier => {
      newAssignments[tier] = newAssignments[tier].filter(id => id !== heroId);
    });

    // Add to target tier if not pool
    if (targetTier !== 'pool' && TIER_ORDER.includes(targetTier as TierKey)) {
      newAssignments[targetTier as TierKey].push(heroId);
    }

    setTierAssignments(newAssignments);
  };

  // Reset tier list
  const handleReset = () => {
    setTierAssignments({
      'S+': [],
      'S': [],
      'A': [],
      'B': [],
      'C': [],
      'D': [],
    });
  };

  // Save tier list
  const handleSave = async () => {
    if (!tierListTitle.trim() || !creatorName.trim()) {
      alert('Please enter both title and your name');
      return;
    }

    setIsSaving(true);
    try {
      await createTierList({
        title: tierListTitle.trim(),
        creatorName: creatorName.trim(),
        tiers: tierAssignments,
      });

      alert('Tier list saved successfully!');
      setShowSaveModal(false);
      setTierListTitle('');
      setCreatorName('');
      handleReset();
      setMode('view');
    } catch (error) {
      alert('Failed to save tier list: ' + (error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  // Filter and group heroes by tier
  const herosByTier = useMemo(() => {
    if (!heroes) return new Map();

    const filtered = heroes.filter(hero => {
      const matchRole = selectedRole === 'All' || hero.role === selectedRole;
      const matchLane = selectedLane === 'All' || hero.lane === selectedLane;
      return matchRole && matchLane;
    });

    const tierMap = new Map<string, Hero[]>();

    filtered.forEach(hero => {
      const tier = hero.stats.tier || 'C';
      if (!tierMap.has(tier)) {
        tierMap.set(tier, []);
      }
      tierMap.get(tier)!.push(hero);
    });

    // Sort heroes within each tier by win rate
    tierMap.forEach((heroes, tier) => {
      heroes.sort((a, b) => {
        const aWin = parseFloat(a.stats.winRate) || 0;
        const bWin = parseFloat(b.stats.winRate) || 0;
        return bWin - aWin;
      });
    });

    return tierMap;
  }, [heroes, selectedRole, selectedLane]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Loading message="Loading tier list..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
          Hero Tier List
        </h1>
        <p className="text-gray-400 text-lg">
          Current meta rankings based on win rate, pick rate, and ban rate
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-gray-400">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filters:</span>
        </div>

        {/* Role Filter */}
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="px-4 py-2 bg-dark-200 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 text-white text-sm"
        >
          {roles.map((role) => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>

        {/* Lane Filter */}
        <select
          value={selectedLane}
          onChange={(e) => setSelectedLane(e.target.value)}
          className="px-4 py-2 bg-dark-200 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 text-white text-sm"
        >
          {lanes.map((lane) => (
            <option key={lane} value={lane}>{lane}</option>
          ))}
        </select>

        {/* Clear Filters */}
        {(selectedRole !== 'All' || selectedLane !== 'All') && (
          <button
            onClick={() => {
              setSelectedRole('All');
              setSelectedLane('All');
            }}
            className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm font-medium hover:bg-red-500/30 transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Tier List */}
      <div className="space-y-6">
        {TIER_ORDER.map((tier) => {
          const tierHeroes = herosByTier.get(tier) || [];
          if (tierHeroes.length === 0) return null;

          const config = TIER_CONFIG[tier as keyof typeof TIER_CONFIG];

          return (
            <div key={tier} className="rounded-xl overflow-hidden bg-dark-200 border border-white/10">
              {/* Tier Header */}
              <div className={`bg-gradient-to-r ${config.color} p-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-bold text-white">{tier}</h2>
                    <span className="text-white/80 text-sm">
                      {tierHeroes.length} {tierHeroes.length === 1 ? 'Hero' : 'Heroes'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Heroes Grid */}
              <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {tierHeroes.map((hero) => {
                  const winRate = parseFloat(hero.stats.winRate) || 0;
                  const pickRate = parseFloat(hero.stats.pickRate) || 0;

                  return (
                    <Link
                      key={hero.heroId}
                      to="/heroes/$heroId"
                      params={{ heroId: hero.heroId.toString() }}
                      className="group relative overflow-hidden rounded-lg bg-dark-100 transition-all hover:scale-105 hover:shadow-xl"
                    >
                      <div className="aspect-square relative overflow-hidden">
                        <img
                          src={hero.icon}
                          alt={hero.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                        {/* Stats overlay */}
                        <div className="absolute top-2 right-2 flex flex-col gap-1">
                          <div className="px-2 py-0.5 bg-black/70 rounded text-xs text-white font-semibold">
                            {winRate.toFixed(1)}%
                          </div>
                        </div>

                        {/* Hero info */}
                        <div className="absolute bottom-0 left-0 right-0 p-2">
                          <h3 className="text-sm font-bold text-white line-clamp-1">{hero.name}</h3>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs text-gray-300">{hero.role}</span>
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-300">{hero.lane}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-8 p-6 bg-dark-200 border border-white/10 rounded-xl">
        <h3 className="text-lg font-bold text-white mb-4">Tier Explanation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <span className="font-bold text-red-400">S+ Tier:</span>
            <p className="text-sm text-gray-400">Dominant picks, often banned</p>
          </div>
          <div>
            <span className="font-bold text-orange-400">S Tier:</span>
            <p className="text-sm text-gray-400">Very strong, meta defining</p>
          </div>
          <div>
            <span className="font-bold text-yellow-400">A Tier:</span>
            <p className="text-sm text-gray-400">Strong and reliable picks</p>
          </div>
          <div>
            <span className="font-bold text-green-400">B Tier:</span>
            <p className="text-sm text-gray-400">Balanced and situational</p>
          </div>
          <div>
            <span className="font-bold text-blue-400">C Tier:</span>
            <p className="text-sm text-gray-400">Viable but outclassed</p>
          </div>
          <div>
            <span className="font-bold text-purple-400">D Tier:</span>
            <p className="text-sm text-gray-400">Weak in current meta</p>
          </div>
        </div>
      </div>
    </div>
  );
}
