import { useMemo } from 'react';
import { useHeroes } from '../hooks/useHeroes';
import { Loading } from '../components/ui/Loading';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, Users, Target, Ban, Award } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import type { Hero } from '../types/hero';

const ROLE_COLORS: Record<string, string> = {
  'Tank': '#3b82f6',
  'Fighter': '#ef4444',
  'Assassin': '#a855f7',
  'Mage': '#06b6d4',
  'Marksman': '#f59e0b',
  'Support': '#10b981',
};

export function AnalyticsPage() {
  const { data: heroes, isLoading } = useHeroes();

  // Top 10 Win Rate Heroes
  const topWinRateHeroes = useMemo(() => {
    if (!heroes) return [];
    return [...heroes]
      .sort((a, b) => parseFloat(b.stats.winRate) - parseFloat(a.stats.winRate))
      .slice(0, 10)
      .map(h => ({
        name: h.name,
        winRate: parseFloat(h.stats.winRate),
        icon: h.icon,
      }));
  }, [heroes]);

  // Top 10 Pick Rate Heroes
  const topPickRateHeroes = useMemo(() => {
    if (!heroes) return [];
    return [...heroes]
      .sort((a, b) => parseFloat(b.stats.pickRate) - parseFloat(a.stats.pickRate))
      .slice(0, 10)
      .map(h => ({
        name: h.name,
        pickRate: parseFloat(h.stats.pickRate),
        icon: h.icon,
      }));
  }, [heroes]);

  // Top 10 Ban Rate Heroes
  const topBanRateHeroes = useMemo(() => {
    if (!heroes) return [];
    return [...heroes]
      .sort((a, b) => parseFloat(b.stats.banRate) - parseFloat(a.stats.banRate))
      .slice(0, 10)
      .map(h => ({
        name: h.name,
        banRate: parseFloat(h.stats.banRate),
        icon: h.icon,
      }));
  }, [heroes]);

  // Role distribution
  const roleDistribution = useMemo(() => {
    if (!heroes) return [];
    const roleCount = heroes.reduce((acc, hero) => {
      acc[hero.role] = (acc[hero.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(roleCount).map(([role, count]) => ({
      name: role,
      value: count,
      color: ROLE_COLORS[role] || '#6b7280',
    }));
  }, [heroes]);

  // Tier distribution
  const tierDistribution = useMemo(() => {
    if (!heroes) return [];
    const tierCount = heroes.reduce((acc, hero) => {
      const tier = hero.stats.tier || 'C';
      acc[tier] = (acc[tier] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const tierOrder = ['S+', 'S', 'A', 'B', 'C', 'D'];
    return tierOrder
      .filter(tier => tierCount[tier])
      .map(tier => ({
        tier,
        count: tierCount[tier],
      }));
  }, [heroes]);

  // Average stats by role
  const avgStatsByRole = useMemo(() => {
    if (!heroes) return [];
    const roleStats: Record<string, { total: number; winRate: number; pickRate: number; banRate: number }> = {};

    heroes.forEach(hero => {
      if (!roleStats[hero.role]) {
        roleStats[hero.role] = { total: 0, winRate: 0, pickRate: 0, banRate: 0 };
      }
      roleStats[hero.role].total++;
      roleStats[hero.role].winRate += parseFloat(hero.stats.winRate) || 0;
      roleStats[hero.role].pickRate += parseFloat(hero.stats.pickRate) || 0;
      roleStats[hero.role].banRate += parseFloat(hero.stats.banRate) || 0;
    });

    return Object.entries(roleStats).map(([role, stats]) => ({
      role,
      winRate: (stats.winRate / stats.total).toFixed(1),
      pickRate: (stats.pickRate / stats.total).toFixed(1),
      banRate: (stats.banRate / stats.total).toFixed(1),
    }));
  }, [heroes]);

  // Overall stats
  const overallStats = useMemo(() => {
    if (!heroes) return { avgWinRate: 0, avgPickRate: 0, avgBanRate: 0, totalHeroes: 0 };

    const total = heroes.length;
    const sumWinRate = heroes.reduce((sum, h) => sum + (parseFloat(h.stats.winRate) || 0), 0);
    const sumPickRate = heroes.reduce((sum, h) => sum + (parseFloat(h.stats.pickRate) || 0), 0);
    const sumBanRate = heroes.reduce((sum, h) => sum + (parseFloat(h.stats.banRate) || 0), 0);

    return {
      avgWinRate: (sumWinRate / total).toFixed(1),
      avgPickRate: (sumPickRate / total).toFixed(1),
      avgBanRate: (sumBanRate / total).toFixed(1),
      totalHeroes: total,
    };
  }, [heroes]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Loading message="Loading analytics..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
          Analytics Dashboard
        </h1>
        <p className="text-gray-400 text-lg">
          Comprehensive statistics and insights across all heroes
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-dark-200 border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm font-medium">Total Heroes</h3>
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-white">{overallStats.totalHeroes}</p>
        </div>

        <div className="bg-dark-200 border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm font-medium">Avg Win Rate</h3>
            <Award className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-3xl font-bold text-white">{overallStats.avgWinRate}%</p>
        </div>

        <div className="bg-dark-200 border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm font-medium">Avg Pick Rate</h3>
            <Target className="w-5 h-5 text-yellow-400" />
          </div>
          <p className="text-3xl font-bold text-white">{overallStats.avgPickRate}%</p>
        </div>

        <div className="bg-dark-200 border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm font-medium">Avg Ban Rate</h3>
            <Ban className="w-5 h-5 text-red-400" />
          </div>
          <p className="text-3xl font-bold text-white">{overallStats.avgBanRate}%</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Role Distribution */}
        <div className="bg-dark-200 border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Hero Distribution by Role</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={roleDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {roleDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)' }}
                labelStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Tier Distribution */}
        <div className="bg-dark-200 border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Hero Distribution by Tier</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={tierDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="tier" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="count" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Average Stats by Role */}
      <div className="bg-dark-200 border border-white/10 rounded-xl p-6 mb-8">
        <h3 className="text-xl font-bold text-white mb-4">Average Statistics by Role</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={avgStatsByRole}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="role" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)' }}
              labelStyle={{ color: '#fff' }}
            />
            <Legend />
            <Bar dataKey="winRate" fill="#10b981" name="Win Rate %" />
            <Bar dataKey="pickRate" fill="#f59e0b" name="Pick Rate %" />
            <Bar dataKey="banRate" fill="#ef4444" name="Ban Rate %" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Heroes Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Win Rate */}
        <div className="bg-dark-200 border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-green-400" />
            <h3 className="text-xl font-bold text-white">Top Win Rate</h3>
          </div>
          <div className="space-y-3">
            {topWinRateHeroes.map((hero, index) => {
              const fullHero = heroes?.find(h => h.name === hero.name);
              return (
              <Link
                key={hero.name}
                to="/heroes/$heroId"
                params={{ heroId: fullHero?.heroId.toString() || '0' }}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-dark-100 transition-colors group"
              >
                <span className="text-lg font-bold text-gray-400 w-6">{index + 1}</span>
                <img src={hero.icon} alt={hero.name} className="w-10 h-10 rounded-lg" />
                <div className="flex-1">
                  <p className="font-semibold text-white group-hover:text-primary-400 transition-colors">
                    {hero.name}
                  </p>
                  <p className="text-sm text-green-400">{hero.winRate.toFixed(1)}%</p>
                </div>
              </Link>
            )})}
          </div>
        </div>

        {/* Top Pick Rate */}
        <div className="bg-dark-200 border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-yellow-400" />
            <h3 className="text-xl font-bold text-white">Most Picked</h3>
          </div>
          <div className="space-y-3">
            {topPickRateHeroes.map((hero, index) => {
              const fullHero = heroes?.find(h => h.name === hero.name);
              return (
              <Link
                key={hero.name}
                to="/heroes/$heroId"
                params={{ heroId: fullHero?.heroId.toString() || '0' }}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-dark-100 transition-colors group"
              >
                <span className="text-lg font-bold text-gray-400 w-6">{index + 1}</span>
                <img src={hero.icon} alt={hero.name} className="w-10 h-10 rounded-lg" />
                <div className="flex-1">
                  <p className="font-semibold text-white group-hover:text-primary-400 transition-colors">
                    {hero.name}
                  </p>
                  <p className="text-sm text-yellow-400">{hero.pickRate.toFixed(1)}%</p>
                </div>
              </Link>
            )})}
          </div>
        </div>

        {/* Top Ban Rate */}
        <div className="bg-dark-200 border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Ban className="w-5 h-5 text-red-400" />
            <h3 className="text-xl font-bold text-white">Most Banned</h3>
          </div>
          <div className="space-y-3">
            {topBanRateHeroes.map((hero, index) => {
              const fullHero = heroes?.find(h => h.name === hero.name);
              return (
              <Link
                key={hero.name}
                to="/heroes/$heroId"
                params={{ heroId: fullHero?.heroId.toString() || '0' }}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-dark-100 transition-colors group"
              >
                <span className="text-lg font-bold text-gray-400 w-6">{index + 1}</span>
                <img src={hero.icon} alt={hero.name} className="w-10 h-10 rounded-lg" />
                <div className="flex-1">
                  <p className="font-semibold text-white group-hover:text-primary-400 transition-colors">
                    {hero.name}
                  </p>
                  <p className="text-sm text-red-400">{hero.banRate.toFixed(1)}%</p>
                </div>
              </Link>
            )})}
          </div>
        </div>
      </div>
    </div>
  );
}
