"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import {
  Eye,
  EyeOff,
  MapPin,
  RefreshCw,
  Store,
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

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

      localStorage.setItem('authToken', data.token);
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
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
    <div className="min-h-screen bg-transparent text-foreground transition-colors duration-300 relative overflow-hidden">
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 dark:bg-primary/20 blur-[120px] pointer-events-none -z-10 animate-pulse" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-purple-400/20 dark:bg-violet-500/10 blur-[100px] pointer-events-none -z-10 animate-pulse delay-1000" />

      <div className="container mx-auto px-4 py-8 md:py-16 max-w-6xl relative z-10 flex items-center justify-center min-h-screen">
        <div className="w-full bg-white/70 dark:bg-card/80 text-card-foreground border rounded-[2.5rem] shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            
            {/* Left Column: Image Splash (Hidden on mobile) */}
            <div className="hidden lg:block relative p-4 bg-primary/5">
              <div className="relative w-full h-full min-h-[600px] rounded-[2rem] overflow-hidden shadow-inner isolate">
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent z-10 mix-blend-overlay" />
                <Image
                   src="/auth-splash.png"
                   alt="Modern Local Ecosystem"
                   fill
                   className="object-cover transition-transform hover:scale-105 duration-[20s] ease-out"
                   priority
                />
                
                <div className="absolute bottom-10 left-10 right-10 z-20 text-white">
                   <div className="flex items-center gap-2 mb-4 bg-white/20 backdrop-blur-md w-max px-4 py-2 rounded-full border border-white/30 text-white shadow-lg">
                      <Store className="w-5 h-5" />
                      <span className="font-bold text-sm tracking-wide">Local Links Platform</span>
                   </div>
                   <h2 className="text-3xl font-bold leading-tight drop-shadow-md">
                     Empowering<br/>Your Neighborhood.
                   </h2>
                   <p className="mt-2 text-white/90 text-sm font-medium drop-shadow-sm max-w-sm">
                     Join thousands of residents, shopkeepers, and local heroes building a stronger, safer, and smarter community together.
                   </p>
                </div>
              </div>
            </div>

            {/* Right Column: Auth Form Container */}
            <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16 relative">
              
              <div className="max-w-md w-full mx-auto">
                <div className="lg:hidden flex items-center gap-2 mb-8 bg-primary/10 w-max px-3 py-1.5 rounded-full text-primary shadow-sm border border-primary/20">
                    <Store className="w-4 h-4" />
                    <span className="font-bold text-xs uppercase tracking-wider">Local Links</span>
                </div>

                <div className="flex bg-muted/80 p-1 rounded-2xl mb-8 relative z-10 border border-gray-200/50 dark:border-gray-800/50">
                  <button
                    onClick={() => switchMode('login')}
                    className={`flex-1 py-2.5 px-4 text-sm font-bold rounded-xl transition-all duration-300 ${mode === 'login' ? 'bg-background shadow-md text-primary' : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'}`}
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => switchMode('signup')}
                    className={`flex-1 py-2.5 px-4 text-sm font-bold rounded-xl transition-all duration-300 ${mode === 'signup' ? 'bg-background shadow-md text-primary' : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'}`}
                  >
                    Sign up
                  </button>
                </div>

                <div className="relative z-10">
                  <h2 className="text-3xl font-extrabold mb-2 tracking-tight text-gray-900 dark:text-white">
                    {mode === 'login' ? 'Welcome back' : 'Create an account'}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-8">
                    {mode === 'login' ? 'Securely login to access your local services.' : 'Join the modern ecosystem today.'}
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {mode === 'signup' && (
                      <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Full Name</label>
                          <input type="text" name="fullName" required value={signupData.fullName} onChange={handleSignupChange} className="w-full p-3.5 rounded-2xl border bg-white dark:bg-gray-900 border-gray-200/80 dark:border-gray-800 shadow-sm text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50" placeholder="John Doe" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Email</label>
                            <input type="email" name="email" required value={signupData.email} onChange={handleSignupChange} className="w-full p-3.5 rounded-2xl border bg-white dark:bg-gray-900 border-gray-200/80 dark:border-gray-800 shadow-sm text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50" placeholder="you@email.com" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Phone</label>
                            <input type="tel" name="phone" required value={signupData.phone} onChange={handleSignupChange} className="w-full p-3.5 rounded-2xl border bg-white dark:bg-gray-900 border-gray-200/80 dark:border-gray-800 shadow-sm text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50" placeholder="+91 9876543210" />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Account Type</label>
                          <select name="role" value={signupData.role} onChange={handleSignupChange} className="w-full p-3.5 rounded-2xl border bg-white dark:bg-gray-900 border-gray-200/80 dark:border-gray-800 shadow-sm text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all appearance-none cursor-pointer">
                            <option value="resident">Resident / Customer</option>
                            <option value="shopkeeper">Shopkeeper / Merchant</option>
                            <option value="ngo">NGO Representative</option>
                            <option value="service_provider">Service Provider</option>
                            <option value="admin">Platform Admin</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Location Status</label>
                          {locationCoords ? (
                            <div className="p-3.5 border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-between text-sm shadow-sm transition-all duration-300">
                              <div className="flex items-center font-semibold"><MapPin className="w-4 h-4 mr-2" /> Coordinates Secured</div>
                              <span className="font-mono text-xs opacity-75">{locationCoords[1].toFixed(4)}, {locationCoords[0].toFixed(4)}</span>
                            </div>
                          ) : (
                            <button type="button" onClick={getUserLocation} disabled={isLocating} className="w-full p-3.5 flex justify-center items-center rounded-2xl border-2 border-dashed border-primary/40 text-primary hover:bg-primary/5 hover:border-primary transition-all text-sm font-bold">
                              {isLocating ? <RefreshCw className="w-5 h-5 mr-3 animate-spin" /> : <MapPin className="w-5 h-5 mr-3" />}
                              {isLocating ? 'Acquiring GPS...' : 'Auto-Detect My Location'}
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {mode === 'login' && (
                      <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Email address</label>
                        <input type="email" name="email" required value={loginData.email} onChange={handleLoginChange} className="w-full p-3.5 rounded-2xl border bg-white dark:bg-gray-900 border-gray-200/80 dark:border-gray-800 shadow-sm text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50" placeholder="you@email.com" />
                      </div>
                    )}

                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</label>
                        {mode === 'login' && (
                           <a href="#" className="text-xs font-bold text-primary hover:text-primary/80 transition-colors">Forgot password?</a>
                        )}
                      </div>
                      <div className="relative">
                        <input type={showPassword ? 'text' : 'password'} name="password" required minLength={6} value={mode === 'login' ? loginData.password : signupData.password} onChange={mode === 'login' ? handleLoginChange : handleSignupChange} className="w-full p-3.5 rounded-2xl border bg-white dark:bg-gray-900 border-gray-200/80 dark:border-gray-800 shadow-sm text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50 pr-12" placeholder="••••••••" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors p-1">
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {errorMessage && (
                      <div className="p-3.5 text-sm font-semibold bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-2xl flex items-center animate-in shake duration-300">
                        {errorMessage}
                      </div>
                    )}

                    <button type="submit" disabled={isLoading} className="w-full p-4 mt-8 rounded-2xl font-bold text-lg tracking-wide text-primary-foreground bg-primary hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:-translate-y-0 disabled:hover:shadow-none transition-all flex justify-center items-center">
                      {isLoading ? <RefreshCw className="w-5 h-5 mr-3 animate-spin" /> : null}
                      {mode === 'login' ? 'Sign In Now' : 'Create Account'}
                    </button>
                  </form>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
