import { FileText, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { useUserContributions, type Contribution } from '../../hooks/useContributions';

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    icon: Clock,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20',
  },
  approved: {
    label: 'Approved',
    icon: CheckCircle,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
  },
};

const TYPE_CONFIG = {
  skin: { label: 'Skin', color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
  hero: { label: 'Hero', color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
  series: { label: 'Series', color: 'text-orange-400', bgColor: 'bg-orange-500/10' },
};

function ContributionCard({ contribution }: { contribution: Contribution }) {
  const status = STATUS_CONFIG[contribution.status];
  const type = TYPE_CONFIG[contribution.type];
  const StatusIcon = status.icon;

  const getTitle = () => {
    const data = contribution.data as Record<string, unknown>;
    if (contribution.type === 'skin') {
      const skin = data.skin as Record<string, string> | undefined;
      return `${data.heroName || 'Unknown'} - ${skin?.skinName || 'Unknown Skin'}`;
    }
    if (contribution.type === 'hero') {
      return data.name as string || 'Unknown Hero';
    }
    if (contribution.type === 'series') {
      return data.seriesName as string || 'Unknown Series';
    }
    return 'Unknown';
  };

  return (
    <div className={`p-4 rounded-lg border ${status.borderColor} ${status.bgColor}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${type.bgColor} ${type.color}`}>
              {type.label}
            </span>
            <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${status.bgColor} ${status.color}`}>
              <StatusIcon className="w-3 h-3" />
              {status.label}
            </span>
          </div>
          <h4 className="font-semibold text-white truncate">{getTitle()}</h4>
          <p className="text-sm text-gray-400 mt-1">
            {new Date(contribution.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

export function ContributionsSection() {
  const { data: contributions, isLoading, error } = useUserContributions();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">Failed to load contributions</p>
      </div>
    );
  }

  const stats = {
    total: contributions?.length || 0,
    pending: contributions?.filter(c => c.status === 'pending').length || 0,
    approved: contributions?.filter(c => c.status === 'approved').length || 0,
    rejected: contributions?.filter(c => c.status === 'rejected').length || 0,
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-500/20 rounded-lg">
          <FileText className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">My Contributions</h2>
          <p className="text-gray-400 text-sm">Track your submitted heroes, skins, and series</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="p-3 bg-dark-50 rounded-lg text-center">
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-xs text-gray-400">Total</p>
        </div>
        <div className="p-3 bg-yellow-500/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
          <p className="text-xs text-gray-400">Pending</p>
        </div>
        <div className="p-3 bg-green-500/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-green-400">{stats.approved}</p>
          <p className="text-xs text-gray-400">Approved</p>
        </div>
        <div className="p-3 bg-red-500/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
          <p className="text-xs text-gray-400">Rejected</p>
        </div>
      </div>

      {/* Contributions List */}
      {!contributions || contributions.length === 0 ? (
        <div className="text-center py-12 bg-dark-50 rounded-lg">
          <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">No contributions yet</p>
          <p className="text-sm text-gray-500">Start contributing heroes, skins, or series to see them here!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {contributions.map((contribution) => (
            <ContributionCard key={contribution.id} contribution={contribution} />
          ))}
        </div>
      )}
    </div>
  );
}
