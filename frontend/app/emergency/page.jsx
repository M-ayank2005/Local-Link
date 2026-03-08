"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { HeartPulse, Droplets, Pill, Ambulance, Activity, MapPin, PackageSearch, ShieldAlert } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/api';

export default function EmergencyPage() {
  const [stats, setStats] = useState({
    totalBloodDonors: 0,
    totalMedicineEntries: 0,
    bloodLocalities: 0,
    medicineLocalities: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/v1/emergency`, {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data.stats || stats);
        }
      } catch (_error) {
        // Keep fallback stats if API unavailable.
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statCards = [
    { label: 'Blood Donors', value: stats.totalBloodDonors, icon: <Activity className="w-4 h-4 text-rose-500" /> },
    { label: 'Medicine Entries', value: stats.totalMedicineEntries, icon: <PackageSearch className="w-4 h-4 text-blue-500" /> },
    { label: 'Blood Localities', value: stats.bloodLocalities, icon: <MapPin className="w-4 h-4 text-violet-500" /> },
    { label: 'Medicine Localities', value: stats.medicineLocalities, icon: <MapPin className="w-4 h-4 text-emerald-500" /> },
  ];

  return (
    <div className="min-h-screen bg-transparent text-foreground transition-colors duration-300 relative">
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-rose-400/20 dark:bg-rose-600/20 blur-[120px] pointer-events-none -z-10 animate-pulse" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-red-400/20 dark:bg-red-600/10 blur-[100px] pointer-events-none -z-10 animate-pulse delay-1000" />
      <div className="container mx-auto p-4 md:p-8 space-y-8 relative z-10 w-full animate-in fade-in duration-500">
        <section className="rounded-2xl border border-gray-200/50 dark:border-gray-800/50 bg-white/70 dark:bg-card/60 p-6 md:p-8 shadow-sm backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 text-rose-600 text-xs md:text-sm font-semibold mb-3">
                <HeartPulse className="w-4 h-4" /> Emergency Network
              </div>
              <h1 className="text-2xl md:text-5xl font-extrabold tracking-tight leading-tight">
                Local Emergency & Blood/Medicine Network
              </h1>
              <p className="text-muted-foreground mt-3 max-w-3xl text-sm md:text-base">
                Fast, verified and hyperlocal emergency support for critical needs.
              </p>
            </div>
            <Link href="/emergency/blood" className="inline-flex items-center gap-2 rounded-xl border bg-background px-4 py-2 text-sm font-semibold hover:bg-muted transition-colors">
              <ShieldAlert className="w-4 h-4 text-rose-500" /> Find Help Now
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
            {statCards.map((card) => (
              <div key={card.label} className="rounded-2xl border bg-background px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs md:text-sm text-muted-foreground">{card.label}</p>
                  {card.icon}
                </div>
                <p className="text-xl md:text-2xl font-extrabold mt-1">{loading ? '...' : card.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200/50 dark:border-gray-800/50 bg-white/70 dark:bg-card/60 p-6 shadow-sm backdrop-blur-xl">
          <h2 className="text-2xl font-bold mb-4">Emergency Pages</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            <Link href="/emergency/blood" className="flex items-center gap-2 rounded-xl border px-4 py-3 hover:bg-muted transition-colors text-base font-medium">
              <Droplets className="w-4 h-4 text-red-500" /> Blood Network
            </Link>
            <Link href="/emergency/medicine" className="flex items-center gap-2 rounded-xl border px-4 py-3 hover:bg-muted transition-colors text-base font-medium">
              <Pill className="w-4 h-4 text-blue-500" /> Medicine Network
            </Link>
            <div className="flex items-center gap-2 rounded-xl border px-4 py-3 text-muted-foreground text-base font-medium">
              <Ambulance className="w-4 h-4" /> Ambulance (coming soon)
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
