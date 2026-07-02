import DashboardPage from '@/pages/DashboardPage';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function App() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .bootstrap()
      .then(() => setReady(true))
      .catch((err) => setError(err instanceof Error ? err.message : 'Gagal memuat dashboard'));
  }, []);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f1f1] p-6">
        <p className="max-w-md rounded-xl border border-red-200 bg-white px-5 py-4 text-sm text-red-700">
          {error}
        </p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f1f1]">
        <Loader2 className="animate-spin text-[#8B1A1A]" size={28} />
      </div>
    );
  }

  return <DashboardPage />;
}
