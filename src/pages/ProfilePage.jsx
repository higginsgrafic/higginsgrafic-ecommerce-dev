import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfileTabs } from '@/components/UserProfileTabs';
import SEO from '@/components/SEO';
import Breadcrumbs from '@/components/Breadcrumbs';
import { LogOut } from 'lucide-react';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <>
      <SEO title="El meu perfil — Higgins Gràfic" />
      <div className="min-h-screen bg-neutral-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Breadcrumbs items={[{ label: 'El meu perfil' }]} />
          </div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">El meu perfil</h1>
              <p className="text-neutral-500 text-sm mt-1">{user?.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Tancar sessió
            </button>
          </div>

          <UserProfileTabs />
        </div>
      </div>
    </>
  );
}
