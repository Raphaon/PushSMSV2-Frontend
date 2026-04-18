'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { isAuthenticated } from '@/lib/auth';

const PAGE_TITLES = {
  '/dashboard': 'Tableau de bord',
  '/contacts': 'Contacts',
  '/contact-lists': 'Listes de contacts',
  '/opt-outs': 'Opt-outs',
  '/sms': 'SMS Rapide',
  '/campaigns': 'Campagnes',
  '/sms-templates': 'Modèles SMS',
  '/sender-ids': 'Sender IDs',
  '/wallet': 'Portefeuille',
  '/users': 'Utilisateurs',
  '/api-keys': 'Clés API',
  '/audit-logs': "Journal d'audit",
  '/profile': 'Mon profil',
  '/recharge-requests': 'Demandes de recharge',
};

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
    } else {
      setReady(true);
    }
  }, [router]);

  if (!ready) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#FFF5F5' }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
          <svg className="animate-spin w-5 h-5 text-white" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" />
          </svg>
        </div>
        <p className="text-sm text-gray-500">Chargement...</p>
      </div>
    </div>
  );

  const base = '/' + (pathname.split('/')[1] || '');
  const title = PAGE_TITLES[base] || 'PushSMS';

  return (
    <div className="flex min-h-screen" style={{ background: '#F8FAFC' }}>
      <Sidebar />
      <div className="flex-1 ml-60 flex flex-col min-h-screen">
        <TopBar title={title} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
