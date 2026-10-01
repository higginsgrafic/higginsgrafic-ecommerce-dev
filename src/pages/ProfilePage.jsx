import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfileTabs } from '@/components/UserProfileTabs';
import SEO from '@/components/SEO';
import Breadcrumbs from '@/components/Breadcrumbs';
import { LogOut, ReceiptText } from 'lucide-react';

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
      <div className="min-h-screen bg-paper-soft py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Breadcrumbs items={[{ label: 'El meu perfil' }]} />
          </div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-ink-strong">El meu perfil</h1>
              <p className="text-ink-soft text-sm mt-1">{user?.email}</p>
              <Link
                to="/compte/factures"
                className="inline-flex items-center gap-1.5 text-sm text-ink-2 hover:text-ink-strong underline decoration-line-strong hover:decoration-ink-strong mt-2 transition-colors"
              >
                <ReceiptText className="w-4 h-4" />
                Les meves factures
              </Link>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-ink-2 hover:text-ink-strong border border-line rounded-lg hover:bg-paper-soft transition-colors"
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
