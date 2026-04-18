'use client';
import { useState, useEffect } from 'react';
import { Bell, Search, User } from 'lucide-react';
import Link from 'next/link';
import { getUser } from '@/lib/auth';
import { notificationsApi } from '@/lib/api';
import { fmtDateTime } from '@/lib/utils';

function NotificationBell() {
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const fetchCount = () => {
    notificationsApi.unreadCount().then(r => setCount(r.data?.data?.count || 0)).catch(() => {});
  };

  useEffect(() => {
    fetchCount();
    const timer = setInterval(fetchCount, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleOpen = async () => {
    try {
      const { data } = await notificationsApi.list({ limit: 20 });
      setNotifications(data.data || []);
    } catch { /* */ }
    setOpen(true);
    setCount(0);
    notificationsApi.markAllRead().catch(() => {});
  };

  const TYPE_ICONS = {
    low_credits: '⚠️', recharge_approved: '✅', recharge_rejected: '❌', system: 'ℹ️',
  };

  return (
    <div className="relative">
      <button onClick={open ? () => setOpen(false) : handleOpen}
        className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors">
        <Bell size={18} className="text-gray-500" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-600 text-white
            text-[9px] font-bold rounded-full flex items-center justify-center px-1">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 z-50 w-80 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-800">Notifications</p>
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
              {notifications.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">Aucune notification</p>
              ) : notifications.map(n => (
                <div key={n.id} className={`px-4 py-3 ${!n.is_read ? 'bg-red-50/40' : ''}`}>
                  <p className="text-sm font-medium text-gray-800">
                    {TYPE_ICONS[n.type] || 'ℹ️'} {n.title}
                  </p>
                  {n.body && <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>}
                  <p className="text-xs text-gray-400 mt-1">{fmtDateTime(n.created_at)}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function TopBar({ title }) {
  const user = getUser();

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-30">
      <h1 className="text-lg font-bold text-gray-900">{title}</h1>
      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input placeholder="Rechercher..."
            className="pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none
              focus:border-red-300 focus:ring-2 focus:ring-red-100 w-52 transition-all" />
        </div>
        <NotificationBell />
        <Link href="/profile">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white text-xs font-bold
            hover:bg-red-700 transition-colors cursor-pointer" title="Mon profil">
            {user?.firstName?.[0]?.toUpperCase() || <User size={14} />}
          </div>
        </Link>
      </div>
    </header>
  );
}
