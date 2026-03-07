"use client";

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Leaf,
  Wrench,
  Briefcase,
  HeartPulse,
  LayoutDashboard,
  ShieldCheck,
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/auth';
const LANDING_PAGE_URL = process.env.NEXT_PUBLIC_LANDING_PAGE_URL || '/commerce';

const DEFAULT_ROLE = 'resident';
const DEFAULT_COORDINATES = [77.209, 28.6139];

const initialSignupState = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
};

const initialLoginState = {
  email: '',
  password: '',
};

export default function Home() {
  const [mode, setMode] = useState('login');
  const [signupData, setSignupData] = useState(initialSignupState);
  const [loginData, setLoginData] = useState(initialLoginState);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const endpoint = useMemo(() => {
    return mode === 'login' ? `${API_BASE_URL}/login` : `${API_BASE_URL}/register`;
  }, [mode]);

  const modules = [
    {
      title: 'Apartment Commerce',
      description: 'Order groceries and essentials from nearby verified shops.',
      href: '/commerce',
      icon: <ShoppingBag className="w-8 h-8" />,
      bgClass: 'bg-primary/10 hover:border-primary/50 hover:shadow-primary/5',
      iconBoxClass: 'bg-primary/10 text-primary',
    },
    {
      title: 'Food Waste Management',
      description: 'Platform for restaurants and users to donate surplus food.',
      href: '#',
      icon: <Leaf className="w-8 h-8" />,
      bgClass: 'bg-emerald-500/10 hover:border-emerald-500/50 hover:shadow-emerald-500/5',
      iconBoxClass: 'bg-emerald-500/10 text-emerald-500',
    },
    {
      title: 'Shared Resource Pool',
      description: 'Peer-to-peer lending for tools, projectors, tents, etc.',
      href: '#',
      icon: <Wrench className="w-8 h-8" />,
      bgClass: 'bg-amber-500/10 hover:border-amber-500/50 hover:shadow-amber-500/5',
      iconBoxClass: 'bg-amber-500/10 text-amber-500',
    },
    {
      title: 'Skill Exchange',
      description: 'Hyperlocal marketplace for electricians, tutors, helpers.',
      href: '#',
      icon: <Briefcase className="w-8 h-8" />,
      bgClass: 'bg-violet-500/10 hover:border-violet-500/50 hover:shadow-violet-500/5',
      iconBoxClass: 'bg-violet-500/10 text-violet-500',
    },
    {
      title: 'Emergency Network',
      description: 'Verified network for blood donors, and oxygen supply.',
      href: '#',
      icon: <HeartPulse className="w-8 h-8" />,
      bgClass: 'bg-rose-500/10 hover:border-rose-500/50 hover:shadow-rose-500/5',
      iconBoxClass: 'bg-rose-500/10 text-rose-500',
    },
  ];

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    clearStatus();
    setIsLoading(true);

    try {
      const payload =
        mode === 'login'
          ? {
              email: loginData.email.trim(),
              password: loginData.password,
            }
          : {
              fullName: signupData.fullName.trim(),
              email: signupData.email.trim(),
              phone: signupData.phone.trim(),
              password: signupData.password,
              role: DEFAULT_ROLE,
              location: {
                coordinates: DEFAULT_COORDINATES,
              },
            };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || 'Request failed');
        return;
      }

      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }

      if (mode === 'login') {
        setLoginData(initialLoginState);
      } else {
        setSignupData(initialSignupState);
      }

      window.location.assign(LANDING_PAGE_URL);
    } catch (_error) {
      setErrorMessage('Cannot connect to local API. Start backend on localhost:8000.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page mode-login">
      <div className="orb orb-left" />
      <div className="orb orb-right" />

      <main className="auth-shell">
        <section className="brand-panel">
          <p className="eyebrow">Secure Account Access</p>
          <h1>Welcome to Local Link</h1>
          <p className="form-subtitle">Login/signup merged into your existing Next.js frontend.</p>
        </section>

        <section className="form-panel">
          <div className={`auth-card ${mode === 'signup' ? 'signup-card' : 'login-card'}`}>
            <div className="tab-row" role="tablist" aria-label="Authentication mode">
              <button
                type="button"
                className={mode === 'login' ? 'tab active' : 'tab'}
                onClick={() => switchMode('login')}
              >
                Login
              </button>
              <button
                type="button"
                className={mode === 'signup' ? 'tab active' : 'tab'}
                onClick={() => switchMode('signup')}
              >
                Sign up
              </button>
            </div>

            <h2 className="form-title">{mode === 'login' ? 'Sign in to continue' : 'Create your account'}</h2>

            <form className="auth-form" onSubmit={handleSubmit}>
              {mode === 'signup' ? (
                <>
                  <label>
                    Full name
                    <input
                      type="text"
                      name="fullName"
                      value={signupData.fullName}
                      onChange={handleSignupChange}
                      placeholder="John Doe"
                      autoComplete="name"
                      required
                    />
                  </label>

                  <label>
                    Email
                    <input
                      type="email"
                      name="email"
                      value={signupData.email}
                      onChange={handleSignupChange}
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                    />
                  </label>

                  <label>
                    Phone
                    <input
                      type="tel"
                      name="phone"
                      value={signupData.phone}
                      onChange={handleSignupChange}
                      placeholder="9876543210"
                      autoComplete="tel"
                      required
                    />
                  </label>

                  <label>
                    Password
                    <div className="password-field">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={signupData.password}
                        onChange={handleSignupChange}
                        minLength={6}
                        autoComplete="new-password"
                        required
                      />
                      <button
                        type="button"
                        className="ghost"
                        onClick={() => setShowPassword((previous) => !previous)}
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </label>
                </>
              ) : (
                <>
                  <label>
                    Email
                    <input
                      type="email"
                      name="email"
                      value={loginData.email}
                      onChange={handleLoginChange}
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                    />
                  </label>

                  <label>
                    Password
                    <div className="password-field">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={loginData.password}
                        onChange={handleLoginChange}
                        autoComplete="current-password"
                        required
                      />
                      <button
                        type="button"
                        className="ghost"
                        onClick={() => setShowPassword((previous) => !previous)}
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </label>
                </>
              )}

              <button type="submit" className="submit" disabled={isLoading}>
                {isLoading ? 'Submitting...' : mode === 'login' ? 'Login' : 'Create account'}
              </button>
            </form>

            {errorMessage ? <p className="status error">{errorMessage}</p> : null}
          </div>
        </section>
      </main>

      <section className="p-8 text-center py-16">
        <div className="space-y-6 max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent pb-2">
            Local Links Platform
          </h2>

          <div className="pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {modules.map((mod, idx) => (
              <Link key={idx} href={mod.href} className={`group p-6 rounded-2xl border bg-card transition-all duration-300 flex flex-col items-start ${mod.bgClass}`}>
                <div className={`p-3 rounded-xl mb-4 group-hover:scale-110 transition-transform ${mod.iconBoxClass}`}>
                  {mod.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{mod.title}</h3>
                <p className="text-sm text-muted-foreground">{mod.description}</p>
              </Link>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t flex flex-col md:flex-row items-center justify-center gap-6">
            <Link href="/dashboard/shopkeeper" className="flex items-center text-muted-foreground hover:text-foreground transition-colors group">
              <LayoutDashboard className="w-5 h-5 mr-2 group-hover:text-blue-500 transition-colors" />
              Shopkeeper Portal
            </Link>
            <span className="hidden md:inline text-border">|</span>
            <Link href="/admin" className="flex items-center text-muted-foreground hover:text-foreground transition-colors group">
              <ShieldCheck className="w-5 h-5 mr-2 group-hover:text-emerald-500 transition-colors" />
              Global Admin Dashboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
