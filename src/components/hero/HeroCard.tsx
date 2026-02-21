import { Link } from '@tanstack/react-router';
import type { Hero } from '../../types/hero';
import { getTierColor } from '../../lib/utils';

interface HeroCardProps {
  hero: Hero;
}

export function HeroCard({ hero }: HeroCardProps) {
  return (
    <Link
      to="/heroes/$heroId"
      params={{ heroId: hero.heroId.toString() }}
      className="group block"
    >
      <div className="relative overflow-hidden rounded-2xl bg-dark-300/50 border border-white/5 hover:border-white/10 transition-all duration-300">
        {/* Hero Image */}
        <div className="relative aspect-[3/4] overflow-hidden">
          <img
            src={hero.icon}
            alt={hero.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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
            <h3 className="font-semibold text-white text-lg leading-tight group-hover:text-primary-400 transition-colors">
              {hero.name}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              {hero.role} · {hero.lane.replace(' Lane', '')}
            </p>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="px-4 py-3 border-t border-white/5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <span className="text-gray-500">WR</span>
              <span className="font-medium text-green-400">{hero.stats.winRate}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gray-500">PR</span>
              <span className="font-medium text-blue-400">{hero.stats.pickRate}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gray-500">BR</span>
              <span className="font-medium text-red-400">{hero.stats.banRate}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
