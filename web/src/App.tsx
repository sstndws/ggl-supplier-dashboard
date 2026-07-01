import { useState } from 'react';
import { isAuthenticated } from '@/lib/auth';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';

export default function App() {
  const [authed, setAuthed] = useState(isAuthenticated);

  if (!authed) {
    return <LoginPage onSuccess={() => setAuthed(true)} />;
  }

  return <DashboardPage onLogout={() => setAuthed(false)} />;
}
