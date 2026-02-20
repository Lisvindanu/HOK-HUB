import { Link } from '@tanstack/react-router';
import { useRef } from 'react';
import type { Hero } from '../../types/hero';
import { getRoleColor, getTierColor } from '../../lib/utils';
import { animate } from 'animejs';

interface HeroCardProps {
  hero: Hero;
}

export function HeroCard({ hero }: HeroCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (!cardRef.current) return;

    // Animate badges
    animate(cardRef.current.querySelectorAll('.badge'), {
      scale: [1, 1.1, 1],
      duration: 600,
      easing: 'outElastic(1, .5)',
    });

    // Shimmer effect
    animate(cardRef.current.querySelector('.shimmer'), {
      translateX: ['-100%', '100%'],
      duration: 800,
      easing: 'inOutQuad',
    });
  };

  return (
    <Link
      to="/heroes/$heroId"
      params={{ heroId: hero.heroId.toString() }}
      className="group"
      onMouseEnter={handleMouseEnter}
    >
      <div ref={cardRef} className="card-hover overflow-hidden relative">
        {/* Hero Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-dark-200">
          <img
            src={hero.icon}
            alt={hero.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />

          {/* Shimmer overlay */}
          <div className="shimmer absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full" />

          {/* Tier Badge */}
          <div className="absolute top-2 right-2">
            <div className={`badge px-3 py-1 rounded-full bg-dark-400/90 backdrop-blur-sm border border-white/10 ${getTierColor(hero.stats.tier)} font-bold text-sm`}>
              {hero.stats.tier}
            </div>
          </div>

          {/* Role Badge */}
          <div className="absolute bottom-2 left-2">
            <div className={`badge px-3 py-1 rounded-full bg-dark-400/90 backdrop-blur-sm border border-white/10 ${getRoleColor(hero.role)} text-xs font-semibold`}>
              {hero.role}
            </div>
          </div>
        </div>

        {/* Hero Info */}
        <div className="p-4">
          <h3 className="font-bold text-lg mb-1 group-hover:text-primary-400 transition-colors">
            {hero.name}
          </h3>
          <p className="text-sm text-gray-400 mb-3">{hero.lane}</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <p className="text-gray-500">Win Rate</p>
              <p className="font-semibold text-green-400">{hero.stats.winRate}</p>
            </div>
            <div>
              <p className="text-gray-500">Pick Rate</p>
              <p className="font-semibold text-blue-400">{hero.stats.pickRate}</p>
            </div>
            <div>
              <p className="text-gray-500">Ban Rate</p>
              <p className="font-semibold text-red-400">{hero.stats.banRate}</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
