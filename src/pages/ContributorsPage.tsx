import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchContributors } from '../api/tierLists';
import { Loading } from '../components/ui/Loading';
import { Trophy, Users, ListChecks, ThumbsUp, X, Loader2, Clock, CheckCircle, XCircle } from 'lucide-react';

const RANK_TIERS = [
  { name: 'Legend',      abbr: 'Le', minPts: 5000, color1: '#FFD700', color2: '#FF6B00', border: '#FFD700', glow: '#FFD700', textColor: '#FFD700' },
  { name: 'Epic',        abbr: 'Ep', minPts: 3500, color1: '#FF6D00', color2: '#FF1744', border: '#FF8C00', glow: '#FF6D00', textColor: '#FF8C00' },
  { name: 'Mythic',      abbr: 'My', minPts: 2000, color1: '#FF1744', color2: '#9C0027', border: '#FF4569', glow: '#FF1744', textColor: '#FF4569' },
  { name: 'Grand Master',abbr: 'GM', minPts: 1250, color1: '#F97316', color2: '#7C2D12', border: '#FB923C', glow: '#F97316', textColor: '#FB923C' },
  { name: 'Master',      abbr: 'Ma', minPts: 750,  color1: '#A855F7', color2: '#4C1D95', border: '#C084FC', glow: '#A855F7', textColor: '#C084FC' },
  { name: 'Diamond',     abbr: 'Di', minPts: 400,  color1: '#60A5FA', color2: '#1D4ED8', border: '#93C5FD', glow: '#60A5FA', textColor: '#93C5FD' },
  { name: 'Platinum',    abbr: 'Pt', minPts: 200,  color1: '#22D3EE', color2: '#0E7490', border: '#67E8F9', glow: '#22D3EE', textColor: '#67E8F9' },
  { name: 'Gold',        abbr: 'Go', minPts: 75,   color1: '#FBBF24', color2: '#B45309', border: '#FCD34D', glow: '#FBBF24', textColor: '#FCD34D' },
  { name: 'Silver',      abbr: 'Si', minPts: 25,   color1: '#D1D5DB', color2: '#6B7280', border: '#E5E7EB', glow: '#9CA3AF', textColor: '#D1D5DB' },
  { name: 'Bronze',      abbr: 'Br', minPts: 0,    color1: '#D97706', color2: '#78350F', border: '#F59E0B', glow: '#D97706', textColor: '#F59E0B' },
] as const;

type RankTier = typeof RANK_TIERS[number];

function getRankTier(points: number): RankTier {
  for (const tier of RANK_TIERS) {
    if (points >= tier.minPts) return tier;
  }
  return RANK_TIERS[RANK_TIERS.length - 1];
}

function RankBadge({ points, idx }: { points: number; idx: number }) {
  const tier = getRankTier(points);
  const gradId = `rg-${idx}-${tier.abbr}`;
  return (
    <div className="flex flex-col items-center" title={`${tier.name} (${points} pts)`}>
      <svg
        width="44" height="44" viewBox="0 0 44 44" fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: `drop-shadow(0 0 5px ${tier.glow}99)` }}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={tier.color1} />
            <stop offset="100%" stopColor={tier.color2} />
          </linearGradient>
        </defs>
        {/* Outer hexagon (pointy-top) */}
        <polygon
          points="22,2 39,11.5 39,32.5 22,42 5,32.5 5,11.5"
          fill={`url(#${gradId})`}
          stroke={tier.border}
          strokeWidth="1.5"
        />
        {/* Inner ring */}
        <polygon
          points="22,8 34,15 34,29 22,36 10,29 10,15"
          fill="none"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="1"
        />
        {/* Rank abbreviation */}
        <text
          x="22" y="27"
          textAnchor="middle"
          fontSize={tier.abbr === 'GM' ? '10' : '12'}
          fontWeight="bold"
          fill="white"
          fontFamily="system-ui,sans-serif"
          style={{ letterSpacing: tier.abbr === 'GM' ? '0.5px' : undefined }}
        >
          {tier.abbr}
        </text>
      </svg>
      <p className="text-[9px] font-bold mt-0.5 leading-none" style={{ color: tier.textColor }}>
        {tier.name === 'Grand Master' ? 'G.Master' : tier.name}
      </p>
    </div>
  );
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://hokapi.project-n.site';

interface ContributorDetail {
  contributor: {
    id: string;
    name: string;
    totalContributions: number;
    totalTierLists: number;
    totalVotes: number;
    createdAt: string;
  };
  contributions: Array<{
    id: string;
    type: string;
    data: Record<string, unknown>;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
  }>;
  tierLists: Array<{
    id: string;
    title: string;
    votes: number;
    createdAt: string;
  }>;
}

export function ContributorsPage() {
  const [selectedContributor, setSelectedContributor] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const { data: contributors, isLoading } = useQuery({
    queryKey: ['contributors'],
    queryFn: fetchContributors,
  });

  const { data: contributorDetail, isLoading: isLoadingDetail } = useQuery({
    queryKey: ['contributorDetail', selectedContributor],
    queryFn: async (): Promise<ContributorDetail> => {
      const res = await fetch(`${API_BASE_URL}/api/contributors/${selectedContributor}/contributions`);
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    enabled: !!selectedContributor && showModal,
  });

  const handleContributorClick = (contributorId: string) => {
    setSelectedContributor(contributorId);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedContributor(null);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 md:px-6 lg:px-8 pt-20 md:pt-28 pb-12">
        <Loading message="Loading contributors..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-400">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 pt-20 md:pt-28 pb-12">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-5xl font-display font-bold mb-2 md:mb-4">
          Top Contributors
        </h1>
        <p className="text-gray-400 text-sm md:text-lg">
          Community members who help keep HoK Hub up-to-date
        </p>
      </div>

      {/* Coming Soon Message */}
      {(!contributors || contributors.length === 0) && (
        <div className="bg-dark-200 border border-white/10 rounded-xl p-12 text-center">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Leaderboard Coming Soon!
          </h2>
          <p className="text-gray-400 mb-6">
            Start contributing skins, tier lists, and data to climb the ranks
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="bg-dark-100 p-4 rounded-lg">
              <ListChecks className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <h3 className="font-semibold text-white mb-1">Skin Contributions</h3>
              <p className="text-sm text-gray-400">Add missing skins & series</p>
            </div>
            <div className="bg-dark-100 p-4 rounded-lg">
              <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <h3 className="font-semibold text-white mb-1">Tier Lists</h3>
              <p className="text-sm text-gray-400">Share your meta rankings</p>
            </div>
            <div className="bg-dark-100 p-4 rounded-lg">
              <ThumbsUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <h3 className="font-semibold text-white mb-1">Community Votes</h3>
              <p className="text-sm text-gray-400">Earn votes from others</p>
            </div>
          </div>
        </div>
      )}

      {/* Contributors Leaderboard */}
      {contributors && contributors.length > 0 && (
        <div className="space-y-4">
          {contributors.map((contributor, index) => {
            const rank = index + 1;
            const points = (contributor.totalContributions || 0) * 5 + contributor.totalTierLists * 10 + contributor.totalVotes;

            return (
              <button
                key={contributor.id}
                onClick={() => handleContributorClick(contributor.id)}
                className="w-full text-left bg-dark-200 border border-white/10 rounded-xl p-6 hover:border-primary-500/30 hover:bg-dark-100 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3 md:gap-4">
                  {/* Rank Badge */}
                  <div className="flex-shrink-0 w-12 flex flex-col items-center gap-0.5">
                    <RankBadge points={points} idx={index} />
                    <p className="text-xs font-bold text-gray-500">#{rank}</p>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-base md:text-xl font-bold text-white truncate">{contributor.name}</h3>
                      {/* Score - Mobile */}
                      <div className="flex-shrink-0 text-right md:hidden">
                        <p className="text-xl font-bold text-primary-400">{points}</p>
                        <p className="text-[10px] text-gray-500">pts</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs md:text-sm">
                      <div className="flex items-center gap-1">
                        <ListChecks className="w-3.5 md:w-4 h-3.5 md:h-4 text-blue-400" />
                        <span className="text-gray-400">{contributor.totalContributions || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Trophy className="w-3.5 md:w-4 h-3.5 md:h-4 text-yellow-400" />
                        <span className="text-gray-400">{contributor.totalTierLists}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-3.5 md:w-4 h-3.5 md:h-4 text-green-400" />
                        <span className="text-gray-400">{contributor.totalVotes}</span>
                      </div>
                    </div>
                  </div>

                  {/* Score - Desktop */}
                  <div className="hidden md:block flex-shrink-0 text-right">
                    <p className="text-3xl font-bold text-primary-400">{points}</p>
                    <p className="text-xs text-gray-500">Total Points</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Contributor Detail Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-300 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div>
                <h3 className="text-xl font-bold">
                  {contributorDetail?.contributor.name || 'Contributor'}
                </h3>
                <p className="text-sm text-gray-400">
                  Member since {contributorDetail ? new Date(contributorDetail.contributor.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '...'}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 overflow-y-auto max-h-[calc(80vh-80px)]">
              {isLoadingDetail ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
                </div>
              ) : contributorDetail ? (
                <div className="space-y-6">
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-4 bg-blue-500/10 rounded-xl text-center">
                      <ListChecks className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-blue-400">{contributorDetail.contributor.totalContributions}</p>
                      <p className="text-xs text-gray-400">Contributions</p>
                    </div>
                    <div className="p-4 bg-yellow-500/10 rounded-xl text-center">
                      <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-yellow-400">{contributorDetail.contributor.totalTierLists}</p>
                      <p className="text-xs text-gray-400">Tier Lists</p>
                    </div>
                    <div className="p-4 bg-green-500/10 rounded-xl text-center">
                      <ThumbsUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-green-400">{contributorDetail.contributor.totalVotes}</p>
                      <p className="text-xs text-gray-400">Votes</p>
                    </div>
                  </div>

                  {/* Contributions */}
                  {contributorDetail.contributions.length > 0 && (
                    <div>
                      <h4 className="text-lg font-bold mb-3 flex items-center gap-2">
                        <ListChecks className="w-5 h-5 text-blue-400" />
                        Contributions
                      </h4>
                      <div className="space-y-2">
                        {contributorDetail.contributions.map((c) => {
                          const StatusIcon = c.status === 'approved' ? CheckCircle : c.status === 'rejected' ? XCircle : Clock;
                          const statusColor = c.status === 'approved' ? 'text-green-400' : c.status === 'rejected' ? 'text-red-400' : 'text-yellow-400';

                          const getTitle = () => {
                            const data = c.data;
                            if (c.type === 'counter') {
                              const action = data.action as string;
                              const heroName = data.heroName as string;
                              const targetHeroName = data.targetHeroName as string;
                              return `${action === 'add' ? 'Add' : 'Remove'} ${targetHeroName} → ${heroName}`;
                            }
                            if (c.type === 'skin') {
                              return `Skin: ${data.heroName || 'Unknown'}`;
                            }
                            return c.type;
                          };

                          return (
                            <div key={c.id} className="flex items-center justify-between p-3 bg-dark-100 rounded-lg">
                              <div className="flex items-center gap-3">
                                <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${
                                  c.type === 'counter' ? 'bg-amber-500/20 text-amber-400' :
                                  c.type === 'skin' ? 'bg-purple-500/20 text-purple-400' :
                                  c.type === 'hero' ? 'bg-blue-500/20 text-blue-400' :
                                  'bg-orange-500/20 text-orange-400'
                                }`}>
                                  {c.type}
                                </span>
                                <span className="text-sm text-white">{getTitle()}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <StatusIcon className={`w-4 h-4 ${statusColor}`} />
                                <span className={`text-xs capitalize ${statusColor}`}>{c.status}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Tier Lists */}
                  {contributorDetail.tierLists.length > 0 && (
                    <div>
                      <h4 className="text-lg font-bold mb-3 flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-400" />
                        Tier Lists
                      </h4>
                      <div className="space-y-2">
                        {contributorDetail.tierLists.map((tl) => (
                          <div key={tl.id} className="flex items-center justify-between p-3 bg-dark-100 rounded-lg">
                            <span className="text-sm text-white">{tl.title}</span>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <ThumbsUp className="w-4 h-4 text-green-400" />
                              <span>{tl.votes} votes</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No activity message */}
                  {contributorDetail.contributions.length === 0 && contributorDetail.tierLists.length === 0 && (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400">No contributions yet</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-red-400">Failed to load contributor details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
