import { useEffect, useState, useMemo } from 'react';
import { CheckCircle, XCircle, Eye, Clock, AlertCircle, LogIn, History, Filter, Users, User, Calendar, Square, CheckSquare, Loader2 } from 'lucide-react';

interface Contribution {
  id: string;
  contributorId?: string;
  contributorName?: string;
  type: 'skin' | 'hero' | 'series' | 'counter';
  data: any;
  submittedAt?: string;
  createdAt?: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface HistoryEntry {
  id: string;
  type: 'skin' | 'hero' | 'series' | 'counter';
  action: 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt: string;
  data: any;
}

interface Contributor {
  id: string;
  name: string;
  email: string;
  totalContributions: number;
  totalTierLists: number;
  totalVotes: number;
}

type TypeFilter = 'all' | 'skin' | 'hero' | 'series' | 'counter';

export function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [token, setToken] = useState<string | null>(localStorage.getItem('adminToken'));
  const [loginError, setLoginError] = useState('');
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showContributors, setShowContributors] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedContribution, setSelectedContribution] = useState<Contribution | null>(null);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkStatus, setBulkStatus] = useState('');

  const API_BASE = 'https://hokapi.project-n.site';

  useEffect(() => {
    if (token) {
      setIsAuthenticated(true);
      fetchAll();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchAll = async () => {
    await Promise.all([fetchContributions(), fetchHistory(), fetchContributors()]);
    setLoading(false);
  };

  const handleLogin = async () => {
    setLoginError('');
    try {
      const response = await fetch(`${API_BASE}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (response.ok) {
        const data = await response.json();
        setToken(data.token);
        localStorage.setItem('adminToken', data.token);
        setIsAuthenticated(true);
        setPassword('');
        fetchAll();
      } else {
        setLoginError('Invalid password');
      }
    } catch (error) {
      setLoginError('Login failed');
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
  };

  const fetchContributions = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/contributions/pending`);
      const data = await response.json();
      setContributions(data.contributions || []);
    } catch (error) {
      console.error('Failed to fetch contributions:', error);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/contributions/history`);
      const data = await response.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
  };

  const fetchContributors = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/contributors`);
      const data = await response.json();
      setContributors(data.contributors || []);
    } catch (error) {
      console.error('Failed to fetch contributors:', error);
    }
  };

  const handleApprove = async (contribution: Contribution) => {
    if (!confirm(`Approve contribution ${contribution.id}?`)) return;

    try {
      const response = await fetch(`${API_BASE}/api/contributions/approve/${contribution.id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('✅ Contribution approved!');
        fetchContributions();
        fetchHistory();
      } else {
        const error = await response.json();
        alert(`Failed: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert('Network error');
    }
  };

  const handleReject = async (contribution: Contribution) => {
    if (!confirm(`Reject contribution ${contribution.id}?`)) return;

    try {
      const response = await fetch(`${API_BASE}/api/contributions/reject/${contribution.id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('❌ Contribution rejected');
        fetchContributions();
        fetchHistory();
      } else {
        const error = await response.json();
        alert(`Failed: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert('Network error');
    }
  };

  const handleBulkApprove = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    if (!confirm(`Approve ${ids.length} contribution(s)?`)) return;

    setBulkLoading(true);
    setBulkStatus(`Approving ${ids.length} contributions...`);
    try {
      const response = await fetch(`${API_BASE}/api/contributions/approve-bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ids })
      });
      const data = await response.json();
      if (response.ok) {
        const { approved, failed } = data.summary;
        setBulkStatus(`Done: ${approved} approved${failed > 0 ? `, ${failed} failed` : ''}`);
        setSelectedIds(new Set());
        fetchContributions();
        fetchHistory();
      } else {
        setBulkStatus(`Error: ${data.error || 'Unknown error'}`);
      }
    } catch {
      setBulkStatus('Network error');
    } finally {
      setBulkLoading(false);
      setTimeout(() => setBulkStatus(''), 3000);
    }
  };

  const handleBulkReject = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    if (!confirm(`Reject ${ids.length} contribution(s)?`)) return;

    setBulkLoading(true);
    setBulkStatus(`Rejecting ${ids.length} contributions...`);
    try {
      const response = await fetch(`${API_BASE}/api/contributions/reject-bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ids })
      });
      const data = await response.json();
      if (response.ok) {
        const { rejected, failed } = data.summary;
        setBulkStatus(`Done: ${rejected} rejected${failed > 0 ? `, ${failed} failed` : ''}`);
        setSelectedIds(new Set());
        fetchContributions();
        fetchHistory();
      } else {
        setBulkStatus(`Error: ${data.error || 'Unknown error'}`);
      }
    } catch {
      setBulkStatus('Network error');
    } finally {
      setBulkLoading(false);
      setTimeout(() => setBulkStatus(''), 3000);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredContributions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredContributions.map(c => c.id)));
    }
  };

  // Stats calculations
  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const todayHistory = history.filter(h => new Date(h.reviewedAt).toDateString() === today);

    return {
      pending: contributions.length,
      approvedToday: todayHistory.filter(h => h.action === 'approved').length,
      rejectedToday: todayHistory.filter(h => h.action === 'rejected').length,
      totalContributors: contributors.length,
      totalApproved: history.filter(h => h.action === 'approved').length,
      totalRejected: history.filter(h => h.action === 'rejected').length,
    };
  }, [contributions, history, contributors]);

  // Filtered contributions
  const filteredContributions = useMemo(() => {
    if (typeFilter === 'all') return contributions;
    return contributions.filter(c => c.type === typeFilter);
  }, [contributions, typeFilter]);

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md mx-auto">
          <div className="card-hover p-8">
            <div className="flex items-center justify-center mb-6">
              <LogIn className="w-12 h-12 text-primary-400" />
            </div>
            <h1 className="text-3xl font-display font-bold mb-2 text-center">Admin Login</h1>
            <p className="text-gray-400 text-center mb-6">Enter password to access admin dashboard</p>

            <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-dark-50 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 text-white"
                placeholder="Enter admin password"
                autoFocus
              />

              {loginError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  {loginError}
                </div>
              )}

              <button type="submit" className="w-full btn-primary" disabled={!password}>
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Review and manage community contributions</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { setShowContributors(!showContributors); setShowHistory(false); }}
            className={`btn-secondary flex items-center gap-2 ${showContributors ? 'bg-primary-500/20' : ''}`}
          >
            <Users className="w-4 h-4" />
            Contributors
          </button>
          <button
            onClick={() => { setShowHistory(!showHistory); setShowContributors(false); }}
            className={`btn-secondary flex items-center gap-2 ${showHistory ? 'bg-primary-500/20' : ''}`}
          >
            <History className="w-4 h-4" />
            History
          </button>
          <button onClick={handleLogout} className="btn-secondary">
            Logout
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="card-hover p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-orange-400" />
            <div>
              <div className="text-2xl font-bold">{stats.pending}</div>
              <div className="text-xs text-gray-400">Pending</div>
            </div>
          </div>
        </div>
        <div className="card-hover p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <div>
              <div className="text-2xl font-bold">{stats.approvedToday}</div>
              <div className="text-xs text-gray-400">Approved Today</div>
            </div>
          </div>
        </div>
        <div className="card-hover p-4">
          <div className="flex items-center gap-3">
            <XCircle className="w-6 h-6 text-red-400" />
            <div>
              <div className="text-2xl font-bold">{stats.rejectedToday}</div>
              <div className="text-xs text-gray-400">Rejected Today</div>
            </div>
          </div>
        </div>
        <div className="card-hover p-4">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-blue-400" />
            <div>
              <div className="text-2xl font-bold">{stats.totalContributors}</div>
              <div className="text-xs text-gray-400">Contributors</div>
            </div>
          </div>
        </div>
        <div className="card-hover p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-400/50" />
            <div>
              <div className="text-2xl font-bold">{stats.totalApproved}</div>
              <div className="text-xs text-gray-400">Total Approved</div>
            </div>
          </div>
        </div>
        <div className="card-hover p-4">
          <div className="flex items-center gap-3">
            <XCircle className="w-6 h-6 text-red-400/50" />
            <div>
              <div className="text-2xl font-bold">{stats.totalRejected}</div>
              <div className="text-xs text-gray-400">Total Rejected</div>
            </div>
          </div>
        </div>
      </div>

      {/* Contributors View */}
      {showContributors && (
        <div className="card-hover p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-400" />
            All Contributors ({contributors.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-gray-400 text-sm">Name</th>
                  <th className="text-left py-3 px-4 text-gray-400 text-sm">Email</th>
                  <th className="text-center py-3 px-4 text-gray-400 text-sm">Contributions</th>
                  <th className="text-center py-3 px-4 text-gray-400 text-sm">Tier Lists</th>
                  <th className="text-center py-3 px-4 text-gray-400 text-sm">Votes</th>
                </tr>
              </thead>
              <tbody>
                {contributors.map((c) => (
                  <tr key={c.id} className="border-b border-white/5 hover:bg-dark-50">
                    <td className="py-3 px-4 font-medium">{c.name}</td>
                    <td className="py-3 px-4 text-gray-400">{c.email}</td>
                    <td className="py-3 px-4 text-center">{c.totalContributions}</td>
                    <td className="py-3 px-4 text-center">{c.totalTierLists}</td>
                    <td className="py-3 px-4 text-center">{c.totalVotes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* History View */}
      {showHistory && (
        <div className="card-hover p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <History className="w-6 h-6 text-purple-400" />
            Contribution History
          </h2>
          {history.length === 0 ? (
            <div className="text-center py-8 text-gray-400">No history yet</div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {history.map((entry) => (
                <div key={entry.id} className="p-4 bg-dark-50 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {entry.action === 'approved' ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                    <div>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        entry.type === 'skin' ? 'bg-green-500/20 text-green-400' :
                        entry.type === 'hero' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-purple-500/20 text-purple-400'
                      }`}>
                        {entry.type}
                      </span>
                      <span className="ml-2 text-sm">{new Date(entry.reviewedAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">ID: {entry.id}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Contributions - Filter + List */}
      {!showHistory && !showContributors && (
        <>
          {/* Filter + Bulk Actions */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-400">Filter:</span>
            {(['all', 'skin', 'hero', 'series', 'counter'] as TypeFilter[]).map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  typeFilter === type
                    ? 'bg-primary-500 text-white'
                    : 'bg-dark-50 text-gray-400 hover:text-white'
                }`}
              >
                {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}

            {/* Bulk controls */}
            {filteredContributions.length > 0 && (
              <div className="ml-auto flex flex-wrap items-center gap-2">
                <button
                  onClick={toggleSelectAll}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-dark-50 text-gray-400 hover:text-white transition-colors"
                >
                  {selectedIds.size === filteredContributions.length && filteredContributions.length > 0
                    ? <CheckSquare className="w-4 h-4 text-primary-400" />
                    : <Square className="w-4 h-4" />}
                  {selectedIds.size === filteredContributions.length && filteredContributions.length > 0
                    ? 'Deselect All'
                    : 'Select All'}
                </button>

                {selectedIds.size > 0 && (
                  <>
                    <span className="text-sm text-gray-400">{selectedIds.size} selected</span>
                    <button
                      onClick={handleBulkApprove}
                      disabled={bulkLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-green-500/20 hover:bg-green-500/30 text-green-400 disabled:opacity-50 transition-colors"
                    >
                      {bulkLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      Approve ({selectedIds.size})
                    </button>
                    <button
                      onClick={handleBulkReject}
                      disabled={bulkLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-red-500/20 hover:bg-red-500/30 text-red-400 disabled:opacity-50 transition-colors"
                    >
                      {bulkLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                      Reject ({selectedIds.size})
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Bulk status message */}
          {bulkStatus && (
            <div className="mb-4 px-4 py-2 bg-dark-50 rounded-lg text-sm text-gray-300 flex items-center gap-2">
              {bulkLoading && <Loader2 className="w-4 h-4 animate-spin text-primary-400" />}
              {bulkStatus}
            </div>
          )}

          {/* List */}
          {filteredContributions.length === 0 ? (
            <div className="card-hover p-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No pending contributions</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredContributions.map((contribution) => (
                <div
                  key={contribution.id}
                  className={`card-hover p-6 hover:border-primary-500/30 transition-colors ${selectedIds.has(contribution.id) ? 'border-primary-500/40 bg-primary-500/5' : ''}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleSelect(contribution.id)}
                      className="mt-1 flex-shrink-0 text-gray-500 hover:text-primary-400 transition-colors"
                    >
                      {selectedIds.has(contribution.id)
                        ? <CheckSquare className="w-5 h-5 text-primary-400" />
                        : <Square className="w-5 h-5" />}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          contribution.type === 'skin' ? 'bg-green-500/20 text-green-400' :
                          contribution.type === 'hero' ? 'bg-blue-500/20 text-blue-400' :
                          contribution.type === 'counter' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-purple-500/20 text-purple-400'
                        }`}>
                          {contribution.type.toUpperCase()}
                        </span>
                        {contribution.contributorName && (
                          <span className="flex items-center gap-1 text-sm text-gray-400">
                            <User className="w-3 h-3" />
                            {contribution.contributorName}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {new Date(contribution.submittedAt || contribution.createdAt || '').toLocaleString()}
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold mb-1">
                        {contribution.type === 'skin'
                          ? `${contribution.data.skin?.skinName} (${contribution.data.heroName})`
                          : contribution.type === 'hero'
                          ? contribution.data.name
                          : contribution.type === 'counter'
                          ? `${contribution.data.action === 'add' ? 'Add' : 'Remove'} ${contribution.data.targetHeroName} ${contribution.data.relationshipType === 'strongAgainst' ? 'to Strong Against' : contribution.data.relationshipType === 'weakAgainst' ? 'to Weak Against' : 'to Best Partners'} for ${contribution.data.heroName}`
                          : contribution.data.seriesName}
                      </h3>
                      <div className="text-xs text-gray-500">ID: {contribution.id}</div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedContribution(contribution)}
                        className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors"
                        title="Preview"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleApprove(contribution)}
                        className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 transition-colors"
                        title="Approve"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleReject(contribution)}
                        className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
                        title="Reject"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Preview Modal */}
      {selectedContribution && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
          onClick={() => setSelectedContribution(null)}
        >
          <div
            className="bg-dark-300 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Contribution Preview</h2>
              <button
                onClick={() => setSelectedContribution(null)}
                className="p-2 hover:bg-dark-200 rounded-lg transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Type</label>
                  <div className="text-lg font-semibold">{selectedContribution.type.toUpperCase()}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Contributor</label>
                  <div className="text-lg">{selectedContribution.contributorName || 'Anonymous'}</div>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400">Submitted At</label>
                <div>{new Date(selectedContribution.submittedAt || selectedContribution.createdAt || '').toLocaleString()}</div>
              </div>

              {selectedContribution.type === 'counter' ? (
                <div className="space-y-3">
                  <div className="p-4 bg-dark-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-500">Hero</label>
                        <div className="font-semibold">{selectedContribution.data.heroName}</div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Action</label>
                        <div className={`font-semibold ${selectedContribution.data.action === 'add' ? 'text-green-400' : 'text-red-400'}`}>
                          {selectedContribution.data.action === 'add' ? 'ADD' : 'REMOVE'}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Relationship</label>
                        <div className="font-semibold">
                          {selectedContribution.data.relationshipType === 'strongAgainst' ? 'Strong Against' :
                           selectedContribution.data.relationshipType === 'weakAgainst' ? 'Weak Against' : 'Best Partner'}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Target Hero</label>
                        <div className="flex items-center gap-2">
                          {selectedContribution.data.targetHeroIcon && (
                            <img src={selectedContribution.data.targetHeroIcon} alt="" className="w-6 h-6 rounded" />
                          )}
                          <span className="font-semibold">{selectedContribution.data.targetHeroName}</span>
                        </div>
                      </div>
                    </div>
                    {selectedContribution.data.description && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <label className="text-xs text-gray-500">Reason</label>
                        <div className="text-sm text-gray-300">{selectedContribution.data.description}</div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-sm text-gray-400">Data (JSON)</label>
                  <pre className="mt-2 p-4 bg-dark-50 rounded-lg text-sm overflow-x-auto">
                    {JSON.stringify(selectedContribution.data, null, 2)}
                  </pre>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button
                  onClick={() => { handleApprove(selectedContribution); setSelectedContribution(null); }}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Approve
                </button>
                <button
                  onClick={() => { handleReject(selectedContribution); setSelectedContribution(null); }}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <XCircle className="w-5 h-5" />
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
