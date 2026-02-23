import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useHeroes } from '../hooks/useHeroes';
import { Loading } from '../components/ui/Loading';
import { Link } from '@tanstack/react-router';
import { Plus, Save, X, RotateCcw, Users, List as ListIcon, ThumbsUp, Calendar, TrendingUp, Share2, Check, Search, GripVertical, Download, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { motion, AnimatePresence } from 'framer-motion';

// Convert image URL to base64 via proxy
async function imageToBase64(url: string): Promise<string> {
  try {
    // Use proxy path for external images
    let proxyUrl = url;
    if (url.includes('honorofkings.com')) {
      const apiBase = import.meta.env.DEV ? '' : 'https://hokapi.project-n.site';
      proxyUrl = url.replace('https://world.honorofkings.com', `${apiBase}/proxy-image`);
    }

    const response = await fetch(proxyUrl);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    // Return a 1x1 transparent pixel as fallback
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
  }
}

// Clone element and convert all images to base64
async function cloneWithBase64Images(element: HTMLElement): Promise<HTMLElement> {
  const clone = element.cloneNode(true) as HTMLElement;
  const images = clone.querySelectorAll('img');

  await Promise.all(
    Array.from(images).map(async (img) => {
      if (img.src && !img.src.startsWith('data:')) {
        const base64 = await imageToBase64(img.src);
        img.src = base64;
      }
    })
  );

  return clone;
}
import type { Hero } from '../types/hero';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  type DragEndEvent,
  type DragStartEvent
} from '@dnd-kit/core';
import { createTierList, fetchTierLists, voteTierList, type TierList } from '../api/tierLists';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../hooks/useUser';

const TIER_CONFIG = {
  'S+': { color: 'from-red-500 to-orange-500', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/20', textColor: 'text-red-400' },
  'S': { color: 'from-orange-500 to-yellow-500', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/20', textColor: 'text-orange-400' },
  'A': { color: 'from-yellow-500 to-green-500', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/20', textColor: 'text-yellow-400' },
  'B': { color: 'from-green-500 to-teal-500', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/20', textColor: 'text-green-400' },
  'C': { color: 'from-blue-500 to-indigo-500', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/20', textColor: 'text-blue-400' },
  'D': { color: 'from-purple-500 to-gray-500', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/20', textColor: 'text-purple-400' },
};

const TIER_ORDER = ['S+', 'S', 'A', 'B', 'C', 'D'] as const;
type TierKey = typeof TIER_ORDER[number];

function DraggableHero({ hero, showName = false }: { hero: Hero; showName?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: hero.heroId,
  });

  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
    touchAction: 'none',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="group relative cursor-grab active:cursor-grabbing select-none"
    >
      <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden border-2 border-white/10 group-hover:border-primary-500/50 transition-all group-hover:scale-105">
        <img src={hero.icon} alt={hero.name} className="w-full h-full object-cover pointer-events-none" draggable={false} />
      </div>
      {showName && (
        <p className="text-[9px] md:text-[10px] text-gray-400 text-center mt-1 truncate w-12 md:w-14">{hero.name}</p>
      )}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <GripVertical className="w-4 md:w-5 h-4 md:h-5 text-white drop-shadow-lg" />
      </div>
    </div>
  );
}

function DroppableTier({ tier, heroes, children }: { tier: TierKey | 'pool'; heroes: Hero[]; children?: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: tier });
  const config = tier !== 'pool' ? TIER_CONFIG[tier as TierKey] : null;

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[72px] rounded-xl transition-all duration-200 ${
        isOver
          ? 'bg-primary-500/10 ring-2 ring-primary-500 ring-inset'
          : config
            ? config.bgColor
            : ''
      }`}
    >
      {children || (
        <div className="flex flex-wrap gap-2">
          {heroes.map(hero => <DraggableHero key={hero.heroId} hero={hero} />)}
          {heroes.length === 0 && <p className="text-gray-500 text-sm">Drag heroes here...</p>}
        </div>
      )}
    </div>
  );
}

export function TierListPage() {
  const { data: heroes, isLoading } = useHeroes();
  const { token } = useAuth();
  const { data: user } = useUser();
  // Get tier list ID from URL
  const searchParams = new URLSearchParams(window.location.search);
  const tierListIdFromUrl = searchParams.get('id');
  const [mode, setMode] = useState<'create' | 'view'>('view');

  const [communityTierLists, setCommunityTierLists] = useState<TierList[]>([]);
  const [isLoadingTierLists, setIsLoadingTierLists] = useState(false);
  const [selectedTierList, setSelectedTierList] = useState<TierList | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('popular');

  const [tierAssignments, setTierAssignments] = useState<Record<TierKey, number[]>>({
    'S+': [], 'S': [], 'A': [], 'B': [], 'C': [], 'D': [],
  });
  const [activeDragHero, setActiveDragHero] = useState<Hero | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [tierListTitle, setTierListTitle] = useState('');
  const [creatorName, setCreatorName] = useState(user?.name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [poolSearch, setPoolSearch] = useState('');
    const [isDownloading, setIsDownloading] = useState(false);
  const [editMode, setEditMode] = useState<'drag' | 'tap'>('tap');
  const [selectedTier, setSelectedTier] = useState<TierKey | null>(null);
  const [showHeroModal, setShowHeroModal] = useState(false);
  const [tierListLane, setTierListLane] = useState<string>('All'); // Main lane filter for tier list
  const [showShareMenu, setShowShareMenu] = useState<string | null>(null); // tier list id
  const [urlTierListHandled, setUrlTierListHandled] = useState(false); // prevent re-opening from URL
  const tierListRef = useRef<HTMLDivElement>(null);
  const createTierListRef = useRef<HTMLDivElement>(null);

  const handleDownload = useCallback(async () => {
    if (!tierListRef.current || !selectedTierList) return;

    setIsDownloading(true);
    try {
      // Clone element and convert images to base64 to avoid CORS issues
      const clone = await cloneWithBase64Images(tierListRef.current);
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      clone.style.top = '0';
      document.body.appendChild(clone);

      const canvas = await html2canvas(clone, {
        backgroundColor: '#0a0e27',
        scale: 2,
        logging: false,
      });

      document.body.removeChild(clone);

      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `${selectedTierList.title.replace(/[^a-z0-9]/gi, '_')}_tierlist.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to download tier list:', error);
      alert('Failed to download tier list. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  }, [selectedTierList]);

  const handleDownloadCreate = useCallback(async () => {
    if (!createTierListRef.current) return;

    setIsDownloading(true);
    try {
      // Show title for download
      const titleEl = document.getElementById('create-tier-title');
      if (titleEl) titleEl.classList.remove('hidden');

      // Clone element and convert images to base64 to avoid CORS issues
      const clone = await cloneWithBase64Images(createTierListRef.current);
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      clone.style.top = '0';
      document.body.appendChild(clone);

      // Hide title in original again
      if (titleEl) titleEl.classList.add('hidden');

      const canvas = await html2canvas(clone, {
        backgroundColor: '#0a0e27',
        scale: 2,
        logging: false,
      });

      document.body.removeChild(clone);

      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `my_tierlist_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to download tier list:', error);
      alert('Failed to download tier list. Please try again.');
      // Ensure title is hidden on error too
      const titleEl = document.getElementById('create-tier-title');
      if (titleEl) titleEl.classList.add('hidden');
    } finally {
      setIsDownloading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.name && !creatorName) setCreatorName(user.name);
  }, [user?.name, creatorName]);

  useEffect(() => {
    if (mode === 'view') loadTierLists();
  }, [mode]);

  // Auto-open tier list from URL param (only once)
  useEffect(() => {
    if (tierListIdFromUrl && communityTierLists.length > 0 && !urlTierListHandled) {
      const tierList = communityTierLists.find(tl => tl.id === tierListIdFromUrl);
      if (tierList) {
        setSelectedTierList(tierList);
        setUrlTierListHandled(true);
      }
    }
  }, [tierListIdFromUrl, communityTierLists, urlTierListHandled]);

  const loadTierLists = async () => {
    setIsLoadingTierLists(true);
    try {
      const lists = await fetchTierLists();
      setCommunityTierLists(lists);
    } catch (error) {
      console.error('Failed to load tier lists:', error);
      setCommunityTierLists([]);
    } finally {
      setIsLoadingTierLists(false);
    }
  };

  const handleVote = async (tierListId: string) => {
    try {
      const updated = await voteTierList(tierListId, token || undefined);
      setCommunityTierLists(prev => prev.map(tl => tl.id === tierListId ? updated : tl));
      if (selectedTierList?.id === tierListId) setSelectedTierList(updated);
    } catch (error) {
      alert((error as Error).message);
    }
  };

  const getShareUrl = (tierListId: string) => {
    const baseUrl = import.meta.env.PROD ? 'https://hok-hub.project-n.site' : window.location.origin;
    return `${baseUrl}/tier-list?id=${tierListId}`;
  };

  const handleCopyLink = async (tierListId: string) => {
    const url = getShareUrl(tierListId);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(tierListId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      alert('Failed to copy link');
    }
  };

  const handleShare = async (tierList: TierList) => {
    const url = getShareUrl(tierList.id);
    const text = `Check out "${tierList.title}" tier list by ${tierList.creatorName} on HoK Hub!`;

    // Try native share first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({ title: tierList.title, text, url });
        return;
      } catch {
        // User cancelled or not supported, show menu
      }
    }

    // Show share menu
    setShowShareMenu(tierList.id);
  };

  const getShareLinks = (tierList: TierList) => {
    const url = getShareUrl(tierList.id);
    const text = `Check out "${tierList.title}" tier list by ${tierList.creatorName} on HoK Hub!`;
    return [
      { name: 'Twitter / X', icon: '𝕏', url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}` },
      { name: 'WhatsApp', icon: '💬', url: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}` },
      { name: 'Facebook', icon: '📘', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
      { name: 'Telegram', icon: '✈️', url: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}` },
    ];
  };

  const sortedTierLists = useMemo(() => {
    const sorted = [...communityTierLists];
    if (sortBy === 'popular') sorted.sort((a, b) => b.votes - a.votes);
    else sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return sorted;
  }, [communityTierLists, sortBy]);

  const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 8 } });
  const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } });
  const sensors = useSensors(pointerSensor, touchSensor);

  // Heroes available for this tier list (filtered by tierListLane)
  const availableHeroes = useMemo(() => {
    if (!heroes) return [];
    if (tierListLane === 'All') return heroes;
    return heroes.filter(h => h.lane === tierListLane);
  }, [heroes, tierListLane]);

  const unassignedHeroIds = useMemo(() => {
    if (!availableHeroes.length) return new Set<number>();
    const assignedIds = new Set(Object.values(tierAssignments).flat());
    return new Set(availableHeroes.map(h => h.heroId).filter(id => !assignedIds.has(id)));
  }, [availableHeroes, tierAssignments]);

  const unassignedHeroes = useMemo(() => {
    return availableHeroes.filter(h => unassignedHeroIds.has(h.heroId));
  }, [availableHeroes, unassignedHeroIds]);

  // Filtered heroes for pool (search only, role is filtered by tierListRole)
  const filteredPoolHeroes = useMemo(() => {
    if (!poolSearch) return unassignedHeroes;
    return unassignedHeroes.filter(h =>
      h.name.toLowerCase().includes(poolSearch.toLowerCase())
    );
  }, [unassignedHeroes, poolSearch]);

  // Get unique lanes
  const lanes = useMemo(() => {
    if (!heroes) return [];
    const laneSet = new Set(heroes.map(h => h.lane));
    return ['All', ...Array.from(laneSet).sort()];
  }, [heroes]);

  // Count heroes per tier
  const getTierCount = (tier: TierKey) => tierAssignments[tier].length;

  const getHeroesInTier = (tier: TierKey): Hero[] => {
    if (!heroes) return [];
    return tierAssignments[tier].map(id => heroes.find(h => h.heroId === id)).filter(Boolean) as Hero[];
  };

  const handleDragStart = (event: DragStartEvent) => {
    const hero = heroes?.find(h => h.heroId === Number(event.active.id));
    if (hero) setActiveDragHero(hero);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragHero(null);
    if (!over) return;

    const heroId = Number(active.id);
    const targetTier = over.id as TierKey | 'pool';

    const newAssignments = { ...tierAssignments };
    TIER_ORDER.forEach(tier => {
      newAssignments[tier] = newAssignments[tier].filter(id => id !== heroId);
    });

    if (targetTier !== 'pool' && TIER_ORDER.includes(targetTier as TierKey)) {
      newAssignments[targetTier as TierKey].push(heroId);
    }

    setTierAssignments(newAssignments);
  };

  const handleReset = () => {
    setTierAssignments({ 'S+': [], 'S': [], 'A': [], 'B': [], 'C': [], 'D': [] });
    setSelectedTier(null);
    setTierListLane('All');
    setPoolSearch('');
  };

  // Tap mode handlers
  const handleSelectTier = (tier: TierKey) => {
    setSelectedTier(tier);
    setShowHeroModal(true);
  };

  const handleTapHeroFromPool = (heroId: number) => {
    if (!selectedTier) return;
    setTierAssignments(prev => ({
      ...prev,
      [selectedTier]: [...prev[selectedTier], heroId]
    }));
    // Modal stays open so user can add more heroes
  };

  const handleTapHeroFromTier = (heroId: number, tier: TierKey) => {
    setTierAssignments(prev => ({
      ...prev,
      [tier]: prev[tier].filter(id => id !== heroId)
    }));
  };

  const closeHeroModal = () => {
    setShowHeroModal(false);
    setSelectedTier(null);
  };

  const handleSave = async () => {
    if (!tierListTitle.trim() || !creatorName.trim()) {
      alert('Please enter both title and your name');
      return;
    }

    setIsSaving(true);
    try {
      const newTierList = await createTierList({
        title: tierListTitle.trim(),
        creatorName: creatorName.trim(),
        tiers: tierAssignments,
        token: token || undefined,
      });

      setCommunityTierLists(prev => [newTierList, ...prev]);
      alert('Tier list saved successfully!');
      setShowSaveModal(false);
      setTierListTitle('');
      if (!user) setCreatorName('');
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
      <div className="min-h-screen flex items-center justify-center">
        <Loading message="Loading tier list..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-400">
      {/* Header */}
      <section className="pt-20 md:pt-28 pb-6 md:pb-8 border-b border-white/5">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-2 md:mb-3">
              Tier List
            </h1>
            <p className="text-gray-400 text-sm md:text-lg">
              {mode === 'create'
                ? 'Create your own tier list by dragging heroes'
                : 'View meta rankings and community tier lists'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Controls */}
      <section className="sticky top-16 md:top-20 z-30 bg-dark-400/95 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-3 md:py-4">
          <div className="flex items-center justify-between gap-2">
            {/* Mode Tabs */}
            <div className="flex items-center gap-1 bg-dark-300/50 p-1 rounded-xl border border-white/5">
              <button
                onClick={() => setMode('view')}
                className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
                  mode === 'view' ? 'bg-white text-dark-400' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <ListIcon className="w-3.5 md:w-4 h-3.5 md:h-4" />
                View
              </button>
              <button
                onClick={() => setMode('create')}
                className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
                  mode === 'create' ? 'bg-white text-dark-400' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Plus className="w-3.5 md:w-4 h-3.5 md:h-4" />
                Create
              </button>
            </div>

            {/* Sort Controls (View Mode) */}
            {mode === 'view' && (
              <div className="flex items-center gap-1 bg-dark-300/50 p-1 rounded-xl border border-white/5">
                <button
                  onClick={() => setSortBy('popular')}
                  className={`flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-medium transition-all ${
                    sortBy === 'popular' ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <TrendingUp className="w-3 md:w-3.5 h-3 md:h-3.5" />
                  <span className="hidden xs:inline">Popular</span>
                </button>
                <button
                  onClick={() => setSortBy('newest')}
                  className={`flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-medium transition-all ${
                    sortBy === 'newest' ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Calendar className="w-3 md:w-3.5 h-3 md:h-3.5" />
                  <span className="hidden xs:inline">Newest</span>
                </button>
              </div>
            )}

            {/* Create Mode Actions */}
            {mode === 'create' && (
              <div className="flex items-center gap-1.5 md:gap-2">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 text-red-400 hover:bg-red-500/10 rounded-lg text-xs md:text-sm transition-colors"
                >
                  <RotateCcw className="w-3.5 md:w-4 h-3.5 md:h-4" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
                <button
                  onClick={handleDownloadCreate}
                  disabled={isDownloading || Object.values(tierAssignments).every(arr => arr.length === 0)}
                  className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-xs md:text-sm transition-colors"
                >
                  {isDownloading ? (
                    <Loader2 className="w-3.5 md:w-4 h-3.5 md:h-4 animate-spin" />
                  ) : (
                    <Download className="w-3.5 md:w-4 h-3.5 md:h-4" />
                  )}
                  <span className="hidden sm:inline">Download</span>
                </button>
                <button
                  onClick={() => setShowSaveModal(true)}
                  disabled={Object.values(tierAssignments).every(arr => arr.length === 0)}
                  className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg text-xs md:text-sm font-medium transition-colors"
                >
                  <Save className="w-3.5 md:w-4 h-3.5 md:h-4" />
                  Save
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-6 md:py-8">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          {/* Create Mode */}
          {mode === 'create' && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              {/* Role Filter & Mode Toggle */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 md:mb-6 space-y-3"
              >
                {/* Lane Filter */}
                <div className="p-3 md:p-4 bg-dark-300/50 border border-white/5 rounded-xl">
                  <p className="text-xs text-gray-400 mb-2">Create tier list for:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {lanes.map(lane => (
                      <button
                        key={lane}
                        onClick={() => {
                          setTierListLane(lane);
                          // Reset assignments when changing lane filter
                          if (lane !== tierListLane) {
                            setTierAssignments({ 'S+': [], 'S': [], 'A': [], 'B': [], 'C': [], 'D': [] });
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          tierListLane === lane
                            ? 'bg-primary-500 text-white'
                            : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {lane === 'All' ? 'All Lanes' : lane.replace(' Lane', '')}
                        {lane !== 'All' && heroes && (
                          <span className="ml-1 text-[10px] opacity-70">
                            ({heroes.filter(h => h.lane === lane).length})
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mode Toggle & Instructions */}
                <div className="p-3 md:p-4 bg-primary-500/5 border border-primary-500/10 rounded-xl">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <p className="text-xs md:text-sm text-gray-300">
                      <span className="text-primary-400 font-medium">Mode:</span>{' '}
                      {editMode === 'drag' ? 'Drag & Drop' : 'Tap to Add'}
                    </p>
                    <div className="flex items-center gap-1 bg-dark-300/50 p-0.5 rounded-lg border border-white/5">
                      <button
                        onClick={() => setEditMode('tap')}
                        className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                          editMode === 'tap' ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        Tap
                      </button>
                      <button
                        onClick={() => setEditMode('drag')}
                        className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                          editMode === 'drag' ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        Drag
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] md:text-xs text-gray-500">
                    {editMode === 'drag'
                      ? 'Hold and drag heroes to tiers. Drop back to pool to remove.'
                      : 'Tap a tier to add heroes. Tap heroes in tiers to remove.'}
                  </p>
                </div>
              </motion.div>

              <div className={`grid gap-4 md:gap-6 ${editMode === 'drag' ? 'grid-cols-1 lg:grid-cols-[320px_1fr]' : 'grid-cols-1'}`}>
                {/* Hero Pool - Only show in drag mode */}
                {editMode === 'drag' && (
                <div className="lg:sticky lg:top-36 lg:self-start">
                  <div className="rounded-2xl overflow-hidden bg-dark-300/50 border border-white/5 max-h-[50vh] lg:max-h-[calc(100vh-220px)] flex flex-col">
                    {/* Pool Header */}
                    <div className="p-4 border-b border-white/5 space-y-3">
                      <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-white">Hero Pool</h2>
                        <span className="px-2 py-0.5 bg-white/10 rounded-full text-xs text-gray-400">
                          {filteredPoolHeroes.length} / {unassignedHeroes.length}
                        </span>
                      </div>

                      {/* Search */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                          type="text"
                          placeholder="Search heroes..."
                          value={poolSearch}
                          onChange={(e) => setPoolSearch(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-dark-200/50 border border-white/5 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50"
                        />
                      </div>

                    </div>

                    {/* Pool Content */}
                    <div className="p-2 md:p-3 overflow-y-auto flex-1">
                      {editMode === 'drag' ? (
                        <DroppableTier tier="pool" heroes={filteredPoolHeroes}>
                          <div className="grid grid-cols-5 md:grid-cols-4 gap-1.5 md:gap-2">
                            {filteredPoolHeroes.map(hero => (
                              <DraggableHero key={hero.heroId} hero={hero} showName />
                            ))}
                            {filteredPoolHeroes.length === 0 && unassignedHeroes.length > 0 && (
                              <p className="col-span-5 md:col-span-4 text-gray-500 text-sm text-center py-6">No heroes match filter</p>
                            )}
                            {unassignedHeroes.length === 0 && (
                              <div className="col-span-5 md:col-span-4 text-center py-8">
                                <Check className="w-8 h-8 text-green-400 mx-auto mb-2" />
                                <p className="text-green-400 text-sm font-medium">All heroes assigned!</p>
                              </div>
                            )}
                          </div>
                        </DroppableTier>
                      ) : (
                        <div className="grid grid-cols-5 md:grid-cols-4 gap-1.5 md:gap-2">
                          {filteredPoolHeroes.map(hero => (
                            <button
                              key={hero.heroId}
                              onClick={() => handleTapHeroFromPool(hero.heroId)}
                              disabled={!selectedTier}
                              className={`group relative ${!selectedTier ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                              <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden border-2 transition-all ${
                                selectedTier ? 'border-white/10 hover:border-primary-500 hover:scale-105' : 'border-white/5'
                              }`}>
                                <img src={hero.icon} alt={hero.name} className="w-full h-full object-cover" />
                              </div>
                              <p className="text-[9px] md:text-[10px] text-gray-400 text-center mt-1 truncate w-12 md:w-14">{hero.name}</p>
                              {selectedTier && (
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                  <Plus className="w-5 h-5 text-primary-400 drop-shadow-lg" />
                                </div>
                              )}
                            </button>
                          ))}
                          {filteredPoolHeroes.length === 0 && unassignedHeroes.length > 0 && (
                            <p className="col-span-5 md:col-span-4 text-gray-500 text-sm text-center py-6">No heroes match filter</p>
                          )}
                          {unassignedHeroes.length === 0 && (
                            <div className="col-span-5 md:col-span-4 text-center py-8">
                              <Check className="w-8 h-8 text-green-400 mx-auto mb-2" />
                              <p className="text-green-400 text-sm font-medium">All heroes assigned!</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                )}

                {/* Tier Containers */}
                <div className="space-y-2 md:space-y-3">
                  {/* Downloadable area */}
                  <div ref={createTierListRef} className="space-y-3 p-4 -m-4 bg-dark-400">
                    {/* Title for download */}
                    <div className="pb-3 border-b border-white/10 hidden" id="create-tier-title">
                      <h3 className="text-xl font-bold text-white">
                        {tierListLane === 'All' ? 'My Tier List' : `${tierListLane.replace(' Lane', '')} Tier List`}
                      </h3>
                      <p className="text-sm text-gray-400 mt-1">HoK Hub</p>
                    </div>

                    {TIER_ORDER.map((tier, index) => {
                      const config = TIER_CONFIG[tier];
                      const tierHeroes = getHeroesInTier(tier);
                      const count = getTierCount(tier);

                      return (
                        <motion.div
                          key={tier}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="rounded-2xl overflow-hidden bg-dark-300/50 border border-white/5 hover:border-white/10 transition-all"
                        >
                          <div className="flex items-stretch">
                            {/* Tier Label - clickable in tap mode */}
                            <button
                              onClick={() => editMode === 'tap' && handleSelectTier(tier)}
                              className={`bg-gradient-to-br ${config.color} w-14 md:w-20 flex flex-col items-center justify-center flex-shrink-0 py-3 md:py-4 ${
                                editMode === 'tap' ? 'cursor-pointer hover:opacity-90 active:opacity-80' : 'cursor-default'
                              }`}
                            >
                              <span className="text-2xl md:text-3xl font-bold text-white">{tier}</span>
                              {count > 0 && (
                                <span className="text-[10px] md:text-xs text-white/70 mt-0.5 md:mt-1">{count}</span>
                              )}
                              {editMode === 'tap' && (
                                <Plus className="w-4 h-4 text-white/70 mt-1" />
                              )}
                            </button>

                            {/* Heroes Zone */}
                            <div className="flex-1 p-2 md:p-4">
                              {editMode === 'drag' ? (
                                <DroppableTier tier={tier} heroes={tierHeroes}>
                                  <div className="flex flex-wrap gap-1.5 md:gap-2 min-h-[56px] md:min-h-[72px]">
                                    {tierHeroes.map(hero => (
                                      <DraggableHero key={hero.heroId} hero={hero} />
                                    ))}
                                    {tierHeroes.length === 0 && (
                                      <div className="flex items-center gap-2 text-gray-500">
                                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center">
                                          <Plus className="w-4 md:w-5 h-4 md:h-5 text-gray-600" />
                                        </div>
                                        <p className="text-xs md:text-sm">Drop heroes here</p>
                                      </div>
                                    )}
                                  </div>
                                </DroppableTier>
                              ) : (
                                <div className="flex flex-wrap gap-1.5 md:gap-2 min-h-[56px] md:min-h-[72px]">
                                  {tierHeroes.map(hero => (
                                    <button
                                      key={hero.heroId}
                                      onClick={() => handleTapHeroFromTier(hero.heroId, tier)}
                                      className="group relative cursor-pointer"
                                    >
                                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden border-2 border-white/10 hover:border-red-500 transition-all hover:scale-105">
                                        <img src={hero.icon} alt={hero.name} className="w-full h-full object-cover" />
                                      </div>
                                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-black/40 rounded-xl">
                                        <X className="w-5 h-5 text-red-400 drop-shadow-lg" />
                                      </div>
                                    </button>
                                  ))}
                                  {tierHeroes.length === 0 && (
                                    <div className="flex items-center gap-2 text-gray-500">
                                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center">
                                        <Plus className="w-4 md:w-5 h-4 md:h-5 text-gray-600" />
                                      </div>
                                      <p className="text-xs md:text-sm">Tap tier to add</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}

                    {/* Watermark for download */}
                    <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-gray-500">
                      <span>hok-hub.project-n.site</span>
                      <span>{new Date().toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Summary - outside downloadable area */}
                  <div className="mt-6 p-4 bg-dark-300/30 rounded-xl border border-white/5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">
                        {tierListLane === 'All' ? 'Total assigned:' : `${tierListLane.replace(' Lane', '')} assigned:`}
                      </span>
                      <span className="text-white font-medium">
                        {Object.values(tierAssignments).flat().length} / {availableHeroes.length} heroes
                      </span>
                    </div>
                    <div className="mt-3 h-2 bg-dark-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-blue-500 transition-all duration-300"
                        style={{
                          width: `${(Object.values(tierAssignments).flat().length / (availableHeroes.length || 1)) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {editMode === 'drag' && (
                <DragOverlay>
                  {activeDragHero && (
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden ring-2 ring-primary-500 shadow-xl shadow-primary-500/20">
                      <img src={activeDragHero.icon} alt={activeDragHero.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                </DragOverlay>
              )}
            </DndContext>
          )}

          {/* Hero Selection Modal for Tap Mode */}
          <AnimatePresence>
            {showHeroModal && selectedTier && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm"
                onClick={closeHeroModal}
              >
                <motion.div
                  initial={{ y: '100%', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: '100%', opacity: 0 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className="relative w-full max-w-2xl max-h-[85vh] bg-dark-300 rounded-t-2xl md:rounded-2xl flex flex-col"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal Header */}
                  <div className="flex items-center justify-between p-4 border-b border-white/5 flex-shrink-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br ${TIER_CONFIG[selectedTier].color}`}>
                        <span className="text-lg font-bold text-white">{selectedTier}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">
                          Add {tierListLane !== 'All' && <span className="text-primary-400">{tierListLane.replace(' Lane', '')}</span>} to {selectedTier}
                        </h3>
                        <p className="text-xs text-gray-400">
                          {tierAssignments[selectedTier].length} added • {unassignedHeroes.length} remaining
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={closeHeroModal}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>

                  {/* Search */}
                  <div className="p-3 border-b border-white/5 flex-shrink-0">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        placeholder={`Search ${tierListLane !== 'All' ? tierListLane.replace(' Lane', '').toLowerCase() + ' heroes' : 'heroes'}...`}
                        value={poolSearch}
                        onChange={(e) => setPoolSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-dark-200/50 border border-white/5 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50"
                      />
                    </div>
                  </div>

                  {/* Heroes Grid */}
                  <div className="flex-1 overflow-y-auto p-3">
                    <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 gap-2">
                      {filteredPoolHeroes.map(hero => (
                        <button
                          key={hero.heroId}
                          onClick={() => handleTapHeroFromPool(hero.heroId)}
                          className="group relative"
                        >
                          <div className="w-full aspect-square rounded-xl overflow-hidden border-2 border-white/10 hover:border-primary-500 transition-all hover:scale-105">
                            <img src={hero.icon} alt={hero.name} className="w-full h-full object-cover" />
                          </div>
                          <p className="text-[9px] text-gray-400 text-center mt-1 truncate">{hero.name}</p>
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
                              <Plus className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        </button>
                      ))}
                      {filteredPoolHeroes.length === 0 && unassignedHeroes.length > 0 && (
                        <p className="col-span-full text-gray-500 text-sm text-center py-8">No heroes match filter</p>
                      )}
                      {unassignedHeroes.length === 0 && (
                        <div className="col-span-full text-center py-8">
                          <Check className="w-8 h-8 text-green-400 mx-auto mb-2" />
                          <p className="text-green-400 text-sm font-medium">All heroes assigned!</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="p-3 border-t border-white/5 flex-shrink-0">
                    <button
                      onClick={closeHeroModal}
                      className="w-full py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* View Mode */}
          {mode === 'view' && (
            <div className="space-y-8 md:space-y-10">
              {/* Official Tier List */}
              {heroes && heroes.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                    <h2 className="text-lg md:text-xl font-semibold text-white">Official Meta</h2>
                    <span className="text-[10px] md:text-xs text-gray-500">Based on API data</span>
                  </div>

                  <div className="bg-dark-300/50 border border-white/5 rounded-2xl overflow-hidden">
                    {TIER_ORDER.map(tier => {
                      const config = TIER_CONFIG[tier];
                      const tierHeroes = heroes.filter(h => h.stats?.tier === tier);
                      if (tierHeroes.length === 0) return null;

                      return (
                        <div key={tier} className="flex items-stretch border-b border-white/5 last:border-b-0">
                          <div className={`w-20 flex items-center justify-center bg-gradient-to-br ${config.color} flex-shrink-0`}>
                            <span className="text-3xl font-bold text-white">{tier}</span>
                          </div>
                          <div className={`flex-1 p-4 ${config.bgColor}`}>
                            <div className="flex flex-wrap gap-2">
                              {tierHeroes.map(hero => (
                                <Link
                                  key={hero.heroId}
                                  to="/heroes/$heroId"
                                  params={{ heroId: hero.heroId.toString() }}
                                  className="group relative"
                                >
                                  <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-white/10 group-hover:border-primary-500 transition-all group-hover:scale-105">
                                    <img src={hero.icon} alt={hero.name} className="w-full h-full object-cover" />
                                  </div>
                                  <div className="absolute -bottom-1 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[10px] bg-black/80 text-white px-1.5 py-0.5 rounded">{hero.name}</span>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Community Tier Lists */}
              <div>
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <div className="flex items-center gap-2 md:gap-3">
                    <h2 className="text-lg md:text-xl font-semibold text-white">Community</h2>
                    <span className="text-[10px] md:text-xs text-gray-500">{sortedTierLists.length} tier lists</span>
                  </div>
                </div>

                {isLoadingTierLists ? (
                  <Loading message="Loading community tier lists..." />
                ) : sortedTierLists.length === 0 ? (
                  <div className="text-center py-12 md:py-16 bg-dark-300/50 rounded-2xl border border-white/5">
                    <Users className="w-10 md:w-12 h-10 md:h-12 text-gray-600 mx-auto mb-3 md:mb-4" />
                    <h3 className="text-base md:text-lg font-semibold text-white mb-2">No Tier Lists Yet</h3>
                    <p className="text-gray-400 text-xs md:text-sm mb-4 md:mb-6">Be the first to create one!</p>
                    <button
                      onClick={() => setMode('create')}
                      className="px-5 md:px-6 py-2 md:py-2.5 bg-white text-dark-400 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors"
                    >
                      Create Tier List
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
                    {sortedTierLists.map((tierList, index) => (
                      <motion.div
                        key={tierList.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.2) }}
                        onClick={() => setSelectedTierList(tierList)}
                        className="bg-dark-300/50 border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all cursor-pointer group"
                      >
                        {/* Card Header */}
                        <div className="p-4 border-b border-white/5">
                          <h3 className="font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors">
                            {tierList.title}
                          </h3>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-3">
                              <span className="text-gray-400">
                                by <span className="text-primary-400">{tierList.creatorName}</span>
                              </span>
                              <span className="text-gray-500 text-xs">
                                {new Date(tierList.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleCopyLink(tierList.id); }}
                                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                              >
                                {copiedId === tierList.id ? (
                                  <Check className="w-4 h-4 text-green-400" />
                                ) : (
                                  <Share2 className="w-4 h-4 text-gray-500 hover:text-white" />
                                )}
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleVote(tierList.id); }}
                                className="flex items-center gap-1.5 px-2 py-1 hover:bg-white/10 rounded-lg transition-colors"
                              >
                                <ThumbsUp className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-medium text-white">{tierList.votes}</span>
                              </button>
                            </div>
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
                                <div className={`w-10 h-7 rounded flex items-center justify-center bg-gradient-to-r ${config.color}`}>
                                  <span className="text-white font-bold text-xs">{tier}</span>
                                </div>
                                <div className="flex-1 flex flex-wrap gap-1">
                                  {tierHeroes.slice(0, 8).map(hero => (
                                    <img
                                      key={hero.heroId}
                                      src={hero.icon}
                                      alt={hero.name}
                                      className="w-7 h-7 rounded border border-white/10"
                                    />
                                  ))}
                                  {tierHeroes.length > 8 && (
                                    <div className="w-7 h-7 rounded bg-dark-200 border border-white/10 flex items-center justify-center text-xs text-gray-400">
                                      +{tierHeroes.length - 8}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Tier List Detail Modal */}
      <AnimatePresence>
        {selectedTierList && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-black/95 md:bg-black/90 backdrop-blur-sm"
            onClick={() => setSelectedTierList(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-dark-300 rounded-xl md:rounded-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedTierList(null)}
                className="absolute top-3 right-3 md:top-4 md:right-4 z-10 p-2 md:p-2.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-4 md:w-5 h-4 md:h-5 text-white" />
              </button>

              {/* Modal Header - Fixed */}
              <div className="p-4 md:p-6 border-b border-white/5 flex-shrink-0">
                <h2 className="text-lg md:text-2xl font-bold text-white mb-2 pr-8">{selectedTierList.title}</h2>
                <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm flex-wrap">
                  <span className="text-gray-400">
                    by <span className="text-primary-400 font-medium">{selectedTierList.creatorName}</span>
                  </span>
                  <span className="text-gray-500">{new Date(selectedTierList.createdAt).toLocaleDateString()}</span>
                  <div className="ml-auto flex items-center gap-1.5 md:gap-2">
                    <button
                      onClick={handleDownload}
                      disabled={isDownloading}
                      className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isDownloading ? (
                        <Loader2 className="w-3.5 md:w-4 h-3.5 md:h-4 animate-spin" />
                      ) : (
                        <Download className="w-3.5 md:w-4 h-3.5 md:h-4" />
                      )}
                      <span className="text-xs md:text-sm hidden sm:inline">
                        {isDownloading ? 'Saving...' : 'Download'}
                      </span>
                    </button>
                    <button
                      onClick={() => handleShare(selectedTierList)}
                      className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      {copiedId === selectedTierList.id ? (
                        <Check className="w-3.5 md:w-4 h-3.5 md:h-4 text-green-400" />
                      ) : (
                        <Share2 className="w-3.5 md:w-4 h-3.5 md:h-4 text-gray-400" />
                      )}
                      <span className="text-xs md:text-sm text-white hidden sm:inline">Share</span>
                    </button>
                    <button
                      onClick={() => handleVote(selectedTierList.id)}
                      className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <ThumbsUp className="w-3.5 md:w-4 h-3.5 md:h-4 text-gray-400" />
                      <span className="text-xs md:text-sm font-medium text-white">{selectedTierList.votes}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Content - Scrollable */}
              <div className="overflow-y-auto flex-1">
                <div ref={tierListRef} className="p-4 md:p-6 space-y-2 md:space-y-3 bg-dark-300">
                  {/* Title for download image */}
                  <div className="pb-3 mb-3 border-b border-white/10">
                    <h3 className="text-xl font-bold text-white">{selectedTierList.title}</h3>
                    <p className="text-sm text-gray-400 mt-1">by {selectedTierList.creatorName} • HoK Hub</p>
                  </div>

                  {TIER_ORDER.map(tier => {
                    const tierHeroIds = selectedTierList.tiers[tier] || [];
                    if (tierHeroIds.length === 0) return null;

                    const config = TIER_CONFIG[tier];
                    const tierHeroes = tierHeroIds
                      .map(id => heroes?.find(h => h.heroId === id))
                      .filter(Boolean) as Hero[];

                    return (
                      <div key={tier} className="rounded-xl overflow-hidden border border-white/5">
                        <div className="flex items-stretch">
                          <div className={`w-16 flex items-center justify-center bg-gradient-to-br ${config.color} flex-shrink-0`}>
                            <span className="text-2xl font-bold text-white">{tier}</span>
                          </div>
                          <div className={`flex-1 p-4 ${config.bgColor}`}>
                            <div className="flex flex-wrap gap-2">
                              {tierHeroes.map(hero => (
                                <div
                                  key={hero.heroId}
                                  className="w-14 h-14 rounded-lg overflow-hidden border border-white/10"
                                  title={hero.name}
                                >
                                  <img src={hero.icon} alt={hero.name} className="w-full h-full object-cover" />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Watermark */}
                  <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between text-xs text-gray-500">
                    <span>hok-hub.project-n.site</span>
                    <span>{new Date(selectedTierList.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save Modal */}
      <AnimatePresence>
        {showSaveModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-black/95 md:bg-black/90 backdrop-blur-sm"
            onClick={() => setShowSaveModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-dark-300 rounded-xl md:rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-4 md:p-6 border-b border-white/5">
                <h2 className="text-lg md:text-xl font-bold text-white">Save Tier List</h2>
                <p className="text-xs md:text-sm text-gray-400 mt-1">Share your tier list with the community</p>
              </div>

              {/* Modal Content */}
              <div className="p-4 md:p-6 space-y-3 md:space-y-4">
                {/* Summary */}
                <div className="p-4 bg-dark-200/50 rounded-xl space-y-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Summary</p>
                  <div className="flex flex-wrap gap-2">
                    {TIER_ORDER.map(tier => {
                      const count = tierAssignments[tier].length;
                      if (count === 0) return null;
                      const config = TIER_CONFIG[tier];
                      return (
                        <div key={tier} className="flex items-center gap-1.5">
                          <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold bg-gradient-to-br ${config.color} text-white`}>
                            {tier}
                          </span>
                          <span className="text-sm text-gray-300">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-sm text-gray-400">
                    Total: {Object.values(tierAssignments).flat().length} heroes
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Title *</label>
                  <input
                    type="text"
                    value={tierListTitle}
                    onChange={(e) => setTierListTitle(e.target.value)}
                    placeholder="e.g., Season 10 Meta Tier List"
                    className="w-full px-4 py-3 bg-dark-200/50 border border-white/10 rounded-xl focus:outline-none focus:border-primary-500/50 text-white placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Your Name *</label>
                  <input
                    type="text"
                    value={creatorName}
                    onChange={(e) => setCreatorName(e.target.value)}
                    placeholder="Enter your name"
                    disabled={!!user}
                    className="w-full px-4 py-3 bg-dark-200/50 border border-white/10 rounded-xl focus:outline-none focus:border-primary-500/50 text-white placeholder-gray-500 disabled:opacity-60"
                  />
                  {user && (
                    <p className="text-xs text-gray-500 mt-1">Logged in as {user.name}</p>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 md:p-6 border-t border-white/5 flex gap-2 md:gap-3">
                <button
                  onClick={handleSave}
                  disabled={isSaving || !tierListTitle.trim() || !creatorName.trim()}
                  className="flex-1 flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-4 py-2.5 md:py-3 bg-white text-dark-400 rounded-xl text-sm font-medium hover:bg-gray-100 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="w-3.5 md:w-4 h-3.5 md:h-4" />
                  {isSaving ? 'Saving...' : 'Save Tier List'}
                </button>
                <button
                  onClick={() => setShowSaveModal(false)}
                  disabled={isSaving}
                  className="px-4 md:px-6 py-2.5 md:py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Menu Modal */}
      <AnimatePresence>
        {showShareMenu && selectedTierList && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowShareMenu(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-300 rounded-2xl p-4 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-white mb-4">Share Tier List</h3>
              <div className="space-y-2">
                {getShareLinks(selectedTierList).map((link) => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                    onClick={() => setShowShareMenu(null)}
                  >
                    <span className="text-xl">{link.icon}</span>
                    <span className="text-white font-medium">{link.name}</span>
                  </a>
                ))}
                <button
                  onClick={() => {
                    handleCopyLink(selectedTierList.id);
                    setShowShareMenu(null);
                  }}
                  className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors w-full"
                >
                  <span className="text-xl">🔗</span>
                  <span className="text-white font-medium">Copy Link</span>
                </button>
              </div>
              <button
                onClick={() => setShowShareMenu(null)}
                className="w-full mt-4 py-2 text-gray-400 hover:text-white transition-colors text-sm"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
