import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, RotateCcw, ChevronLeft, Flame, Droplets, Leaf, Plus } from 'lucide-react';
import { useHeroes } from '../hooks/useHeroes';
import { useItems, useArcana } from '../hooks/useItems';
import { Loading } from '../components/ui/Loading';
import type { Item, Arcana } from '../types/hero';
import type { Hero } from '../types/hero';

// ─── Stat definitions ─────────────────────────────────────────────────────────

const STAT_INFO: Record<number, { name: string; isPercent: boolean }> = {
  1: { name: 'Physical Attack', isPercent: false },
  2: { name: 'Magical Attack', isPercent: false },
  3: { name: 'Physical Defense', isPercent: false },
  4: { name: 'Magical Defense', isPercent: false },
  5: { name: 'Max Health', isPercent: false },
  6: { name: 'Critical Rate', isPercent: true },
  7: { name: 'Physical Pierce', isPercent: true },
  8: { name: 'Magical Pierce', isPercent: true },
  9: { name: 'Physical Lifesteal', isPercent: true },
  10: { name: 'Magical Lifesteal', isPercent: true },
  12: { name: 'Critical Damage', isPercent: true },
  15: { name: 'Movement Speed', isPercent: false },
  16: { name: 'Health Recovery', isPercent: false },
  18: { name: 'Attack Speed', isPercent: true },
  19: { name: 'Cooldown Reduction', isPercent: true },
};

// Stat order for display
const STAT_ORDER = [1, 2, 5, 3, 4, 6, 12, 7, 8, 18, 9, 10, 19, 15, 16];

function parseEffectValue(valueType: number, value: number): number {
  switch (valueType) {
    case 1: return value;
    case 2: return value / 10000;
    case 3:
    case 4: return value / 100;
    default: return value;
  }
}

function fmtVal(isPercent: boolean, value: number): string {
  const v = value % 1 === 0 ? value.toString() : value.toFixed(1);
  return isPercent ? `+${v}%` : `+${v}`;
}

// ─── Arcana color config ───────────────────────────────────────────────────────

const ARCANA_COLORS = [
  { color: 1 as const, label: 'Red', Icon: Flame, text: 'text-red-400', border: 'border-red-500/25', bg: 'bg-red-500/10' },
  { color: 2 as const, label: 'Blue', Icon: Droplets, text: 'text-blue-400', border: 'border-blue-500/25', bg: 'bg-blue-500/10' },
  { color: 3 as const, label: 'Green', Icon: Leaf, text: 'text-green-400', border: 'border-green-500/25', bg: 'bg-green-500/10' },
] as const;

const ROLES = ['All', 'Tank', 'Fighter', 'Assassin', 'Mage', 'Marksman', 'Support'];

// ─── Main Component ────────────────────────────────────────────────────────────

export function PlaygroundPage() {
  const { data: heroesData, isLoading: loadingHeroes } = useHeroes();
  const { data: itemsData, isLoading: loadingItems } = useItems();
  const { data: arcanaData, isLoading: loadingArcana } = useArcana();

  const heroes = useMemo(
    () => (heroesData ? Object.values(heroesData).sort((a, b) => a.name.localeCompare(b.name)) : []),
    [heroesData]
  );

  const topItems = useMemo(
    () => (itemsData ? itemsData.filter(i => i.isTopEquip) : []),
    [itemsData]
  );

  // Build state
  const [selectedHero, setSelectedHero] = useState<Hero | null>(null);
  const [heroSearch, setHeroSearch] = useState('');
  const [heroRole, setHeroRole] = useState('All');
  const [buildItems, setBuildItems] = useState<(Item | null)[]>(Array(6).fill(null));
  const [buildArcana, setBuildArcana] = useState<{ 1: Arcana | null; 2: Arcana | null; 3: Arcana | null }>({
    1: null, 2: null, 3: null,
  });

  // Modal state
  const [itemSlot, setItemSlot] = useState<number | null>(null);
  const [arcanaColor, setArcanaColor] = useState<1 | 2 | 3 | null>(null);
  const [itemSearch, setItemSearch] = useState('');
  const [arcanaSearch, setArcanaSearch] = useState('');

  function pickHero(hero: Hero) {
    setSelectedHero(hero);

    // Pre-fill items from hero's recommended equipment
    if (itemsData && hero.recommendedEquipment?.length) {
      const newItems: (Item | null)[] = Array(6).fill(null);
      hero.recommendedEquipment.slice(0, 6).forEach((eq, i) => {
        newItems[i] = itemsData.find(item => item.id === eq.id) ?? null;
      });
      setBuildItems(newItems);
    } else {
      setBuildItems(Array(6).fill(null));
    }

    // Pre-fill arcana from hero's recommended arcana (match against full arcana data with effects)
    if (arcanaData && hero.arcana?.length) {
      const newArcana: { 1: Arcana | null; 2: Arcana | null; 3: Arcana | null } = { 1: null, 2: null, 3: null };
      for (const rec of hero.arcana) {
        const found = arcanaData.find(a => a.id === rec.id);
        if (found) {
          const c = found.color as 1 | 2 | 3;
          if (!newArcana[c]) newArcana[c] = found;
        }
      }
      setBuildArcana(newArcana);
    } else {
      setBuildArcana({ 1: null, 2: null, 3: null });
    }
  }

  function resetBuild() {
    setBuildItems(Array(6).fill(null));
    setBuildArcana({ 1: null, 2: null, 3: null });
  }

  // Stat aggregation
  const stats = useMemo(() => {
    const acc: Record<number, number> = {};

    for (const item of buildItems) {
      if (!item) continue;
      for (const e of item.effects ?? []) {
        const v = parseEffectValue(e.valueType, e.value);
        acc[e.effectType] = (acc[e.effectType] ?? 0) + v;
      }
    }

    for (const c of [1, 2, 3] as const) {
      const arc = buildArcana[c];
      if (!arc) continue;
      for (const e of arc.effects ?? []) {
        const v = parseEffectValue(e.valueType, e.value) * 10;
        acc[e.effectType] = (acc[e.effectType] ?? 0) + v;
      }
    }

    return acc;
  }, [buildItems, buildArcana]);

  const totalGold = useMemo(
    () => buildItems.reduce((s, item) => s + (item?.price ?? 0), 0),
    [buildItems]
  );

  if (loadingHeroes || loadingItems || loadingArcana) return <Loading />;

  const filteredHeroes = heroes.filter(h => {
    const matchSearch = !heroSearch || h.name.toLowerCase().includes(heroSearch.toLowerCase());
    const matchRole = heroRole === 'All' || h.role === heroRole;
    return matchSearch && matchRole;
  });

  return (
    <div className="min-h-screen bg-dark-400">
      {/* Page Header */}
      <div className="border-b border-white/5 bg-dark-300/40">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-display font-bold text-white">Hero Build Playground</h1>
              <p className="text-gray-400 text-sm mt-0.5">Pilih hero, atur item & arcana, lihat stats real-time</p>
            </div>
            {selectedHero && (
              <div className="flex items-center gap-3">
                <button
                  onClick={resetBuild}
                  className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Build
                </button>
                <button
                  onClick={() => { setSelectedHero(null); resetBuild(); }}
                  className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Ganti Hero
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        {!selectedHero ? (
          // ── HERO SELECTION ──────────────────────────────────────────────────
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-wrap gap-3 mb-5">
              <div className="relative min-w-[180px] flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  value={heroSearch}
                  onChange={e => setHeroSearch(e.target.value)}
                  placeholder="Search hero..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/20"
                />
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {ROLES.map(r => (
                  <button
                    key={r}
                    onClick={() => setHeroRole(r)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      heroRole === r ? 'bg-primary-500 text-white' : 'bg-white/5 text-white/40 hover:text-white/70'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2">
              {filteredHeroes.map(hero => (
                <motion.button
                  key={hero.heroId}
                  onClick={() => pickHero(hero)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-white/[0.04] border border-white/[0.07] hover:bg-white/[0.09] hover:border-white/[0.18] transition-all group"
                >
                  <div className="w-full aspect-square overflow-hidden rounded-lg">
                    <img
                      src={hero.icon}
                      alt={hero.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      loading="lazy"
                    />
                  </div>
                  <span className="text-[10px] text-white/50 font-medium truncate w-full text-center leading-tight">
                    {hero.name}
                  </span>
                </motion.button>
              ))}
              {filteredHeroes.length === 0 && (
                <div className="col-span-full py-16 text-center text-gray-600 text-sm">
                  No heroes found
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          // ── BUILD EDITOR ────────────────────────────────────────────────────
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6"
          >
            {/* Left: Build config */}
            <div className="space-y-6">
              {/* Hero banner */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
                <img src={selectedHero.icon} alt={selectedHero.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                <div className="min-w-0">
                  <h2 className="text-xl font-bold text-white truncate">{selectedHero.name}</h2>
                  <p className="text-sm text-gray-400">{selectedHero.role} · {selectedHero.lane}</p>
                </div>
                {selectedHero.buildTitle && (
                  <span className="ml-auto text-xs text-gray-600 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full flex-shrink-0">
                    {selectedHero.buildTitle}
                  </span>
                )}
              </div>

              {/* Items */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Items (6 slot)</h3>
                  {totalGold > 0 && (
                    <span className="text-xs text-amber-400 font-semibold">{totalGold.toLocaleString()} Gold</span>
                  )}
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                  {buildItems.map((item, i) => (
                    <div key={i} className="flex flex-col gap-1">
                      <div
                        onClick={() => { setItemSlot(i); setItemSearch(''); }}
                        className={`group relative aspect-square rounded-xl border-2 transition-all overflow-hidden cursor-pointer ${
                          item
                            ? 'border-white/20 bg-dark-300 hover:border-white/35'
                            : 'border-dashed border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]'
                        }`}
                      >
                        {item ? (
                          <>
                            <img src={item.icon} alt={item.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="text-white text-[10px] font-semibold">Ganti</span>
                            </div>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                const n = [...buildItems];
                                n[i] = null;
                                setBuildItems(n);
                              }}
                              className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
                            >
                              <X className="w-3 h-3 text-white" />
                            </button>
                          </>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Plus className="w-5 h-5 text-white/20" />
                          </div>
                        )}
                      </div>
                      {item && (
                        <p className="text-[9px] text-gray-600 text-center truncate leading-tight px-0.5">
                          {item.name}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Arcana */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Arcana (×10 per warna)</h3>
                <div className="space-y-2">
                  {ARCANA_COLORS.map(({ color, label, Icon, text, border, bg }) => {
                    const arc = buildArcana[color];
                    return (
                      <div
                        key={color}
                        onClick={() => { setArcanaColor(color); setArcanaSearch(''); }}
                        className={`group flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                          arc
                            ? `${bg} ${border} hover:brightness-110`
                            : 'border-dashed border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.05]'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border ${arc ? `${bg} ${border}` : 'bg-white/5 border-white/10'}`}>
                          {arc ? (
                            <img src={arc.icon} alt={arc.name} className="w-6 h-6 object-contain" />
                          ) : (
                            <Icon className={`w-4 h-4 ${text} opacity-40`} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          {arc ? (
                            <>
                              <p className="text-sm font-semibold text-white truncate">
                                {arc.name.replace(/^Lvl \d+: /, '')} <span className="text-xs text-gray-500 font-normal">×10</span>
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {arc.description.split('\n').join(' · ')}
                              </p>
                            </>
                          ) : (
                            <p className={`text-sm ${text} opacity-40`}>Pilih {label} Arcana...</p>
                          )}
                        </div>
                        {arc && (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              setBuildArcana(prev => ({ ...prev, [color]: null }));
                            }}
                            className="flex-shrink-0 p-1 rounded-lg hover:bg-white/10 text-gray-600 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Stats Panel */}
            <div className="lg:sticky lg:top-20 h-fit">
              <div className="rounded-2xl bg-dark-300 border border-white/10 p-5">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Build Stats</h3>

                {Object.keys(stats).length === 0 ? (
                  <p className="text-sm text-gray-600 text-center py-10">
                    Tambah item atau arcana untuk melihat stats
                  </p>
                ) : (
                  <div className="space-y-0">
                    {STAT_ORDER
                      .filter(et => stats[et] != null)
                      .map(et => {
                        const info = STAT_INFO[et];
                        if (!info) return null;
                        const val = stats[et];
                        return (
                          <div
                            key={et}
                            className="flex items-center justify-between py-2 border-b border-white/[0.05] last:border-0"
                          >
                            <span className="text-xs text-gray-400">{info.name}</span>
                            <span className={`text-sm font-bold tabular-nums ${info.isPercent ? 'text-amber-300' : 'text-white'}`}>
                              {fmtVal(info.isPercent, val)}
                            </span>
                          </div>
                        );
                      })
                    }
                    {/* Unknown stats */}
                    {Object.entries(stats)
                      .filter(([et]) => !STAT_INFO[Number(et)])
                      .map(([et, val]) => (
                        <div key={et} className="flex items-center justify-between py-2 border-b border-white/[0.05] last:border-0">
                          <span className="text-xs text-gray-600">Stat #{et}</span>
                          <span className="text-sm font-bold text-gray-500">+{val % 1 === 0 ? val : val.toFixed(1)}</span>
                        </div>
                      ))
                    }
                  </div>
                )}

                {totalGold > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/[0.08] flex items-center justify-between">
                    <span className="text-xs text-gray-500">Total Gold Cost</span>
                    <span className="text-sm font-bold text-amber-400">{totalGold.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Item Picker Modal ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {itemSlot !== null && (
          <PickerModal title="Pilih Item" onClose={() => setItemSlot(null)}>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                value={itemSearch}
                onChange={e => setItemSearch(e.target.value)}
                placeholder="Search items..."
                autoFocus
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none"
              />
            </div>
            <div className="overflow-y-auto max-h-[52vh] space-y-1 pr-0.5">
              {topItems
                .filter(item =>
                  !itemSearch ||
                  item.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
                  item.description.toLowerCase().includes(itemSearch.toLowerCase())
                )
                .map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      const n = [...buildItems];
                      n[itemSlot] = item;
                      setBuildItems(n);
                      setItemSlot(null);
                    }}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.07] transition-colors text-left"
                  >
                    <img src={item.icon} alt={item.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{item.name}</p>
                      <p className="text-xs text-gray-500 truncate">{item.description.split('\n').join(' · ')}</p>
                    </div>
                    <span className="text-xs text-amber-400 font-medium flex-shrink-0">{item.price.toLocaleString()}g</span>
                  </button>
                ))}
            </div>
          </PickerModal>
        )}
      </AnimatePresence>

      {/* ── Arcana Picker Modal ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {arcanaColor !== null && arcanaData && (
          <PickerModal
            title={`Pilih ${arcanaColor === 1 ? 'Red' : arcanaColor === 2 ? 'Blue' : 'Green'} Arcana ×10`}
            onClose={() => setArcanaColor(null)}
          >
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                value={arcanaSearch}
                onChange={e => setArcanaSearch(e.target.value)}
                placeholder="Search arcana..."
                autoFocus
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none"
              />
            </div>
            <div className="overflow-y-auto max-h-[52vh] space-y-1 pr-0.5">
              {arcanaData
                .filter(arc => arc.color === arcanaColor)
                .filter(arc =>
                  !arcanaSearch ||
                  arc.name.toLowerCase().includes(arcanaSearch.toLowerCase()) ||
                  arc.description.toLowerCase().includes(arcanaSearch.toLowerCase())
                )
                .sort((a, b) => b.level - a.level)
                .map(arc => (
                  <button
                    key={arc.id}
                    onClick={() => {
                      setBuildArcana(prev => ({ ...prev, [arcanaColor]: arc }));
                      setArcanaColor(null);
                    }}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.07] transition-colors text-left"
                  >
                    <img src={arc.icon} alt={arc.name} className="w-10 h-10 rounded-lg object-contain flex-shrink-0 bg-white/5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{arc.name}</p>
                      <p className="text-xs text-gray-500 truncate">{arc.description.split('\n').join(' · ')}</p>
                    </div>
                    <span className="text-xs text-gray-600 flex-shrink-0">Lv.{arc.level}</span>
                  </button>
                ))}
            </div>
          </PickerModal>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Picker Modal ──────────────────────────────────────────────────────────────

function PickerModal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="w-full sm:max-w-md bg-dark-300 rounded-t-2xl sm:rounded-2xl border border-white/10 p-5 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}
