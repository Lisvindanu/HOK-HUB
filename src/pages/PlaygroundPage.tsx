import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, RotateCcw, ChevronLeft, Flame, Droplets, Leaf,
  Plus, Minus, Check, Swords, Shield, Wind, TreePine, Compass,
} from 'lucide-react';
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

// ─── Item categories ───────────────────────────────────────────────────────────

const ITEM_CATEGORIES = [
  { id: 0, label: 'All', Icon: null },
  { id: 1, label: 'Physical', Icon: Swords },
  { id: 2, label: 'Magical', Icon: Flame },
  { id: 3, label: 'Defense', Icon: Shield },
  { id: 4, label: 'Movement', Icon: Wind },
  { id: 5, label: 'Jungle', Icon: TreePine },
  { id: 7, label: 'Roaming', Icon: Compass },
] as const;

// ─── Arcana ────────────────────────────────────────────────────────────────────

type ArcanaEntry = { arcana: Arcana; count: number };
type BuildArcanaState = { 1: ArcanaEntry[]; 2: ArcanaEntry[]; 3: ArcanaEntry[] };

const ARCANA_COLORS = [
  { color: 1 as const, label: 'Red', Icon: Flame, text: 'text-red-400', border: 'border-red-500/25', bg: 'bg-red-500/10', activeBg: 'bg-red-500/20', activeBorder: 'border-red-500/40' },
  { color: 2 as const, label: 'Blue', Icon: Droplets, text: 'text-blue-400', border: 'border-blue-500/25', bg: 'bg-blue-500/10', activeBg: 'bg-blue-500/20', activeBorder: 'border-blue-500/40' },
  { color: 3 as const, label: 'Green', Icon: Leaf, text: 'text-green-400', border: 'border-green-500/25', bg: 'bg-green-500/10', activeBg: 'bg-green-500/20', activeBorder: 'border-green-500/40' },
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

  // Build state
  const [selectedHero, setSelectedHero] = useState<Hero | null>(null);
  const [heroSearch, setHeroSearch] = useState('');
  const [heroRole, setHeroRole] = useState('All');
  const [buildItems, setBuildItems] = useState<(Item | null)[]>(Array(6).fill(null));
  const [buildArcana, setBuildArcana] = useState<BuildArcanaState>({ 1: [], 2: [], 3: [] });

  // Modal state
  const [itemSlot, setItemSlot] = useState<number | null>(null);
  const [arcanaColor, setArcanaColor] = useState<1 | 2 | 3 | null>(null);

  function pickHero(hero: Hero) {
    setSelectedHero(hero);

    if (itemsData && hero.recommendedEquipment?.length) {
      const newItems: (Item | null)[] = Array(6).fill(null);
      hero.recommendedEquipment.slice(0, 6).forEach((eq, i) => {
        newItems[i] = itemsData.find(item => item.id === eq.id) ?? null;
      });
      setBuildItems(newItems);
    } else {
      setBuildItems(Array(6).fill(null));
    }

    if (arcanaData && hero.arcana?.length) {
      const newArcana: BuildArcanaState = { 1: [], 2: [], 3: [] };
      const byColor: { 1: Arcana[]; 2: Arcana[]; 3: Arcana[] } = { 1: [], 2: [], 3: [] };

      for (const rec of hero.arcana) {
        const found = arcanaData.find(a => a.id === rec.id);
        if (found) {
          const c = found.color as 1 | 2 | 3;
          if (!byColor[c].find(a => a.id === found.id)) {
            byColor[c].push(found);
          }
        }
      }

      for (const c of [1, 2, 3] as const) {
        const arcs = byColor[c];
        if (arcs.length === 0) continue;
        const base = Math.floor(10 / arcs.length);
        const rem = 10 % arcs.length;
        newArcana[c] = arcs.map((arc, i) => ({ arcana: arc, count: base + (i === 0 ? rem : 0) }));
      }

      setBuildArcana(newArcana);
    } else {
      setBuildArcana({ 1: [], 2: [], 3: [] });
    }
  }

  function resetBuild() {
    setBuildItems(Array(6).fill(null));
    setBuildArcana({ 1: [], 2: [], 3: [] });
  }

  // Arcana helpers
  function toggleArcana(color: 1 | 2 | 3, arc: Arcana) {
    setBuildArcana(prev => {
      const entries = [...prev[color]];
      const idx = entries.findIndex(e => e.arcana.id === arc.id);
      if (idx >= 0) {
        entries.splice(idx, 1);
      } else {
        const used = entries.reduce((s, e) => s + e.count, 0);
        if (used < 10) entries.push({ arcana: arc, count: 1 });
      }
      return { ...prev, [color]: entries };
    });
  }

  function adjustArcanaCount(color: 1 | 2 | 3, arcanaId: number, delta: number) {
    setBuildArcana(prev => {
      const entries = prev[color].map(e => {
        if (e.arcana.id !== arcanaId) return e;
        const totalOthers = prev[color].filter(x => x.arcana.id !== arcanaId).reduce((s, x) => s + x.count, 0);
        const maxThis = 10 - totalOthers;
        const newCount = Math.max(1, Math.min(e.count + delta, maxThis));
        return { ...e, count: newCount };
      });
      return { ...prev, [color]: entries };
    });
  }

  function removeArcana(color: 1 | 2 | 3, arcanaId: number) {
    setBuildArcana(prev => ({
      ...prev,
      [color]: prev[color].filter(e => e.arcana.id !== arcanaId),
    }));
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
      for (const entry of buildArcana[c]) {
        for (const e of entry.arcana.effects ?? []) {
          const v = parseEffectValue(e.valueType, e.value) * entry.count;
          acc[e.effectType] = (acc[e.effectType] ?? 0) + v;
        }
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
                  Reset
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
          // ── HERO SELECTION ────────────────────────────────────────────────────
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
          // ── BUILD EDITOR ──────────────────────────────────────────────────────
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
                        onClick={() => setItemSlot(i)}
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
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Arcana</h3>
                <div className="space-y-2.5">
                  {ARCANA_COLORS.map(({ color, label, Icon, text, border, bg }) => {
                    const entries = buildArcana[color];
                    const totalUsed = entries.reduce((s, e) => s + e.count, 0);
                    const remaining = 10 - totalUsed;
                    const hasEntries = entries.length > 0;

                    return (
                      <div
                        key={color}
                        className={`rounded-xl border p-3 transition-all ${
                          hasEntries ? `${bg} ${border}` : 'border-white/10 bg-white/[0.02]'
                        }`}
                      >
                        {/* Color header */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            <Icon className={`w-3.5 h-3.5 ${text}`} />
                            <span className={`text-xs font-semibold ${text}`}>{label}</span>
                          </div>
                          <span className={`text-xs font-medium tabular-nums ${totalUsed >= 10 ? 'text-green-400' : 'text-gray-600'}`}>
                            {totalUsed}/10
                          </span>
                        </div>

                        {/* Arcana entries */}
                        {entries.length > 0 && (
                          <div className="space-y-1.5 mb-2">
                            {entries.map(entry => (
                              <div key={entry.arcana.id} className="flex items-center gap-2">
                                <img
                                  src={entry.arcana.icon}
                                  alt={entry.arcana.name}
                                  className="w-7 h-7 object-contain flex-shrink-0"
                                />
                                <p className="flex-1 text-xs text-white/80 truncate min-w-0">
                                  {entry.arcana.name.replace(/^Lvl \d+: /, '')}
                                </p>
                                {/* Count controls */}
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <button
                                    onClick={() => adjustArcanaCount(color, entry.arcana.id, -1)}
                                    className="w-5 h-5 rounded flex items-center justify-center bg-white/[0.07] hover:bg-white/[0.15] text-gray-400 hover:text-white transition-colors"
                                  >
                                    <Minus className="w-2.5 h-2.5" />
                                  </button>
                                  <span className="text-xs font-bold text-white w-6 text-center tabular-nums">
                                    ×{entry.count}
                                  </span>
                                  <button
                                    onClick={() => adjustArcanaCount(color, entry.arcana.id, 1)}
                                    disabled={remaining <= 0}
                                    className="w-5 h-5 rounded flex items-center justify-center bg-white/[0.07] hover:bg-white/[0.15] text-gray-400 hover:text-white transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
                                  >
                                    <Plus className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                                <button
                                  onClick={() => removeArcana(color, entry.arcana.id)}
                                  className="w-5 h-5 flex items-center justify-center rounded text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add arcana button */}
                        {remaining > 0 && (
                          <button
                            onClick={() => setArcanaColor(color)}
                            className="w-full flex items-center gap-1.5 py-1.5 px-2 rounded-lg border border-dashed border-white/10 hover:border-white/20 hover:bg-white/[0.04] text-gray-600 hover:text-white/70 text-xs transition-all"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Tambah arcana</span>
                            <span className="ml-auto text-gray-700">{remaining} slot</span>
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
                        return (
                          <div
                            key={et}
                            className="flex items-center justify-between py-2 border-b border-white/[0.05] last:border-0"
                          >
                            <span className="text-xs text-gray-400">{info.name}</span>
                            <span className={`text-sm font-bold tabular-nums ${info.isPercent ? 'text-amber-300' : 'text-white'}`}>
                              {fmtVal(info.isPercent, stats[et])}
                            </span>
                          </div>
                        );
                      })
                    }
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
                    <span className="text-xs text-gray-500">Total Gold</span>
                    <span className="text-sm font-bold text-amber-400">{totalGold.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Item Picker (full-screen overlay) ─────────────────────────────────── */}
      <AnimatePresence>
        {itemSlot !== null && itemsData && (
          <ItemPickerOverlay
            itemsData={itemsData}
            onSelect={item => {
              const n = [...buildItems];
              n[itemSlot] = item;
              setBuildItems(n);
              setItemSlot(null);
            }}
            onClose={() => setItemSlot(null)}
          />
        )}
      </AnimatePresence>

      {/* ── Arcana Picker Modal ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {arcanaColor !== null && arcanaData && (
          <ArcanaPickerModal
            color={arcanaColor}
            arcanaData={arcanaData}
            buildArcana={buildArcana}
            onToggle={toggleArcana}
            onClose={() => setArcanaColor(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Item Picker Overlay (3-panel) ─────────────────────────────────────────────

function ItemPickerOverlay({
  itemsData,
  onSelect,
  onClose,
}: {
  itemsData: Item[];
  onSelect: (item: Item) => void;
  onClose: () => void;
}) {
  const [category, setCategory] = useState<number>(0);
  const [tab, setTab] = useState<'advanced' | 'basic'>('advanced');
  const [search, setSearch] = useState('');
  const [previewItem, setPreviewItem] = useState<Item | null>(null);

  const filtered = useMemo(() => {
    return itemsData
      .filter(item => tab === 'advanced' ? item.isTopEquip : !item.isTopEquip)
      .filter(item => category === 0 || item.type === category)
      .filter(item =>
        !search ||
        item.name.toLowerCase().includes(search.toLowerCase())
      );
  }, [itemsData, category, tab, search]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-dark-400 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-dark-300/60 flex-shrink-0">
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="font-bold text-white text-lg">Pilih Item</h2>

        {/* Advanced / Basic tabs */}
        <div className="flex bg-white/[0.07] rounded-lg p-0.5 ml-2">
          <button
            onClick={() => setTab('advanced')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              tab === 'advanced' ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Advanced
          </button>
          <button
            onClick={() => setTab('basic')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              tab === 'basic' ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Basic
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search items..."
            autoFocus
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.07] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/20"
          />
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: categories */}
        <div className="w-24 md:w-32 shrink-0 border-r border-white/[0.08] overflow-y-auto py-2 bg-dark-300/30">
          {ITEM_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`w-full text-left px-3 py-2.5 text-sm font-medium transition-all flex items-center gap-2 ${
                category === cat.id
                  ? 'text-white bg-white/[0.1] border-r-2 border-primary-500'
                  : 'text-gray-500 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              {cat.Icon && <cat.Icon className="w-3.5 h-3.5 shrink-0" />}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Center: item grid */}
        <div className="flex-1 overflow-y-auto p-3">
          {filtered.length === 0 ? (
            <p className="text-center text-gray-600 text-sm py-16">No items found</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filtered.map(item => (
                <button
                  key={item.id}
                  onClick={() => setPreviewItem(item)}
                  onDoubleClick={() => onSelect(item)}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all text-left w-full ${
                    previewItem?.id === item.id
                      ? 'bg-primary-500/15 border-primary-500/40'
                      : 'bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.07] hover:border-white/[0.14]'
                  }`}
                >
                  <img
                    src={item.icon}
                    alt={item.name}
                    className="w-12 h-12 rounded-full object-cover shrink-0 ring-1 ring-white/10"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white truncate">{item.name}</p>
                    <p className="text-[11px] text-gray-500 truncate">{item.typeName}</p>
                    <p className="text-xs text-amber-400 font-medium">{item.price.toLocaleString()} Gold</p>
                  </div>
                  {previewItem?.id === item.id && (
                    <Check className="w-4 h-4 text-primary-400 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
          <p className="text-center text-[11px] text-gray-700 mt-4">Double-click untuk langsung pilih</p>
        </div>

        {/* Right: detail panel */}
        <div className="hidden lg:flex flex-col w-72 shrink-0 border-l border-white/[0.08] overflow-y-auto p-4 bg-dark-300/30">
          {previewItem ? (
            <ItemDetailPanel item={previewItem} onSelect={onSelect} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mb-3">
                <Swords className="w-6 h-6 text-gray-700" />
              </div>
              <p className="text-gray-600 text-sm">Klik item untuk melihat detail</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Item Detail Panel ─────────────────────────────────────────────────────────

function ItemDetailPanel({ item, onSelect }: { item: Item; onSelect: (item: Item) => void }) {
  return (
    <div>
      {/* Icon + name + price */}
      <div className="flex items-center gap-3 mb-4">
        <img src={item.icon} alt={item.name} className="w-16 h-16 rounded-xl object-cover ring-1 ring-white/15 shrink-0" />
        <div className="min-w-0">
          <h3 className="font-bold text-white text-sm leading-tight">{item.name}</h3>
          <p className="text-amber-400 font-semibold text-sm mt-0.5">{item.price.toLocaleString()} Gold</p>
          <span className="text-[11px] text-gray-500">{item.typeName} · Lv.{item.level}</span>
        </div>
      </div>

      {/* Stats */}
      {item.effects?.length > 0 && (
        <div className="mb-4">
          <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-2">Stats</p>
          <div className="space-y-0">
            {item.effects.map((e, i) => {
              const info = STAT_INFO[e.effectType];
              const val = parseEffectValue(e.valueType, e.value);
              const label = info?.name ?? `Stat #${e.effectType}`;
              const isPercent = info?.isPercent ?? false;
              return (
                <div key={i} className="flex justify-between items-center py-1.5 border-b border-white/[0.05] last:border-0">
                  <span className="text-xs text-gray-400">{label}</span>
                  <span className={`text-xs font-bold tabular-nums ${isPercent ? 'text-amber-300' : 'text-white'}`}>
                    {fmtVal(isPercent, val)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Passive skills */}
      {item.passiveSkills?.length > 0 && (
        <div className="mb-4">
          <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-2">Passive</p>
          <div className="space-y-2">
            {item.passiveSkills.map((ps, i) => (
              <p key={i} className="text-[11px] text-gray-400 leading-relaxed bg-white/[0.04] rounded-lg p-2.5 border border-white/[0.06]">
                {ps.description}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Recipe */}
      {item.buildsFrom?.length > 0 && (
        <div className="mb-5">
          <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-2">Recipe</p>
          <div className="flex flex-wrap gap-2">
            {item.buildsFrom.map(ref => (
              <div key={ref.id} className="flex items-center gap-1.5 bg-white/[0.04] rounded-lg px-2 py-1.5 border border-white/[0.06]">
                <img src={ref.icon} alt={ref.name} className="w-7 h-7 rounded-md object-cover" />
                <div>
                  <p className="text-[10px] text-gray-400 font-medium">{ref.name}</p>
                  {ref.price && <p className="text-[10px] text-amber-500">{ref.price.toLocaleString()}g</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => onSelect(item)}
        className="w-full py-2.5 bg-primary-500 hover:bg-primary-400 rounded-xl text-white font-semibold text-sm transition-colors"
      >
        Pilih Item Ini
      </button>
    </div>
  );
}

// ─── Arcana Picker Modal ───────────────────────────────────────────────────────

function ArcanaPickerModal({
  color,
  arcanaData,
  buildArcana,
  onToggle,
  onClose,
}: {
  color: 1 | 2 | 3;
  arcanaData: Arcana[];
  buildArcana: BuildArcanaState;
  onToggle: (color: 1 | 2 | 3, arc: Arcana) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState('');
  const colorMeta = ARCANA_COLORS.find(c => c.color === color)!;

  const entries = buildArcana[color];
  const totalUsed = entries.reduce((s, e) => s + e.count, 0);
  const remaining = 10 - totalUsed;

  const filteredArcana = useMemo(() =>
    arcanaData
      .filter(a => a.color === color)
      .filter(a =>
        !search ||
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.description.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => b.level - a.level),
    [arcanaData, color, search]
  );

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
        className="w-full sm:max-w-md bg-dark-300 rounded-t-2xl sm:rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <colorMeta.Icon className={`w-4 h-4 ${colorMeta.text}`} />
            <h3 className="font-bold text-white">{colorMeta.label} Arcana</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-medium ${remaining <= 0 ? 'text-green-400' : 'text-gray-500'}`}>
              {remaining > 0 ? `${remaining} slot tersisa` : 'Full (10/10)'}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 pt-3 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search arcana..."
              autoFocus
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none"
            />
          </div>
        </div>

        {/* Arcana list */}
        <div className="overflow-y-auto max-h-[50vh] px-2 pb-3 space-y-0.5">
          {filteredArcana.map(arc => {
            const isSelected = entries.some(e => e.arcana.id === arc.id);
            const isDisabled = !isSelected && remaining <= 0;
            const entry = entries.find(e => e.arcana.id === arc.id);

            return (
              <button
                key={arc.id}
                onClick={() => !isDisabled && onToggle(color, arc)}
                disabled={isDisabled}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${
                  isSelected
                    ? `${colorMeta.bg} border ${colorMeta.border}`
                    : isDisabled
                      ? 'opacity-30 cursor-not-allowed'
                      : 'hover:bg-white/[0.06]'
                }`}
              >
                <img
                  src={arc.icon}
                  alt={arc.name}
                  className="w-10 h-10 object-contain flex-shrink-0 bg-white/[0.05] rounded-lg p-0.5"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {arc.name.replace(/^Lvl \d+: /, '')}
                  </p>
                  <p className="text-[11px] text-gray-500 truncate">{arc.description.split('\n').join(' · ')}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {isSelected && entry && (
                    <span className={`text-xs font-bold ${colorMeta.text}`}>×{entry.count}</span>
                  )}
                  <span className="text-xs text-gray-600">Lv.{arc.level}</span>
                  {isSelected && <Check className={`w-4 h-4 ${colorMeta.text}`} />}
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
