"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/api';

export default function EmergencyMedicinePage() {
  const [query, setQuery] = useState('');
  const [locality, setLocality] = useState('ALL');
  const [medicines, setMedicines] = useState([]);
  const [localitiesFromApi, setLocalitiesFromApi] = useState([]);
  const [loading, setLoading] = useState(true);

  const localities = useMemo(() => ['ALL', ...localitiesFromApi], [localitiesFromApi]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (query.trim()) params.set('q', query.trim());
        if (locality !== 'ALL') params.set('locality', locality);

        const response = await fetch(`${API_BASE_URL}/v1/emergency/medicine?${params.toString()}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          setMedicines([]);
          return;
        }

        const data = await response.json();
        setMedicines(data.medicines || []);
        setLocalitiesFromApi(data.filters?.localities || []);
      } catch (_error) {
        setMedicines([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [query, locality]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-blue-50 dark:from-background dark:via-background dark:to-background">
      <div className="container mx-auto px-4 py-10 md:py-16 max-w-5xl space-y-6">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Emergency Medicine Network</h1>
        <p className="text-muted-foreground">Check rare medicine availability from nearby stores in real-time style cards.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 rounded-2xl border bg-white/70 dark:bg-card p-4 shadow-lg">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search medicine"
            className="p-3 rounded-xl border bg-background"
          />
          <select value={locality} onChange={(e) => setLocality(e.target.value)} className="p-3 rounded-xl border bg-background">
            {localities.map((loc) => (
              <option key={loc} value={loc}>{loc === 'ALL' ? 'All Localities' : loc}</option>
            ))}
          </select>
        </div>

        {loading ? <p className="text-sm text-muted-foreground">Loading medicine availability...</p> : null}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {medicines.map((m) => (
            <div key={m._id} className="rounded-2xl border bg-white/70 dark:bg-card p-4 shadow-md">
              <p className="font-bold">{m.medicine}</p>
              <p className="text-sm text-muted-foreground mt-1">{m.store} • {m.locality}</p>
              <p className="text-sm mt-2">Availability: <span className="font-semibold">{m.availability}</span></p>
              <p className="text-sm text-muted-foreground">ETA: {m.eta}</p>
            </div>
          ))}
        </div>

        {!loading && medicines.length === 0 ? <p className="text-sm text-muted-foreground">No medicine found for current filters.</p> : null}

        <Link href="/emergency" className="inline-flex rounded-xl border px-4 py-2 hover:bg-muted">Back to Emergency</Link>
      </div>
    </div>
  );
}
