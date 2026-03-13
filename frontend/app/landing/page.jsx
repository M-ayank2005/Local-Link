import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingBag,
  Leaf,
  Wrench,
  Briefcase,
  HeartPulse,
} from 'lucide-react';

export default async function LandingPage({ searchParams }) {
  const params = await searchParams;
  const nextPath = params?.next ? String(params.next) : '/';
  const signupLink = `/login?mode=signup&next=${encodeURIComponent(nextPath)}`;
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
      description: 'Verified network for blood donors and oxygen supply.',
      href: '#',
      icon: <HeartPulse className="w-8 h-8" />,
      bgClass: 'bg-rose-500/10 hover:border-rose-500/50 hover:shadow-rose-500/5',
      iconBoxClass: 'bg-rose-500/10 text-rose-500',
    },
  ];

  return (
    <div className="min-h-screen bg-transparent text-foreground transition-colors duration-300 relative overflow-hidden">
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 dark:bg-primary/20 blur-[120px] pointer-events-none -z-10 animate-pulse" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-purple-400/20 dark:bg-violet-500/10 blur-[100px] pointer-events-none -z-10 animate-pulse delay-1000" />

      <div className="container mx-auto px-4 py-12 md:py-24 max-w-7xl inset-0 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center mb-16">
          <div className="lg:col-span-3 space-y-2">
            <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-xs tracking-widest uppercase mb-4 shadow-sm border border-primary/20">
              The Next-Generation Neighborhood
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] text-gray-900 dark:text-white">
              Elevate Your <br className="hidden md:block"/>
              <span className="bg-gradient-to-r from-primary via-violet-500 to-fuchsia-500 bg-clip-text text-transparent drop-shadow-sm">Local Living</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mt-6 mb-8">
              Welcome to a unified, hyper-local ecosystem. Discover seamless apartment commerce, peer-to-peer resource sharing, skill exchange, and vital emergency networks—all in one secure platform.
            </p>
            <div className="pt-4">
              <Link
                href={signupLink}
                className="inline-flex items-center px-8 py-4 rounded-2xl font-bold text-lg text-primary-foreground bg-primary hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5"
              >
                Join Your Community
              </Link>
            </div>
          </div>

          {/* Hero Image */}
          <div className="lg:col-span-2 hidden lg:flex justify-end relative">
             <div className="relative w-full max-w-md aspect-square rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/40 dark:border-white/10 ring-8 ring-primary/5 transition-transform hover:scale-[1.02] duration-500">
               <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent z-10 mix-blend-overlay" />
               <Image 
                  src="/hero.png" 
                  alt="Modern Neighborhood Community" 
                  fill 
                  className="object-cover" 
                  priority 
               />
             </div>
          </div>
        </div>

        <section className="pt-6 border-t">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Available Services</h2>
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
          </div>
        </section>
      </div>
    </div>
  );
}
