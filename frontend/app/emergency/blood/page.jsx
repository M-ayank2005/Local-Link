"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/api';

export default function EmergencyBloodPage() {
  const [group, setGroup] = useState('ALL');
  const [locality, setLocality] = useState('ALL');
  const [donors, setDonors] = useState([]);
  const [localitiesFromApi, setLocalitiesFromApi] = useState([]);
  const [loading, setLoading] = useState(true);

  const localities = useMemo(() => ['ALL', ...localitiesFromApi], [localitiesFromApi]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (group !== 'ALL') params.set('bloodGroup', group);
        if (locality !== 'ALL') params.set('locality', locality);

        const response = await fetch(`${API_BASE_URL}/v1/emergency/blood?${params.toString()}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          setDonors([]);
          return;
        }

        const data = await response.json();
        setDonors(data.donors || []);
        setLocalitiesFromApi(data.filters?.localities || []);
      } catch (_error) {
        setDonors([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [group, locality]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-blue-50 dark:from-background dark:via-background dark:to-background">
      <div className="container mx-auto px-4 py-10 md:py-16 max-w-5xl space-y-6">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Emergency Blood Network</h1>
        <p className="text-muted-foreground">Find nearby verified blood donors with locality filters and availability status.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 rounded-2xl border bg-white/70 dark:bg-card p-4 shadow-lg">
          <select value={group} onChange={(e) => setGroup(e.target.value)} className="p-3 rounded-xl border bg-background">
            <option value="ALL">All Blood Groups</option>
            <option value="A+">A+</option>
            <option value="B+">B+</option>
            <option value="AB+">AB+</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
          <select value={locality} onChange={(e) => setLocality(e.target.value)} className="p-3 rounded-xl border bg-background">
            {localities.map((loc) => (
              <option key={loc} value={loc}>{loc === 'ALL' ? 'All Localities' : loc}</option>
            ))}
          </select>
        </div>

        {loading ? <p className="text-sm text-muted-foreground">Loading donors...</p> : null}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {donors.map((d) => (
            <div key={d._id} className="rounded-2xl border bg-white/70 dark:bg-card p-4 shadow-md">
              <div className="flex items-center justify-between">
                <p className="font-bold">{d.name}</p>
                <span className="text-sm px-2 py-1 rounded-full border bg-background">{d.bloodGroup}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{d.locality} • {d.distanceKm} km away</p>
              <p className="text-sm mt-2">Status: <span className="font-semibold">{d.availability}</span></p>
            </div>
          ))}
        </div>

        {!loading && donors.length === 0 ? <p className="text-sm text-muted-foreground">No donors match current filters.</p> : null}

        <Link href="/emergency" className="inline-flex rounded-xl border px-4 py-2 hover:bg-muted">Back to Emergency</Link>
      </div>
    </div>
  );
}
