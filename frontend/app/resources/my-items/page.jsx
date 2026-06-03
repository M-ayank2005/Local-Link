"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Wrench, Plus, Edit2, Trash2, X, Check,
  BookOpen, TrendingUp, BellPlus, Users, Calendar, IndianRupee, Sparkles
} from 'lucide-react';

const API_BASE = (() => {
  const base = (
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    'http://localhost:5000/api'
  ).replace(/\/$/, '');
  return base.endsWith('/v1') ? base : `${base}/v1`;
})();

const CATEGORIES = ['drill', 'ladder', 'projector', 'tent', 'tool', 'appliance', 'sports', 'other'];
const CONDITIONS = ['new', 'good', 'fair'];

const DEPOSIT_STATUS_PILL = {
  held: 'text-amber-500 bg-amber-500/10',
  released: 'text-emerald-500 bg-emerald-500/10',
  forfeited: 'text-red-500 bg-red-500/10',
  partial_refund: 'text-orange-500 bg-orange-500/10',
};

const BOOKING_STATUS_PILL = {
  confirmed: 'text-blue-500 bg-blue-500/10',
  active: 'text-emerald-500 bg-emerald-500/10',
  returned: 'text-muted-foreground bg-secondary',
  cancelled: 'text-red-500 bg-red-500/10',
  pending: 'text-amber-500 bg-amber-500/10',
};

const DEMAND_STATUS_PILL = {
  open: 'text-blue-500 bg-blue-500/10',
  fulfilled: 'text-emerald-500 bg-emerald-500/10',
  expired: 'text-zinc-400 bg-zinc-100',
};

const emptyForm = {
  title: '', description: '', category: 'drill', condition: 'good',
  pricePerDay: '', depositAmount: '', availableFrom: '', availableTo: '', rules: '',
};

const TABS = [
  { id: 'listings',           label: 'My Listings',         icon: Wrench },
  { id: 'my-bookings',        label: 'My Bookings',         icon: BookOpen },
  { id: 'my-demands',         label: 'My Demands',          icon: BellPlus },
  { id: 'community-demands',  label: 'Fulfill Demands',     icon: Users },
];

export default function MyItemsPage() {
  const [items, setItems] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [myDemands, setMyDemands] = useState([]);
  const [publicDemands, setPublicDemands] = useState([]);
  const [tab, setTab] = useState('listings');
  const [isLoading, setIsLoading] = useState(true);
  const [userCoords, setUserCoords] = useState(null);

  // Item modal
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Pricing Assistant
  const [isPricingLoading, setIsPricingLoading] = useState(false);
  const [pricingSuggestion, setPricingSuggestion] = useState(null);

  // Fulfill modal
  const [fulfillDemand, setFulfillDemand] = useState(null);
  const [selectedResourceId, setSelectedResourceId] = useState('');
  const [fulfillLoading, setFulfillLoading] = useState(false);
  const [fulfillError, setFulfillError] = useState('');

  // ── Fetch helpers ─────────────────────────────────────────────────────────
  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/resources/my-items`, { credentials: 'include' });
      const data = await res.json();
      setItems(res.ok ? data.data || [] : []);
    } catch { setItems([]); }
    finally { setIsLoading(false); }
  };

  const fetchMyBookings = async () => {
    try {
      const res = await fetch(`${API_BASE}/bookings/my-bookings`, { credentials: 'include' });
      const data = await res.json();
      setMyBookings(res.ok ? data.data || [] : []);
    } catch { setMyBookings([]); }
  };

  const fetchMyDemands = async () => {
    try {
      const res = await fetch(`${API_BASE}/demands/my-demands`, { credentials: 'include' });
      const data = await res.json();
      setMyDemands(res.ok ? data.data || [] : []);
    } catch { setMyDemands([]); }
  };

  const fetchPublicDemands = async () => {
    try {
      const res = await fetch(`${API_BASE}/demands`);
      const data = await res.json();
      setPublicDemands(res.ok ? data.data || [] : []);
    } catch { setPublicDemands([]); }
  };

  useEffect(() => {
    fetchItems(); fetchMyBookings(); fetchMyDemands(); fetchPublicDemands();
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserCoords([pos.coords.longitude, pos.coords.latitude]);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Item CRUD ─────────────────────────────────────────────────────────────
  const openAdd = () => { setEditingItem(null); setForm(emptyForm); setFormError(''); setPricingSuggestion(null); setShowModal(true); };
  const openEdit = (item) => {
    setEditingItem(item);
    setPricingSuggestion(null);
    setForm({
      title: item.title, description: item.description || '', category: item.category,
      condition: item.condition, pricePerDay: item.pricePerDay, depositAmount: item.depositAmount,
      availableFrom: item.availableFrom ? item.availableFrom.split('T')[0] : '',
      availableTo: item.availableTo ? item.availableTo.split('T')[0] : '',
      rules: item.rules || '',
    });
    setFormError(''); setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setFormLoading(true); setFormError('');
    try {
      const body = {
        ...form,
        pricePerDay: Number(form.pricePerDay),
        depositAmount: Number(form.depositAmount),
        location: { type: 'Point', coordinates: userCoords || [77.209, 28.6139] },
      };
      const url = editingItem ? `${API_BASE}/resources/${editingItem._id}` : `${API_BASE}/resources`;
      const method = editingItem ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method, credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      setShowModal(false); fetchItems();
    } catch (err) { setFormError(err.message); }
    finally { setFormLoading(false); }
  };

  const handleGetPricing = async () => {
    if (!form.category || !form.condition) {
      alert("Please select a category and condition first.");
      return;
    }
    setIsPricingLoading(true);
    setPricingSuggestion(null);
    try {
      const res = await fetch(`${API_BASE}/resources/ai/pricing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: form.category,
          condition: form.condition,
          itemDetails: form.title + " " + form.description,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error);
      setPricingSuggestion(data.data);
      if (data.data?.recommendedPrice?.min) {
        setForm(prev => ({ ...prev, pricePerDay: data.data.recommendedPrice.min }));
      }
    } catch (err) {
      alert("Pricing error: " + err.message);
    } finally {
      setIsPricingLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (!confirm('Deactivate this listing?')) return;
    try {
      const res = await fetch(`${API_BASE}/resources/${itemId}`, { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchItems();
    } catch (err) { alert(err.message); }
  };

  const handleReturn = async (bookingId, condition) => {
    try {
      const res = await fetch(`${API_BASE}/bookings/${bookingId}/return`, {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ condition }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert(data.data?.message || 'Updated');
      fetchMyBookings();
    } catch (err) { alert(err.message); }
  };

  const handleCancelDemand = async (demandId) => {
    if (!confirm('Cancel this demand?')) return;
    try {
      const res = await fetch(`${API_BASE}/demands/${demandId}`, { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchMyDemands();
    } catch (err) { alert(err.message); }
  };

  const handleFulfill = async () => {
    if (!selectedResourceId) { setFulfillError('Please select one of your items'); return; }
    setFulfillLoading(true); setFulfillError('');
    try {
      const res = await fetch(`${API_BASE}/demands/${fulfillDemand._id}/fulfill`, {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourceId: selectedResourceId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert(data.message);
      setFulfillDemand(null); setSelectedResourceId('');
      fetchPublicDemands();
    } catch (err) { setFulfillError(err.message); }
    finally { setFulfillLoading(false); }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6 max-w-5xl">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wrench className="w-6 h-6 text-amber-500" /> My Resource Hub
          </h1>
          <Link href="/resources" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Browse resources
          </Link>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors"
        >
          <Plus className="w-4 h-4" /> List item
        </button>
      </header>

      {/* Tabs */}
      <div className="flex bg-muted p-1 rounded-2xl w-fit gap-0.5 flex-wrap">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl transition-all ${
              tab === id ? 'bg-background shadow text-amber-500' : 'text-muted-foreground hover:bg-background/50'
            }`}
          >
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {/* ── MY LISTINGS ───────────────────────────────────────────────────── */}
      {tab === 'listings' && (
        <>
          {isLoading ? (
            <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-20 rounded-xl bg-card border animate-pulse" />)}</div>
          ) : items.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Wrench className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No listings yet. Add your first item!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item._id} className="flex items-center justify-between rounded-xl border bg-card p-4">
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">{item.category} · {item.condition} · ₹{item.pricePerDay}/day</p>
                    {item.activeBookings > 0 && (
                      <span className="text-xs text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full mt-1 inline-block">
                        {item.activeBookings} active booking{item.activeBookings > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(item)} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(item._id)} className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── MY BOOKINGS ───────────────────────────────────────────────────── */}
      {tab === 'my-bookings' && (
        <div className="space-y-3">
          {myBookings.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No bookings yet.</p>
              <Link href="/resources" className="text-amber-500 hover:underline text-sm mt-1 inline-block">Browse items →</Link>
            </div>
          ) : myBookings.map((b) => (
            <div key={b._id} className="rounded-xl border bg-card p-4 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{b.resource?.title || 'Resource'}</p>
                  <p className="text-xs text-muted-foreground capitalize">{b.resource?.category}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${BOOKING_STATUS_PILL[b.status]}`}>{b.status}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{new Date(b.fromDate).toLocaleDateString()} → {new Date(b.toDate).toLocaleDateString()}</span>
                <span>Rent: ₹{b.totalRent}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${DEPOSIT_STATUS_PILL[b.depositStatus]}`}>
                  Deposit {b.depositStatus} · ₹{b.depositAmount}
                </span>
                {b.mlRiskLevel && (
                  <span className="text-xs text-violet-500 bg-violet-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Risk: {b.mlRiskLevel}
                  </span>
                )}
              </div>
              {b.status === 'confirmed' && (
                <div className="flex gap-2 pt-1">
                  <button onClick={() => handleReturn(b._id, 'good')} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors">
                    <Check className="w-3 h-3" /> Mark returned (good)
                  </button>
                  <button onClick={() => handleReturn(b._id, 'damaged')} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors">
                    <X className="w-3 h-3" /> Mark damaged
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── MY DEMANDS ────────────────────────────────────────────────────── */}
      {tab === 'my-demands' && (
        <div className="space-y-3">
          {myDemands.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <BellPlus className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No demands posted yet.</p>
              <Link href="/resources" className="text-amber-500 hover:underline text-sm mt-1 inline-block">Post a demand →</Link>
            </div>
          ) : myDemands.map((d) => (
            <div key={d._id} className="rounded-xl border bg-card p-4 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{d.title}</p>
                  <p className="text-xs text-muted-foreground capitalize">{d.category} · Max ₹{d.maxBudgetPerDay}/day</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${DEMAND_STATUS_PILL[d.status] || ''}`}>{d.status}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>{new Date(d.fromDate).toLocaleDateString()} → {new Date(d.toDate).toLocaleDateString()}</span>
              </div>
              {d.status === 'fulfilled' && d.fulfilledBy && (
                <Link href={`/resources/item/${d.fulfilledBy._id || d.fulfilledBy}`} className="text-xs text-emerald-500 hover:underline">
                  View fulfilling item →
                </Link>
              )}
              {d.status === 'open' && (
                <button onClick={() => handleCancelDemand(d._id)} className="text-xs text-red-500 hover:underline">Cancel demand</button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── COMMUNITY DEMANDS (FULFILL) ────────────────────────────────────── */}
      {tab === 'community-demands' && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Open demands from your community — fulfill them by linking one of your listed items.</p>
          {publicDemands.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No open demands right now.</p>
            </div>
          ) : publicDemands.map((d) => (
            <div key={d._id} className="rounded-xl border bg-card p-4 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{d.title}</p>
                  <p className="text-xs text-muted-foreground capitalize">{d.category} · Budget ≤ ₹{d.maxBudgetPerDay}/day</p>
                </div>
                <div className="flex items-center gap-1.5">
                  {d.count > 1 && (
                    <span className="text-xs font-bold text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full">
                      🔥 {d.count} people
                    </span>
                  )}
                  <span className="text-xs text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">open</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>{new Date(d.fromDate).toLocaleDateString()} → {new Date(d.toDate).toLocaleDateString()}</span>
                <span className="ml-2">By {d.postedBy?.fullName || 'Member'}</span>
              </div>
              {items.some(i => i.category === d.category) && (
                <button
                  onClick={() => { setFulfillDemand(d); setSelectedResourceId(''); setFulfillError(''); }}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors mt-1"
                >
                  <IndianRupee className="w-3 h-3" /> Fulfill this demand
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── ADD / EDIT ITEM MODAL ────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-background rounded-2xl border shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">{editingItem ? 'Edit listing' : 'Add new listing'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { label: 'Title', name: 'title', type: 'text', required: true },
                { label: 'Description', name: 'description', type: 'textarea', required: true },
                { label: 'Price per day (₹)', name: 'pricePerDay', type: 'number', required: true },
                { label: 'Deposit amount (₹)', name: 'depositAmount', type: 'number', required: true },
                { label: 'Available from', name: 'availableFrom', type: 'date', required: true },
                { label: 'Available to', name: 'availableTo', type: 'date', required: true },
                { label: 'Rules (optional)', name: 'rules', type: 'textarea', required: false },
              ].map((field) => (
                <div key={field.name} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">{field.label}</label>
                    {field.name === 'pricePerDay' && (
                      <button type="button" onClick={handleGetPricing} disabled={isPricingLoading} className="text-xs text-violet-600 hover:text-violet-700 flex items-center gap-1 transition-colors disabled:opacity-50">
                        {isPricingLoading ? <Sparkles className="w-3 h-3 animate-pulse" /> : <Sparkles className="w-3 h-3"/>} 
                        AI Pricing
                      </button>
                    )}
                  </div>
                  {field.type === 'textarea' ? (
                    <textarea name={field.name} required={field.required} value={form[field.name]} onChange={handleFormChange} rows={2}
                      className="w-full p-2.5 rounded-xl border bg-background text-foreground text-sm focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none resize-none" />
                  ) : (
                    <input type={field.type} name={field.name} required={field.required} value={form[field.name]} onChange={handleFormChange}
                      className="w-full p-2.5 rounded-xl border bg-background text-foreground text-sm focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none" />
                  )}
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Category</label>
                  <select name="category" value={form.category} onChange={handleFormChange}
                    className="w-full p-2.5 rounded-xl border bg-background text-foreground text-sm focus:ring-2 focus:ring-amber-500/50 outline-none">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Condition</label>
                  <select name="condition" value={form.condition} onChange={handleFormChange}
                    className="w-full p-2.5 rounded-xl border bg-background text-foreground text-sm focus:ring-2 focus:ring-amber-500/50 outline-none">
                    {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              
              {pricingSuggestion && (
                <div className="p-3 text-sm bg-violet-500/10 border border-violet-500/20 text-violet-700 dark:text-violet-300 rounded-xl space-y-1">
                  <p className="font-semibold flex items-center gap-1"><Sparkles className="w-4 h-4"/> Suggested: ₹{pricingSuggestion.recommendedPrice?.min} - ₹{pricingSuggestion.recommendedPrice?.max}/day</p>
                  <p>{pricingSuggestion.explanation}</p>
                  <p className="text-xs mt-1">💡 Tip: {pricingSuggestion.tip}</p>
                </div>
              )}

              {formError && <p className="text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-lg">{formError}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
                <button type="submit" disabled={formLoading} className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 disabled:opacity-60 transition-colors">
                  {formLoading ? 'Saving...' : editingItem ? 'Save changes' : 'Create listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── FULFILL DEMAND MODAL ─────────────────────────────────────────── */}
      {fulfillDemand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-background rounded-2xl border shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Fulfill Demand</h2>
              <button onClick={() => setFulfillDemand(null)} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <div className="bg-muted rounded-xl p-3 text-sm space-y-1">
              <p className="font-semibold">{fulfillDemand.title}</p>
              <p className="text-muted-foreground capitalize">{fulfillDemand.category} · {new Date(fulfillDemand.fromDate).toLocaleDateString()} – {new Date(fulfillDemand.toDate).toLocaleDateString()}</p>
              <p className="text-muted-foreground">Budget: ≤ ₹{fulfillDemand.maxBudgetPerDay}/day</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Select your item to offer</label>
              <select value={selectedResourceId} onChange={e => setSelectedResourceId(e.target.value)}
                className="w-full p-2.5 rounded-xl border bg-background text-foreground text-sm focus:ring-2 focus:ring-amber-500/50 outline-none">
                <option value="">-- Pick an item --</option>
                {items.filter(i => i.category === fulfillDemand.category).map(i => (
                  <option key={i._id} value={i._id}>{i.title} · ₹{i.pricePerDay}/day</option>
                ))}
              </select>
            </div>
            {fulfillError && <p className="text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-lg">{fulfillError}</p>}
            <div className="flex gap-3">
              <button onClick={() => setFulfillDemand(null)} className="flex-1 py-2.5 rounded-xl border text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
              <button onClick={handleFulfill} disabled={fulfillLoading}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 disabled:opacity-60 transition-colors">
                {fulfillLoading ? 'Submitting...' : 'Fulfill Demand'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
