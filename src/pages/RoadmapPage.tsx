import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Sparkles, Rocket, Users, Wrench, Palette, Globe, Zap, Music2, Swords, Target, MessageSquare, Shield } from 'lucide-react';

interface Milestone {
  label: string;
  done: boolean;
}

interface Phase {
  phase: string;
  title: string;
  period: string;
  color: string;
  icon: React.ElementType;
  status: 'done' | 'in-progress' | 'planned';
  milestones: Milestone[];
}

const PHASES: Phase[] = [
  {
    phase: 'Phase 1',
    title: 'Foundation',
    period: 'Jan 2025',
    color: 'from-blue-500 to-cyan-500',
    icon: Rocket,
    status: 'done',
    milestones: [
      { label: 'Platform HOK Hub — launch awal', done: true },
      { label: 'Data heroes, tier list, item database', done: true },
      { label: 'Sistem login & register', done: true },
      { label: 'Dashboard pengguna', done: true },
      { label: 'Counter pick guide', done: true },
    ],
  },
  {
    phase: 'Phase 2',
    title: 'Game Tools',
    period: 'Feb – Mar 2025',
    color: 'from-primary-500 to-violet-500',
    icon: Wrench,
    status: 'done',
    milestones: [
      { label: 'Draft Pick Simulator — role-based picking', done: true },
      { label: 'Draft Pick — switch side per game', done: true },
      { label: 'Hero Build Playground — sim arcana + item', done: true },
      { label: 'Playground — stats breakdown (Item vs Arcana)', done: true },
      { label: 'Playground — save & share build via URL', done: true },
      { label: 'Item Synergy Checker — konflik passive detection', done: true },
    ],
  },
  {
    phase: 'Phase 3',
    title: 'Content & Media',
    period: 'Mar – Apr 2025',
    color: 'from-rose-500 to-orange-500',
    icon: Palette,
    status: 'done',
    milestones: [
      { label: 'Patch Notes — season selector + balance history', done: true },
      { label: 'Skin Gallery — koleksi skin per hero', done: true },
      { label: 'OST Music Player — 34 lagu + vinyl animation', done: true },
      { label: 'Arcana Explorer — detail set arcana', done: true },
      { label: 'Items Explorer — detail item + stats', done: true },
      { label: 'Analytics — winrate & pickrate tracking', done: true },
    ],
  },
  {
    phase: 'Phase 4',
    title: 'Community',
    period: 'Mei – Jun 2025',
    color: 'from-green-500 to-teal-500',
    icon: Users,
    status: 'done',
    milestones: [
      { label: 'Community Board — posts, replies, likes', done: true },
      { label: 'Dev Updates — panel admin + pengumuman resmi', done: true },
      { label: 'Reply edit & post edit', done: true },
      { label: 'Contributors page — showcase kontributor', done: true },
      { label: 'Feedback & saran langsung ke dev', done: true },
      { label: 'Trakteer widget — support HOK Hub', done: true },
    ],
  },
  {
    phase: 'Phase 5',
    title: 'Polish & SEO',
    period: 'Jul – Sep 2025',
    color: 'from-yellow-500 to-amber-500',
    icon: Globe,
    status: 'done',
    milestones: [
      { label: 'Redesign UI 2026 — dark luxury aesthetic', done: true },
      { label: 'SEO optimization — meta, sitemap, canonical', done: true },
      { label: 'Mega menu — grouped navigation', done: true },
      { label: 'Mobile bottom nav — quick access', done: true },
      { label: 'Dropdown "More" — text nowrap fix', done: true },
      { label: 'Incident page — status & downtime tracker', done: true },
    ],
  },
  {
    phase: 'Phase 6',
    title: 'Coming Next',
    period: '2026 & Beyond',
    color: 'from-violet-500 to-fuchsia-500',
    icon: Sparkles,
    status: 'planned',
    milestones: [
      { label: 'Hero Comparison Tool — head-to-head stats', done: false },
      { label: 'Team Composition Builder — meta comp suggestions', done: false },
      { label: 'Custom Tier List — buat & share tier list sendiri', done: false },
      { label: 'Notifikasi patch notes baru', done: false },
      { label: 'Match history & rank tracker', done: false },
    ],
  },
];

const STATS = [
  { value: '5+', label: 'Game Tools', icon: Wrench },
  { value: '34', label: 'OST Tracks', icon: Music2 },
  { value: '114', label: 'Items', icon: Swords },
  { value: '70+', label: 'Heroes', icon: Target },
];

function PhaseCard({ phase, index }: { phase: Phase; index: number }) {
  const isPlanned = phase.status === 'planned';
  const doneCount = phase.milestones.filter(m => m.done).length;

  const borderColor = isPlanned
    ? 'border-violet-500/20'
    : 'border-white/[0.06]';

  const bgColor = isPlanned
    ? 'bg-violet-500/[0.05]'
    : 'bg-white/[0.02]';

  return (
    <motion.div
      initial={{ opacity: 0, x: index % 2 === 0 ? -24 : 24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: 0.05 }}
      className={`relative rounded-2xl border ${borderColor} ${bgColor} p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]`}
    >
      {/* Phase badge */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${phase.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
            <phase.icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{phase.phase}</p>
            <h3 className="text-base font-bold text-white">{phase.title}</h3>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <span className="text-xs text-gray-500">{phase.period}</span>
          {isPlanned ? (
            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 bg-violet-500/15 border border-violet-500/25 rounded-full text-violet-400 font-medium">
              <Clock className="w-3 h-3" />
              Planned
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 bg-green-500/15 border border-green-500/25 rounded-full text-green-400 font-medium">
              <CheckCircle2 className="w-3 h-3" />
              Done {doneCount}/{phase.milestones.length}
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {!isPlanned && (
        <div className="mb-4">
          <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <motion.div
              className={`h-full bg-gradient-to-r ${phase.color} rounded-full`}
              initial={{ width: 0 }}
              whileInView={{ width: `${(doneCount / phase.milestones.length) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
          </div>
        </div>
      )}

      {/* Milestones */}
      <ul className="space-y-2.5">
        {phase.milestones.map((m, i) => (
          <li key={i} className="flex items-center gap-3">
            {m.done ? (
              <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
            ) : (
              <Clock className="w-4 h-4 text-violet-400 flex-shrink-0" />
            )}
            <span className={`text-sm ${m.done ? 'text-gray-300' : 'text-gray-500'}`}>
              {m.label}
            </span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

export function RoadmapPage() {
  const donePhases = PHASES.filter(p => p.status === 'done').length;

  return (
    <div className="min-h-screen bg-dark-400">
      {/* Header */}
      <section className="relative pt-20 pb-14 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary-500/[0.08] rounded-full blur-[100px]" />
          <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-violet-500/[0.07] rounded-full blur-[100px]" />
        </div>
        <div className="container mx-auto px-4 md:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-6">
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              <span className="text-sm text-white/80 font-medium">Project Roadmap</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
              Perjalanan HOK Hub
            </h1>
            <p className="text-gray-400 max-w-xl mx-auto text-base leading-relaxed">
              Dari awal dibuat hingga sekarang — semua fitur, milestone, dan apa yang sedang kami siapkan untuk kamu selanjutnya.
            </p>
          </motion.div>

          {/* Stats row */}
          <motion.div
            className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {STATS.map((s, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-1.5 p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06]"
              >
                <s.icon className="w-4 h-4 text-gray-500" />
                <span className="text-2xl font-bold text-white font-display">{s.value}</span>
                <span className="text-xs text-gray-500">{s.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Overall progress */}
      <section className="pb-8">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <motion.div
              className="flex items-center gap-4 p-5 rounded-2xl bg-green-500/[0.06] border border-green-500/[0.15]"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">
                  {donePhases} dari {PHASES.length} phase selesai
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {PHASES.filter(p => p.status === 'done').reduce((acc, p) => acc + p.milestones.length, 0)} fitur berhasil diimplementasi
                </p>
              </div>
              <div className="hidden md:flex items-center gap-3">
                <div className="w-32 h-2 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-teal-400 rounded-full transition-all"
                    style={{ width: `${(donePhases / PHASES.length) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-green-400 font-medium">
                  {Math.round((donePhases / PHASES.length) * 100)}%
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Timeline grid */}
      <section className="pb-24">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            {/* Section header */}
            <motion.div
              className="flex items-center gap-3 mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Shield className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span className="text-sm font-semibold text-white">Semua Phase</span>
              <div className="flex-1 h-px bg-white/[0.06]" />
              <span className="text-xs text-gray-600">{PHASES.length} phase</span>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {PHASES.map((phase, i) => (
                <PhaseCard key={i} phase={phase} index={i} />
              ))}
            </div>

            {/* Coming next callout */}
            <motion.div
              className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-violet-500/[0.08] to-fuchsia-500/[0.05] border border-violet-500/20"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white mb-1">Ada ide fitur baru?</h4>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Sampaikan saran kamu lewat <strong className="text-white">Community Board</strong> atau langsung kirim feedback ke tim kami. Saran terbaik bisa masuk ke roadmap berikutnya!
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
