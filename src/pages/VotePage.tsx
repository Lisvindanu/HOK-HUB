import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Layers, BarChart2, MessageSquare, CheckCircle2, Loader2, Users } from 'lucide-react';

const API_BASE = import.meta.env.DEV ? '' : 'https://hokapi.project-n.site';

const FEATURES = [
  {
    key: 'playground',
    icon: Layers,
    title: 'Hero Build Playground',
    description:
      'Simulator interaktif — pilih hero, atur arcana, lihat stat berubah real-time, tambah item, dan lihat final build. Cocok buat eksperimen kombinasi sebelum masuk ranked.',
    color: 'from-violet-500 to-indigo-700',
    glow: 'rgba(139,92,246,0.3)',
    tag: 'Simulator',
  },
  {
    key: 'item-synergy',
    icon: BarChart2,
    title: 'Item Synergy Guide',
    description:
      'Panduan item mana yang cocok dan tidak cocok digabung untuk setiap hero dan role. Dilengkapi warning otomatis saat kombinasi item kurang optimal — ideal buat pemula.',
    color: 'from-cyan-500 to-teal-600',
    glow: 'rgba(6,182,212,0.3)',
    tag: 'Guide',
  },
  {
    key: 'dev-talk',
    icon: MessageSquare,
    title: 'Dev Talk & Community Board',
    description:
      'Halaman 2 arah — developer update dari kami, plus ruang buat komunitas share build, tips & tricks, dan artikel strategi. Seperti forum mini tapi lebih terstruktur.',
    color: 'from-amber-400 to-orange-600',
    glow: 'rgba(251,146,60,0.3)',
    tag: 'Community',
  },
];

function getOrCreateVoterId(): string {
  const stored = localStorage.getItem('hok-voter-id');
  if (stored) return stored;
  const id = crypto.randomUUID();
  localStorage.setItem('hok-voter-id', id);
  return id;
}

interface VoteData {
  counts: Record<string, number>;
  total: number;
  myVote: string | null;
}

export function VotePage() {
  const [data, setData] = useState<VoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [voterId] = useState(() => getOrCreateVoterId());

  const fetchVotes = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/votes?voterId=${voterId}`);
      const json = await res.json();
      setData(json);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [voterId]);

  useEffect(() => {
    fetchVotes();
  }, [fetchVotes]);

  const castVote = async (feature: string) => {
    if (voting) return;
    setVoting(true);
    try {
      const res = await fetch(`${API_BASE}/api/votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voterId, feature }),
      });
      const json = await res.json();
      if (json.success) setData(json);
    } catch {
      // silent
    } finally {
      setVoting(false);
    }
  };

  const getPercent = (key: string) => {
    if (!data || data.total === 0) return 0;
    return Math.round(((data.counts[key] || 0) / data.total) * 100);
  };

  return (
    <div className="min-h-screen bg-dark-400">
      {/* Header */}
      <section className="relative pt-20 pb-12 overflow-hidden">
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
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm text-white/80 font-medium">Voting Open</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
              Fitur apa yang kamu mau<br className="hidden md:block" /> kami buat selanjutnya?
            </h1>
            <p className="text-gray-400 max-w-xl mx-auto text-base">
              Vote fitur favoritmu. Suara terbanyak yang akan kami prioritaskan di update berikutnya.
            </p>
            {data && (
              <div className="mt-5 inline-flex items-center gap-2 text-sm text-gray-500">
                <Users className="w-4 h-4" />
                <span>{data.total} vote{data.total !== 1 ? 's' : ''} sejauh ini</span>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Cards */}
      <section className="pb-24">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
              {FEATURES.map((f, i) => {
                const isVoted = data?.myVote === f.key;
                const pct = getPercent(f.key);
                const count = data?.counts[f.key] || 0;

                return (
                  <motion.div
                    key={f.key}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  >
                    <button
                      onClick={() => castVote(f.key)}
                      disabled={voting}
                      className={`group relative w-full text-left flex flex-col p-6 rounded-3xl border transition-all duration-300 disabled:cursor-wait
                        ${isVoted
                          ? 'bg-white/[0.09] border-white/25 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)]'
                          : 'bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.18] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]'
                        }`}
                      style={isVoted ? { boxShadow: `inset 0 1px 0 0 rgba(255,255,255,0.15), 0 0 40px -8px ${f.glow}` } : undefined}
                    >
                      {/* Voted badge */}
                      {isVoted && (
                        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                          <span className="text-xs text-green-400 font-medium">Voted</span>
                        </div>
                      )}

                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5 shadow-lg`}>
                        <f.icon className="w-6 h-6 text-white" />
                      </div>

                      {/* Tag */}
                      <span className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2">
                        {f.tag}
                      </span>

                      {/* Title */}
                      <h3 className="text-lg font-bold text-white mb-3 leading-snug">
                        {f.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-gray-500 leading-relaxed flex-1">
                        {f.description}
                      </p>

                      {/* Progress bar */}
                      <div className="mt-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-500">{count} vote{count !== 1 ? 's' : ''}</span>
                          <span className="text-xs font-semibold text-white">{pct}%</span>
                        </div>
                        <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full bg-gradient-to-r ${f.color}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                          />
                        </div>
                      </div>

                      {/* CTA */}
                      <div className={`mt-4 text-sm font-semibold transition-colors ${isVoted ? 'text-green-400' : 'text-gray-500 group-hover:text-white'}`}>
                        {isVoted ? 'Pilihanmu saat ini · Klik untuk ganti' : 'Klik untuk vote →'}
                      </div>
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Note */}
          <motion.p
            className="text-center text-xs text-gray-600 mt-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Kamu bisa ganti vote kapan saja. Hasilnya akan kami umumkan di update berikutnya.
          </motion.p>
        </div>
      </section>
    </div>
  );
}
