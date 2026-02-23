import { useState, useMemo } from 'react';
import { Search, Filter, Flame, Droplets, Leaf } from 'lucide-react';
import { useArcana } from '../hooks/useItems';
import { Loading } from '../components/ui/Loading';
import { motion } from 'framer-motion';
import type { Arcana } from '../types/hero';

const ARCANA_COLORS = [
  { id: 0, name: 'All', icon: Filter, color: 'gray' },
  { id: 1, name: 'Red', icon: Flame, color: 'red', desc: 'Offensive stats' },
  { id: 2, name: 'Blue', icon: Droplets, color: 'blue', desc: 'Utility stats' },
  { id: 3, name: 'Green', icon: Leaf, color: 'green', desc: 'Defensive stats' },
];

const ARCANA_LEVELS = [
  { id: 0, name: 'All Levels' },
  { id: 1, name: 'Level 1' },
  { id: 2, name: 'Level 2' },
  { id: 3, name: 'Level 3' },
  { id: 4, name: 'Level 4' },
  { id: 5, name: 'Level 5' },
];

const getColorClasses = (color: number) => {
  switch (color) {
    case 1: return { bg: 'bg-red-500/20', border: 'border-red-500/30', text: 'text-red-400', glow: 'shadow-red-500/20' };
    case 2: return { bg: 'bg-blue-500/20', border: 'border-blue-500/30', text: 'text-blue-400', glow: 'shadow-blue-500/20' };
    case 3: return { bg: 'bg-green-500/20', border: 'border-green-500/30', text: 'text-green-400', glow: 'shadow-green-500/20' };
    default: return { bg: 'bg-gray-500/20', border: 'border-gray-500/30', text: 'text-gray-400', glow: '' };
  }
};

export function ArcanaPage() {
  const { data: arcana, isLoading, error } = useArcana();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedLevel, setSelectedLevel] = useState(0);
  const [selectedArcana, setSelectedArcana] = useState<Arcana | null>(null);

  const filteredArcana = useMemo(() => {
    if (!arcana) return [];

    return arcana.filter(arc => {
      const matchesSearch = !searchQuery ||
        arc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        arc.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesColor = selectedColor === 0 || arc.color === selectedColor;
      const matchesLevel = selectedLevel === 0 || arc.level === selectedLevel;

      return matchesSearch && matchesColor && matchesLevel;
    });
  }, [arcana, searchQuery, selectedColor, selectedLevel]);

  // Group by level
  const groupedArcana = useMemo(() => {
    if (selectedLevel !== 0) {
      return [{ level: selectedLevel, arcana: filteredArcana }];
    }

    const groups: { level: number; arcana: Arcana[] }[] = [];
    for (let lvl = 5; lvl >= 1; lvl--) {
      const levelArcana = filteredArcana.filter(arc => arc.level === lvl);
      if (levelArcana.length > 0) {
        groups.push({ level: lvl, arcana: levelArcana });
      }
    }
    return groups;
  }, [filteredArcana, selectedLevel]);

  if (isLoading) return <Loading />;
  if (error) return <div className="text-center text-red-500 py-10">Failed to load arcana</div>;

  return (
    <div className="min-h-screen bg-dark-400 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-white mb-2">Arcana</h1>
          <p className="text-gray-400">Browse all {arcana?.length || 0} arcana in Honor of Kings</p>
        </div>

        {/* Color Legend */}
        <div className="mb-6 p-4 bg-dark-300 rounded-xl">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Arcana Types</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {ARCANA_COLORS.slice(1).map((color) => {
              const Icon = color.icon;
              const classes = getColorClasses(color.id);
              return (
                <div key={color.id} className={`flex items-center gap-3 p-3 rounded-lg ${classes.bg} border ${classes.border}`}>
                  <Icon className={`w-5 h-5 ${classes.text}`} />
                  <div>
                    <p className={`font-medium ${classes.text}`}>{color.name}</p>
                    <p className="text-xs text-gray-500">{color.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search arcana..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-dark-300 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
            />
          </div>

          {/* Color Filter */}
          <div className="flex flex-wrap gap-2">
            {ARCANA_COLORS.map((color) => {
              const Icon = color.icon;
              const isSelected = selectedColor === color.id;
              return (
                <button
                  key={color.id}
                  onClick={() => setSelectedColor(color.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    isSelected
                      ? color.id === 1 ? 'bg-red-500 text-white' :
                        color.id === 2 ? 'bg-blue-500 text-white' :
                        color.id === 3 ? 'bg-green-500 text-white' :
                        'bg-primary-500 text-white'
                      : 'bg-dark-300 text-gray-400 hover:bg-dark-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {color.name}
                </button>
              );
            })}
          </div>

          {/* Level Filter */}
          <div className="flex flex-wrap gap-2">
            {ARCANA_LEVELS.map((level) => (
              <button
                key={level.id}
                onClick={() => setSelectedLevel(level.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedLevel === level.id
                    ? 'bg-amber-500 text-white'
                    : 'bg-dark-300 text-gray-400 hover:bg-dark-200'
                }`}
              >
                {level.name}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p className="text-gray-500 mb-4">Showing {filteredArcana.length} arcana</p>

        {/* Arcana Grid by Level */}
        {groupedArcana.map((group) => (
          <div key={group.level} className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              Level {group.level}
              <span className="text-sm font-normal text-gray-500">({group.arcana.length})</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {group.arcana.map((arc) => {
                const colorClasses = getColorClasses(arc.color);
                return (
                  <motion.div
                    key={arc.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group cursor-pointer"
                    onClick={() => setSelectedArcana(arc)}
                  >
                    <div className={`relative bg-dark-300 rounded-xl p-3 border transition-all hover:shadow-lg ${colorClasses.border} hover:${colorClasses.glow}`}>
                      {/* Icon */}
                      <div className={`aspect-square mb-2 rounded-lg overflow-hidden ${colorClasses.bg}`}>
                        <img
                          src={arc.icon}
                          alt={arc.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        />
                      </div>

                      {/* Name */}
                      <h3 className="text-sm font-medium text-white truncate mb-1">
                        {arc.name.replace(/^Lvl \d+: /, '')}
                      </h3>

                      {/* Color Badge */}
                      <div className={`text-[10px] font-medium px-2 py-0.5 rounded-full inline-block ${colorClasses.bg} ${colorClasses.text}`}>
                        {arc.colorName}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Arcana Detail Modal */}
        {selectedArcana && (
          <div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedArcana(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-dark-300 rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const colorClasses = getColorClasses(selectedArcana.color);
                return (
                  <>
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-20 h-20 rounded-xl overflow-hidden ${colorClasses.bg}`}>
                        <img
                          src={selectedArcana.icon}
                          alt={selectedArcana.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">{selectedArcana.name}</h2>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colorClasses.bg} ${colorClasses.text}`}>
                            {selectedArcana.colorName}
                          </span>
                          <span className="text-xs text-gray-500">
                            Level {selectedArcana.level}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-gray-400 mb-2">Stats</h3>
                      <div className={`p-4 rounded-lg ${colorClasses.bg} border ${colorClasses.border}`}>
                        <p className="text-white whitespace-pre-line">{selectedArcana.description}</p>
                      </div>
                    </div>

                    {/* Close Button */}
                    <button
                      onClick={() => setSelectedArcana(null)}
                      className="w-full py-3 bg-dark-400 hover:bg-dark-200 text-white rounded-xl transition-colors"
                    >
                      Close
                    </button>
                  </>
                );
              })()}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
