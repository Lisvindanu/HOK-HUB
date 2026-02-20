import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Eye, Clock, AlertCircle, LogIn, History } from 'lucide-react';

interface Contribution {
  id: string;
  type: 'skin' | 'hero' | 'series';
  data: any;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface HistoryEntry {
  id: string;
  type: 'skin' | 'hero' | 'series';
  action: 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt: string;
  data: any;
}

export function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [token, setToken] = useState<string | null>(localStorage.getItem('adminToken'));
  const [loginError, setLoginError] = useState('');
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedContribution, setSelectedContribution] = useState<Contribution | null>(null);

  useEffect(() => {
    if (token) {
      setIsAuthenticated(true);
      fetchContributions();
      fetchHistory();
    } else {
      setLoading(false);
    }
  }, [token]);

  const handleLogin = async () => {
    setLoginError('');
    try {
      const response = await fetch('http://167.253.158.192:8090/api/admin/login', {
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
        fetchContributions();
        fetchHistory();
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
      const response = await fetch('http://167.253.158.192:8090/api/contributions/pending');
      const data = await response.json();
      setContributions(data.contributions || []);
    } catch (error) {
      console.error('Failed to fetch contributions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch('http://167.253.158.192:8090/api/contributions/history');
      const data = await response.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
  };

  const handleApprove = async (contribution: Contribution) => {
    if (!confirm(`Approve and merge contribution ${contribution.id}?\n\nThis will update the main API data.`)) {
      return;
    }

    try {
      const response = await fetch(
        `http://167.253.158.192:8090/api/contributions/approve/${contribution.id}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        alert('✅ Contribution approved and merged successfully!');
        fetchContributions();
        fetchHistory();
      } else {
        const error = await response.json();
        alert(`Failed to approve: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert('Network error - failed to approve contribution');
      console.error(error);
    }
  };

  const handleReject = async (contribution: Contribution) => {
    if (!confirm(`Reject contribution ${contribution.id}?\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(
        `http://167.253.158.192:8090/api/contributions/reject/${contribution.id}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        alert('❌ Contribution rejected');
        fetchContributions();
        fetchHistory();
      } else {
        const error = await response.json();
        alert(`Failed to reject: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert('Network error - failed to reject contribution');
      console.error(error);
    }
  };

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
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-50 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 text-white"
                  placeholder="Enter admin password"
                  autoFocus
                />
              </div>

              {loginError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                className="w-full btn-primary"
                disabled={!password}
              >
                Login
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Default password: admin123
              </p>
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
          <p className="mt-4 text-gray-400">Loading contributions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Admin Dashboard
          </h1>
          <p className="text-gray-400 text-lg">
            Review and manage community contributions
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="btn-secondary flex items-center gap-2"
          >
            <History className="w-4 h-4" />
            {showHistory ? 'Hide' : 'Show'} History
          </button>
          <button
            onClick={handleLogout}
            className="btn-secondary"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card-hover p-6">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-orange-400" />
            <div>
              <div className="text-2xl font-bold">{contributions.length}</div>
              <div className="text-sm text-gray-400">Pending Review</div>
            </div>
          </div>
        </div>

        <div className="card-hover p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-400" />
            <div>
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-gray-400">Approved Today</div>
            </div>
          </div>
        </div>

        <div className="card-hover p-6">
          <div className="flex items-center gap-3">
            <XCircle className="w-8 h-8 text-red-400" />
            <div>
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-gray-400">Rejected Today</div>
            </div>
          </div>
        </div>
      </div>

      {/* Contributions List */}
      {contributions.length === 0 ? (
        <div className="card-hover p-12 text-center">
          <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">No pending contributions</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {contributions.map((contribution) => (
            <div
              key={contribution.id}
              className="card-hover p-6 hover:border-primary-500/30 cursor-pointer"
              onClick={() => setSelectedContribution(contribution)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      contribution.type === 'skin'
                        ? 'bg-green-500/20 text-green-400'
                        : contribution.type === 'hero'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-purple-500/20 text-purple-400'
                    }`}>
                      {contribution.type.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-400">
                      {new Date(contribution.submittedAt).toLocaleString()}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold mb-2">
                    {contribution.type === 'skin'
                      ? `${contribution.data.skin?.skinName} (${contribution.data.heroName})`
                      : contribution.type === 'hero'
                      ? contribution.data.name
                      : contribution.data.seriesName}
                  </h3>

                  <div className="text-sm text-gray-400">
                    ID: {contribution.id}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedContribution(contribution);
                    }}
                    className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors"
                    title="Preview"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApprove(contribution);
                    }}
                    className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 transition-colors"
                    title="Approve"
                  >
                    <CheckCircle className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReject(contribution);
                    }}
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
              <div>
                <label className="text-sm text-gray-400">Type</label>
                <div className="text-lg font-semibold">{selectedContribution.type.toUpperCase()}</div>
              </div>

              <div>
                <label className="text-sm text-gray-400">Submitted At</label>
                <div className="text-lg">{new Date(selectedContribution.submittedAt).toLocaleString()}</div>
              </div>

              <div>
                <label className="text-sm text-gray-400">Data (JSON)</label>
                <pre className="mt-2 p-4 bg-dark-50 rounded-lg text-sm overflow-x-auto">
                  {JSON.stringify(selectedContribution.data, null, 2)}
                </pre>
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button
                  onClick={() => {
                    handleApprove(selectedContribution);
                    setSelectedContribution(null);
                  }}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Approve & Merge
                </button>
                <button
                  onClick={() => {
                    handleReject(selectedContribution);
                    setSelectedContribution(null);
                  }}
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

      {/* History View */}
      {showHistory && (
        <div className="mt-8">
          <div className="card-hover p-6">
            <h2 className="text-2xl font-bold mb-4">Contribution History</h2>

            {history.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No history yet
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {history.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-4 bg-dark-200 rounded-lg border border-white/5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {entry.action === 'approved' ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400" />
                        )}
                        <div>
                          <div className="font-semibold">
                            {entry.action === 'approved' ? 'Approved' : 'Rejected'}:{' '}
                            <span className="text-primary-400">{entry.type}</span>
                          </div>
                          <div className="text-sm text-gray-400">
                            Reviewed: {new Date(entry.reviewedAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {entry.id}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
