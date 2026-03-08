import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import HomePage from './home/page';

const SERVER_API_BASE = process.env.BACKEND_URL || 'http://localhost:5001/api';

async function ensureAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/landing');
  }

  try {
    const response = await fetch(`${SERVER_API_BASE}/auth/me`, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        Cookie: `token=${token}`,
      },
    });

    if (!response.ok) {
      redirect('/landing');
    }
  } catch (_error) {
    redirect('/landing');
  }
}

export default async function RootHomePage() {
  await ensureAuthenticated();
  return <HomePage />;
}
