'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, List, Megaphone, MessageSquare,
  CreditCard, Key, Shield, XCircle, FileText, LogOut, Mail,
  ChevronRight, Send, User, RefreshCw,
} from 'lucide-react';
import { clearSession, getUser, isSuperAdmin } from '@/lib/auth';

const navSections = [
  {
    items: [
      { href: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
    ],
  },
  {
    title: 'Audience',
    items: [
      { href: '/contacts', icon: Users, label: 'Contacts' },
      { href: '/contact-lists', icon: List, label: 'Listes de contacts' },
      { href: '/opt-outs', icon: XCircle, label: 'Opt-outs' },
    ],
  },
  {
    title: 'Envoi',
    items: [
      { href: '/sms', icon: Send, label: 'SMS Rapide' },
      { href: '/campaigns', icon: Megaphone, label: 'Campagnes' },
      { href: '/sms-templates', icon: MessageSquare, label: 'Modèles SMS' },
      { href: '/sender-ids', icon: Shield, label: 'Sender IDs' },
    ],
  },
  {
    title: 'Finance',
    items: [
      { href: '/wallet', icon: CreditCard, label: 'Portefeuille' },
    ],
  },
  {
    title: 'Configuration',
    items: [
      { href: '/users', icon: Users, label: 'Utilisateurs' },
      { href: '/api-keys', icon: Key, label: 'Clés API' },
      { href: '/audit-logs', icon: FileText, label: "Journal d'audit" },
      { href: '/profile', icon: User, label: 'Mon profil' },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = getUser();
  const superAdmin = isSuperAdmin();

  const handleLogout = () => {
    clearSession();
    router.push('/login');
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-white border-r border-gray-100 flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center shadow-sm">
            <Mail size={18} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-base leading-none">PushSMS</p>
            <p className="text-xs text-gray-400 mt-0.5">Plateforme SMS</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {superAdmin && (
          <div>
            <p className="px-3 mb-1.5 text-[10px] font-bold text-red-500 uppercase tracking-widest">Super Admin</p>
            <div className="space-y-0.5">
              {[{ href: '/recharge-requests', icon: RefreshCw, label: 'Recharges clients' }].map(({ href, icon: Icon, label }) => {
                const active = pathname === href;
                return (
                  <Link key={href} href={href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                      ${active ? 'bg-red-50 text-red-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                    <Icon size={16} className={active ? 'text-red-600' : 'text-gray-400'} />
                    <span className="flex-1">{label}</span>
                    {active && <ChevronRight size={12} className="text-red-400" />}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
        {navSections.map((section, si) => (
          <div key={si}>
            {section.title && (
              <p className="px-3 mb-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {section.title}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map(({ href, icon: Icon, label }) => {
                const active = pathname === href || pathname.startsWith(href + '/');
                return (
                  <Link key={href} href={href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                      transition-all duration-150
                      ${active
                        ? 'bg-red-50 text-red-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}>
                    <Icon size={16} className={active ? 'text-red-600' : 'text-gray-400'} />
                    <span className="flex-1">{label}</span>
                    {active && <ChevronRight size={12} className="text-red-400" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2.5 mb-1">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
            {user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-400 truncate">{user?.role}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
            text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150">
          <LogOut size={16} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
