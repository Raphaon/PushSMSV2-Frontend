import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'PushSMS — Plateforme SMS',
  description: 'Plateforme SaaS d\'envoi SMS multi-tenant',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { borderRadius: '12px', fontSize: '14px', fontWeight: 500 },
            success: { iconTheme: { primary: '#DC2626', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  );
}
