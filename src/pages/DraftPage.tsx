import { useState, useMemo } from 'react';
import { useHeroes } from '../hooks/useHeroes';
import { Loading } from '../components/ui/Loading';
import type { Hero } from '../types/hero';
import { Search, X, RotateCcw, ChevronRight, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type TeamSide = 'blue' | 'red';
type DraftAction = 'ban' | 'pick';

interface DraftStep {
  team: TeamSide;
  action: DraftAction;
  label: string;
}

interface DraftConfig {
  team1: string;
  team2: string;
  seriesType: 'BO1' | 'BO3' | 'BO5' | 'BO7';
  banCount: number;
  mode: 'GBP' | 'NGBP';
}

interface MatchState {
  bans: { blue: (Hero | null)[]; red: (Hero | null)[] };
  picks: { blue: (Hero | null)[]; red: (Hero | null)[] };
  currentStep: number;
  winner: TeamSide | null;
}

function buildSequence(banCount: number): DraftStep[] {
  const steps: DraftStep[] = [];
  let blueB = 0, redB = 0, blueP = 0, redP = 0;

  const phase1Each = Math.min(2, banCount);
  const phase2Each = banCount - phase1Each;

  // Phase 1 bans: Blue first, alternating
  for (let i = 0; i < phase1Each; i++) {
    steps.push({ team: 'blue', action: 'ban', label: `Blue Ban ${++blueB}` });
    steps.push({ team: 'red', action: 'ban', label: `Red Ban ${++redB}` });
  }
  // Phase 1 picks: B, RR, BB, R
  steps.push({ team: 'blue', action: 'pick', label: `Blue Pick ${++blueP}` });
  steps.push({ team: 'red', action: 'pick', label: `Red Pick ${++redP}` });
  steps.push({ team: 'red', action: 'pick', label: `Red Pick ${++redP}` });
  steps.push({ team: 'blue', action: 'pick', label: `Blue Pick ${++blueP}` });
  steps.push({ team: 'blue', action: 'pick', label: `Blue Pick ${++blueP}` });
  steps.push({ team: 'red', action: 'pick', label: `Red Pick ${++redP}` });
  // Phase 2 bans: Red first, alternating
  for (let i = 0; i < phase2Each; i++) {
    steps.push({ team: 'red', action: 'ban', label: `Red Ban ${++redB}` });
    steps.push({ team: 'blue', action: 'ban', label: `Blue Ban ${++blueB}` });
  }
  // Phase 2 picks: R, BB, R
  steps.push({ team: 'red', action: 'pick', label: `Red Pick ${++redP}` });
  steps.push({ team: 'blue', action: 'pick', label: `Blue Pick ${++blueP}` });
  steps.push({ team: 'blue', action: 'pick', label: `Blue Pick ${++blueP}` });
  steps.push({ team: 'red', action: 'pick', label: `Red Pick ${++redP}` });

  return steps;
}

function createMatchState(banCount: number): MatchState {
  return {
    bans: { blue: Array(banCount).fill(null), red: Array(banCount).fill(null) },
    picks: { blue: Array(5).fill(null), red: Array(5).fill(null) },
    currentStep: 0,
    winner: null,
  };
}

const ROLES = ['All', 'Tank', 'Fighter', 'Assassin', 'Mage', 'Marksman', 'Support'];

const SERIES_OPTIONS: DraftConfig['seriesType'][] = ['BO1', 'BO3', 'BO5', 'BO7'];
const BAN_OPTIONS = [3, 4, 5, 6];

export function DraftPage() {
  const { data: heroesData, isLoading } = useHeroes();
  const [phase, setPhase] = useState<'config' | 'drafting' | 'complete'>('config');
  const [config, setConfig] = useState<DraftConfig>({
    team1: 'Blue Team',
    team2: 'Red Team',
    seriesType: 'BO3',
    banCount: 4,
    mode: 'NGBP',
  });
  const [matchIndex, setMatchIndex] = useState(0);
  const [matchStates, setMatchStates] = useState<MatchState[]>([]);
  const [sequence, setSequence] = useState<DraftStep[]>([]);
  const [selectedHero, setSelectedHero] = useState<Hero | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  const heroes = useMemo(() => {
    if (!heroesData) return [];
    return Object.values(heroesData).sort((a, b) => a.name.localeCompare(b.name));
  }, [heroesData]);

  const currentMatch = matchStates[matchIndex];
  const currentStep = currentMatch?.currentStep ?? 0;
  const currentDraftStep = sequence[currentStep];
  const isDraftComplete = currentMatch != null && currentStep >= sequence.length;

  // Heroes used in current match
  const takenHeroIds = useMemo(() => {
    if (!currentMatch) return new Set<number>();
    const ids = new Set<number>();
    [...currentMatch.bans.blue, ...currentMatch.bans.red,
     ...currentMatch.picks.blue, ...currentMatch.picks.red]
      .forEach(h => h && ids.add(h.heroId));
    return ids;
  }, [currentMatch]);

  // In GBP mode: per-team lock — heroes used by a team in prev matches are locked for THAT TEAM only
  const gbpLockedIds = useMemo(() => {
    if (config.mode !== 'GBP') return { blue: new Set<number>(), red: new Set<number>() };
    const blue = new Set<number>();
    const red = new Set<number>();
    matchStates.slice(0, matchIndex).forEach(m => {
      [...m.bans.blue, ...m.picks.blue].forEach(h => h && blue.add(h.heroId));
      [...m.bans.red, ...m.picks.red].forEach(h => h && red.add(h.heroId));
    });
    return { blue, red };
  }, [config.mode, matchStates, matchIndex]);

  const filteredHeroes = useMemo(() => {
    return heroes.filter(h => {
      const matchesSearch = !searchQuery || h.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'All' || h.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [heroes, searchQuery, roleFilter]);

  const maxMatches = parseInt(config.seriesType.replace('BO', ''));
  const neededToWin = Math.ceil(maxMatches / 2);

  const seriesScore = useMemo(() => {
    return matchStates.reduce((acc, m) => {
      if (m.winner === 'blue') acc.blue++;
      else if (m.winner === 'red') acc.red++;
      return acc;
    }, { blue: 0, red: 0 });
  }, [matchStates]);

  const seriesComplete = seriesScore.blue >= neededToWin || seriesScore.red >= neededToWin;

  // Compute active slot index for current step
  const activeSlotIndex = useMemo(() => {
    if (!currentDraftStep || isDraftComplete) return -1;
    return sequence.slice(0, currentStep).filter(
      s => s.team === currentDraftStep.team && s.action === currentDraftStep.action
    ).length;
  }, [sequence, currentStep, currentDraftStep, isDraftComplete]);

  function startDraft() {
    const seq = buildSequence(config.banCount);
    setSequence(seq);
    setMatchStates([createMatchState(config.banCount)]);
    setMatchIndex(0);
    setPhase('drafting');
    setSelectedHero(null);
    setSearchQuery('');
    setRoleFilter('All');
  }

  function lockIn() {
    if (!selectedHero || !currentMatch || isDraftComplete || !currentDraftStep) return;
    const step = currentDraftStep;

    setMatchStates(prev => prev.map((m, i) => {
      if (i !== matchIndex) return m;
      const updated: MatchState = {
        ...m,
        bans: { blue: [...m.bans.blue], red: [...m.bans.red] },
        picks: { blue: [...m.picks.blue], red: [...m.picks.red] },
        currentStep: m.currentStep + 1,
        winner: m.winner,
      };
      if (step.action === 'ban') {
        const idx = updated.bans[step.team].findIndex(h => h === null);
        if (idx !== -1) updated.bans[step.team][idx] = selectedHero;
      } else {
        const idx = updated.picks[step.team].findIndex(h => h === null);
        if (idx !== -1) updated.picks[step.team][idx] = selectedHero;
      }
      return updated;
    }));

    setSelectedHero(null);
  }

  function undoLast() {
    if (!currentMatch || currentStep === 0) return;
    const prevStep = sequence[currentStep - 1];

    setMatchStates(prev => prev.map((m, i) => {
      if (i !== matchIndex) return m;
      const updated: MatchState = {
        ...m,
        bans: { blue: [...m.bans.blue], red: [...m.bans.red] },
        picks: { blue: [...m.picks.blue], red: [...m.picks.red] },
        currentStep: m.currentStep - 1,
        winner: m.winner,
      };
      if (prevStep.action === 'ban') {
        const slot = updated.bans[prevStep.team];
        for (let k = slot.length - 1; k >= 0; k--) {
          if (slot[k] !== null) { slot[k] = null; break; }
        }
      } else {
        const slot = updated.picks[prevStep.team];
        for (let k = slot.length - 1; k >= 0; k--) {
          if (slot[k] !== null) { slot[k] = null; break; }
        }
      }
      return updated;
    }));
    setSelectedHero(null);
  }

  function setMatchWinner(winner: TeamSide) {
    setMatchStates(prev => prev.map((m, i) => i === matchIndex ? { ...m, winner } : m));
  }

  function nextMatch() {
    const newIndex = matchIndex + 1;
    if (newIndex >= maxMatches || seriesComplete) {
      setPhase('complete');
      return;
    }
    setMatchStates(prev => [...prev, createMatchState(config.banCount)]);
    setMatchIndex(newIndex);
    setSelectedHero(null);
    setSearchQuery('');
    setRoleFilter('All');
  }

  function resetDraft() {
    setPhase('config');
    setMatchStates([]);
    setMatchIndex(0);
    setSelectedHero(null);
    setSearchQuery('');
    setRoleFilter('All');
  }

  if (isLoading) return <Loading />;

  // ─── CONFIG SCREEN ────────────────────────────────────────────────────────────
  if (phase === 'config') {
    return (
      <div className="min-h-screen bg-dark-400 py-10 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-display font-bold text-white mb-2">Draft Simulator</h1>
            <p className="text-gray-400">Simulate the official Honor of Kings ban/pick phase</p>
          </div>

          <div className="bg-dark-300 rounded-2xl border border-white/10 p-6 space-y-6">
            {/* Team Names */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-primary-400 font-semibold uppercase tracking-wider block mb-2">
                  Blue Side
                </label>
                <input
                  type="text"
                  value={config.team1}
                  onChange={e => setConfig(c => ({ ...c, team1: e.target.value }))}
                  className="w-full px-4 py-3 bg-dark-400 border border-primary-500/30 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-primary-500"
                  placeholder="Blue Team"
                  maxLength={20}
                />
              </div>
              <div>
                <label className="text-xs text-red-400 font-semibold uppercase tracking-wider block mb-2">
                  Red Side
                </label>
                <input
                  type="text"
                  value={config.team2}
                  onChange={e => setConfig(c => ({ ...c, team2: e.target.value }))}
                  className="w-full px-4 py-3 bg-dark-400 border border-red-500/30 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-red-500"
                  placeholder="Red Team"
                  maxLength={20}
                />
              </div>
            </div>

            {/* Series Type */}
            <div>
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-3">
                Series Type
              </label>
              <div className="flex gap-2">
                {SERIES_OPTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => setConfig(c => ({ ...c, seriesType: s }))}
                    className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                      config.seriesType === s
                        ? 'bg-primary-500 text-white'
                        : 'bg-dark-400 text-gray-400 hover:bg-dark-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Draft Mode */}
            <div>
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-3">
                Draft Mode
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setConfig(c => ({ ...c, mode: 'NGBP' }))}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    config.mode === 'NGBP'
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-white/10 bg-dark-400 hover:border-white/20'
                  }`}
                >
                  <p className={`font-bold text-sm mb-1 ${config.mode === 'NGBP' ? 'text-primary-300' : 'text-white'}`}>
                    NGBP
                  </p>
                  <p className="text-xs text-gray-500">Hero reset tiap match</p>
                </button>
                <button
                  onClick={() => setConfig(c => ({ ...c, mode: 'GBP' }))}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    config.mode === 'GBP'
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-white/10 bg-dark-400 hover:border-white/20'
                  }`}
                >
                  <p className={`font-bold text-sm mb-1 ${config.mode === 'GBP' ? 'text-amber-300' : 'text-white'}`}>
                    GBP
                  </p>
                  <p className="text-xs text-gray-500">Hero terkunci sepanjang series</p>
                </button>
              </div>
            </div>

            {/* Ban Count */}
            <div>
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-3">
                Bans per Team: <span className="text-white">{config.banCount}</span>
              </label>
              <div className="flex gap-2">
                {BAN_OPTIONS.map(n => (
                  <button
                    key={n}
                    onClick={() => setConfig(c => ({ ...c, banCount: n }))}
                    className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                      config.banCount === n
                        ? 'bg-amber-500 text-white'
                        : 'bg-dark-400 text-gray-400 hover:bg-dark-200'
                    }`}
                  >
                    {n}{n === 4 ? ' ★' : ''}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-600 mt-2">4 is standard for official tournaments</p>
            </div>

            {/* Draft Order Preview */}
            <div className="bg-dark-400 rounded-xl p-4">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-3">Draft Order Preview</p>
              <div className="flex flex-wrap gap-1.5">
                {buildSequence(config.banCount).map((step, i) => (
                  <span
                    key={i}
                    className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                      step.action === 'ban'
                        ? step.team === 'blue' ? 'bg-blue-900/60 text-blue-300' : 'bg-red-900/60 text-red-300'
                        : step.team === 'blue' ? 'bg-primary-900/60 text-primary-300' : 'bg-rose-900/60 text-rose-300'
                    }`}
                  >
                    {step.label}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={startDraft}
              className="w-full py-4 bg-primary-500 hover:bg-primary-600 text-white font-bold text-lg rounded-xl transition-all"
            >
              Start Draft
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── COMPLETE SCREEN ──────────────────────────────────────────────────────────
  if (phase === 'complete') {
    const winner = seriesScore.blue > seriesScore.red ? 'blue' : seriesScore.red > seriesScore.blue ? 'red' : null;
    const winnerName = winner === 'blue' ? config.team1 : winner === 'red' ? config.team2 : null;
    return (
      <div className="min-h-screen bg-dark-400 py-10 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Winner Banner */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl p-8 mb-8 text-center border ${
              winner === 'blue'
                ? 'bg-gradient-to-br from-primary-900/60 to-primary-800/30 border-primary-500/40'
                : winner === 'red'
                ? 'bg-gradient-to-br from-red-900/60 to-red-800/30 border-red-500/40'
                : 'bg-dark-300 border-white/10'
            }`}
          >
            <Trophy className="w-14 h-14 text-amber-400 mx-auto mb-4" />
            <p className="text-sm text-gray-400 uppercase tracking-widest mb-1">{config.seriesType} Series Complete</p>
            {winnerName ? (
              <h1 className={`text-4xl font-display font-bold mb-3 ${winner === 'blue' ? 'text-primary-300' : 'text-red-300'}`}>
                {winnerName} Wins!
              </h1>
            ) : (
              <h1 className="text-4xl font-display font-bold text-gray-300 mb-3">It's a Tie!</h1>
            )}

            {/* Score badge */}
            <div className="inline-flex items-center gap-4 bg-black/30 rounded-2xl px-6 py-3">
              <span className={`text-2xl font-bold ${winner === 'blue' ? 'text-primary-300' : 'text-gray-400'}`}>
                {config.team1}
              </span>
              <span className="text-4xl font-bold text-white">
                {seriesScore.blue} <span className="text-gray-600">–</span> {seriesScore.red}
              </span>
              <span className={`text-2xl font-bold ${winner === 'red' ? 'text-red-300' : 'text-gray-400'}`}>
                {config.team2}
              </span>
            </div>
          </motion.div>

          {/* Game-by-game recap */}
          <div className="space-y-4 mb-8">
            {matchStates.map((match, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-dark-300 rounded-2xl border border-white/10 overflow-hidden"
              >
                {/* Game header */}
                <div className={`flex items-center justify-between px-5 py-3 border-b border-white/5 ${
                  match.winner === 'blue' ? 'bg-primary-500/10' : match.winner === 'red' ? 'bg-red-500/10' : 'bg-dark-400/50'
                }`}>
                  <span className="text-sm font-bold text-gray-300">Game {i + 1}</span>
                  {match.winner && (
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      match.winner === 'blue'
                        ? 'bg-primary-500/30 text-primary-300'
                        : 'bg-red-500/30 text-red-300'
                    }`}>
                      {match.winner === 'blue' ? config.team1 : config.team2} Won
                    </span>
                  )}
                </div>

                <div className="p-4 space-y-4">
                  {/* Blue team row */}
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold w-20 flex-shrink-0 ${match.winner === 'blue' ? 'text-primary-300' : 'text-gray-500'}`}>
                      {config.team1}
                    </span>
                    {/* Picks */}
                    <div className="flex gap-1.5 flex-1">
                      {match.picks.blue.map((hero, j) => (
                        <div key={j} className="relative group">
                          {hero ? (
                            <>
                              <img src={hero.icon} alt={hero.name} className="w-10 h-10 rounded-lg object-cover border border-primary-500/30" />
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-dark-400 text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap z-10">
                                {hero.name}
                              </div>
                            </>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-dark-400 border border-white/5" />
                          )}
                        </div>
                      ))}
                    </div>
                    {/* Bans */}
                    <div className="flex gap-1 flex-shrink-0">
                      {match.bans.blue.map((hero, j) => (
                        <div key={j} className="relative">
                          {hero ? (
                            <div className="relative">
                              <img src={hero.icon} alt={hero.name} className="w-7 h-7 rounded-md object-cover grayscale opacity-50" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <X className="w-3 h-3 text-red-400" />
                              </div>
                            </div>
                          ) : (
                            <div className="w-7 h-7 rounded-md bg-dark-400/50 border border-white/5" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-white/5" />

                  {/* Red team row */}
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold w-20 flex-shrink-0 ${match.winner === 'red' ? 'text-red-300' : 'text-gray-500'}`}>
                      {config.team2}
                    </span>
                    {/* Picks */}
                    <div className="flex gap-1.5 flex-1">
                      {match.picks.red.map((hero, j) => (
                        <div key={j} className="relative group">
                          {hero ? (
                            <>
                              <img src={hero.icon} alt={hero.name} className="w-10 h-10 rounded-lg object-cover border border-red-500/30" />
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-dark-400 text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap z-10">
                                {hero.name}
                              </div>
                            </>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-dark-400 border border-white/5" />
                          )}
                        </div>
                      ))}
                    </div>
                    {/* Bans */}
                    <div className="flex gap-1 flex-shrink-0">
                      {match.bans.red.map((hero, j) => (
                        <div key={j} className="relative">
                          {hero ? (
                            <div className="relative">
                              <img src={hero.icon} alt={hero.name} className="w-7 h-7 rounded-md object-cover grayscale opacity-50" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <X className="w-3 h-3 text-red-400" />
                              </div>
                            </div>
                          ) : (
                            <div className="w-7 h-7 rounded-md bg-dark-400/50 border border-white/5" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <button
            onClick={resetDraft}
            className="w-full py-4 bg-primary-500 hover:bg-primary-600 text-white font-bold text-lg rounded-xl transition-all"
          >
            New Draft
          </button>
        </div>
      </div>
    );
  }

  // ─── DRAFT SCREEN ─────────────────────────────────────────────────────────────

  const isCurrentBlue = currentDraftStep?.team === 'blue';
  const isCurrentRed = currentDraftStep?.team === 'red';
  const isCurrentBan = currentDraftStep?.action === 'ban';

  return (
    <div className="flex flex-col" style={{ height: 'calc(100dvh - 64px)', background: 'linear-gradient(180deg, #0a0d1a 0%, #080c16 100%)' }}>

      {/* ── TOP NAV BAR ─────────────────────────────────────── */}
      <div className="flex-shrink-0 border-b border-white/5 px-4 py-2" style={{ background: 'rgba(15,19,35,0.95)' }}>
        <div className="max-w-screen-xl mx-auto flex items-center justify-between gap-3">

          {/* Blue side score */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-bold text-blue-300 text-sm truncate max-w-[100px]">{config.team1}</span>
            <div className="flex gap-1">
              {Array.from({ length: neededToWin }).map((_, i) => (
                <div key={i} className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                  i < seriesScore.blue ? 'bg-blue-400 border-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.8)]' : 'border-white/20'
                }`} />
              ))}
            </div>
          </div>

          {/* Center: series info + game tabs */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2">
              <span className="text-white/40 text-xs font-medium">{config.seriesType}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                config.mode === 'GBP' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-white/5 text-white/30 border border-white/10'
              }`}>{config.mode}</span>
            </div>
            {matchStates.length > 1 && (
              <div className="flex gap-1">
                {matchStates.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setMatchIndex(i)}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                      i === matchIndex ? 'bg-primary-500 text-white' : 'text-white/30 hover:text-white/60'
                    }`}
                  >
                    G{i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Red side score */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex gap-1">
              {Array.from({ length: neededToWin }).map((_, i) => (
                <div key={i} className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                  i < seriesScore.red ? 'bg-red-400 border-red-400 shadow-[0_0_6px_rgba(248,113,113,0.8)]' : 'border-white/20'
                }`} />
              ))}
            </div>
            <span className="font-bold text-red-300 text-sm truncate max-w-[100px]">{config.team2}</span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={undoLast}
              disabled={currentStep === 0}
              className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
              title="Undo"
            ><RotateCcw className="w-3.5 h-3.5" /></button>
            <button
              onClick={resetDraft}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-all border border-white/10"
            >Reset</button>
          </div>
        </div>
      </div>

      {/* ── TURN BANNER ─────────────────────────────────────── */}
      {!isDraftComplete && currentDraftStep && (
        <div className={`flex-shrink-0 py-2.5 text-center font-bold tracking-widest text-xs uppercase ${
          isCurrentBlue
            ? 'text-blue-300'
            : 'text-red-300'
        }`} style={{
          background: isCurrentBlue
            ? 'linear-gradient(90deg, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0.05) 50%, transparent 100%)'
            : 'linear-gradient(270deg, rgba(239,68,68,0.15) 0%, rgba(239,68,68,0.05) 50%, transparent 100%)',
          borderBottom: isCurrentBlue ? '1px solid rgba(59,130,246,0.2)' : '1px solid rgba(239,68,68,0.2)',
        }}>
          {isCurrentBlue ? config.team1 : config.team2}
          <span className="mx-2 text-white/20">·</span>
          <span className={isCurrentBan ? 'text-red-400' : ''}>
            {isCurrentBan ? '⊗ BANNING' : '◎ PICKING'}
          </span>
          {selectedHero && (
            <span className="ml-2 text-white/60 normal-case tracking-normal font-medium">— {selectedHero.name}</span>
          )}
        </div>
      )}

      {/* ── THREE-COLUMN DRAFT AREA ─────────────────────────── */}
      <div className="flex-1 overflow-hidden flex gap-0 min-h-0">

        {/* BLUE TEAM COLUMN */}
        <TeamColumn
          side="blue"
          teamName={config.team1}
          match={currentMatch}
          sequence={sequence}
          currentStep={currentStep}
          activeSlotIndex={isCurrentBlue ? activeSlotIndex : -1}
          isDraftComplete={isDraftComplete}
        />

        {/* ── CENTER: HERO PICKER ─────────────────────────────── */}
        <div className="flex-1 min-w-0 flex flex-col gap-1 sm:gap-1.5 px-1 sm:px-2 py-1.5 sm:py-2 min-h-0">
          {isDraftComplete ? (
            <div className="flex-1 flex items-center justify-center">
              <DraftComplete
                match={currentMatch}
                team1={config.team1}
                team2={config.team2}
                matchIndex={matchIndex}
                seriesComplete={seriesComplete}
                onSetWinner={setMatchWinner}
                onNextMatch={nextMatch}
                onReset={resetDraft}
              />
            </div>
          ) : (
            <>
              {/* Lock-in preview — always at top */}
              <div className={`flex-shrink-0 rounded-xl border transition-all overflow-hidden ${
                selectedHero
                  ? isCurrentBan
                    ? 'border-red-500/40 bg-red-950/30'
                    : 'border-blue-500/40 bg-blue-950/30'
                  : 'border-white/5 bg-white/[0.02]'
              }`}>
                {selectedHero ? (
                  <div className="flex items-center gap-3 px-3 py-2">
                    <div className="relative flex-shrink-0">
                      <img src={selectedHero.icon} alt={selectedHero.name} className="w-12 h-12 rounded-lg object-cover" />
                      <div className={`absolute inset-0 rounded-lg ${isCurrentBan ? 'ring-2 ring-red-400' : 'ring-2 ring-blue-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold truncate">{selectedHero.name}</p>
                      <p className="text-white/40 text-xs">{selectedHero.role} · {selectedHero.lane}</p>
                    </div>
                    <button
                      onClick={lockIn}
                      className={`px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all shadow-lg ${
                        isCurrentBan
                          ? 'bg-red-500 hover:bg-red-400 text-white shadow-red-900/50'
                          : 'bg-blue-500 hover:bg-blue-400 text-white shadow-blue-900/50'
                      }`}
                    >
                      {isCurrentBan ? '⊗ Ban' : '✓ Lock In'}
                    </button>
                  </div>
                ) : (
                  <p className="text-white/20 text-xs text-center py-3 tracking-wide">
                    Select a hero to {isCurrentBan ? 'ban' : 'pick'}
                  </p>
                )}
              </div>

              {/* Search + Filter row */}
              <div className="flex-shrink-0 flex items-center gap-2">
                <div className="relative" style={{ width: '160px' }}>
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg text-white placeholder-white/20 focus:outline-none text-xs"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                  />
                </div>
                <div className="flex gap-1 flex-wrap flex-1">
                  {ROLES.map(r => (
                    <button
                      key={r}
                      onClick={() => setRoleFilter(r)}
                      className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${
                        roleFilter === r
                          ? 'bg-primary-500 text-white shadow-md'
                          : 'text-white/30 hover:text-white/60'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hero Grid — large cards like in-game, responsive */}
              <div
                className="flex-1 min-h-0 overflow-y-auto"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(56px, 8vw, 80px), 1fr))',
                  gap: 'clamp(3px, 0.5vw, 6px)',
                  alignContent: 'start',
                }}
              >
                {filteredHeroes.map(hero => {
                  const activeTeam = currentDraftStep?.team;
                  const isGbpLocked = activeTeam ? gbpLockedIds[activeTeam].has(hero.heroId) : false;
                  const isTaken = takenHeroIds.has(hero.heroId) || isGbpLocked;
                  const isSelected = selectedHero?.heroId === hero.heroId;
                  return (
                    <motion.button
                      key={hero.heroId}
                      onClick={() => !isTaken && setSelectedHero(isSelected ? null : hero)}
                      whileHover={!isTaken ? { scale: 1.05, zIndex: 10 } : undefined}
                      whileTap={!isTaken ? { scale: 0.96 } : undefined}
                      title={hero.name}
                      className={`relative flex flex-col rounded-xl overflow-hidden transition-all group ${
                        isTaken
                          ? 'opacity-20 cursor-not-allowed'
                          : isSelected
                          ? isCurrentBan
                            ? 'ring-2 ring-red-400 shadow-[0_0_12px_rgba(248,113,113,0.6)]'
                            : 'ring-2 ring-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.6)]'
                          : 'cursor-pointer hover:ring-1 hover:ring-white/30'
                      }`}
                      style={{ background: 'rgba(255,255,255,0.04)' }}
                    >
                      {/* Portrait */}
                      <div className="relative aspect-square w-full overflow-hidden">
                        <img
                          src={hero.icon}
                          alt={hero.name}
                          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                          loading="lazy"
                        />
                        {isTaken && (
                          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                            {isGbpLocked
                              ? <span className="text-[8px] text-amber-400 font-bold tracking-wide">GBP</span>
                              : <X className="w-4 h-4 text-white/50" />
                            }
                          </div>
                        )}
                        {isSelected && (
                          <div className={`absolute inset-0 ${isCurrentBan ? 'bg-red-500/30' : 'bg-blue-500/30'}`} />
                        )}
                      </div>
                      {/* Hero name */}
                      <div className="px-1 py-1 text-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
                        <p className={`text-[10px] font-semibold truncate leading-tight ${
                          isSelected ? (isCurrentBan ? 'text-red-300' : 'text-blue-300') : 'text-white/80'
                        }`}>
                          {hero.name}
                        </p>
                      </div>
                    </motion.button>
                  );
                })}
                {filteredHeroes.length === 0 && (
                  <div className="col-span-full py-8 text-center text-white/20 text-sm">No heroes found</div>
                )}
              </div>
            </>
          )}
        </div>

        {/* RED TEAM COLUMN */}
        <TeamColumn
          side="red"
          teamName={config.team2}
          match={currentMatch}
          sequence={sequence}
          currentStep={currentStep}
          activeSlotIndex={isCurrentRed ? activeSlotIndex : -1}
          isDraftComplete={isDraftComplete}
        />
      </div>
    </div>
  );
}

// ─── TEAM COLUMN ──────────────────────────────────────────────────────────────

interface TeamColumnProps {
  side: TeamSide;
  teamName: string;
  match: MatchState | undefined;
  sequence: DraftStep[];
  currentStep: number;
  activeSlotIndex: number;
  isDraftComplete: boolean;
}

function TeamColumn({ side, teamName, match, sequence, currentStep, activeSlotIndex, isDraftComplete }: TeamColumnProps) {
  if (!match) return null;

  const bans = match.bans[side];
  const picks = match.picks[side];
  const isBlue = side === 'blue';

  const currentAction = sequence[currentStep]?.team === side ? sequence[currentStep]?.action : null;

  const accentColor = isBlue ? 'rgba(59,130,246,' : 'rgba(239,68,68,';
  const borderAccent = isBlue ? '1px solid rgba(59,130,246,0.25)' : '1px solid rgba(239,68,68,0.25)';

  // Responsive width: 60px mobile → 140px sm → 180px md+
  const colWidth = 'clamp(60px, 16vw, 180px)';

  return (
    <div
      className="flex-shrink-0 flex flex-col h-full py-1.5 sm:py-2"
      style={{
        width: colWidth,
        background: isBlue
          ? 'linear-gradient(90deg, rgba(59,130,246,0.06) 0%, transparent 100%)'
          : 'linear-gradient(270deg, rgba(239,68,68,0.06) 0%, transparent 100%)',
        borderRight: isBlue ? '1px solid rgba(59,130,246,0.1)' : undefined,
        borderLeft: !isBlue ? '1px solid rgba(239,68,68,0.1)' : undefined,
        paddingLeft: isBlue ? 'clamp(4px, 1vw, 10px)' : 'clamp(4px, 0.6vw, 8px)',
        paddingRight: isBlue ? 'clamp(4px, 0.6vw, 8px)' : 'clamp(4px, 1vw, 10px)',
      }}
    >
      {/* Team Name */}
      <div
        className="text-center py-1.5 mb-1.5 rounded-lg font-bold flex-shrink-0 truncate"
        style={{
          fontSize: 'clamp(9px, 1.2vw, 13px)',
          color: isBlue ? '#93c5fd' : '#fca5a5',
          background: isBlue ? 'rgba(59,130,246,0.12)' : 'rgba(239,68,68,0.12)',
          border: borderAccent,
        }}
      >
        {teamName}
      </div>

      {/* Ban row */}
      <div className="flex-shrink-0 mb-1.5">
        <p className="text-[8px] text-white/20 uppercase tracking-widest mb-1 hidden sm:block">Bans</p>
        <div className="flex flex-wrap gap-0.5 sm:gap-1">
          {bans.map((hero, i) => {
            const isActive = !isDraftComplete && currentAction === 'ban' && i === activeSlotIndex;
            const sz = 'clamp(20px, 3.5vw, 34px)';
            return (
              <div
                key={i}
                title={hero?.name}
                className={`relative rounded overflow-hidden flex-shrink-0 transition-all ${
                  isActive ? 'ring-2 ring-red-400' : ''
                }`}
                style={{ width: sz, height: sz, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {hero ? (
                  <>
                    <img src={hero.icon} alt={hero.name} className="w-full h-full object-cover grayscale opacity-40" />
                    <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(180,0,0,0.3)' }}>
                      <X className="w-2 h-2 sm:w-3 sm:h-3 text-red-300" />
                    </div>
                  </>
                ) : isActive ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-red-400 animate-ping" />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pick slots — fill remaining height */}
      <div className="flex-1 flex flex-col gap-1 sm:gap-1.5 min-h-0">
        <p className="text-[8px] text-white/20 uppercase tracking-widest flex-shrink-0 hidden sm:block">Picks</p>
        {picks.map((hero, i) => {
          const isActive = !isDraftComplete && currentAction === 'pick' && i === activeSlotIndex;
          return (
            <div
              key={i}
              title={hero?.name}
              className={`relative flex-1 min-h-[36px] rounded-lg overflow-hidden transition-all ${
                isActive ? `ring-2 ${isBlue ? 'ring-blue-400' : 'ring-red-400'} animate-pulse` : ''
              }`}
              style={{
                border: hero
                  ? `1px solid ${accentColor}0.3)`
                  : isActive
                  ? 'none'
                  : '1px solid rgba(255,255,255,0.05)',
                background: hero
                  ? 'transparent'
                  : isActive
                  ? `${accentColor}0.08)`
                  : 'rgba(255,255,255,0.02)',
              }}
            >
              {hero ? (
                <>
                  <img src={hero.icon} alt={hero.name} className="absolute inset-0 w-full h-full object-cover" />
                  <div
                    className="absolute inset-0"
                    style={{
                      background: isBlue
                        ? 'linear-gradient(to bottom, transparent 35%, rgba(5,10,30,0.9) 100%)'
                        : 'linear-gradient(to bottom, transparent 35%, rgba(30,5,5,0.9) 100%)',
                    }}
                  />
                  {/* Hero name — hidden on smallest screens, shown sm+ */}
                  <div className="absolute bottom-0 left-0 right-0 px-1 pb-1 hidden sm:block">
                    <p className="text-white font-bold truncate drop-shadow-sm" style={{ fontSize: 'clamp(9px, 1vw, 11px)' }}>
                      {hero.name}
                    </p>
                  </div>
                </>
              ) : isActive ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`w-1.5 h-1.5 rounded-full animate-ping ${isBlue ? 'bg-blue-400' : 'bg-red-400'}`} />
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white/10 font-bold" style={{ fontSize: 'clamp(12px, 1.5vw, 18px)' }}>{i + 1}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── DRAFT COMPLETE ───────────────────────────────────────────────────────────

interface DraftCompleteProps {
  match: MatchState;
  team1: string;
  team2: string;
  matchIndex: number;
  seriesComplete: boolean;
  onSetWinner: (w: TeamSide) => void;
  onNextMatch: () => void;
  onReset: () => void;
}

function DraftComplete({ match, team1, team2, matchIndex, seriesComplete, onSetWinner, onNextMatch, onReset }: DraftCompleteProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-dark-300 rounded-2xl border border-white/10 p-6 text-center"
      >
        <h3 className="text-xl font-bold text-white mb-1">Draft Complete!</h3>
        <p className="text-gray-400 text-sm mb-6">Game {matchIndex + 1} — Who won this match?</p>

        {!match.winner ? (
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => onSetWinner('blue')}
              className="py-4 rounded-xl bg-primary-500/20 border border-primary-500/30 hover:bg-primary-500/30 text-primary-300 font-bold transition-all"
            >
              {team1} Won
            </button>
            <button
              onClick={() => onSetWinner('red')}
              className="py-4 rounded-xl bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 text-red-300 font-bold transition-all"
            >
              {team2} Won
            </button>
          </div>
        ) : (
          <div className={`py-3 rounded-xl mb-6 font-bold ${
            match.winner === 'blue'
              ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
              : 'bg-red-500/20 text-red-300 border border-red-500/30'
          }`}>
            {match.winner === 'blue' ? team1 : team2} Won Game {matchIndex + 1}
          </div>
        )}

        <div className="flex gap-3">
          {match.winner && !seriesComplete && (
            <button
              onClick={onNextMatch}
              className="flex-1 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              Next Game <ChevronRight className="w-4 h-4" />
            </button>
          )}
          {match.winner && seriesComplete && (
            <button
              onClick={onNextMatch}
              className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4" /> See Results
            </button>
          )}
          <button
            onClick={onReset}
            className="px-4 py-3 bg-dark-400 hover:bg-dark-200 text-gray-400 hover:text-white rounded-xl transition-all"
          >
            New Draft
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
