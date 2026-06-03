"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Store,
  BrainCircuit,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Loader2,
  Flame,
  CalendarClock,
  BarChart2,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

const CAT_ICONS = {
  electrician: '⚡', plumber: '🔧', carpenter: '🪚', tutor: '📚',
  cleaner: '🧹', painter: '🎨', mechanic: '🔩', helper: '🤝',
  cook: '👨‍🍳', driver: '🚗', other: '📋',
};
const catIcon = (c) => CAT_ICONS[c] || '📋';

function GrowthBadge({ growth, trend }) {
  if (trend === 'up') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
      <ArrowUpRight className="w-3 h-3" />+{growth}%
    </span>
  );
  if (trend === 'down') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
      <ArrowDownRight className="w-3 h-3" />{growth}%
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
      <Minus className="w-3 h-3" />0%
    </span>
  );
}

function InsightSkeleton() {
  return (
    <div className="rounded-xl border bg-background/50 p-4 animate-pulse space-y-3">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
      <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
      <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded w-16" />
    </div>
  );
}

export default function AdminPage() {
  const [shops, setShops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [insights, setInsights] = useState([]);
  const [upcomingPeaks, setUpcomingPeaks] = useState([]);
  const [summary, setSummary] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(true);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/v1/admin/shops`, { credentials: 'include' });
        if (res.ok) {
          const json = await res.json();
          const items = Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : [];
          setShops(items.map(s => ({
            _id: s._id,
            name: s.name,
            owner: s.owner?.fullName || s.owner || 'Unknown',
            status: s.status || 'pending',
            submittedAt: new Date(s.createdAt || Date.now()).toLocaleDateString('en-IN'),
          })));
        }
      } catch (err) {
        console.error('Error fetching admin shops', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchShops();
  }, []);

  const fetchInsights = useCallback(async () => {
    setInsightsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/v1/skills/admin/ai/demand-insights`, { credentials: 'include' });
      if (res.ok) {
        const json = await res.json();
        setInsights(json.data?.insights || []);
        setUpcomingPeaks((json.data?.upcomingPeaks || []).sort((a, b) => b.count - a.count));
        setSummary(json.data?.summary || null);
      }
    } catch (err) {
      console.error('Error fetching demand insights', err);
    } finally {
      setInsightsLoading(false);
    }
  }, []);

  useEffect(() => { fetchInsights(); }, [fetchInsights]);

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE_URL}/v1/admin/shops/${id}/verify`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        credentials: 'include', body: JSON.stringify({ status }),
      });
      if (res.ok) setShops(shops.map(s => s._id === id ? { ...s, status } : s));
      else alert('Failed to update status');
    } catch (err) { console.error(err); alert('Network error'); }
  };
  const handleVerify = (id) => updateStatus(id, 'verified');
  const handleReject = (id) => updateStatus(id, 'rejected');

  return (
    <div className="min-h-screen bg-transparent text-foreground transition-colors duration-300 relative overflow-hidden">
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-400/20 dark:bg-emerald-600/20 blur-[120px] pointer-events-none -z-10 animate-pulse" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-teal-400/20 dark:bg-teal-600/10 blur-[100px] pointer-events-none -z-10 animate-pulse delay-1000" />

      <div className="container mx-auto p-4 md:p-8 space-y-8 relative z-10 w-full animate-in fade-in duration-500">
        {/* Header */}
        <header className="mb-8 pb-6 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-3">
              <ShieldAlert className="w-8 h-8" /> Admin Portal
            </h1>
            <p className="text-muted-foreground mt-2">Approve shop registrations and monitor AI-driven demand insights.</p>
          </div>
          <div className="bg-card border rounded-xl p-4 shadow-sm flex items-center gap-6">
            <div className="text-center">
              <span className="block text-2xl font-bold">{shops.filter(s => s.status === 'pending').length}</span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Pending</span>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-center">
              <span className="block text-2xl font-bold text-emerald-500">{shops.filter(s => s.status === 'verified').length}</span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Verified</span>
            </div>
          </div>
        </header>

        {/* ── AI Demand Insights ── */}
        <section className="bg-card border rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <BrainCircuit className="w-6 h-6 text-primary" /> AI Demand Insights
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Live booking trends — month-over-month category analysis.</p>
            </div>
            <div className="flex items-center gap-3">
              {summary && (
                <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold border ${
                  summary.overallTrend === 'up'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
                    : summary.overallTrend === 'down'
                    ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                    : 'bg-muted text-muted-foreground border-border'
                }`}>
                  {summary.overallTrend === 'up' && <TrendingUp className="w-4 h-4" />}
                  {summary.overallTrend === 'down' && <TrendingDown className="w-4 h-4" />}
                  {summary.overallTrend === 'stable' && <Minus className="w-4 h-4" />}
                  Overall {summary.overallGrowth > 0 ? '+' : ''}{summary.overallGrowth}% this month
                </div>
              )}
              <button onClick={fetchInsights} disabled={insightsLoading}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-border hover:bg-muted transition text-sm font-medium disabled:opacity-60">
                <RefreshCw className={`w-4 h-4 ${insightsLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Insight cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insightsLoading ? (
              [1, 2, 3].map(i => <InsightSkeleton key={i} />)
            ) : (insights.length ? insights : [{
              message: 'Demand insights will appear after skill bookings are created.',
              category: 'other', growth: 0, trend: 'stable', count: 0,
            }]).map((item, i) => (
              <div key={`${item.category}-${i}`}
                className={`rounded-xl border p-4 bg-background/50 transition hover:shadow-sm ${
                  item.trend === 'up' && item.growth >= 30
                    ? 'border-emerald-200 dark:border-emerald-800/50'
                    : item.trend === 'down'
                    ? 'border-red-200 dark:border-red-900/40'
                    : 'border-border'
                }`}>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{catIcon(item.category)}</span>
                    <span className="font-bold capitalize text-sm">{item.category?.replace('_', ' ')}</span>
                  </div>
                  <GrowthBadge growth={item.growth} trend={item.trend} />
                </div>
                <p className="text-sm text-foreground leading-relaxed">{item.message}</p>
                {item.count > 0 && (
                  <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
                    <BarChart2 className="w-3 h-3" />
                    {item.count} booking{item.count !== 1 ? 's' : ''} this month
                    {item.previousCount > 0 && <span className="text-muted-foreground/60">· {item.previousCount} last month</span>}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Upcoming peaks */}
          {!insightsLoading && upcomingPeaks.length > 0 && (
            <div className="mt-5 pt-5 border-t border-border">
              <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-primary" /> Upcoming Demand Peaks
              </p>
              <div className="flex flex-wrap gap-2">
                {upcomingPeaks.map((peak, i) => (
                  <span key={peak.category}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                      i === 0 ? 'bg-primary text-primary-foreground'
                        : i === 1 ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                    {i === 0 && <Flame className="w-3 h-3" />}
                    {catIcon(peak.category)} {peak.message}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ── Shop Approvals ── */}
        <section>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Store className="w-5 h-5 text-primary" /> Shop Registrations
          </h2>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-xl border bg-card animate-pulse" />)}
            </div>
          ) : shops.length === 0 ? (
            <div className="text-center py-16 bg-card border rounded-2xl">
              <Store className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-muted-foreground font-medium">No shop registrations yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {shops.map((shop) => (
                <div key={shop._id}
                  className="bg-card border rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between transition-all hover:shadow-md hover:border-primary/30 gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl mt-1 flex-shrink-0 ${
                      shop.status === 'verified' ? 'bg-emerald-500/10 text-emerald-500'
                        : shop.status === 'rejected' ? 'bg-destructive/10 text-destructive'
                        : 'bg-amber-500/10 text-amber-500'
                    }`}><Store className="w-6 h-6" /></div>
                    <div>
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        {shop.name}
                        {shop.status === 'verified' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                      </h3>
                      <div className="text-sm text-muted-foreground mt-1 space-y-0.5">
                        <p>Owner: <span className="font-medium text-foreground">{shop.owner}</span></p>
                        <p>Applied: {shop.submittedAt}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 md:ml-auto">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border ${
                      shop.status === 'verified' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                        : shop.status === 'rejected' ? 'bg-destructive/10 text-destructive border-destructive/20'
                        : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    }`}>{shop.status}</span>
                    {shop.status === 'pending' ? (
                      <>
                        <button onClick={() => handleReject(shop._id)}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition flex items-center gap-1">
                          <XCircle className="w-5 h-5" /><span className="text-sm font-medium">Reject</span>
                        </button>
                        <button onClick={() => handleVerify(shop._id)}
                          className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition flex items-center gap-1">
                          <CheckCircle2 className="w-5 h-5" /><span className="text-sm font-medium">Approve</span>
                        </button>
                      </>
                    ) : (
                      <button className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-muted transition">View Profile</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
