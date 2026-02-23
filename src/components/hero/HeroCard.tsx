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

// Role-based glow colors
const ROLE_GLOW: Record<string, { border: string; shadow: string; text: string }> = {
  'Tank': { border: 'border-blue-500/60', shadow: 'shadow-blue-500/30', text: 'text-blue-400' },
  'Fighter': { border: 'border-orange-500/60', shadow: 'shadow-orange-500/30', text: 'text-orange-400' },
  'Assassin': { border: 'border-purple-500/60', shadow: 'shadow-purple-500/30', text: 'text-purple-400' },
  'Mage': { border: 'border-cyan-500/60', shadow: 'shadow-cyan-500/30', text: 'text-cyan-400' },
  'Marksman': { border: 'border-yellow-500/60', shadow: 'shadow-yellow-500/30', text: 'text-yellow-400' },
  'Support': { border: 'border-green-500/60', shadow: 'shadow-green-500/30', text: 'text-green-400' },
};

export function HeroCard({ hero }: HeroCardProps) {
  const lanes = hero.lanes && hero.lanes.length > 0 ? hero.lanes : [hero.lane];
  const roleGlow = ROLE_GLOW[hero.role] || ROLE_GLOW['Fighter'];
  const skills = hero.skill?.slice(0, 4) || [];

  return (
    <Link
      to="/heroes/$heroId"
      params={{ heroId: hero.heroId.toString() }}
      className="group block perspective-1000"
    >
      <div className="relative w-full aspect-[3/4] transform-style-3d transition-transform duration-700 ease-out group-hover:rotate-y-180">
        {/* Front Side */}
        <div className="absolute inset-0 backface-hidden">
          <div className="relative h-full overflow-hidden rounded-2xl bg-dark-300/50 border border-white/10 transition-all duration-300">
            {/* Hero Image */}
            <div className="relative h-full overflow-hidden">
              <img
                src={hero.icon}
                alt={hero.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-dark-400 via-dark-400/30 to-transparent" />

              {/* Tier Badge */}
              <div className="absolute top-3 right-3">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold bg-dark-400/90 backdrop-blur-sm border border-white/10 ${getTierColor(hero.stats.tier)}`}>
                  {hero.stats.tier}
                </span>
              </div>

              {/* Hero Info - Overlaid at bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-bold text-white text-lg leading-tight drop-shadow-lg">
                  {hero.name}
                </h3>
                <p className={`text-sm font-medium mt-1 ${roleGlow.text}`}>
                  {hero.role}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Back Side - TCG Style */}
        <div className="absolute inset-0 backface-hidden rotate-y-180">
          <div className={`relative h-full overflow-hidden rounded-2xl border-2 ${roleGlow.border} shadow-lg ${roleGlow.shadow} transition-shadow duration-300`}>
            {/* Frosted Glass Background - Hero Image */}
            <div className="absolute inset-0">
              <img
                src={hero.icon}
                alt=""
                className="w-full h-full object-cover blur-xl scale-110 opacity-20"
              />
              <div className="absolute inset-0 bg-dark-400/85" />
            </div>

            {/* TCG Inner Frame */}
            <div className="absolute inset-2 border border-gradient-to-b from-amber-500/30 via-amber-600/20 to-amber-500/30 rounded-xl pointer-events-none" />

            {/* Content */}
            <div className="relative h-full p-4 flex flex-col">
              {/* Header with Mini Avatar */}
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-12 h-12 rounded-full overflow-hidden border-2 ${roleGlow.border} shadow-md ${roleGlow.shadow}`}>
                  <img
                    src={hero.icon}
                    alt={hero.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-base truncate">{hero.name}</h3>
                  <p className={`text-xs font-semibold ${roleGlow.text}`}>{hero.role}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs font-bold bg-dark-400/80 ${getTierColor(hero.stats.tier)}`}>
                  {hero.stats.tier}
                </span>
              </div>

              {/* Lanes Section */}
              <div className="mb-3">
                <p className="text-[9px] text-amber-500/80 uppercase tracking-widest font-semibold mb-1.5">Lanes</p>
                <div className="flex flex-wrap gap-1.5">
                  {lanes.map((lane) => (
                    <div
                      key={lane}
                      className="flex items-center gap-1.5 px-2 py-1 bg-dark-400/60 rounded-lg border border-white/10"
                    >
                      {LANE_ICONS[lane] && (
                        <img
                          src={LANE_ICONS[lane]}
                          alt={lane}
                          className="w-4 h-4 object-contain"
                        />
                      )}
                      <span className="text-[10px] text-white font-medium">
                        {formatLane(lane)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills Section */}
              {skills.length > 0 && (
                <div className="mb-3">
                  <p className="text-[9px] text-amber-500/80 uppercase tracking-widest font-semibold mb-1.5">Skills</p>
                  <div className="flex gap-1.5">
                    {skills.map((skill, index) => (
                      <div
                        key={index}
                        className="w-8 h-8 rounded-lg overflow-hidden border border-white/20 bg-dark-400/60"
                        title={skill.skillName}
                      >
                        {skill.skillImg ? (
                          <img
                            src={skill.skillImg}
                            alt={skill.skillName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500">
                            {index === 0 ? 'P' : index}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Spacer */}
              <div className="flex-1" />

              {/* Stats Section - TCG Style */}
              <div className="border-t border-amber-500/20 pt-2">
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-1.5 bg-dark-400/50 rounded-lg border border-green-500/20">
                    <span className="text-green-400 font-bold text-sm block">{hero.stats.winRate}</span>
                    <p className="text-[8px] text-green-500/70 uppercase tracking-wider">Win</p>
                  </div>
                  <div className="text-center p-1.5 bg-dark-400/50 rounded-lg border border-blue-500/20">
                    <span className="text-blue-400 font-bold text-sm block">{hero.stats.pickRate}</span>
                    <p className="text-[8px] text-blue-500/70 uppercase tracking-wider">Pick</p>
                  </div>
                  <div className="text-center p-1.5 bg-dark-400/50 rounded-lg border border-red-500/20">
                    <span className="text-red-400 font-bold text-sm block">{hero.stats.banRate}</span>
                    <p className="text-[8px] text-red-500/70 uppercase tracking-wider">Ban</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
