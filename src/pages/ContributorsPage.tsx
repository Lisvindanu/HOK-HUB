import { useQuery } from '@tanstack/react-query';
import { fetchContributors } from '../api/tierLists';
import { Loading } from '../components/ui/Loading';
import { Trophy, Medal, Award, Users, ListChecks, ThumbsUp } from 'lucide-react';

export function ContributorsPage() {
  const { data: contributors, isLoading } = useQuery({
    queryKey: ['contributors'],
    queryFn: fetchContributors,
  });

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
              <div
                key={contributor.id}
                className="bg-dark-200 border border-white/10 rounded-xl p-6 hover:border-primary-500/30 transition-colors"
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
