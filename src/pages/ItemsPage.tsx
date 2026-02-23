import { useState, useMemo } from 'react';
import { Search, Filter, Coins, Swords, Sparkles, Shield, Footprints, Trees, Users } from 'lucide-react';
import { useItems } from '../hooks/useItems';
import { Loading } from '../components/ui/Loading';
import { motion } from 'framer-motion';
import type { Item } from '../types/hero';

const ITEM_TYPES = [
  { id: 0, name: 'All', icon: Filter },
  { id: 1, name: 'Physical', icon: Swords },
  { id: 2, name: 'Magical', icon: Sparkles },
  { id: 3, name: 'Defense', icon: Shield },
  { id: 4, name: 'Boots', icon: Footprints },
  { id: 5, name: 'Jungling', icon: Trees },
  { id: 7, name: 'Roaming', icon: Users },
];

const ITEM_LEVELS = [
  { id: 0, name: 'All Tiers' },
  { id: 1, name: 'Basic' },
  { id: 2, name: 'Mid-Tier' },
  { id: 3, name: 'Advanced' },
];

export function ItemsPage() {
  const { data: items, isLoading, error } = useItems();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState(0);
  const [selectedLevel, setSelectedLevel] = useState(0);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const filteredItems = useMemo(() => {
    if (!items) return [];

    return items.filter(item => {
      const matchesSearch = !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === 0 || item.type === selectedType;
      const matchesLevel = selectedLevel === 0 || item.level === selectedLevel;

      return matchesSearch && matchesType && matchesLevel;
    });
  }, [items, searchQuery, selectedType, selectedLevel]);

  // Group by type
  const groupedItems = useMemo(() => {
    if (selectedType !== 0) {
      return [{ type: selectedType, typeName: ITEM_TYPES.find(t => t.id === selectedType)?.name || '', items: filteredItems }];
    }

    const groups: { type: number; typeName: string; items: Item[] }[] = [];
    ITEM_TYPES.slice(1).forEach(type => {
      const typeItems = filteredItems.filter(item => item.type === type.id);
      if (typeItems.length > 0) {
        groups.push({ type: type.id, typeName: type.name, items: typeItems });
      }
    });
    return groups;
  }, [filteredItems, selectedType]);

  if (isLoading) return <Loading />;
  if (error) return <div className="text-center text-red-500 py-10">Failed to load items</div>;

  return (
    <div className="min-h-screen bg-dark-400 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-white mb-2">Equipment</h1>
          <p className="text-gray-400">Browse all {items?.length || 0} items in Honor of Kings</p>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-dark-300 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
            />
          </div>

          {/* Type Filter */}
          <div className="flex flex-wrap gap-2">
            {ITEM_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedType === type.id
                      ? 'bg-primary-500 text-white'
                      : 'bg-dark-300 text-gray-400 hover:bg-dark-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {type.name}
                </button>
              );
            })}
          </div>

          {/* Level Filter */}
          <div className="flex flex-wrap gap-2">
            {ITEM_LEVELS.map((level) => (
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
        <p className="text-gray-500 mb-4">Showing {filteredItems.length} items</p>

        {/* Items Grid by Type */}
        {groupedItems.map((group) => (
          <div key={group.type} className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              {group.typeName}
              <span className="text-sm font-normal text-gray-500">({group.items.length})</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {group.items.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group cursor-pointer"
                  onClick={() => setSelectedItem(item)}
                >
                  <div className={`relative bg-dark-300 rounded-xl p-3 border transition-all hover:border-primary-500/50 ${
                    item.isTopEquip ? 'border-amber-500/30' : 'border-white/10'
                  }`}>
                    {/* Top Equipment Badge */}
                    {item.isTopEquip && (
                      <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        TOP
                      </div>
                    )}

                    {/* Icon */}
                    <div className="aspect-square mb-2 rounded-lg overflow-hidden bg-dark-400">
                      <img
                        src={item.icon}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                    </div>

                    {/* Name */}
                    <h3 className="text-sm font-medium text-white truncate mb-1">{item.name}</h3>

                    {/* Price */}
                    <div className="flex items-center gap-1 text-amber-400 text-xs">
                      <Coins className="w-3 h-3" />
                      {item.price}
                    </div>

                    {/* Level Badge */}
                    <div className={`mt-2 text-[10px] font-medium px-2 py-0.5 rounded-full inline-block ${
                      item.level === 3 ? 'bg-purple-500/20 text-purple-400' :
                      item.level === 2 ? 'bg-blue-500/20 text-blue-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {item.levelName}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}

        {/* Item Detail Modal */}
        {selectedItem && (
          <div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-dark-300 rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-4 mb-4">
                <img
                  src={selectedItem.icon}
                  alt={selectedItem.name}
                  className="w-20 h-20 rounded-xl"
                />
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedItem.name}</h2>
                  <p className="text-gray-400 text-sm">{selectedItem.typeName}</p>
                  <div className="flex items-center gap-1 text-amber-400 mt-1">
                    <Coins className="w-4 h-4" />
                    {selectedItem.price} Gold
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-400 mb-1">Stats</h3>
                <p className="text-white whitespace-pre-line">{selectedItem.description}</p>
              </div>

              {/* Passive Skills */}
              {selectedItem.passiveSkills.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">Passive Skills</h3>
                  {selectedItem.passiveSkills.map((skill, idx) => (
                    <div key={idx} className="bg-dark-400 rounded-lg p-3 mb-2">
                      <p className="text-white text-sm whitespace-pre-line">{skill.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={() => setSelectedItem(null)}
                className="w-full py-3 bg-dark-400 hover:bg-dark-200 text-white rounded-xl transition-colors"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
