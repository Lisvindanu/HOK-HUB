import { useState, useMemo, useEffect } from 'react';
import { useHeroes } from '../hooks/useHeroes';
import { Loading } from '../components/ui/Loading';
import { Link } from '@tanstack/react-router';
import { Plus, Save, X, RotateCcw, Users, List as ListIcon, ThumbsUp, Calendar, TrendingUp, Filter } from 'lucide-react';
import type { Hero } from '../types/hero';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  type DragEndEvent,
  type DragStartEvent
} from '@dnd-kit/core';
import { createTierList, fetchTierLists, voteTierList, type TierListData, type TierList } from '../api/tierLists';

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

// Draggable Hero Component
function DraggableHero({ hero }: { hero: Hero }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: hero.heroId,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.5 : 1,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="w-16 h-16 rounded-lg overflow-hidden cursor-grab active:cursor-grabbing transition-transform hover:scale-110"
    >
      <img
        src={hero.icon}
        alt={hero.name}
        className="w-full h-full object-cover"
        title={hero.name}
      />
    </div>
  );
}

// Droppable Tier Container
function DroppableTier({ tier, heroes, children }: { tier: TierKey | 'pool'; heroes: Hero[]; children?: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id: tier,
  });

  const config = tier !== 'pool' ? TIER_CONFIG[tier as TierKey] : null;

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[100px] p-4 rounded-lg border-2 transition-colors ${
        isOver
          ? 'border-primary-500 bg-primary-500/10'
          : config
            ? `${config.borderColor} ${config.bgColor}`
            : 'border-white/10 bg-dark-200'
      }`}
    >
      {children || (
        <div className="flex flex-wrap gap-2">
          {heroes.map(hero => (
            <DraggableHero key={hero.heroId} hero={hero} />
          ))}
          {heroes.length === 0 && (
            <p className="text-gray-500 text-sm">Drag heroes here...</p>
          )}
        </div>
      )}
    </div>
  );
}

export function TierListPage() {
  const { data: heroes, isLoading } = useHeroes();
  const [mode, setMode] = useState<'create' | 'view'>('view');

  // Community tier lists state
  const [communityTierLists, setCommunityTierLists] = useState<TierList[]>([]);
  const [isLoadingTierLists, setIsLoadingTierLists] = useState(false);
  const [selectedTierList, setSelectedTierList] = useState<TierList | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('popular');

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

  // Fetch community tier lists
  // TODO: Enable this when VPS API has /api/tier-lists endpoint
  useEffect(() => {
    if (mode === 'view') {
      // loadTierLists(); // Disabled temporarily
      setIsLoadingTierLists(false);
    }
  }, [mode]);

  const loadTierLists = async () => {
    setIsLoadingTierLists(true);
    try {
      // const lists = await fetchTierLists(); // Disabled temporarily
      // setCommunityTierLists(lists);
      setCommunityTierLists([]); // Empty for now
    } catch (error) {
      console.error('Failed to load tier lists:', error);
    } finally {
      setIsLoadingTierLists(false);
    }
  };

  // Handle vote
  const handleVote = async (tierListId: string) => {
    try {
      const updated = await voteTierList(tierListId);
      // Update local state
      setCommunityTierLists(prev =>
        prev.map(tl => tl.id === tierListId ? updated : tl)
      );
      if (selectedTierList?.id === tierListId) {
        setSelectedTierList(updated);
      }
    } catch (error) {
      alert((error as Error).message);
    }
  };

  // Sort tier lists
  const sortedTierLists = useMemo(() => {
    const sorted = [...communityTierLists];
    if (sortBy === 'popular') {
      sorted.sort((a, b) => b.votes - a.votes);
    } else {
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return sorted;
  }, [communityTierLists, sortBy]);

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

  // Get heroes by tier
  const getHeroesInTier = (tier: TierKey): Hero[] => {
    if (!heroes) return [];
    return tierAssignments[tier]
      .map(id => heroes.find(h => h.heroId === id))
      .filter(Boolean) as Hero[];
  };

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
          {mode === 'create'
            ? 'Create your own tier list by dragging heroes'
            : 'View official meta rankings and community tier lists'}
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="mb-8 flex items-center gap-4">
        <div className="inline-flex bg-dark-200 border border-white/10 rounded-lg p-1">
          <button
            onClick={() => setMode('view')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
              mode === 'view'
                ? 'bg-primary-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ListIcon className="w-4 h-4" />
            View Tier Lists
          </button>
          <button
            onClick={() => setMode('create')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
              mode === 'create'
                ? 'bg-primary-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Plus className="w-4 h-4" />
            Create Tier List
          </button>
        </div>
      </div>

      {/* Create Mode */}
      {mode === 'create' && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {/* Action Buttons */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setShowSaveModal(true)}
              disabled={Object.values(tierAssignments).every(arr => arr.length === 0)}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Tier List
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>

          {/* Side by Side Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4">
            {/* Hero Pool - Left Side (Sticky) */}
            <div className="lg:sticky lg:top-20 lg:self-start">
              <div className="rounded-xl overflow-hidden bg-dark-200 border border-white/10 max-h-[calc(100vh-180px)] flex flex-col">
                <div className="bg-gradient-to-r from-gray-600 to-gray-700 p-3 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white">Hero Pool</h2>
                    <span className="text-white/80 text-xs">
                      {unassignedHeroes.length}
                    </span>
                  </div>
                </div>
                <div className="p-3 overflow-y-auto flex-1">
                  <DroppableTier tier="pool" heroes={unassignedHeroes}>
                    <div className="grid grid-cols-4 gap-2">
                      {unassignedHeroes.map(hero => (
                        <DraggableHero key={hero.heroId} hero={hero} />
                      ))}
                      {unassignedHeroes.length === 0 && (
                        <p className="col-span-4 text-gray-500 text-sm text-center py-8">All heroes assigned!</p>
                      )}
                    </div>
                  </DroppableTier>
                </div>
              </div>
            </div>

            {/* Tier Containers - Right Side */}
            <div className="space-y-3">
              {TIER_ORDER.map(tier => {
                const config = TIER_CONFIG[tier];
                const tierHeroes = getHeroesInTier(tier);

                return (
                  <div key={tier} className="rounded-lg overflow-hidden bg-dark-200 border border-white/10">
                    <div className="flex items-stretch">
                      {/* Tier Label */}
                      <div className={`bg-gradient-to-br ${config.color} w-16 flex items-center justify-center flex-shrink-0`}>
                        <span className="text-2xl font-bold text-white">{tier}</span>
                      </div>

                      {/* Drop Zone */}
                      <div className="flex-1 p-3">
                        <DroppableTier tier={tier} heroes={tierHeroes}>
                          <div className="flex flex-wrap gap-2 min-h-[80px]">
                            {tierHeroes.map(hero => (
                              <DraggableHero key={hero.heroId} hero={hero} />
                            ))}
                            {tierHeroes.length === 0 && (
                              <p className="text-gray-500 text-sm self-center">Drag heroes here...</p>
                            )}
                          </div>
                        </DroppableTier>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeDragHero ? (
              <div className="w-16 h-16 rounded-lg overflow-hidden opacity-80 ring-4 ring-primary-500">
                <img
                  src={activeDragHero.icon}
                  alt={activeDragHero.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* View Mode - Community Tier Lists Gallery */}
      {mode === 'view' && (
        <div className="space-y-8">
          {/* Official API Tier List */}
          {heroes && heroes.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-8 bg-gradient-to-b from-primary-500 to-blue-600 rounded-full" />
                <h2 className="text-2xl font-display font-bold gradient-text">Official Tier List</h2>
                <span className="text-sm text-gray-500 mt-1">Based on official API data</span>
              </div>

              <div className="bg-dark-200 border border-white/10 rounded-xl p-6 space-y-3">
                {TIER_ORDER.map(tier => {
                  const config = TIER_CONFIG[tier];
                  const tierHeroes = heroes.filter(h => h.stats?.tier === tier);

                  if (tierHeroes.length === 0) return null;

                  return (
                    <div key={tier} className="flex items-stretch gap-0 overflow-hidden rounded-lg">
                      {/* Tier Label */}
                      <div className={`w-20 flex items-center justify-center bg-gradient-to-br ${config.color}`}>
                        <span className="text-3xl font-bold text-white font-display">{tier}</span>
                      </div>

                      {/* Heroes */}
                      <div className={`flex-1 p-4 ${config.bgColor} border-2 ${config.borderColor}`}>
                        <div className="flex flex-wrap gap-2">
                          {tierHeroes.map(hero => (
                            <Link
                              key={hero.heroId}
                              to="/heroes/$heroId"
                              params={{ heroId: hero.heroId.toString() }}
                              className="group relative"
                            >
                              <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-white/20 group-hover:border-primary-400 transition-all group-hover:scale-110">
                                <img
                                  src={hero.icon}
                                  alt={hero.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white text-xs py-1 px-1 text-center opacity-0 group-hover:opacity-100 transition-opacity rounded-b-lg">
                                {hero.name}
                              </div>
                            </Link>
                          ))}
                        </div>
                        <div className="mt-2 text-sm text-gray-400">
                          {tierHeroes.length} {tierHeroes.length === 1 ? 'hero' : 'heroes'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Community Tier Lists Section */}
          <div className="space-y-6">
            {/* Section Header with Divider */}
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-primary-500 to-blue-600 rounded-full" />
              <h2 className="text-2xl font-display font-bold gradient-text">Community Tier Lists</h2>
            </div>

            {/* Sort Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-400">
                <Users className="w-5 h-5" />
                <span className="font-medium">
                  {sortedTierLists.length} Community Tier {sortedTierLists.length === 1 ? 'List' : 'Lists'}
                </span>
              </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSortBy('popular')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sortBy === 'popular'
                    ? 'bg-primary-500 text-white'
                    : 'bg-dark-200 text-gray-400 hover:text-white'
                }`}
              >
                <TrendingUp className="w-4 h-4 inline mr-1" />
                Most Popular
              </button>
              <button
                onClick={() => setSortBy('newest')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sortBy === 'newest'
                    ? 'bg-primary-500 text-white'
                    : 'bg-dark-200 text-gray-400 hover:text-white'
                }`}
              >
                <Calendar className="w-4 h-4 inline mr-1" />
                Newest
              </button>
            </div>
          </div>

          {isLoadingTierLists ? (
            <Loading message="Loading community tier lists..." />
          ) : sortedTierLists.length === 0 ? (
            <div className="text-center py-20 bg-dark-200 rounded-xl border border-white/10">
              <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Tier Lists Yet</h3>
              <p className="text-gray-400 mb-6">Be the first to create a community tier list!</p>
              <button
                onClick={() => setMode('create')}
                className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
              >
                Create First Tier List
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {sortedTierLists.map(tierList => (
                <div
                  key={tierList.id}
                  className="bg-dark-200 border border-white/10 rounded-xl overflow-hidden hover:border-primary-500/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedTierList(tierList)}
                >
                  {/* Header */}
                  <div className="p-4 border-b border-white/10">
                    <h3 className="text-lg font-bold text-white mb-2">{tierList.title}</h3>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <span className="text-gray-400">
                          by <span className="text-primary-400 font-medium">{tierList.creatorName}</span>
                        </span>
                        <span className="text-gray-500">
                          {new Date(tierList.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVote(tierList.id);
                        }}
                        className="flex items-center gap-1 px-3 py-1 bg-dark-100 hover:bg-primary-500/20 border border-white/10 rounded-lg transition-colors group"
                      >
                        <ThumbsUp className="w-4 h-4 text-gray-400 group-hover:text-primary-400 transition-colors" />
                        <span className="text-white font-semibold">{tierList.votes}</span>
                      </button>
                    </div>
                  </div>

                  {/* Tier Preview */}
                  <div className="p-4 space-y-2">
                    {TIER_ORDER.map(tier => {
                      const tierHeroIds = tierList.tiers[tier] || [];
                      if (tierHeroIds.length === 0) return null;

                      const config = TIER_CONFIG[tier];
                      const tierHeroes = tierHeroIds
                        .map(id => heroes?.find(h => h.heroId === id))
                        .filter(Boolean) as Hero[];

                      return (
                        <div key={tier} className="flex items-center gap-2">
                          <div className={`w-12 h-8 rounded flex items-center justify-center bg-gradient-to-r ${config.color}`}>
                            <span className="text-white font-bold text-sm">{tier}</span>
                          </div>
                          <div className="flex-1 flex flex-wrap gap-1">
                            {tierHeroes.slice(0, 10).map(hero => (
                              <img
                                key={hero.heroId}
                                src={hero.icon}
                                alt={hero.name}
                                title={hero.name}
                                className="w-8 h-8 rounded border border-white/20"
                              />
                            ))}
                            {tierHeroes.length > 10 && (
                              <div className="w-8 h-8 rounded bg-dark-100 border border-white/20 flex items-center justify-center text-xs text-gray-400">
                                +{tierHeroes.length - 10}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
        </div>
      )}

      {/* Tier List Detail Modal */}
      {selectedTierList && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 overflow-y-auto"
          onClick={() => setSelectedTierList(null)}
        >
          <div
            className="relative w-full max-w-5xl bg-dark-300 rounded-2xl shadow-2xl my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedTierList(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <h2 className="text-3xl font-bold text-white mb-2">{selectedTierList.title}</h2>
              <div className="flex items-center gap-4">
                <span className="text-gray-400">
                  Created by <span className="text-primary-400 font-semibold">{selectedTierList.creatorName}</span>
                </span>
                <span className="text-gray-500">
                  {new Date(selectedTierList.createdAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => handleVote(selectedTierList.id)}
                  className="ml-auto flex items-center gap-2 px-4 py-2 bg-dark-200 hover:bg-primary-500/20 border border-white/10 rounded-lg transition-colors group"
                >
                  <ThumbsUp className="w-5 h-5 text-gray-400 group-hover:text-primary-400 transition-colors" />
                  <span className="text-white font-bold">{selectedTierList.votes}</span>
                </button>
              </div>
            </div>

            {/* Tier List */}
            <div className="p-6 space-y-4">
              {TIER_ORDER.map(tier => {
                const tierHeroIds = selectedTierList.tiers[tier] || [];
                if (tierHeroIds.length === 0) return null;

                const config = TIER_CONFIG[tier];
                const tierHeroes = tierHeroIds
                  .map(id => heroes?.find(h => h.heroId === id))
                  .filter(Boolean) as Hero[];

                return (
                  <div key={tier} className="rounded-xl overflow-hidden bg-dark-200 border border-white/10">
                    <div className={`bg-gradient-to-r ${config.color} p-3`}>
                      <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold text-white">{tier}</h3>
                        <span className="text-white/80 text-sm">
                          {tierHeroes.length} {tierHeroes.length === 1 ? 'Hero' : 'Heroes'}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 flex flex-wrap gap-2">
                      {tierHeroes.map(hero => (
                        <div
                          key={hero.heroId}
                          className="w-16 h-16 rounded-lg overflow-hidden border-2 border-white/20 hover:border-primary-500 transition-colors"
                          title={hero.name}
                        >
                          <img
                            src={hero.icon}
                            alt={hero.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Save Modal */}
      {showSaveModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={() => setShowSaveModal(false)}
        >
          <div
            className="relative w-full max-w-md bg-dark-300 rounded-2xl shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowSaveModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            <h2 className="text-2xl font-bold text-white mb-6">Save Tier List</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tier List Title *
                </label>
                <input
                  type="text"
                  value={tierListTitle}
                  onChange={(e) => setTierListTitle(e.target.value)}
                  placeholder="e.g., My Meta Tier List 2026"
                  className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 text-white placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-2 bg-dark-100 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 text-white placeholder-gray-500"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSave}
                  disabled={isSaving || !tierListTitle.trim() || !creatorName.trim()}
                  className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-semibold"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => setShowSaveModal(false)}
                  disabled={isSaving}
                  className="px-4 py-2 bg-dark-100 hover:bg-dark-50 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
