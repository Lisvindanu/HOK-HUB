import { useState, useMemo } from 'react';
import { useHeroes } from '../hooks/useHeroes';
import { useAuth } from '../contexts/AuthContext';
import { Loading } from '../components/ui/Loading';
import { Search, ChevronRight, Shield, Sword, AlertCircle, PenLine, X, Plus, Trash2 } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import type { Hero } from '../types/hero';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://hokapi.project-n.site';

export function CounterPage() {
  const { data: heroes, isLoading } = useHeroes();
  const { isAuthenticated, user, token } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHero, setSelectedHero] = useState<Hero | null>(null);
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [suggestAction, setSuggestAction] = useState<'add' | 'remove'>('add');
  const [suggestType, setSuggestType] = useState<'strongAgainst' | 'weakAgainst' | 'bestPartner'>('strongAgainst');
  const [suggestTargetHero, setSuggestTargetHero] = useState<Hero | null>(null);
  const [suggestTargetHeroes, setSuggestTargetHeroes] = useState<{name: string, icon: string}[]>([]);
  const [suggestDescription, setSuggestDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [heroSearch, setHeroSearch] = useState('');
  const [filterRole, setFilterRole] = useState<string>('All');
  const [filterLane, setFilterLane] = useState<string>('All');
  const [applyInverse, setApplyInverse] = useState(true);

  const roles = ['All', 'Tank', 'Fighter', 'Assassin', 'Mage', 'Marksman', 'Support'];
  const lanes = ['All', 'Clash Lane', 'Jungle', 'Mid Lane', 'Farm Lane', 'Roaming'];

  const filteredSuggestHeroes = useMemo(() => {
    if (!heroes) return [];

    let filtered = heroes.filter(h => h.heroId !== selectedHero?.heroId);

    // Filter by search query
    if (heroSearch) {
      filtered = filtered.filter(h =>
        h.name.toLowerCase().includes(heroSearch.toLowerCase())
      );
    }

    // Filter by role
    if (filterRole !== 'All') {
      filtered = filtered.filter(h =>
        h.role?.toLowerCase() === filterRole.toLowerCase()
      );
    }

    // Filter by lane
    if (filterLane !== 'All') {
      filtered = filtered.filter(h =>
        h.lane?.toLowerCase().includes(filterLane.toLowerCase().replace(' lane', ''))
      );
    }

    return filtered;
  }, [heroes, heroSearch, selectedHero, filterRole, filterLane]);

  // Get existing heroes for remove action
  const existingRelationHeroes = useMemo(() => {
    if (!selectedHero || suggestAction !== 'remove') return [];

    const relationMap = {
      strongAgainst: selectedHero.suppressingHeroes,
      weakAgainst: selectedHero.suppressedHeroes,
      bestPartner: selectedHero.bestPartners,
    };

    const relations = relationMap[suggestType] || {};
    return Object.values(relations).map((r: any) => ({
      name: r.name,
      thumbnail: r.thumbnail,
    }));
  }, [selectedHero, suggestAction, suggestType]);

  const handleSubmitSuggestion = async () => {
    if (!selectedHero) return;
    if (suggestTargetHeroes.length === 0) return;

    setIsSubmitting(true);
    try {
      // Submit one contribution per target hero
      const promises = suggestTargetHeroes.map(target =>
        fetch(`${API_BASE_URL}/api/contribute`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            type: 'counter',
            contributorName: user?.name || 'Anonymous',
            contributorEmail: user?.email || '',
            data: {
              heroName: selectedHero.name,
              heroIcon: selectedHero.icon,
              action: suggestAction,
              relationshipType: suggestType,
              targetHeroName: target.name,
              targetHeroIcon: target.icon,
              description: suggestDescription,
              applyInverse: applyInverse,
            },
          }),
        })
      );

      await Promise.all(promises);
      setSubmitSuccess(true);
      setTimeout(() => {
        setShowSuggestModal(false);
        setSubmitSuccess(false);
        setSuggestTargetHero(null);
        setSuggestTargetHeroes([]);
        setSuggestDescription('');
        setHeroSearch('');
      }, 2000);
    } catch (error) {
      console.error('Failed to submit suggestion:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleHeroSelection = (hero: {name: string, icon: string}) => {
    setSuggestTargetHeroes(prev => {
      const exists = prev.some(h => h.name === hero.name);
      if (exists) {
        return prev.filter(h => h.name !== hero.name);
      } else {
        return [...prev, { name: hero.name, icon: hero.icon }];
      }
    });
  };

  // Filter heroes based on search
  const filteredHeroes = useMemo(() => {
    if (!heroes) return [];
    if (!searchQuery) return heroes;

    return heroes.filter(hero =>
      hero.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [heroes, searchQuery]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Loading message="Loading counter data..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
          Counter Picks
        </h1>
        <p className="text-gray-400 text-lg">
          Find out which heroes counter or get countered by your pick
        </p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for a hero..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-dark-50 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 text-white placeholder-gray-500"
          />
        </div>
      </div>

      {!selectedHero ? (
        <>
          {/* Hero Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredHeroes.map((hero) => (
              <button
                key={hero.heroId}
                onClick={() => setSelectedHero(hero)}
                className="group relative overflow-hidden rounded-lg bg-dark-200 transition-all hover:scale-105 hover:shadow-xl"
              >
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={hero.icon}
                    alt={hero.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <h3 className="text-sm font-bold text-white line-clamp-1">{hero.name}</h3>
                    <p className="text-xs text-gray-300">{hero.role}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {filteredHeroes.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">No heroes found matching "{searchQuery}"</p>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Selected Hero Section */}
          <div className="mb-8">
            <button
              onClick={() => setSelectedHero(null)}
              className="mb-4 px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white hover:bg-dark-100 transition-colors"
            >
              ← Back to all heroes
            </button>

            <div className="flex items-center gap-4 p-6 bg-dark-200 border border-white/10 rounded-xl">
              <img
                src={selectedHero.icon}
                alt={selectedHero.name}
                className="w-20 h-20 rounded-lg border-2 border-primary-500"
              />
              <div>
                <h2 className="text-3xl font-bold text-white">{selectedHero.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-gray-400">{selectedHero.role}</span>
                  <span className="text-gray-600">•</span>
                  <span className="text-gray-400">{selectedHero.lane}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Counter Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strong Against */}
            <div className="bg-dark-200 border border-white/10 rounded-xl overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4">
                <div className="flex items-center gap-2">
                  <Sword className="w-5 h-5 text-white" />
                  <h3 className="text-xl font-bold text-white">Strong Against</h3>
                </div>
                <p className="text-white/80 text-sm mt-1">
                  {selectedHero.name} counters these heroes
                </p>
              </div>

              <div className="p-4">
                {Object.keys(selectedHero.suppressingHeroes).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(selectedHero.suppressingHeroes).map(([key, relation]) => {
                      const counterHero = heroes?.find(h => h.name.toLowerCase() === relation.name.toLowerCase());
                      return (
                      <Link
                        key={key}
                        to="/heroes/$heroId"
                        params={{ heroId: counterHero?.heroId.toString() || '0' }}
                        className="flex items-center gap-3 p-3 bg-dark-100 rounded-lg hover:bg-dark-50 transition-colors group"
                      >
                        <img
                          src={relation.thumbnail}
                          alt={relation.name}
                          className="w-12 h-12 rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-white group-hover:text-primary-400 transition-colors">
                            {relation.name}
                          </h4>
                          <p className="text-sm text-gray-400 line-clamp-1">{relation.description}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-primary-400 transition-colors" />
                      </Link>
                    )})}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-400">No counter data available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Weak Against */}
            <div className="bg-dark-200 border border-white/10 rounded-xl overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-orange-500 p-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-white" />
                  <h3 className="text-xl font-bold text-white">Weak Against</h3>
                </div>
                <p className="text-white/80 text-sm mt-1">
                  These heroes counter {selectedHero.name}
                </p>
              </div>

              <div className="p-4">
                {Object.keys(selectedHero.suppressedHeroes).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(selectedHero.suppressedHeroes).map(([key, relation]) => {
                      const counterHero = heroes?.find(h => h.name.toLowerCase() === relation.name.toLowerCase());
                      return (
                      <Link
                        key={key}
                        to="/heroes/$heroId"
                        params={{ heroId: counterHero?.heroId.toString() || '0' }}
                        className="flex items-center gap-3 p-3 bg-dark-100 rounded-lg hover:bg-dark-50 transition-colors group"
                      >
                        <img
                          src={relation.thumbnail}
                          alt={relation.name}
                          className="w-12 h-12 rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-white group-hover:text-primary-400 transition-colors">
                            {relation.name}
                          </h4>
                          <p className="text-sm text-gray-400 line-clamp-1">{relation.description}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-primary-400 transition-colors" />
                      </Link>
                    )})}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-400">No counter data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Best Partners */}
          {Object.keys(selectedHero.bestPartners).length > 0 && (
            <div className="mt-6 bg-dark-200 border border-white/10 rounded-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4">
                <h3 className="text-xl font-bold text-white">Best Partners</h3>
                <p className="text-white/80 text-sm mt-1">
                  Heroes that synergize well with {selectedHero.name}
                </p>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(selectedHero.bestPartners).map(([key, relation]) => {
                    const partnerHero = heroes?.find(h => h.name.toLowerCase() === relation.name.toLowerCase());
                    return (
                    <Link
                      key={key}
                      to="/heroes/$heroId"
                      params={{ heroId: partnerHero?.heroId.toString() || '0' }}
                      className="flex items-center gap-3 p-3 bg-dark-100 rounded-lg hover:bg-dark-50 transition-colors group"
                    >
                      <img
                        src={relation.thumbnail}
                        alt={relation.name}
                        className="w-12 h-12 rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-white group-hover:text-primary-400 transition-colors">
                          {relation.name}
                        </h4>
                        <p className="text-sm text-gray-400 line-clamp-1">{relation.description}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-primary-400 transition-colors" />
                    </Link>
                  )})}
                </div>
              </div>
            </div>
          )}

          {/* Suggest Edit Button */}
          {isAuthenticated && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowSuggestModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/20 text-primary-400 border border-primary-500/30 rounded-lg hover:bg-primary-500/30 transition-colors"
              >
                <PenLine className="w-4 h-4" />
                Suggest Edit
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Help improve counter data for the community
              </p>
            </div>
          )}
        </>
      )}

      {/* Suggest Modal */}
      {showSuggestModal && selectedHero && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-300 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div>
                <h3 className="text-xl font-bold">Suggest Counter Edit</h3>
                <p className="text-sm text-gray-400 mt-0.5">Help improve data for {selectedHero.name}</p>
              </div>
              <button
                onClick={() => { setShowSuggestModal(false); setSuggestTargetHero(null); setHeroSearch(''); }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitSuccess ? (
              <div className="p-10 text-center">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-xl font-bold text-white">Suggestion Submitted!</p>
                <p className="text-gray-400 mt-2">Admin will review your suggestion</p>
              </div>
            ) : (
              <div className="p-5 space-y-5">
                {/* Hero Info */}
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-primary-500/10 to-transparent rounded-xl border border-primary-500/20">
                  <img src={selectedHero.icon} alt={selectedHero.name} className="w-14 h-14 rounded-lg border-2 border-primary-500/50" />
                  <div>
                    <p className="font-bold text-lg">{selectedHero.name}</p>
                    <p className="text-sm text-gray-400">{selectedHero.role} • {selectedHero.lane}</p>
                  </div>
                </div>

                {/* Action & Type Selection */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Action */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Action</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setSuggestAction('add'); setSuggestTargetHeroes([]); setFilterRole('All'); setFilterLane('All'); setHeroSearch(''); }}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg font-medium text-sm transition-all ${
                          suggestAction === 'add'
                            ? 'bg-green-500 text-white shadow-lg shadow-green-500/25'
                            : 'bg-dark-100 text-gray-400 hover:bg-dark-50'
                        }`}
                      >
                        <Plus className="w-4 h-4" /> Add
                      </button>
                      <button
                        onClick={() => { setSuggestAction('remove'); setSuggestTargetHeroes([]); }}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg font-medium text-sm transition-all ${
                          suggestAction === 'remove'
                            ? 'bg-red-500 text-white shadow-lg shadow-red-500/25'
                            : 'bg-dark-100 text-gray-400 hover:bg-dark-50'
                        }`}
                      >
                        <Trash2 className="w-4 h-4" /> Remove
                      </button>
                    </div>
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Category</label>
                    <select
                      value={suggestType}
                      onChange={(e) => { setSuggestType(e.target.value as typeof suggestType); setSuggestTargetHero(null); setSuggestTargetHeroes([]); }}
                      className="w-full py-2.5 px-3 bg-dark-100 border border-white/10 rounded-lg text-white text-sm font-medium focus:border-primary-500 focus:outline-none"
                    >
                      <option value="strongAgainst">Strong Against</option>
                      <option value="weakAgainst">Weak Against</option>
                      <option value="bestPartner">Best Partner</option>
                    </select>
                  </div>
                </div>

                {/* Target Hero Selection */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    {suggestAction === 'add' ? 'Select Hero to Add' : 'Select Hero to Remove'}
                  </label>

                  {suggestAction === 'remove' ? (
                    existingRelationHeroes.length > 0 ? (
                      <div>
                        {suggestTargetHeroes.length > 0 && (
                          <div className="mb-2 px-2 py-1.5 bg-red-500/20 rounded-lg text-sm text-red-300 flex items-center justify-between">
                            <span>{suggestTargetHeroes.length} hero{suggestTargetHeroes.length > 1 ? 'es' : ''} selected</span>
                            <button onClick={() => setSuggestTargetHeroes([])} className="text-xs hover:text-white">Clear all</button>
                          </div>
                        )}
                        <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
                          {existingRelationHeroes.map((hero) => {
                            const isSelected = suggestTargetHeroes.some(h => h.name === hero.name);
                            return (
                              <button
                                key={hero.name}
                                onClick={() => toggleHeroSelection({ name: hero.name, icon: hero.thumbnail })}
                                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all text-center ${
                                  isSelected
                                    ? 'bg-red-500/30 border-2 border-red-500 ring-2 ring-red-500/30'
                                    : 'bg-dark-100 border border-white/10 hover:bg-red-500/10 hover:border-red-500/30'
                                }`}
                              >
                                <img src={hero.thumbnail} alt={hero.name} className={`w-12 h-12 rounded-lg ${isSelected ? 'ring-2 ring-red-400' : ''}`} />
                                <span className={`text-xs font-medium truncate w-full ${isSelected ? 'text-red-300' : ''}`}>{hero.name}</span>
                                {isSelected && <span className="text-[10px] text-red-400">✓</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 bg-dark-100 rounded-xl text-center">
                        <AlertCircle className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">No heroes in this category to remove</p>
                      </div>
                    )
                  ) : (
                    <div>
                      {/* Selected heroes counter */}
                      {suggestTargetHeroes.length > 0 && (
                        <div className="mb-2 px-2 py-1.5 bg-green-500/20 rounded-lg text-sm text-green-300 flex items-center justify-between">
                          <span>{suggestTargetHeroes.length} hero{suggestTargetHeroes.length > 1 ? 'es' : ''} selected</span>
                          <button onClick={() => setSuggestTargetHeroes([])} className="text-xs hover:text-white">Clear all</button>
                        </div>
                      )}

                      {/* Filters */}
                      <div className="flex gap-2 mb-3">
                        <div className="relative flex-1">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <input
                            type="text"
                            value={heroSearch}
                            onChange={(e) => setHeroSearch(e.target.value)}
                            placeholder="Search..."
                            className="w-full py-2 pl-8 pr-3 bg-dark-100 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none"
                          />
                        </div>
                        <select
                          value={filterRole}
                          onChange={(e) => setFilterRole(e.target.value)}
                          className="py-2 px-2 bg-dark-100 border border-white/10 rounded-lg text-sm text-white focus:border-primary-500 focus:outline-none"
                        >
                          {roles.map(role => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                        </select>
                        <select
                          value={filterLane}
                          onChange={(e) => setFilterLane(e.target.value)}
                          className="py-2 px-2 bg-dark-100 border border-white/10 rounded-lg text-sm text-white focus:border-primary-500 focus:outline-none"
                        >
                          {lanes.map(lane => (
                            <option key={lane} value={lane}>{lane}</option>
                          ))}
                        </select>
                      </div>

                      {/* Hero grid */}
                      {filteredSuggestHeroes.length > 0 ? (
                        <div className="grid grid-cols-4 gap-2 max-h-52 overflow-y-auto p-1">
                          {filteredSuggestHeroes.slice(0, 24).map((hero) => {
                            const isSelected = suggestTargetHeroes.some(h => h.name === hero.name);
                            return (
                              <button
                                key={hero.heroId}
                                onClick={() => toggleHeroSelection({ name: hero.name, icon: hero.icon })}
                                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all text-center ${
                                  isSelected
                                    ? 'bg-green-500/30 border-2 border-green-500 ring-2 ring-green-500/30'
                                    : 'bg-dark-100 border border-white/10 hover:bg-green-500/10 hover:border-green-500/30'
                                }`}
                              >
                                <img src={hero.icon} alt={hero.name} className={`w-10 h-10 rounded-lg ${isSelected ? 'ring-2 ring-green-400' : ''}`} />
                                <span className={`text-[10px] font-medium truncate w-full ${isSelected ? 'text-green-300' : 'text-gray-400'}`}>{hero.name}</span>
                                {isSelected && <span className="text-[10px] text-green-400">✓</span>}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-6 bg-dark-100 rounded-xl text-center">
                          <AlertCircle className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                          <p className="text-sm text-gray-400">No heroes match filter</p>
                        </div>
                      )}
                      {filteredSuggestHeroes.length > 24 && (
                        <p className="text-xs text-gray-500 text-center mt-2">Showing 24 of {filteredSuggestHeroes.length}. Use filters to narrow down.</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Two-way relationship toggle */}
                <div className="flex items-start gap-3 p-3 bg-dark-100 rounded-xl border border-white/10">
                  <input
                    type="checkbox"
                    id="applyInverse"
                    checked={applyInverse}
                    onChange={(e) => setApplyInverse(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-gray-600 bg-dark-200 text-primary-500 focus:ring-primary-500 focus:ring-offset-0"
                  />
                  <label htmlFor="applyInverse" className="text-sm cursor-pointer">
                    <span className="font-medium text-white">Apply two-way relationship</span>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {suggestType === 'weakAgainst'
                        ? `Also add ${selectedHero?.name} to target hero's "Strong Against"`
                        : suggestType === 'strongAgainst'
                        ? `Also add ${selectedHero?.name} to target hero's "Weak Against"`
                        : `Also add ${selectedHero?.name} to target hero's "Best Partner"`}
                    </p>
                  </label>
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Reason (Optional)</label>
                  <textarea
                    value={suggestDescription}
                    onChange={(e) => setSuggestDescription(e.target.value)}
                    placeholder="e.g., After patch 1.5, this hero now counters..."
                    rows={2}
                    className="w-full p-3 bg-dark-100 border border-white/10 rounded-xl text-white placeholder-gray-500 resize-none focus:border-primary-500 focus:outline-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmitSuggestion}
                  disabled={suggestTargetHeroes.length === 0 || isSubmitting}
                  className={`w-full py-3.5 rounded-xl font-bold text-white transition-all ${
                    suggestTargetHeroes.length > 0 && !isSubmitting
                      ? suggestAction === 'add'
                        ? 'bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/25'
                        : 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/25'
                      : 'bg-gray-600 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting
                    ? 'Submitting...'
                    : suggestAction === 'add'
                      ? `Add ${suggestTargetHeroes.length} Hero${suggestTargetHeroes.length > 1 ? 'es' : ''}`
                      : `Remove ${suggestTargetHeroes.length} Hero${suggestTargetHeroes.length > 1 ? 'es' : ''}`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
