"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Eye,
  EyeOff,
  MapPin,
  RefreshCw,
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/api';

const initialSignupState = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  role: 'resident',
  address: '',
};

const initialLoginState = {
  email: '',
  password: '',
};

export function AuthPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryMode = searchParams.get('mode');
  const initialMode = queryMode === 'signup' ? 'signup' : 'login';

  const [mode, setMode] = useState(initialMode);
  const [signupData, setSignupData] = useState(initialSignupState);
  const [loginData, setLoginData] = useState(initialLoginState);

  const [locationCoords, setLocationCoords] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const endpoint = useMemo(() => {
    return mode === 'login' ? `${API_BASE_URL}/auth/login` : `${API_BASE_URL}/auth/register`;
  }, [mode]);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          method: 'GET',
          credentials: 'include',
        });
        if (response.ok) {
          const nextPath = searchParams.get('next') || '/';
          router.replace(nextPath);
          router.refresh();
        }
      } catch (_error) {
        // No active session; user stays on login page.
      }
    };

    checkSession();
  }, [router, searchParams]);

  const clearStatus = () => setErrorMessage('');

  const handleSignupChange = (event) => {
    const { name, value } = event.target;
    setSignupData((previous) => ({ ...previous, [name]: value }));
  };

  const handleLoginChange = (event) => {
    const { name, value } = event.target;
    setLoginData((previous) => ({ ...previous, [name]: value }));
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setShowPassword(false);
    clearStatus();
  };

  const getUserLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationCoords([position.coords.longitude, position.coords.latitude]);
          setIsLocating(false);
        },
        (_error) => {
          setErrorMessage('Failed to acquire exact coordinates. Please ensure location permissions are enabled.');
          setIsLocating(false);
        }
      );
    } else {
      setErrorMessage('Geolocation is not supported by your browser.');
      setIsLocating(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    clearStatus();

    if (mode === 'signup' && !locationCoords) {
      setErrorMessage('Please capture your coordinates before registering.');
      return;
    }

    setIsLoading(true);

    try {
      const payload = mode === 'login'
        ? {
            email: loginData.email.trim(),
            password: loginData.password,
          }
        : {
            fullName: signupData.fullName.trim(),
            email: signupData.email.trim(),
            phone: signupData.phone.trim(),
            password: signupData.password,
            role: signupData.role,
            address: { street: signupData.address },
            location: {
              coordinates: locationCoords,
            },
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || 'Authentication request failed');
        return;
      }

      if (mode === 'login') {
        setLoginData(initialLoginState);
      } else {
        setSignupData(initialSignupState);
      }

      const nextPath = searchParams.get('next') || '/';
      router.replace(nextPath);
      router.refresh();
    } catch (_error) {
      setErrorMessage(`Cannot connect to local API: ${endpoint}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-emerald-50 dark:from-background dark:via-background dark:to-background text-foreground transition-colors duration-300">
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 dark:bg-primary/20 blur-[120px] pointer-events-none -z-10 animate-pulse" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-purple-400/20 dark:bg-violet-500/10 blur-[100px] pointer-events-none -z-10 animate-pulse delay-1000" />

      <div className="container mx-auto px-4 py-12 md:py-24 max-w-7xl inset-0 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center mb-24">
          <div className="lg:col-span-3 space-y-6">
            <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm tracking-wide mb-2">
              Secure Account Access
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
              Welcome to <span className="bg-gray-900/40 bg-clip-text text-transparent">Local Link</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
              Connect to your hyper-local community. One unified account granting you access across neighborhood services.
            </p>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white/70 dark:bg-card text-card-foreground border rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden group backdrop-blur-md">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none origin-bottom group-hover:scale-110 transition-transform duration-700" />

              <div className="flex bg-muted p-1 rounded-2xl mb-8 relative z-10">
                <button
                  onClick={() => switchMode('login')}
                  className={`flex-1 py-2.5 px-4 text-sm font-bold rounded-xl transition-all duration-300 ${mode === 'login' ? 'bg-background shadow-md text-primary' : 'text-muted-foreground hover:bg-background/50'}`}
                >
                  Log in
                </button>
                <button
                  onClick={() => switchMode('signup')}
                  className={`flex-1 py-2.5 px-4 text-sm font-bold rounded-xl transition-all duration-300 ${mode === 'signup' ? 'bg-background shadow-md text-primary' : 'text-muted-foreground hover:bg-background/50'}`}
                >
                  Sign up
                </button>
              </div>

              <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-2">
                  {mode === 'login' ? 'Sign in to continue' : 'Create an account'}
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  {mode === 'login' ? 'Welcome back! Please enter your details.' : 'Join the Local Link community today.'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === 'signup' && (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Full Name</label>
                        <input type="text" name="fullName" required value={signupData.fullName} onChange={handleSignupChange} className="w-full p-3 rounded-xl border bg-background text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/60" placeholder="Your full name" />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium">Email</label>
                          <input type="email" name="email" required value={signupData.email} onChange={handleSignupChange} className="w-full p-3 rounded-xl border bg-background text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/60" placeholder="you@email.com" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium">Phone</label>
                          <input type="tel" name="phone" required value={signupData.phone} onChange={handleSignupChange} className="w-full p-3 rounded-xl border bg-background text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/60" placeholder="+91 9876543210" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Account Type</label>
                        <select name="role" value={signupData.role} onChange={handleSignupChange} className="w-full p-3 rounded-xl border bg-background text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all">
                          <option value="resident">Resident / Customer</option>
                          <option value="shopkeeper">Shopkeeper / Merchant</option>
                          <option value="ngo">NGO Representative</option>
                          <option value="service_provider">Service Provider</option>
                          <option value="admin">Platform Admin</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Location Setting</label>
                        {locationCoords ? (
                          <div className="p-3 border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-between text-sm">
                            <div className="flex items-center"><MapPin className="w-4 h-4 mr-2" /> Got Location</div>
                            <span className="font-mono text-xs opacity-75">{locationCoords[1].toFixed(4)}, {locationCoords[0].toFixed(4)}</span>
                          </div>
                        ) : (
                          <button type="button" onClick={getUserLocation} disabled={isLocating} className="w-full p-3 flex justify-center items-center rounded-xl border border-primary text-primary hover:bg-primary/5 transition-colors text-sm font-medium">
                            {isLocating ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <MapPin className="w-4 h-4 mr-2" />}
                            {isLocating ? 'Detecting...' : 'Auto-detect coordinates'}
                          </button>
                        )}
                      </div>
                    </>
                  )}

                  {mode === 'login' && (
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Email address</label>
                      <input type="email" name="email" required value={loginData.email} onChange={handleLoginChange} className="w-full p-3 rounded-xl border bg-background text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/60" placeholder="you@email.com" />
                    </div>
                  )}

                  <div className="space-y-1.5 pt-1">
                    <label className="text-sm font-medium">Password</label>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} name="password" required minLength={6} value={mode === 'login' ? loginData.password : signupData.password} onChange={mode === 'login' ? handleLoginChange : handleSignupChange} className="w-full p-3 rounded-xl border bg-background text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/60 pr-12" placeholder="••••••••" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="p-3 mt-4 text-sm font-medium bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-lg flex items-center">
                      {errorMessage}
                    </div>
                  )}

                  <button type="submit" disabled={isLoading} className="w-full p-3.5 mt-4 rounded-xl font-bold text-primary-foreground bg-primary hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:-translate-y-0 disabled:hover:shadow-none transition-all flex justify-center items-center">
                    {isLoading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                    {mode === 'login' ? 'Sign In Now' : 'Create Account'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
