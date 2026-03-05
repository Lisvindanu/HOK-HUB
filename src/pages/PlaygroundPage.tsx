import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, RotateCcw, ChevronLeft, Flame, Droplets, Leaf,
  Plus, Minus, Check, Swords, Shield, Wind, TreePine, Compass,
  AlertTriangle, Share2, Bookmark, Copy, CheckCheck, Trash2,
} from 'lucide-react';
import { useHeroes } from '../hooks/useHeroes';
import { useItems, useArcana } from '../hooks/useItems';
import { Loading } from '../components/ui/Loading';
import type { Item, Arcana } from '../types/hero';
import type { Hero } from '../types/hero';

// ─── Saved build type ──────────────────────────────────────────────────────────
interface SavedBuild {
  id: string;
  name: string;
  heroName: string;
  heroIcon: string;
  itemIcons: string[];
  encoded: string;
  savedAt: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function extractPassiveName(desc: string): string | null {
  const m = desc.match(/^Passive\s*-\s*([^\n\r]+)/);
  return m ? m[1].trim() : null;
}

function encodeBuild(hero: Hero, items: (Item | null)[], arcana: BuildArcanaState): string {
  return btoa(JSON.stringify({
    heroId: hero.heroId,
    items: items.map(i => i?.id ?? null),
    arcana: {
      1: arcana[1].map(e => ({ id: e.arcana.id, count: e.count })),
      2: arcana[2].map(e => ({ id: e.arcana.id, count: e.count })),
      3: arcana[3].map(e => ({ id: e.arcana.id, count: e.count })),
    },
  }));
}

interface EncodedBuild {
  heroId: number;
  items: (number | null)[];
  arcana: { 1: { id: number; count: number }[]; 2: { id: number; count: number }[]; 3: { id: number; count: number }[] };
}
function decodeBuild(encoded: string): EncodedBuild | null {
  try { return JSON.parse(atob(encoded)); } catch { return null; }
}

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
  { id: 0, label: 'Equipment', Icon: null },
  { id: 1, label: 'Physical', Icon: Swords },
  { id: 2, label: 'Magical', Icon: Flame },
  { id: 3, label: 'Defense', Icon: Shield },
  { id: 4, label: 'Movement', Icon: Wind },
  { id: 5, label: 'Jungling', Icon: TreePine },
  { id: 7, label: 'Roaming', Icon: Compass },
] as const;

// Ring color by item type — matches in-game color coding
const ITEM_TYPE_RING: Record<number, string> = {
  1: 'ring-orange-400/70',
  2: 'ring-purple-400/70',
  3: 'ring-sky-400/70',
  4: 'ring-green-400/70',
  5: 'ring-lime-400/70',
  7: 'ring-teal-400/70',
};

// ─── Arcana ────────────────────────────────────────────────────────────────────

type ArcanaEntry = { arcana: Arcana; count: number };
type BuildArcanaState = { 1: ArcanaEntry[]; 2: ArcanaEntry[]; 3: ArcanaEntry[] };

const ARCANA_COLORS = [
  {
    color: 1 as const, label: 'Red', Icon: Flame,
    text: 'text-red-400', border: 'border-red-500/30', bg: 'bg-red-500/10',
    hexBg: '#2a0808', hexBorder: '#c0392b', glowClass: 'shadow-red-900/50',
  },
  {
    color: 2 as const, label: 'Blue', Icon: Droplets,
    text: 'text-sky-400', border: 'border-sky-500/30', bg: 'bg-sky-500/10',
    hexBg: '#081828', hexBorder: '#2980b9', glowClass: 'shadow-sky-900/50',
  },
  {
    color: 3 as const, label: 'Green', Icon: Leaf,
    text: 'text-green-400', border: 'border-green-500/30', bg: 'bg-green-500/10',
    hexBg: '#082808', hexBorder: '#27ae60', glowClass: 'shadow-green-900/50',
  },
] as const;

const ROLES = ['All', 'Tank', 'Fighter', 'Assassin', 'Mage', 'Marksman', 'Support'];

// ─── Hex icon component ────────────────────────────────────────────────────────

function HexIcon({
  src, alt, size = 48, borderColor = '#c8a84b', innerBg = '#1a0a2e',
  selected = false, onClick,
}: {
  src: string; alt: string; size?: number; borderColor?: string;
  innerBg?: string; selected?: boolean; onClick?: () => void;
}) {
  const HEX = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';
  const h = Math.round(size * 1.155);
  return (
    <div
      role={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`relative flex-shrink-0 transition-transform duration-150 ${onClick ? 'cursor-pointer hover:scale-110 active:scale-95' : ''} ${selected ? 'scale-110' : ''}`}
      style={{ width: size, height: h }}
    >
      {/* border layer */}
      <div
        className="absolute inset-0"
        style={{
          clipPath: HEX,
          background: selected
            ? `radial-gradient(ellipse, #fff8 0%, ${borderColor} 60%)`
            : `linear-gradient(135deg, ${borderColor}cc, ${borderColor}55, ${borderColor}cc)`,
        }}
      />
      {/* icon layer */}
      <div
        className="absolute overflow-hidden"
        style={{
          inset: 2,
          clipPath: HEX,
          background: innerBg,
        }}
      >
        <img src={src} alt={alt} className="w-full h-full object-cover" />
        {selected && (
          <div className="absolute inset-0 bg-white/25 flex items-center justify-center">
            <Check className="w-3 h-3 text-white drop-shadow" />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function PlaygroundPage() {
  useEffect(() => {
    document.title = 'Build Playground - Honor of Kings | HoK Hub';
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', 'Create and share Honor of Kings hero builds. Pick items and arcana, check passive synergies, and save your builds.');
    return () => { document.title = 'HoK Hub - Honor of Kings Community Hub'; };
  }, []);

  const { data: heroesData, isLoading: loadingHeroes } = useHeroes();
  const { data: itemsData, isLoading: loadingItems } = useItems();
  const { data: arcanaData, isLoading: loadingArcana } = useArcana();

  const heroes = useMemo(
    () => (heroesData ? Object.values(heroesData).sort((a, b) => a.name.localeCompare(b.name)) : []),
    [heroesData]
  );

  const [selectedHero, setSelectedHero] = useState<Hero | null>(null);
  const [heroSearch, setHeroSearch] = useState('');
  const [heroRole, setHeroRole] = useState('All');
  const [buildItems, setBuildItems] = useState<(Item | null)[]>(Array(6).fill(null));
  const [buildArcana, setBuildArcana] = useState<BuildArcanaState>({ 1: [], 2: [], 3: [] });

  const [itemSlot, setItemSlot] = useState<number | null>(null);
  const [arcanaColor, setArcanaColor] = useState<1 | 2 | 3 | null>(null);

  // ── New state ──────────────────────────────────────────────────────────────
  const [statsView, setStatsView] = useState<'total' | 'breakdown'>('total');
  const [shareCopied, setShareCopied] = useState(false);
  const [savedBuilds, setSavedBuilds] = useState<SavedBuild[]>(() => {
    try { return JSON.parse(localStorage.getItem('hok-playground-builds') ?? '[]'); } catch { return []; }
  });
  const [saveToast, setSaveToast] = useState(false);
  const [pendingBuild] = useState<string | null>(() => new URLSearchParams(window.location.search).get('build'));

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
          if (!byColor[c].find(a => a.id === found.id)) byColor[c].push(found);
        }
      }
      for (const c of [1, 2, 3] as const) {
        const arcs = byColor[c];
        if (!arcs.length) continue;
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

  // ── Load build from URL ────────────────────────────────────────────────────
  useEffect(() => {
    if (!pendingBuild || !heroesData || !itemsData || !arcanaData) return;
    const decoded = decodeBuild(pendingBuild);
    if (!decoded) return;
    const hero = Object.values(heroesData).find(h => h.heroId === decoded.heroId);
    if (!hero) return;
    const newItems = decoded.items.map((id: number | null) => id ? (itemsData.find(i => i.id === id) ?? null) : null);
    const newArcana: BuildArcanaState = { 1: [], 2: [], 3: [] };
    for (const c of [1, 2, 3] as const) {
      newArcana[c] = (decoded.arcana[c] ?? [])
        .map((e: { id: number; count: number }) => {
          const arc = arcanaData.find(a => a.id === e.id);
          return arc ? { arcana: arc, count: e.count } : null;
        })
        .filter(Boolean) as ArcanaEntry[];
    }
    setSelectedHero(hero);
    setBuildItems(newItems);
    setBuildArcana(newArcana);
    window.history.replaceState({}, '', window.location.pathname);
  }, [pendingBuild, heroesData, itemsData, arcanaData]);

  // ── Passive conflict detection ─────────────────────────────────────────────
  const passiveConflicts = useMemo(() => {
    const selected = buildItems.filter(Boolean) as Item[];
    const groups: Record<string, Item[]> = {};
    for (const item of selected) {
      for (const ps of item.passiveSkills ?? []) {
        const name = extractPassiveName(ps.description);
        if (!name) continue;
        if (!groups[name]) groups[name] = [];
        if (!groups[name].find(i => i.id === item.id)) groups[name].push(item);
      }
    }
    return Object.entries(groups).filter(([, its]) => its.length > 1).map(([name, its]) => ({ name, items: its }));
  }, [buildItems]);

  // ── Per-source stats ───────────────────────────────────────────────────────
  const itemStats = useMemo(() => {
    const acc: Record<number, number> = {};
    for (const item of buildItems) {
      if (!item) continue;
      for (const e of item.effects ?? []) {
        acc[e.effectType] = (acc[e.effectType] ?? 0) + parseEffectValue(e.valueType, e.value);
      }
    }
    return acc;
  }, [buildItems]);

  const arcanaStats = useMemo(() => {
    const acc: Record<number, number> = {};
    for (const c of [1, 2, 3] as const) {
      for (const entry of buildArcana[c]) {
        for (const e of entry.arcana.effects ?? []) {
          acc[e.effectType] = (acc[e.effectType] ?? 0) + parseEffectValue(e.valueType, e.value) * entry.count;
        }
      }
    }
    return acc;
  }, [buildArcana]);

  // ── Save / Share ───────────────────────────────────────────────────────────
  const handleSave = useCallback(() => {
    if (!selectedHero) return;
    const build: SavedBuild = {
      id: crypto.randomUUID(),
      name: `${selectedHero.name} Build`,
      heroName: selectedHero.name,
      heroIcon: selectedHero.icon,
      itemIcons: buildItems.filter(Boolean).map(i => i!.icon),
      encoded: encodeBuild(selectedHero, buildItems, buildArcana),
      savedAt: new Date().toISOString(),
    };
    const updated = [...savedBuilds, build];
    setSavedBuilds(updated);
    localStorage.setItem('hok-playground-builds', JSON.stringify(updated));
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  }, [selectedHero, buildItems, buildArcana, savedBuilds]);

  const handleShare = useCallback(async () => {
    if (!selectedHero) return;
    const encoded = encodeBuild(selectedHero, buildItems, buildArcana);
    const url = `${window.location.origin}/playground?build=${encoded}`;
    await navigator.clipboard.writeText(url);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  }, [selectedHero, buildItems, buildArcana]);

  const deleteSavedBuild = useCallback((id: string) => {
    const updated = savedBuilds.filter(b => b.id !== id);
    setSavedBuilds(updated);
    localStorage.setItem('hok-playground-builds', JSON.stringify(updated));
  }, [savedBuilds]);

  const loadSavedBuild = useCallback((build: SavedBuild) => {
    if (!heroesData || !itemsData || !arcanaData) return;
    const decoded = decodeBuild(build.encoded);
    if (!decoded) return;
    const hero = Object.values(heroesData).find(h => h.heroId === decoded.heroId);
    if (!hero) return;
    const newItems = decoded.items.map((id: number | null) => id ? (itemsData.find(i => i.id === id) ?? null) : null);
    const newArcana: BuildArcanaState = { 1: [], 2: [], 3: [] };
    for (const c of [1, 2, 3] as const) {
      newArcana[c] = (decoded.arcana[c] ?? [])
        .map((e: { id: number; count: number }) => {
          const arc = arcanaData.find(a => a.id === e.id);
          return arc ? { arcana: arc, count: e.count } : null;
        })
        .filter(Boolean) as ArcanaEntry[];
    }
    setSelectedHero(hero);
    setBuildItems(newItems);
    setBuildArcana(newArcana);
  }, [heroesData, itemsData, arcanaData]);

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
        const othersTotal = prev[color].filter(x => x.arcana.id !== arcanaId).reduce((s, x) => s + x.count, 0);
        const newCount = Math.max(1, Math.min(e.count + delta, 10 - othersTotal));
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

  const stats = useMemo(() => {
    const acc: Record<number, number> = {};
    for (const item of buildItems) {
      if (!item) continue;
      for (const e of item.effects ?? []) {
        acc[e.effectType] = (acc[e.effectType] ?? 0) + parseEffectValue(e.valueType, e.value);
      }
    }
    for (const c of [1, 2, 3] as const) {
      for (const entry of buildArcana[c]) {
        for (const e of entry.arcana.effects ?? []) {
          acc[e.effectType] = (acc[e.effectType] ?? 0) + parseEffectValue(e.valueType, e.value) * entry.count;
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
              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={resetBuild} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors px-2 py-1">
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
                <button onClick={() => { setSelectedHero(null); resetBuild(); }} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors px-2 py-1">
                  <ChevronLeft className="w-3.5 h-3.5" /> Ganti Hero
                </button>
                <div className="w-px h-4 bg-white/10" />
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 hover:text-white transition-all"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  {saveToast ? 'Tersimpan!' : 'Simpan'}
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-primary-500/20 border border-primary-500/30 hover:bg-primary-500/30 text-primary-300 transition-all"
                >
                  {shareCopied ? <CheckCheck className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                  {shareCopied ? 'Link disalin!' : 'Share'}
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
            {/* Saved builds */}
            {savedBuilds.length > 0 && (
              <div className="mb-6">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Bookmark className="w-3 h-3" /> Build Tersimpan
                </p>
                <div className="flex gap-3 flex-wrap">
                  {savedBuilds.map(build => (
                    <div key={build.id} className="group flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.16] transition-all min-w-0">
                      <img src={build.heroIcon} alt={build.heroName} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate max-w-[120px]">{build.name}</p>
                        <div className="flex gap-0.5 mt-1">
                          {build.itemIcons.slice(0, 4).map((icon, i) => (
                            <img key={i} src={icon} alt="" className="w-4 h-4 rounded object-cover" />
                          ))}
                          {build.itemIcons.length > 4 && <span className="text-[10px] text-gray-600 ml-0.5">+{build.itemIcons.length - 4}</span>}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 ml-1">
                        <button onClick={() => loadSavedBuild(build)} className="text-[10px] text-primary-400 hover:text-primary-300 font-semibold transition-colors">Load</button>
                        <button onClick={() => deleteSavedBuild(build.id)} className="text-[10px] text-gray-600 hover:text-red-400 transition-colors"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3 mb-5">
              <div className="relative min-w-[180px] flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text" value={heroSearch} onChange={e => setHeroSearch(e.target.value)}
                  placeholder="Search hero..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/20"
                />
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {ROLES.map(r => (
                  <button key={r} onClick={() => setHeroRole(r)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${heroRole === r ? 'bg-primary-500 text-white' : 'bg-white/5 text-white/40 hover:text-white/70'}`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2">
              {filteredHeroes.map(hero => (
                <motion.button key={hero.heroId} onClick={() => pickHero(hero)}
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-white/[0.04] border border-white/[0.07] hover:bg-white/[0.09] hover:border-white/[0.18] transition-all group">
                  <div className="w-full aspect-square overflow-hidden rounded-lg">
                    <img src={hero.icon} alt={hero.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" loading="lazy" />
                  </div>
                  <span className="text-[10px] text-white/50 font-medium truncate w-full text-center leading-tight">{hero.name}</span>
                </motion.button>
              ))}
              {filteredHeroes.length === 0 && (
                <div className="col-span-full py-16 text-center text-gray-600 text-sm">No heroes found</div>
              )}
            </div>
          </motion.div>
        ) : (
          // ── BUILD EDITOR ────────────────────────────────────────────────────
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
            {/* Left */}
            <div className="space-y-6">
              {/* Hero banner */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
                <img src={selectedHero.icon} alt={selectedHero.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                <div className="min-w-0">
                  <h2 className="text-xl font-bold text-white truncate">{selectedHero.name}</h2>
                  <p className="text-sm text-gray-400">{selectedHero.role} · {selectedHero.lane}</p>
                </div>
                {selectedHero.buildTitle && (
                  <span className="ml-auto text-xs text-gray-600 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full flex-shrink-0">{selectedHero.buildTitle}</span>
                )}
              </div>

              {/* Items */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Items (6 slot)</h3>
                  {totalGold > 0 && <span className="text-xs text-amber-400 font-semibold">{totalGold.toLocaleString()} Gold</span>}
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                  {buildItems.map((item, i) => (
                    <div key={i} className="flex flex-col gap-1">
                      <div onClick={() => setItemSlot(i)}
                        className={`group relative aspect-square rounded-xl border-2 transition-all overflow-hidden cursor-pointer ${item ? 'border-white/20 bg-dark-300 hover:border-white/35' : 'border-dashed border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]'}`}>
                        {item ? (
                          <>
                            <img src={item.icon} alt={item.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="text-white text-[10px] font-semibold">Ganti</span>
                            </div>
                            <button
                              onClick={e => { e.stopPropagation(); const n = [...buildItems]; n[i] = null; setBuildItems(n); }}
                              className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80">
                              <X className="w-3 h-3 text-white" />
                            </button>
                          </>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Plus className="w-5 h-5 text-white/20" />
                          </div>
                        )}
                      </div>
                      {item && <p className="text-[9px] text-gray-600 text-center truncate leading-tight px-0.5">{item.name}</p>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Passive conflict warning */}
              {passiveConflicts.length > 0 && (
                <div className="space-y-1.5">
                  {passiveConflicts.map(({ name, items }) => (
                    <div key={name} className="flex items-start gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-semibold text-red-300">Passive «{name}» tidak stack</span>
                        <span className="text-xs text-red-400/60 ml-1.5">{items.map(i => i.name).join(' + ')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Arcana — game-style hex display */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Arcana</h3>
                <div className="space-y-2">
                  {ARCANA_COLORS.map(({ color, label, Icon, text, border, bg, hexBorder, hexBg }) => {
                    const entries = buildArcana[color];
                    const totalUsed = entries.reduce((s, e) => s + e.count, 0);
                    const remaining = 10 - totalUsed;

                    return (
                      <div key={color} className={`rounded-xl border p-3 transition-all ${entries.length > 0 ? `${bg} ${border}` : 'border-white/10 bg-white/[0.02]'}`}>
                        <div className="flex items-center justify-between mb-2.5">
                          <div className="flex items-center gap-1.5">
                            <Icon className={`w-3.5 h-3.5 ${text}`} />
                            <span className={`text-xs font-bold ${text}`}>{label}</span>
                          </div>
                          <span className={`text-[11px] font-semibold tabular-nums ${totalUsed >= 10 ? 'text-green-400' : 'text-gray-500'}`}>
                            {totalUsed}/10
                          </span>
                        </div>

                        {/* Hex icons row */}
                        {entries.length > 0 && (
                          <div className="flex flex-wrap gap-3 mb-2.5 items-center">
                            {entries.map(entry => (
                              <div key={entry.arcana.id} className="flex flex-col items-center gap-1">
                                <div className="relative group">
                                  <HexIcon
                                    src={entry.arcana.icon}
                                    alt={entry.arcana.name}
                                    size={44}
                                    borderColor={hexBorder}
                                    innerBg={hexBg}
                                  />
                                  {/* Remove button on hover */}
                                  <button
                                    onClick={() => removeArcana(color, entry.arcana.id)}
                                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                  >
                                    <X className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                                {/* Count controls */}
                                <div className="flex items-center gap-0.5">
                                  <button
                                    onClick={() => adjustArcanaCount(color, entry.arcana.id, -1)}
                                    className="w-4 h-4 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                                  >
                                    <Minus className="w-2 h-2" />
                                  </button>
                                  <span className={`text-xs font-bold tabular-nums w-6 text-center ${text}`}>×{entry.count}</span>
                                  <button
                                    onClick={() => adjustArcanaCount(color, entry.arcana.id, 1)}
                                    disabled={remaining <= 0}
                                    className="w-4 h-4 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-400 hover:text-white transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                                  >
                                    <Plus className="w-2 h-2" />
                                  </button>
                                </div>
                              </div>
                            ))}

                            {/* Add slot */}
                            {remaining > 0 && (
                              <button
                                onClick={() => setArcanaColor(color)}
                                className="flex flex-col items-center gap-1 group"
                              >
                                <div
                                  className="flex items-center justify-center transition-all group-hover:scale-110"
                                  style={{
                                    width: 44,
                                    height: Math.round(44 * 1.155),
                                    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                                    background: 'rgba(255,255,255,0.06)',
                                    border: '1px dashed rgba(255,255,255,0.15)',
                                  }}
                                >
                                  <Plus className="w-4 h-4 text-white/30 group-hover:text-white/60" />
                                </div>
                                <span className="text-[10px] text-gray-700 group-hover:text-gray-400 transition-colors">{remaining} left</span>
                              </button>
                            )}
                          </div>
                        )}

                        {/* Empty state */}
                        {entries.length === 0 && (
                          <button
                            onClick={() => setArcanaColor(color)}
                            className="w-full flex items-center gap-2 py-2 px-3 rounded-lg border border-dashed border-white/10 hover:border-white/20 hover:bg-white/[0.03] text-gray-600 hover:text-gray-400 text-xs transition-all"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Tambah {label} Arcana</span>
                            <span className="ml-auto text-gray-700">10 slot</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Stats */}
            <div className="lg:sticky lg:top-20 h-fit space-y-3">
              <div className="rounded-2xl bg-dark-300 border border-white/10 p-5">
                {/* Tab toggle */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Build Stats</h3>
                  <div className="flex rounded-lg overflow-hidden border border-white/10 text-[11px]">
                    <button
                      onClick={() => setStatsView('total')}
                      className={`px-2.5 py-1 font-medium transition-colors ${statsView === 'total' ? 'bg-primary-500 text-white' : 'text-gray-500 hover:text-white'}`}
                    >Total</button>
                    <button
                      onClick={() => setStatsView('breakdown')}
                      className={`px-2.5 py-1 font-medium transition-colors ${statsView === 'breakdown' ? 'bg-primary-500 text-white' : 'text-gray-500 hover:text-white'}`}
                    >Rincian</button>
                  </div>
                </div>

                {Object.keys(stats).length === 0 ? (
                  <p className="text-sm text-gray-600 text-center py-10">Tambah item atau arcana untuk melihat stats</p>
                ) : statsView === 'total' ? (
                  <div>
                    {STAT_ORDER.filter(et => stats[et] != null).map(et => {
                      const info = STAT_INFO[et];
                      if (!info) return null;
                      return (
                        <div key={et} className="flex items-center justify-between py-2 border-b border-white/[0.05] last:border-0">
                          <span className="text-xs text-gray-400">{info.name}</span>
                          <span className={`text-sm font-bold tabular-nums ${info.isPercent ? 'text-amber-300' : 'text-white'}`}>{fmtVal(info.isPercent, stats[et])}</span>
                        </div>
                      );
                    })}
                    {Object.entries(stats).filter(([et]) => !STAT_INFO[Number(et)]).map(([et, val]) => (
                      <div key={et} className="flex items-center justify-between py-2 border-b border-white/[0.05] last:border-0">
                        <span className="text-xs text-gray-600">Stat #{et}</span>
                        <span className="text-sm font-bold text-gray-500">+{val % 1 === 0 ? val : (val as number).toFixed(1)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Breakdown: Items vs Arcana */
                  <div>
                    {/* Column headers */}
                    <div className="grid grid-cols-3 gap-1 mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-600">
                      <span>Stat</span>
                      <span className="text-center text-orange-400/70">Item</span>
                      <span className="text-center text-sky-400/70">Arcana</span>
                    </div>
                    {STAT_ORDER.filter(et => stats[et] != null).map(et => {
                      const info = STAT_INFO[et];
                      if (!info) return null;
                      const iVal = itemStats[et];
                      const aVal = arcanaStats[et];
                      return (
                        <div key={et} className="grid grid-cols-3 gap-1 py-1.5 border-b border-white/[0.05] last:border-0 items-center">
                          <span className="text-[11px] text-gray-500 leading-tight">{info.name}</span>
                          <span className={`text-xs font-bold tabular-nums text-center ${iVal ? 'text-orange-300' : 'text-gray-700'}`}>
                            {iVal ? fmtVal(info.isPercent, iVal) : '—'}
                          </span>
                          <span className={`text-xs font-bold tabular-nums text-center ${aVal ? 'text-sky-300' : 'text-gray-700'}`}>
                            {aVal ? fmtVal(info.isPercent, aVal) : '—'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {totalGold > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/[0.08] flex items-center justify-between">
                    <span className="text-xs text-gray-500">Total Gold</span>
                    <span className="text-sm font-bold text-amber-400">{totalGold.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Copy build URL shortcut */}
              <button
                onClick={handleShare}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] text-gray-400 hover:text-white text-xs font-medium transition-all"
              >
                {shareCopied ? <CheckCheck className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                {shareCopied ? 'Link disalin!' : 'Salin link build'}
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Item Picker (HOK-style) ──────────────────────────────────────────── */}
      <AnimatePresence>
        {itemSlot !== null && itemsData && (
          <ItemPickerOverlay
            itemsData={itemsData}
            buildItems={buildItems}
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

      {/* ── Arcana Picker (HOK-style) ────────────────────────────────────────── */}
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

// ─── Item Picker — HOK Equipment screen ────────────────────────────────────────

function ItemPickerOverlay({
  itemsData, buildItems, onSelect, onClose,
}: {
  itemsData: Item[];
  buildItems: (Item | null)[];
  onSelect: (item: Item) => void;
  onClose: () => void;
}) {
  const [category, setCategory] = useState<number>(0);
  const [search, setSearch] = useState('');
  const [previewItem, setPreviewItem] = useState<Item | null>(null);

  // Group filtered items by tier
  const tieredItems = useMemo(() => {
    const base = itemsData
      .filter(item => category === 0 || item.type === category)
      .filter(item => !search || item.name.toLowerCase().includes(search.toLowerCase()));

    const groups: Record<number, { name: string; items: Item[] }> = {};
    for (const item of base) {
      if (!groups[item.level]) groups[item.level] = { name: item.levelName || `Level ${item.level}`, items: [] };
      groups[item.level].items.push(item);
    }
    return Object.entries(groups)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([, v]) => v);
  }, [itemsData, category, search]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: 'linear-gradient(160deg, #091828 0%, #0b1e35 100%)' }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 flex-shrink-0 border-b"
        style={{ borderColor: 'rgba(56,100,160,0.4)', background: 'rgba(5,14,28,0.7)' }}
      >
        <button onClick={onClose} className="p-1.5 rounded-lg text-sky-300/60 hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-white font-bold text-lg tracking-wide">Equipment</h2>

        {/* Search */}
        <div className="relative flex-1 max-w-64 ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-300/40" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search..."
            autoFocus
            className="w-full pl-9 pr-4 py-1.5 rounded-lg text-sm text-white placeholder-sky-300/30 focus:outline-none"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(56,120,200,0.3)' }}
          />
        </div>

        <button onClick={onClose} className="p-1.5 rounded-lg text-sky-300/60 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar — categories */}
        <div
          className="w-28 shrink-0 flex flex-col py-1 overflow-y-auto"
          style={{ background: 'rgba(5,12,25,0.8)', borderRight: '1px solid rgba(30,70,130,0.5)' }}
        >
          {ITEM_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className="relative px-4 py-3 text-sm font-medium text-left transition-all flex items-center gap-2"
              style={{
                background: category === cat.id ? 'rgba(29,127,212,0.6)' : undefined,
                color: category === cat.id ? '#fff' : 'rgba(147,197,253,0.5)',
              }}
            >
              {/* Active indicator — right border */}
              {category === cat.id && (
                <span className="absolute right-0 inset-y-0 w-0.5 bg-sky-400 rounded-l" />
              )}
              {cat.Icon && <cat.Icon className="w-3.5 h-3.5 shrink-0 opacity-80" />}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Center — item grid */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {tieredItems.length === 0 ? (
            <p className="text-center text-sky-300/30 text-sm py-20">No items found</p>
          ) : (
            tieredItems.map(({ name: tierName, items }) => (
              <div key={tierName} className="mb-7">
                {/* Tier label */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1" style={{ background: 'rgba(180,130,40,0.3)' }} />
                  <span className="text-sm font-bold tracking-wider" style={{ color: '#e8c060' }}>{tierName}</span>
                  <div className="h-px flex-1" style={{ background: 'rgba(180,130,40,0.3)' }} />
                </div>

                {/* Item circles */}
                <div className="flex flex-wrap gap-3">
                  {items.map(item => {
                    const isSelected = previewItem?.id === item.id;
                    const ringClass = ITEM_TYPE_RING[item.type] ?? 'ring-slate-500/50';
                    return (
                      <button
                        key={item.id}
                        onClick={() => setPreviewItem(item)}
                        onDoubleClick={() => onSelect(item)}
                        title={item.name}
                        className={`relative rounded-full overflow-hidden ring-2 ring-offset-2 transition-all duration-150 ${
                          isSelected
                            ? 'ring-white scale-110 ring-offset-[#091828]'
                            : `${ringClass} ring-offset-[#091828] hover:scale-105 hover:ring-sky-400/70`
                        }`}
                        style={{ width: 60, height: 60 }}
                      >
                        <img src={item.icon} alt={item.name} className="w-full h-full object-cover" />
                        {isSelected && (
                          <div className="absolute inset-0 bg-white/20 flex items-center justify-center">
                            <Check className="w-4 h-4 text-white drop-shadow" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
          <p className="text-center text-sky-300/20 text-[11px] pb-4">Double-click untuk langsung pilih</p>
        </div>

        {/* Right — detail panel */}
        <div
          className="hidden lg:flex flex-col w-64 shrink-0 overflow-y-auto p-4"
          style={{ background: 'rgba(5,12,25,0.7)', borderLeft: '1px solid rgba(30,70,130,0.4)' }}
        >
          {previewItem ? (
            <ItemDetailPanel item={previewItem} onSelect={onSelect} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3">
              <Swords className="w-8 h-8 text-sky-800/50" />
              <p className="text-sky-300/30 text-sm">Klik item untuk detail</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom — current build slots */}
      <div
        className="flex-shrink-0 px-4 py-3 flex items-center justify-center gap-3 border-t"
        style={{ background: 'rgba(5,12,25,0.85)', borderColor: 'rgba(30,70,130,0.4)' }}
      >
        {buildItems.map((item, i) => (
          <div
            key={i}
            className="rounded-full overflow-hidden ring-1 ring-sky-800/50"
            style={{ width: 44, height: 44, background: 'rgba(20,40,80,0.8)' }}
          >
            {item && <img src={item.icon} alt={item.name} className="w-full h-full object-cover" />}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Item Detail Panel ─────────────────────────────────────────────────────────

function ItemDetailPanel({ item, onSelect }: { item: Item; onSelect: (item: Item) => void }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <img src={item.icon} alt={item.name} className="w-16 h-16 rounded-xl object-cover ring-2 ring-sky-700/50 shrink-0" />
        <div className="min-w-0">
          <h3 className="font-bold text-white text-sm leading-tight">{item.name}</h3>
          <p className="font-semibold text-sm mt-0.5" style={{ color: '#e8c060' }}>{item.price.toLocaleString()} Gold</p>
          <span className="text-[11px] text-sky-300/50">{item.typeName} · Lv.{item.level}</span>
        </div>
      </div>

      {item.effects?.length > 0 && (
        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-widest mb-2 text-sky-400/50">Stats</p>
          {item.effects.map((e, i) => {
            const info = STAT_INFO[e.effectType];
            const val = parseEffectValue(e.valueType, e.value);
            return (
              <div key={i} className="flex justify-between items-center py-1.5 border-b border-sky-900/30 last:border-0">
                <span className="text-xs text-sky-200/60">{info?.name ?? `Stat #${e.effectType}`}</span>
                <span className={`text-xs font-bold tabular-nums ${info?.isPercent ? 'text-amber-300' : 'text-white'}`}>
                  {fmtVal(info?.isPercent ?? false, val)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {item.passiveSkills?.length > 0 && (
        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-widest mb-2 text-sky-400/50">Passive</p>
          {item.passiveSkills.map((ps, i) => (
            <p key={i} className="text-[11px] text-sky-200/50 leading-relaxed rounded-lg p-2.5 mb-1.5"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(56,100,160,0.3)' }}>
              {ps.description}
            </p>
          ))}
        </div>
      )}

      {item.buildsFrom?.length > 0 && (
        <div className="mb-5">
          <p className="text-[10px] uppercase tracking-widest mb-2 text-sky-400/50">Recipe</p>
          <div className="flex flex-wrap gap-2">
            {item.buildsFrom.map(ref => (
              <div key={ref.id} className="flex items-center gap-1.5 rounded-lg px-2 py-1.5"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(56,100,160,0.3)' }}>
                <img src={ref.icon} alt={ref.name} className="w-7 h-7 rounded-md object-cover" />
                <div>
                  <p className="text-[10px] text-sky-200/50 font-medium">{ref.name}</p>
                  {ref.price && <p className="text-[10px]" style={{ color: '#e8c060' }}>{ref.price.toLocaleString()}g</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => onSelect(item)}
        className="w-full py-2.5 rounded-xl text-white font-bold text-sm transition-all hover:brightness-110"
        style={{ background: 'linear-gradient(135deg, #1a6faa, #2196f3)' }}
      >
        Pilih Item Ini
      </button>
    </div>
  );
}

// ─── Arcana Picker — HOK-style ─────────────────────────────────────────────────

function ArcanaPickerModal({
  color, arcanaData, buildArcana, onToggle, onClose,
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
      .filter(a => !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.description.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => b.level - a.level),
    [arcanaData, color, search]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(5,12,25,0.75)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: 'linear-gradient(160deg, #091828 0%, #0c1e38 100%)', border: '1px solid rgba(56,100,160,0.4)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid rgba(56,100,160,0.35)', background: 'rgba(5,12,25,0.5)' }}>
          <div className="flex items-center gap-2">
            <colorMeta.Icon className={`w-4 h-4 ${colorMeta.text}`} />
            <h3 className="font-bold text-white">{colorMeta.label} Arcana</h3>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{
                background: remaining <= 0 ? 'rgba(34,197,94,0.2)' : 'rgba(56,100,160,0.3)',
                color: remaining <= 0 ? '#4ade80' : '#93c5fd',
                border: `1px solid ${remaining <= 0 ? 'rgba(34,197,94,0.4)' : 'rgba(56,100,160,0.5)'}`,
              }}>
              {remaining > 0 ? `${remaining} slot tersisa` : '10/10 Full'}
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-sky-300/50 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selected arcana summary */}
        {entries.length > 0 && (
          <div className="px-5 py-3 flex items-center gap-4 flex-wrap"
            style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(56,100,160,0.25)' }}>
            {entries.map(entry => (
              <div key={entry.arcana.id} className="flex items-center gap-2">
                <HexIcon
                  src={entry.arcana.icon}
                  alt={entry.arcana.name}
                  size={36}
                  borderColor={colorMeta.hexBorder}
                  innerBg={colorMeta.hexBg}
                />
                <div>
                  <p className="text-[11px] text-white font-semibold leading-tight">
                    {entry.arcana.name.replace(/^Lvl \d+: /, '')}
                  </p>
                  <p className={`text-[11px] font-bold ${colorMeta.text}`}>×{entry.count}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="px-4 pt-3 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-300/30" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search arcana..." autoFocus
              className="w-full pl-9 pr-4 py-2 rounded-lg text-sm text-white placeholder-sky-300/30 focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(56,120,200,0.3)' }}
            />
          </div>
        </div>

        {/* Arcana list — hex icons in a grid */}
        <div className="px-4 pb-4 overflow-y-auto max-h-[50vh]">
          <div className="flex flex-wrap gap-4 pt-2">
            {filteredArcana.map(arc => {
              const isSelected = entries.some(e => e.arcana.id === arc.id);
              const isDisabled = !isSelected && remaining <= 0;
              const entry = entries.find(e => e.arcana.id === arc.id);

              return (
                <button
                  key={arc.id}
                  onClick={() => !isDisabled && onToggle(color, arc)}
                  disabled={isDisabled}
                  title={arc.name}
                  className={`flex flex-col items-center gap-1.5 transition-all ${isDisabled ? 'opacity-25 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
                >
                  <div className="relative">
                    <HexIcon
                      src={arc.icon}
                      alt={arc.name}
                      size={52}
                      borderColor={isSelected ? '#ffffff' : colorMeta.hexBorder}
                      innerBg={colorMeta.hexBg}
                      selected={isSelected}
                    />
                    {isSelected && entry && (
                      <span
                        className="absolute -bottom-1 -right-1 text-[10px] font-bold px-1 py-0.5 rounded-full z-10"
                        style={{ background: colorMeta.hexBorder, color: '#fff', minWidth: 18, textAlign: 'center', lineHeight: 1.4 }}
                      >
                        ×{entry.count}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-sky-200/60 max-w-[60px] truncate text-center">
                    {arc.name.replace(/^Lvl \d+: /, '')}
                  </span>
                  <span className="text-[9px] text-sky-300/30">Lv.{arc.level}</span>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
