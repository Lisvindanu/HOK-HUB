import { User, Lock, FileText, List } from 'lucide-react';
import { useState } from 'react';
import { useUser } from '../hooks/useUser';
import { Loading } from '../components/ui/Loading';
import { ProfileSection } from '../components/dashboard/ProfileSection';
import { StatsSection } from '../components/dashboard/StatsSection';
import { PasswordSection } from '../components/dashboard/PasswordSection';

type ActiveSection = 'profile' | 'password' | 'contributions' | 'tierlists';

export function DashboardPage() {
  const { data: user, isLoading } = useUser();
  const [activeSection, setActiveSection] = useState<ActiveSection>('profile');

  if (isLoading) {
    return <Loading />;
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center text-gray-400">User not found</div>
      </div>
    );
  }

  const menuItems = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'password' as const, label: 'Change Password', icon: Lock },
    { id: 'contributions' as const, label: 'My Contributions', icon: FileText },
    { id: 'tierlists' as const, label: 'My Tier Lists', icon: List },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold">{user.name.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold mb-1">Dashboard</h1>
            <p className="text-gray-400">Welcome back, {user.name}!</p>
          </div>
        </div>

        {/* Stats Cards */}
        <StatsSection user={user} />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Menu */}
        <div className="lg:col-span-1">
          <div className="card-hover p-4">
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeSection === item.id
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-dark-50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="card-hover p-6">
            {activeSection === 'profile' && <ProfileSection user={user} />}
            {activeSection === 'password' && <PasswordSection />}
            {activeSection === 'contributions' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">My Contributions</h2>
                <p className="text-gray-400">Contributions list coming soon...</p>
              </div>
            )}
            {activeSection === 'tierlists' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">My Tier Lists</h2>
                <p className="text-gray-400">Tier lists coming soon...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
