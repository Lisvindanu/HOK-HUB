import { Link } from '@tanstack/react-router';
import type { Hero } from '../../types/hero';
import { getTierColor } from '../../lib/utils';

interface HeroCardProps {
  hero: Hero;
}

const LANE_ICONS: Record<string, string> = {
  'Clash Lane': '/assets/lanes/clash-lane.webp',
  'Jungling': '/assets/lanes/jungle.webp',
  'Mid Lane': '/assets/lanes/mid-lane.webp',
  'Farm Lane': '/assets/lanes/farm-lane.webp',
  'Roaming': '/assets/lanes/roamer.webp',
};

const formatLane = (lane: string): string => {
  if (lane === 'Jungling') return 'Jungle';
  if (lane === 'Roaming') return 'Roam';
  return lane.replace(' Lane', '');
};

export function HeroCard({ hero }: HeroCardProps) {
  const lanes = hero.lanes && hero.lanes.length > 0 ? hero.lanes : [hero.lane];

  return (
    <Link
      to="/heroes/$heroId"
      params={{ heroId: hero.heroId.toString() }}
      className="group block perspective-1000"
    >
      <div className="relative w-full aspect-[3/4] transform-style-3d transition-transform duration-500 group-hover:rotate-y-180">
        {/* Front Side */}
        <div className="absolute inset-0 backface-hidden">
          <div className="relative h-full overflow-hidden rounded-2xl bg-dark-300/50 border border-white/5 group-hover:border-white/10 transition-all duration-300">
            {/* Hero Image */}
            <div className="relative h-full overflow-hidden">
              <img
                src={hero.icon}
                alt={hero.name}
                className="w-full h-full object-cover"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-dark-400 via-dark-400/20 to-transparent" />

              {/* Tier Badge */}
              <div className="absolute top-3 right-3">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold bg-dark-400/80 backdrop-blur-sm ${getTierColor(hero.stats.tier)}`}>
                  {hero.stats.tier}
                </span>
              </div>

              {/* Hero Info - Overlaid at bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-semibold text-white text-lg leading-tight">
                  {hero.name}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  {hero.role}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Back Side */}
        <div className="absolute inset-0 backface-hidden rotate-y-180">
          <div className="relative h-full overflow-hidden rounded-2xl bg-dark-300 border border-primary-500/30 p-4 flex flex-col">
            {/* Header */}
            <div className="text-center mb-4">
              <h3 className="font-bold text-white text-lg">{hero.name}</h3>
              <p className="text-sm text-primary-400">{hero.role}</p>
            </div>

            {/* Lanes */}
            <div className="flex-1 flex flex-col justify-center">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 text-center">Lanes</p>
              <div className="space-y-2">
                {lanes.map((lane) => (
                  <div
                    key={lane}
                    className="flex items-center gap-3 px-3 py-2 bg-dark-400/50 rounded-xl border border-white/5"
                  >
                    {LANE_ICONS[lane] && (
                      <img
                        src={LANE_ICONS[lane]}
                        alt={lane}
                        className="w-6 h-6 object-contain"
                      />
                    )}
                    <span className="text-sm text-white font-medium">
                      {formatLane(lane)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="mt-4 pt-3 border-t border-white/10">
              <div className="flex items-center justify-between text-xs">
                <div className="text-center">
                  <span className="text-green-400 font-bold">{hero.stats.winRate}</span>
                  <p className="text-gray-500 text-[10px]">Win</p>
                </div>
                <div className="text-center">
                  <span className="text-blue-400 font-bold">{hero.stats.pickRate}</span>
                  <p className="text-gray-500 text-[10px]">Pick</p>
                </div>
                <div className="text-center">
                  <span className="text-red-400 font-bold">{hero.stats.banRate}</span>
                  <p className="text-gray-500 text-[10px]">Ban</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
