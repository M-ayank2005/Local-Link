"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Wrench,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  BookOpen,
  TrendingUp,
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api/v1';

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

const emptyForm = {
  title: '',
  description: '',
  category: 'drill',
  condition: 'good',
  pricePerDay: '',
  depositAmount: '',
  availableFrom: '',
  availableTo: '',
  rules: '',
};

export default function MyItemsPage() {
  const [items, setItems] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [tab, setTab] = useState('listings');
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [userCoords, setUserCoords] = useState(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  const authHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/resources/my-items`, { headers: authHeaders });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setItems(data.data || []);
    } catch {
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyBookings = async () => {
    try {
      const res = await fetch(`${API_BASE}/bookings/my-bookings`, { headers: authHeaders });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMyBookings(data.data || []);
    } catch {
      setMyBookings([]);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchMyBookings();
    // Grab user location for new listing
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserCoords([pos.coords.longitude, pos.coords.latitude]);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openAdd = () => {
    setEditingItem(null);
    setForm(emptyForm);
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      description: item.description || '',
      category: item.category,
      condition: item.condition,
      pricePerDay: item.pricePerDay,
      depositAmount: item.depositAmount,
      availableFrom: item.availableFrom ? item.availableFrom.split('T')[0] : '',
      availableTo: item.availableTo ? item.availableTo.split('T')[0] : '',
      rules: item.rules || '',
    });
    setFormError('');
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    try {
      const body = {
        ...form,
        pricePerDay: Number(form.pricePerDay),
        depositAmount: Number(form.depositAmount),
        location: {
          type: 'Point',
          coordinates: userCoords || [77.209, 28.6139],
        },
      };
      const url = editingItem
        ? `${API_BASE}/resources/${editingItem._id}`
        : `${API_BASE}/resources`;
      const method = editingItem ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: authHeaders,
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      setShowModal(false);
      fetchItems();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (!confirm('Deactivate this listing?')) return;
    try {
      const res = await fetch(`${API_BASE}/resources/${itemId}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchItems();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReturn = async (bookingId, condition) => {
    try {
      const res = await fetch(`${API_BASE}/bookings/${bookingId}/return`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ condition }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert(data.data.message);
      fetchMyBookings();
    } catch (err) {
      alert(err.message);
    }
  };

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
      <div className="flex bg-muted p-1 rounded-2xl w-fit">
        {['listings', 'my-bookings'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 text-sm font-medium rounded-xl transition-all ${tab === t ? 'bg-background shadow text-amber-500' : 'text-muted-foreground hover:bg-background/50'}`}
          >
            {t === 'listings' ? 'My Listings' : 'My Bookings'}
          </button>
        ))}
      </div>

      {/* Listings tab */}
      {tab === 'listings' && (
        <>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => <div key={i} className="h-20 rounded-xl bg-card border animate-pulse" />)}
            </div>
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
                    <button
                      onClick={() => openEdit(item)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* My Bookings tab */}
      {tab === 'my-bookings' && (
        <div className="space-y-3">
          {myBookings.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No bookings yet.</p>
              <Link href="/resources" className="text-amber-500 hover:underline text-sm mt-1 inline-block">Browse items →</Link>
            </div>
          ) : (
            myBookings.map((b) => (
              <div key={b._id} className="rounded-xl border bg-card p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{b.resource?.title || 'Resource'}</p>
                    <p className="text-xs text-muted-foreground capitalize">{b.resource?.category}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${BOOKING_STATUS_PILL[b.status]}`}>
                    {b.status}
                  </span>
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
                {/* Owner confirm return actions */}
                {b.status === 'confirmed' && (
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleReturn(b._id, 'good')}
                      className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors"
                    >
                      <Check className="w-3 h-3" /> Mark returned (good)
                    </button>
                    <button
                      onClick={() => handleReturn(b._id, 'damaged')}
                      className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                    >
                      <X className="w-3 h-3" /> Mark damaged
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-background rounded-2xl border shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">{editingItem ? 'Edit listing' : 'Add new listing'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                <X className="w-4 h-4" />
              </button>
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
                  <label className="text-sm font-medium">{field.label}</label>
                  {field.type === 'textarea' ? (
                    <textarea
                      name={field.name}
                      required={field.required}
                      value={form[field.name]}
                      onChange={handleFormChange}
                      rows={2}
                      className="w-full p-2.5 rounded-xl border bg-background text-foreground text-sm focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none resize-none"
                    />
                  ) : (
                    <input
                      type={field.type}
                      name={field.name}
                      required={field.required}
                      value={form[field.name]}
                      onChange={handleFormChange}
                      className="w-full p-2.5 rounded-xl border bg-background text-foreground text-sm focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none"
                    />
                  )}
                </div>
              ))}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Category</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleFormChange}
                    className="w-full p-2.5 rounded-xl border bg-background text-foreground text-sm focus:ring-2 focus:ring-amber-500/50 outline-none"
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Condition</label>
                  <select
                    name="condition"
                    value={form.condition}
                    onChange={handleFormChange}
                    className="w-full p-2.5 rounded-xl border bg-background text-foreground text-sm focus:ring-2 focus:ring-amber-500/50 outline-none"
                  >
                    {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {formError && (
                <p className="text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-lg">{formError}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border text-sm font-medium hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 disabled:opacity-60 transition-colors"
                >
                  {formLoading ? 'Saving...' : editingItem ? 'Save changes' : 'Create listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
