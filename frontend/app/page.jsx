import Link from 'next/link';
import { cookies } from 'next/headers';
import {
  ShoppingBag,
  Leaf,
  Wrench,
  Briefcase,
  HeartPulse,
  LayoutDashboard,
  ShieldCheck,
} from 'lucide-react';

const SERVER_API_BASE = process.env.BACKEND_URL || 'http://localhost:5000/api';

async function checkAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return false;
  try {
    const res = await fetch(`${SERVER_API_BASE}/auth/me`, {
      method: 'GET',
      headers: { Cookie: `token=${token}` },
      cache: 'no-store'
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}

export default async function RootHomePage(props) {
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
      href: '/food',
      icon: <Leaf className="w-8 h-8" />,
      bgClass: 'bg-emerald-500/10 hover:border-emerald-500/50 hover:shadow-emerald-500/5',
      iconBoxClass: 'bg-emerald-500/10 text-emerald-500',
    },
    {
      title: 'Shared Resource Pool',
      description: 'Peer-to-peer lending for tools, projectors, tents, etc.',
      href: '/resources',
      icon: <Wrench className="w-8 h-8" />,
      bgClass: 'bg-amber-500/10 hover:border-amber-500/50 hover:shadow-amber-500/5',
      iconBoxClass: 'bg-amber-500/10 text-amber-500',
    },
    {
      title: 'Skill Exchange',
      description: 'Hyperlocal marketplace for electricians, tutors, helpers.',
      href: '/skills',
      icon: <Briefcase className="w-8 h-8" />,
      bgClass: 'bg-violet-500/10 hover:border-violet-500/50 hover:shadow-violet-500/5',
      iconBoxClass: 'bg-violet-500/10 text-violet-500',
    },
    {
      title: 'Emergency Network',
      description: 'Verified network for blood donors and oxygen supply.',
      href: '/emergency',
      icon: <HeartPulse className="w-8 h-8" />,
      bgClass: 'bg-rose-500/10 hover:border-rose-500/50 hover:shadow-rose-500/5',
      iconBoxClass: 'bg-rose-500/10 text-rose-500',
    },
  ];

  return (
    <div className="min-h-screen bg-transparent text-foreground transition-colors duration-300 relative overflow-hidden">
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 dark:bg-primary/20 blur-[120px] pointer-events-none -z-10 animate-pulse" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-purple-400/20 dark:bg-violet-500/10 blur-[100px] pointer-events-none -z-10 animate-pulse delay-1000" />

      <div className="container mx-auto px-4 py-12 md:py-24 max-w-7xl inset-0 z-10 relative">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center mb-16">
          <div className="lg:col-span-3 space-y-2">
            <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-xs tracking-widest uppercase mb-4 shadow-sm border border-primary/20">
              Your Personal Dashboard
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] text-gray-900 dark:text-white">
              Welcome Back to <br className="hidden md:block"/>
              <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent drop-shadow-sm">Your Community</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mt-6">
              Access your centralized neighborhood hub. Navigate seamlessly between marketplace orders, service bookings, resource sharing, and verified emergency feeds.
            </p>
          </div>
        </div>

        <section className="pt-6 border-t">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Our Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {modules.map((mod, idx) => (
                <Link key={idx} href={mod.href} className={`group p-6 rounded-2xl border bg-card transition-all duration-300 flex flex-col items-start ${mod.bgClass}`}>
                  <div className={`p-3 rounded-xl mb-4 group-hover:scale-110 transition-transform shadow-sm ${mod.iconBoxClass}`}>
                    {mod.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-2 leading-tight">{mod.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3">{mod.description}</p>
                </Link>
              ))}
            </div>

            <div className="mt-12 pt-8 flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/dashboard/shopkeeper" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group">
                <LayoutDashboard className="w-4 h-4 mr-2 group-hover:text-primary transition-colors" />
                Shopkeeper Portal
              </Link>
              <span className="hidden sm:inline border-r h-4" />
              <Link href="/admin" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group">
                <ShieldCheck className="w-4 h-4 mr-2 group-hover:text-emerald-500 transition-colors" />
                Admin Home
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
