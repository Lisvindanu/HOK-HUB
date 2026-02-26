import { Link } from '@tanstack/react-router';
import { AlertTriangle, CheckCircle, Clock, Database, Shield } from 'lucide-react';

export function IncidentPage() {
  return (
    <div className="min-h-screen bg-dark-950 py-16 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <AlertTriangle className="w-8 h-8 text-red-500 shrink-0" />
          <h1 className="text-2xl font-bold text-white">Data Loss Incident Report</h1>
        </div>

        {/* Status badge */}
        <div className="flex items-center gap-2 mb-8">
          <span className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-3 py-1 rounded-full">
            <CheckCircle className="w-3.5 h-3.5" />
            Resolved
          </span>
          <span className="text-dark-400 text-sm">Feb 26, 2026</span>
        </div>

        {/* What happened */}
        <div className="bg-dark-900 border border-dark-700 rounded-xl p-6 mb-4">
          <h2 className="text-white font-semibold text-lg mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            What Happened
          </h2>
          <p className="text-dark-300 leading-relaxed mb-3">
            On February 26, 2026, a <code className="bg-dark-800 text-red-400 px-1.5 py-0.5 rounded text-sm">git reset --hard</code> command was executed on the production server. This command wiped all uncommitted changes in the working directory, including the <code className="bg-dark-800 text-amber-400 px-1.5 py-0.5 rounded text-sm">tier-lists.json</code> file which was being used to store community tier lists.
          </p>
          <p className="text-dark-300 leading-relaxed">
            At the time, the file was tracked by git but changes were never committed — so git had no record of the new entries and they could not be recovered.
          </p>
        </div>

        {/* Who was affected */}
        <div className="bg-dark-900 border border-dark-700 rounded-xl p-6 mb-4">
          <h2 className="text-white font-semibold text-lg mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            Data Lost
          </h2>
          <p className="text-dark-300 leading-relaxed mb-4">
            The following community-created tier lists were permanently lost and cannot be recovered:
          </p>
          <div className="space-y-2">
            {[
              { name: 'Aji', count: 6 },
              { name: 'Eionts', count: 1 },
              { name: 'WaNNaruu', count: 1 },
            ].map(({ name, count }) => (
              <div key={name} className="flex items-center justify-between bg-dark-800 rounded-lg px-4 py-2.5">
                <span className="text-white font-medium">{name}</span>
                <span className="text-red-400 text-sm">{count} tier list{count > 1 ? 's' : ''} lost</span>
              </div>
            ))}
          </div>
          <p className="text-dark-400 text-sm mt-4">
            We sincerely apologize. We attempted all possible git recovery methods (reflog, fsck, dangling blobs) — the data was never staged or committed and could not be retrieved.
          </p>
        </div>

        {/* Root cause */}
        <div className="bg-dark-900 border border-dark-700 rounded-xl p-6 mb-4">
          <h2 className="text-white font-semibold text-lg mb-3 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-400" />
            Root Cause
          </h2>
          <ul className="text-dark-300 space-y-2 leading-relaxed">
            <li className="flex gap-2">
              <span className="text-red-400 mt-0.5 shrink-0">•</span>
              Tier lists were stored in a JSON file (<code className="bg-dark-800 text-amber-400 px-1 rounded text-sm">community-data/tier-lists.json</code>) that was tracked by git
            </li>
            <li className="flex gap-2">
              <span className="text-red-400 mt-0.5 shrink-0">•</span>
              New tier lists were written directly to disk but never committed to git
            </li>
            <li className="flex gap-2">
              <span className="text-red-400 mt-0.5 shrink-0">•</span>
              <code className="bg-dark-800 text-red-400 px-1 rounded text-sm">git reset --hard</code> reset the file to the last committed state, erasing all uncommitted entries
            </li>
          </ul>
        </div>

        {/* What we fixed */}
        <div className="bg-dark-900 border border-green-500/20 rounded-xl p-6 mb-8">
          <h2 className="text-white font-semibold text-lg mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-400" />
            What We Fixed
          </h2>
          <ul className="text-dark-300 space-y-2 leading-relaxed">
            <li className="flex gap-2">
              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
              Tier lists are now stored in <strong className="text-white">PostgreSQL</strong> — completely independent from git
            </li>
            <li className="flex gap-2">
              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
              <code className="bg-dark-800 text-amber-400 px-1 rounded text-sm">community-data/</code> added to <code className="bg-dark-800 text-amber-400 px-1 rounded text-sm">.gitignore</code> — git operations can never affect runtime data again
            </li>
            <li className="flex gap-2">
              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
              All new tier lists will persist safely across deployments and server restarts
            </li>
          </ul>
        </div>

        <div className="text-center">
          <Link
            to="/tier-list"
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
          >
            Back to Tier List
          </Link>
        </div>

      </div>
    </div>
  );
}
