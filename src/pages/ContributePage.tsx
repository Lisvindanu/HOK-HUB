import { useState } from 'react';
import { Upload, CheckCircle, AlertCircle, Info, Plus, X, Search, Shield, Sword, Zap, Wand2, Target, HeartPulse, Swords, Users, TrendingUp, Sprout, Map, Send, LogIn } from 'lucide-react';
import { useHeroes } from '../hooks/useHeroes';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../hooks/useUser';
import { useNavigate, Link } from '@tanstack/react-router';

type ContributionType = 'skin' | 'hero' | 'series';

interface SkinFormData {
  heroId: number;
  heroName: string;
  skinName: string;
  skinSeries: string;
  skinTier?: string;
  skinCover?: string;
}

interface HeroFormData {
  name: string;
  role: string;
  lane: string;
  icon?: string;
  banner?: string;
}

interface SeriesSkin {
  heroId: number;
  heroName: string;
  skinName: string;
}

interface SeriesFormData {
  seriesName: string;
  description?: string;
  skins: SeriesSkin[];
}

const ROLES = [
  { value: 'Tank', label: 'Tank', icon: Shield, color: 'text-blue-400' },
  { value: 'Fighter', label: 'Fighter', icon: Sword, color: 'text-red-400' },
  { value: 'Assassin', label: 'Assassin', icon: Zap, color: 'text-purple-400' },
  { value: 'Mage', label: 'Mage', icon: Wand2, color: 'text-cyan-400' },
  { value: 'Marksman', label: 'Marksman', icon: Target, color: 'text-orange-400' },
  { value: 'Support', label: 'Support', icon: HeartPulse, color: 'text-green-400' },
];

const LANES = [
  { value: 'Clash', label: 'Clash', icon: Swords, color: 'text-red-400' },
  { value: 'Jungle', label: 'Jungle', icon: Users, color: 'text-green-400' },
  { value: 'Mid', label: 'Mid', icon: TrendingUp, color: 'text-purple-400' },
  { value: 'Farm', label: 'Farm', icon: Sprout, color: 'text-yellow-400' },
  { value: 'Roam', label: 'Roam', icon: Map, color: 'text-blue-400' },
];

const TIERS = ['Epic', 'Legendary', 'Limited', 'Rare', 'Common'];

export function ContributePage() {
  const { data: heroes, isLoading } = useHeroes();
  const { token, contributorId } = useAuth();
  const { data: user } = useUser();
  const navigate = useNavigate();
  const [contributionType, setContributionType] = useState<ContributionType>('skin');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [heroSearch, setHeroSearch] = useState('');
  const [showHeroPicker, setShowHeroPicker] = useState(false);
  const [activeSeriesSkinPicker, setActiveSeriesSkinPicker] = useState<number | null>(null);

  const [skinForm, setSkinForm] = useState<SkinFormData>({
    heroId: 0,
    heroName: '',
    skinName: '',
    skinSeries: '',
    skinTier: '',
    skinCover: ''
  });

  const [heroForm, setHeroForm] = useState<HeroFormData>({
    name: '',
    role: '',
    lane: '',
    icon: '',
    banner: ''
  });

  const [seriesForm, setSeriesForm] = useState<SeriesFormData>({
    seriesName: '',
    description: '',
    skins: []
  });

  const handleHeroSelect = (heroId: number) => {
    const selectedHero = heroes?.find(h => h.heroId === heroId);
    if (selectedHero) {
      setSkinForm({
        ...skinForm,
        heroId,
        heroName: selectedHero.name
      });
      setShowHeroPicker(false);
      setHeroSearch('');
    }
  };

  const handleSeriesHeroSelect = (index: number, heroId: number) => {
    const selectedHero = heroes?.find(h => h.heroId === heroId);
    if (selectedHero) {
      const updatedSkins = [...seriesForm.skins];
      updatedSkins[index] = {
        heroId,
        heroName: selectedHero.name,
        skinName: updatedSkins[index]?.skinName || ''
      };
      setSeriesForm({ ...seriesForm, skins: updatedSkins });
      setActiveSeriesSkinPicker(null);
      setHeroSearch('');
    }
  };

  const handleAddSeriesSkin = () => {
    setSeriesForm({
      ...seriesForm,
      skins: [...seriesForm.skins, { heroId: 0, heroName: '', skinName: '' }]
    });
  };

  const handleRemoveSeriesSkin = (index: number) => {
    setSeriesForm({
      ...seriesForm,
      skins: seriesForm.skins.filter((_, i) => i !== index)
    });
  };

  const handleUpdateSeriesSkinName = (index: number, skinName: string) => {
    const updatedSkins = [...seriesForm.skins];
    updatedSkins[index] = { ...updatedSkins[index], skinName };
    setSeriesForm({ ...seriesForm, skins: updatedSkins });
  };

  const validateForm = (): boolean => {
    if (contributionType === 'skin') {
      if (!skinForm.heroId || !skinForm.skinName.trim()) {
        setErrorMessage('Please select a hero and enter skin name');
        return false;
      }
    } else if (contributionType === 'hero') {
      if (!heroForm.name.trim() || !heroForm.role.trim() || !heroForm.lane.trim()) {
        setErrorMessage('Please fill in hero name, role, and lane');
        return false;
      }
    } else if (contributionType === 'series') {
      if (!seriesForm.seriesName.trim()) {
        setErrorMessage('Please enter series name');
        return false;
      }
      if (seriesForm.skins.length === 0) {
        setErrorMessage('Please add at least one skin to the series');
        return false;
      }
      if (seriesForm.skins.some(s => !s.heroId || !s.skinName.trim())) {
        setErrorMessage('All skins must have a hero and skin name');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    setErrorMessage('');

    // Check if user is logged in
    if (!contributorId || !token) {
      navigate({ to: '/auth' });
      return;
    }

    if (!validateForm()) {
      return;
    }

    setSubmitStatus('submitting');

    const API_BASE_URL = import.meta.env.DEV ? '' : 'https://hokapi.project-n.site';

    let contributionData: any;

    if (contributionType === 'skin') {
      contributionData = {
        type: 'skin',
        contributorId,
        contributorName: user?.name || '',
        data: {
          heroId: skinForm.heroId,
          heroName: skinForm.heroName,
          skin: {
            skinName: skinForm.skinName,
            skinSeries: skinForm.skinSeries,
            ...(skinForm.skinTier && { skinTier: skinForm.skinTier }),
            ...(skinForm.skinCover && {
              skinCover: skinForm.skinCover,
              skinImage: skinForm.skinCover
            })
          }
        }
      };
    } else if (contributionType === 'hero') {
      contributionData = {
        type: 'hero',
        contributorId,
        contributorName: user?.name || '',
        data: {
          heroId: Math.floor(Math.random() * 1000) + 500,
          name: heroForm.name.toUpperCase(),
          role: heroForm.role,
          lane: heroForm.lane,
          ...(heroForm.icon && { icon: heroForm.icon }),
          ...(heroForm.banner && { banner: heroForm.banner }),
          skins: []
        }
      };
    } else if (contributionType === 'series') {
      contributionData = {
        type: 'series',
        contributorId,
        contributorName: user?.name || '',
        data: {
          seriesName: seriesForm.seriesName,
          ...(seriesForm.description && { description: seriesForm.description }),
          skins: seriesForm.skins.map(s => ({
            heroId: s.heroId,
            skinName: s.skinName
          }))
        }
      };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/contribute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(contributionData)
      });

      if (response.ok) {
        setSubmitStatus('success');
        setSkinForm({ heroId: 0, heroName: '', skinName: '', skinSeries: '', skinTier: '', skinCover: '' });
        setHeroForm({ name: '', role: '', lane: '', icon: '', banner: '' });
        setSeriesForm({ seriesName: '', description: '', skins: [] });
        setTimeout(() => setSubmitStatus('idle'), 5000);
      } else {
        const error = await response.json();
        setErrorMessage(error.error || 'Failed to submit');
        setSubmitStatus('error');
      }
    } catch (error) {
      setErrorMessage('Network error - please try again');
      setSubmitStatus('error');
    }
  };

  const filteredHeroes = heroes?.filter(h =>
    h.name.toLowerCase().includes(heroSearch.toLowerCase())
  );

  // Hero Picker Component
  const HeroPicker = ({
    onSelect,
    show,
    onToggle
  }: {
    onSelect: (heroId: number) => void;
    show: boolean;
    onToggle: () => void;
  }) => (
    <div>
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 bg-dark-50 border border-white/10 rounded-lg hover:border-primary-500 transition-colors text-left text-gray-400"
        disabled={isLoading}
      >
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5 text-primary-400" />
          <span>{isLoading ? 'Loading heroes...' : 'Click to select a hero'}</span>
        </div>
      </button>

      {show && !isLoading && (
        <div className="mt-3 p-4 md:p-5 bg-dark-200 border border-white/10 rounded-xl">
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={heroSearch}
              onChange={(e) => setHeroSearch(e.target.value)}
              placeholder="Search heroes..."
              className="w-full pl-12 pr-4 py-3 bg-dark-50 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 text-white"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3 max-h-80 overflow-y-auto">
            {filteredHeroes?.map(hero => (
              <button
                key={hero.heroId}
                onClick={() => onSelect(hero.heroId)}
                className="group relative aspect-square rounded-full overflow-hidden border-2 border-white/10 hover:border-primary-500 transition-all hover:scale-110"
                title={hero.name}
              >
                <img
                  src={hero.icon}
                  alt={hero.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-1">
                  <span className="text-[9px] font-bold text-white text-center px-0.5 leading-tight">
                    {hero.name}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
          Contribute Data
        </h1>
        <p className="text-gray-400 text-lg">
          Help us complete the Honor of Kings database!
        </p>
      </div>

      {/* Login Notice */}
      {!contributorId && (
        <div className="mb-8 bg-primary-500/10 border border-primary-500/20 rounded-lg p-5 md:p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary-500/20 rounded-lg">
              <LogIn className="w-6 h-6 text-primary-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-2">Login Required</h3>
              <p className="text-gray-300 mb-4">
                You need to be logged in to submit contributions. This helps us track your contributions and give you credit on the leaderboard!
              </p>
              <Link
                to="/auth"
                className="btn-primary inline-flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Login / Register
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Logged In User Info */}
      {contributorId && (
        <div className="mb-8 bg-green-500/10 border border-green-500/20 rounded-lg p-5 md:p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-1">Welcome back, {user?.name}!</h3>
              <p className="text-gray-300">
                Your contributions will be credited to your account and tracked on the leaderboard.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="mb-8 bg-blue-500/10 border border-blue-500/20 rounded-lg p-5 md:p-6">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-gray-300">
            <p className="font-semibold text-white mb-2">How it works:</p>
            <ol className="list-decimal list-inside space-y-1 text-gray-300">
              <li>Select contribution type and fill in the form</li>
              <li>Submit for review - our team will verify the data</li>
              <li>Approved contributions get merged into the database</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="max-w-6xl mx-auto">
        <div className="card-hover p-4 md:p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <div className="p-2 bg-primary-500/20 rounded-lg">
              <Upload className="w-6 h-6 text-primary-400" />
            </div>
            Submit Contribution
          </h2>

          {/* Contribution Type Selector */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wide">
              Contribution Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { type: 'skin' as ContributionType, label: 'Skin', desc: 'Add missing skin' },
                { type: 'hero' as ContributionType, label: 'Hero', desc: 'Add new hero' },
                { type: 'series' as ContributionType, label: 'Series', desc: 'Add skin series' },
              ].map(item => (
                <button
                  key={item.type}
                  onClick={() => setContributionType(item.type)}
                  className={`p-5 md:p-6 rounded-xl border-2 transition-all ${
                    contributionType === item.type
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="font-bold text-base md:text-lg">{item.label}</div>
                  <div className="text-xs text-gray-400 mt-1">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Skin Form */}
          {contributionType === 'skin' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">
                  Select Hero <span className="text-red-400">*</span>
                </label>

                {skinForm.heroId === 0 ? (
                  <HeroPicker
                    onSelect={handleHeroSelect}
                    show={showHeroPicker}
                    onToggle={() => setShowHeroPicker(!showHeroPicker)}
                  />
                ) : (
                  <div className="flex items-center gap-4 p-4 bg-primary-500/10 border border-primary-500/30 rounded-lg">
                    <img
                      src={heroes?.find(h => h.heroId === skinForm.heroId)?.icon}
                      alt={skinForm.heroName}
                      className="w-16 h-16 rounded-full border-2 border-primary-500"
                    />
                    <div className="flex-1">
                      <div className="font-bold text-lg">{skinForm.heroName}</div>
                      <div className="text-sm text-gray-400">
                        {heroes?.find(h => h.heroId === skinForm.heroId)?.role} • {heroes?.find(h => h.heroId === skinForm.heroId)?.lane}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSkinForm({ ...skinForm, heroId: 0, heroName: '' });
                        setShowHeroPicker(true);
                      }}
                      className="px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      Change
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">
                  Skin Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={skinForm.skinName}
                  onChange={(e) => setSkinForm({ ...skinForm, skinName: e.target.value })}
                  placeholder="e.g. Kid the Phantom Thief"
                  className="w-full px-4 py-3 bg-dark-50 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">
                  Skin Series
                </label>
                <input
                  type="text"
                  value={skinForm.skinSeries}
                  onChange={(e) => setSkinForm({ ...skinForm, skinSeries: e.target.value })}
                  placeholder="e.g. DETECTIVE CONAN"
                  className="w-full px-4 py-3 bg-dark-50 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">
                  Skin Tier (Optional)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {TIERS.map(tier => (
                    <button
                      key={tier}
                      onClick={() => setSkinForm({ ...skinForm, skinTier: skinForm.skinTier === tier ? '' : tier })}
                      className={`px-4 py-3 rounded-lg border-2 transition-all text-sm font-semibold ${
                        skinForm.skinTier === tier
                          ? 'border-primary-500 bg-primary-500/20 text-white'
                          : 'border-white/10 hover:border-white/20 text-gray-400'
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">
                  Skin Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={skinForm.skinCover}
                  onChange={(e) => setSkinForm({ ...skinForm, skinCover: e.target.value })}
                  placeholder="https://world.honorofkings.com/..."
                  className="w-full px-4 py-3 bg-dark-50 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 text-white"
                />
              </div>
            </div>
          )}

          {/* Hero Form */}
          {contributionType === 'hero' && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">
                  Hero Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={heroForm.name}
                  onChange={(e) => setHeroForm({ ...heroForm, name: e.target.value })}
                  placeholder="e.g. SUN WUKONG"
                  className="w-full px-4 py-3 bg-dark-50 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">
                  Role <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {ROLES.map(role => {
                    const Icon = role.icon;
                    return (
                      <button
                        key={role.value}
                        onClick={() => setHeroForm({ ...heroForm, role: role.value })}
                        className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                          heroForm.role === role.value
                            ? 'border-primary-500 bg-primary-500/10'
                            : 'border-white/10 hover:border-white/20'
                        }`}
                      >
                        <Icon className={`w-6 h-6 ${role.color}`} />
                        <span className="font-semibold">{role.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">
                  Lane <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {LANES.map(lane => {
                    const Icon = lane.icon;
                    return (
                      <button
                        key={lane.value}
                        onClick={() => setHeroForm({ ...heroForm, lane: lane.value })}
                        className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                          heroForm.lane === lane.value
                            ? 'border-primary-500 bg-primary-500/10'
                            : 'border-white/10 hover:border-white/20'
                        }`}
                      >
                        <Icon className={`w-6 h-6 ${lane.color}`} />
                        <span className="font-semibold">{lane.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">
                  Hero Icon URL (Optional)
                </label>
                <input
                  type="url"
                  value={heroForm.icon}
                  onChange={(e) => setHeroForm({ ...heroForm, icon: e.target.value })}
                  placeholder="https://example.com/hero-icon.jpg"
                  className="w-full px-4 py-3 bg-dark-50 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">
                  Hero Banner URL (Optional)
                </label>
                <input
                  type="url"
                  value={heroForm.banner}
                  onChange={(e) => setHeroForm({ ...heroForm, banner: e.target.value })}
                  placeholder="https://example.com/hero-banner.jpg"
                  className="w-full px-4 py-3 bg-dark-50 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 text-white"
                />
              </div>
            </div>
          )}

          {/* Series Form */}
          {contributionType === 'series' && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">
                  Series Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={seriesForm.seriesName}
                  onChange={(e) => setSeriesForm({ ...seriesForm, seriesName: e.target.value })}
                  placeholder="e.g. DETECTIVE CONAN"
                  className="w-full px-4 py-3 bg-dark-50 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">
                  Description (Optional)
                </label>
                <textarea
                  value={seriesForm.description}
                  onChange={(e) => setSeriesForm({ ...seriesForm, description: e.target.value })}
                  placeholder="Brief description of the skin series..."
                  rows={3}
                  className="w-full px-4 py-3 bg-dark-50 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 text-white resize-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
                    Skins in Series <span className="text-red-400">*</span>
                  </label>
                  <button
                    onClick={handleAddSeriesSkin}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 rounded-lg transition-colors text-sm font-semibold"
                  >
                    <Plus className="w-4 h-4" />
                    Add Skin
                  </button>
                </div>

                {seriesForm.skins.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-lg">
                    <p className="text-gray-500 mb-3">No skins added yet</p>
                    <button
                      onClick={handleAddSeriesSkin}
                      className="btn-primary"
                    >
                      Add First Skin
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {seriesForm.skins.map((skin, index) => (
                      <div key={index} className="p-4 bg-dark-200 border border-white/10 rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <span className="text-sm font-semibold text-gray-400">Skin #{index + 1}</span>
                          <button
                            onClick={() => handleRemoveSeriesSkin(index)}
                            className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {skin.heroId === 0 ? (
                          <div className="mb-3">
                            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase">Hero</label>
                            <HeroPicker
                              onSelect={(heroId) => handleSeriesHeroSelect(index, heroId)}
                              show={activeSeriesSkinPicker === index}
                              onToggle={() => setActiveSeriesSkinPicker(activeSeriesSkinPicker === index ? null : index)}
                            />
                          </div>
                        ) : (
                          <div className="mb-3 flex items-center gap-3 p-3 bg-dark-100 rounded-lg">
                            <img
                              src={heroes?.find(h => h.heroId === skin.heroId)?.icon}
                              alt={skin.heroName}
                              className="w-10 h-10 rounded-full border-2 border-primary-500"
                            />
                            <div className="flex-1">
                              <div className="font-semibold text-sm">{skin.heroName}</div>
                              <div className="text-xs text-gray-400">
                                {heroes?.find(h => h.heroId === skin.heroId)?.role}
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                const updatedSkins = [...seriesForm.skins];
                                updatedSkins[index] = { heroId: 0, heroName: '', skinName: skin.skinName };
                                setSeriesForm({ ...seriesForm, skins: updatedSkins });
                                setActiveSeriesSkinPicker(index);
                              }}
                              className="text-xs text-red-400 hover:text-red-300"
                            >
                              Change
                            </button>
                          </div>
                        )}

                        <div>
                          <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase">Skin Name</label>
                          <input
                            type="text"
                            value={skin.skinName}
                            onChange={(e) => handleUpdateSeriesSkinName(index, e.target.value)}
                            placeholder="Enter skin name..."
                            className="w-full px-3 py-2 bg-dark-100 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 text-white text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mt-5 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <p className="text-red-400">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {submitStatus === 'success' && (
            <div className="mt-5 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <p className="text-green-400">
                  Contribution submitted successfully! Our team will review it soon.
                </p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="mt-6">
            <button
              onClick={handleSubmit}
              disabled={submitStatus === 'submitting'}
              className="w-full btn-primary flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitStatus === 'submitting' ? (
                <>
                  <Upload className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Contribution
                </>
              )}
            </button>
          </div>
        </div>

        {/* Guidelines */}
        <div className="mt-6 card-hover p-5 md:p-8">
          <h2 className="text-xl font-bold mb-5">Contribution Guidelines</h2>
          <div className="space-y-4 text-sm text-gray-300">
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Use official sources:</strong> Only submit data from official Honor of Kings sources
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Accurate information:</strong> Double-check all data before submitting
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">High-quality images:</strong> Use official images from world.honorofkings.com
              </div>
            </div>
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">No fan content:</strong> Do not submit fan-made content
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
