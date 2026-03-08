"use client";

import { useEffect, useMemo, useState } from "react";
import { Pencil, X } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

const initialProfile = {
  fullName: "",
  email: "",
  phone: "",
  role: "",
  profileImage: "",
  isActive: true,
  isVerified: false,
  address: {
    street: "",
    city: "",
    state: "",
    pincode: "",
  },
};

export default function ProfilePage() {
  const [profile, setProfile] = useState(initialProfile);
  const [editForm, setEditForm] = useState(initialProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [passwordBusy, setPasswordBusy] = useState(false);

  const previewImage = useMemo(() => editForm.profileImage || "", [editForm.profileImage]);

  const normalizeProfile = (user) => ({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    role: user?.role || "",
    profileImage: user?.profileImage || "",
    isActive: Boolean(user?.isActive),
    isVerified: Boolean(user?.isVerified),
    address: {
      street: user?.address?.street || "",
      city: user?.address?.city || "",
      state: user?.address?.state || "",
      pincode: user?.address?.pincode || "",
    },
  });

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        window.location.assign("/landing");
        return;
      }

      const data = await response.json();
      const normalized = normalizeProfile(data.user);
      setProfile(normalized);
      setEditForm(normalized);
    } catch (_err) {
      setError("Unable to load profile details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onEditChange = (event) => {
    const { name, value } = event.target;

    if (["street", "city", "state", "pincode"].includes(name)) {
      setEditForm((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [name]: value,
        },
      }));
      return;
    }

    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const onImageFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = typeof reader.result === "string" ? reader.result : "";
      setEditForm((prev) => ({ ...prev, profileImage: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const startEditing = () => {
    setError("");
    setSuccess("");
    setEditForm(profile);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setEditForm(profile);
    setIsEditing(false);
    setError("");
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      setSaving(true);
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: editForm.fullName,
          phone: editForm.phone,
          profileImage: editForm.profileImage,
          address: editForm.address,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Profile update failed.");
        return;
      }

      const normalized = normalizeProfile(data.user);
      setProfile(normalized);
      setEditForm(normalized);
      setSuccess("Profile updated successfully.");
      setIsEditing(false);
    } catch (_err) {
      setError("Profile update failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const submitChangePassword = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      setPasswordBusy(true);
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(passwordForm),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Password change failed.");
        return;
      }

      setPasswordForm({ currentPassword: "", newPassword: "" });
      setSuccess("Password changed successfully.");
    } catch (_err) {
      setError("Password change failed. Please try again.");
    } finally {
      setPasswordBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-emerald-50 dark:from-background dark:via-background dark:to-background text-foreground transition-colors duration-300">
      <div className="container mx-auto px-4 py-10 md:py-16 max-w-6xl space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm tracking-wide mb-3">
              My Account
            </p>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Profile Settings</h1>
            <p className="text-muted-foreground mt-2">Manage profile photo and account details.</p>
          </div>
          {!isEditing ? (
            <button
              type="button"
              onClick={startEditing}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm hover:bg-muted transition-colors"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </button>
          ) : (
            <button
              type="button"
              onClick={cancelEditing}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          )}
        </div>

        {error ? <div className="p-3 text-sm bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-lg">{error}</div> : null}
        {success ? <div className="p-3 text-sm bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg">{success}</div> : null}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white/70 dark:bg-card border rounded-3xl p-6 md:p-8 shadow-xl backdrop-blur-md">
            <h2 className="text-2xl font-bold mb-1">Profile Details</h2>
            <p className="text-sm text-muted-foreground mb-6">
              {isEditing ? "Edit and save your details." : "Click the pen icon to edit your details."}
            </p>

            <form onSubmit={saveProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Full Name</label>
                  <input name="fullName" value={editForm.fullName} onChange={onEditChange} disabled={!isEditing} className="mt-1 w-full p-3 rounded-xl border bg-background disabled:bg-muted/50" required />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <input value={editForm.email} readOnly className="mt-1 w-full p-3 rounded-xl border bg-muted/50" />
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <input name="phone" value={editForm.phone} onChange={onEditChange} disabled={!isEditing} className="mt-1 w-full p-3 rounded-xl border bg-background disabled:bg-muted/50" required />
                </div>
                <div>
                  <label className="text-sm font-medium">Role</label>
                  <input value={(editForm.role || "").replace(/_/g, " ")} readOnly className="mt-1 w-full p-3 rounded-xl border bg-muted/50 capitalize" />
                </div>
                <div>
                  <label className="text-sm font-medium">Street</label>
                  <input name="street" value={editForm.address.street} onChange={onEditChange} disabled={!isEditing} className="mt-1 w-full p-3 rounded-xl border bg-background disabled:bg-muted/50" />
                </div>
                <div>
                  <label className="text-sm font-medium">City</label>
                  <input name="city" value={editForm.address.city} onChange={onEditChange} disabled={!isEditing} className="mt-1 w-full p-3 rounded-xl border bg-background disabled:bg-muted/50" />
                </div>
                <div>
                  <label className="text-sm font-medium">State</label>
                  <input name="state" value={editForm.address.state} onChange={onEditChange} disabled={!isEditing} className="mt-1 w-full p-3 rounded-xl border bg-background disabled:bg-muted/50" />
                </div>
                <div>
                  <label className="text-sm font-medium">Pincode</label>
                  <input name="pincode" value={editForm.address.pincode} onChange={onEditChange} disabled={!isEditing} className="mt-1 w-full p-3 rounded-xl border bg-background disabled:bg-muted/50" />
                </div>
              </div>

              {isEditing ? (
                <button disabled={saving} className="px-5 py-3 rounded-xl font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-all disabled:opacity-70">
                  {saving ? "Saving..." : "Save Details"}
                </button>
              ) : null}
            </form>
          </div>

          <div className="space-y-6">
            <div className="bg-white/70 dark:bg-card border rounded-3xl p-6 shadow-xl backdrop-blur-md">
              <h3 className="text-xl font-bold mb-3">Profile Picture</h3>
              <div className="w-28 h-28 rounded-full border overflow-hidden bg-muted/40 mb-3">
                {previewImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">No Image</div>
                )}
              </div>
              <input type="file" accept="image/*" onChange={onImageFileChange} disabled={!isEditing} className="w-full text-sm mb-2 disabled:opacity-60" />
              <input
                name="profileImage"
                value={editForm.profileImage}
                onChange={onEditChange}
                disabled={!isEditing}
                placeholder="Or paste image URL"
                className="w-full p-3 rounded-xl border bg-background text-sm disabled:bg-muted/50"
              />
            </div>

            <div className="bg-white/70 dark:bg-card border rounded-3xl p-6 shadow-xl backdrop-blur-md">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Account Status</p>
              <div className="mt-2 space-y-1 text-sm">
                <p>Status: <span className="font-semibold">{profile.isActive ? "Active" : "Inactive"}</span></p>
                <p>Verified: <span className="font-semibold">{profile.isVerified ? "Yes" : "No"}</span></p>
              </div>
            </div>
          </div>
        </div>

        {isEditing ? (
          <div className="bg-white/70 dark:bg-card border rounded-3xl p-6 shadow-xl backdrop-blur-md">
            <h3 className="text-xl font-bold mb-3">Change Password</h3>
            <form onSubmit={submitChangePassword} className="space-y-3 max-w-xl">
              <input
                type="password"
                placeholder="Current password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                className="w-full p-3 rounded-xl border bg-background"
                required
              />
              <input
                type="password"
                placeholder="New password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                className="w-full p-3 rounded-xl border bg-background"
                minLength={6}
                required
              />
              <button disabled={passwordBusy} className="px-4 py-2.5 rounded-xl font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-all disabled:opacity-70">
                {passwordBusy ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        ) : null}
      </div>
    </div>
  );
}
