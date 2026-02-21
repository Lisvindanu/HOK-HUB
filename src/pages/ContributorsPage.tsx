import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchContributors } from '../api/tierLists';
import { Loading } from '../components/ui/Loading';
import { Trophy, Medal, Award, Users, ListChecks, ThumbsUp, X, Loader2, Clock, CheckCircle, XCircle } from 'lucide-react';

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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Loading message="Loading contributors..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
          Top Contributors
        </h1>
        <p className="text-gray-400 text-lg">
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
            const RankIcon = rank === 1 ? Trophy : rank === 2 ? Medal : rank === 3 ? Award : Users;
            const rankColor = rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-gray-400' : rank === 3 ? 'text-orange-400' : 'text-gray-600';

            return (
              <button
                key={contributor.id}
                onClick={() => handleContributorClick(contributor.id)}
                className="w-full text-left bg-dark-200 border border-white/10 rounded-xl p-6 hover:border-primary-500/30 hover:bg-dark-100 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="flex-shrink-0 w-12 text-center">
                    <RankIcon className={`w-8 h-8 mx-auto ${rankColor}`} />
                    <p className="text-sm font-bold text-gray-400 mt-1">#{rank}</p>
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white">{contributor.name}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <div className="flex items-center gap-1">
                        <ListChecks className="w-4 h-4 text-blue-400" />
                        <span className="text-gray-400">{contributor.totalContributions || 0} contributions</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Trophy className="w-4 h-4 text-yellow-400" />
                        <span className="text-gray-400">{contributor.totalTierLists} tier lists</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4 text-green-400" />
                        <span className="text-gray-400">{contributor.totalVotes} votes</span>
                      </div>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="flex-shrink-0 text-right">
                    <p className="text-3xl font-bold text-primary-400">
                      {(contributor.totalContributions || 0) * 5 + contributor.totalTierLists * 10 + contributor.totalVotes}
                    </p>
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
  );
}
