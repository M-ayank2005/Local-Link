import Link from 'next/link';
import {
  ShoppingBag,
  Leaf,
  Wrench,
  Briefcase,
  HeartPulse,
  ShieldCheck,
  CheckCircle2,
  Users,
  MapPin,
  Star,
  ChevronRight
} from 'lucide-react';
import { ScrollReveal } from '@/components/ScrollReveal';

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
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 dark:bg-primary/20 blur-[120px] pointer-events-none -z-10 animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-purple-400/20 dark:bg-violet-500/10 blur-[100px] pointer-events-none -z-10 animate-pulse delay-1000" />
      <div className="absolute top-[40%] left-[60%] w-[20%] h-[20%] rounded-full bg-emerald-400/10 dark:bg-emerald-500/5 blur-[80px] pointer-events-none -z-10" />

      {/* HERO SECTION */}
      <div className="container mx-auto px-4 py-16 md:py-24 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
          <ScrollReveal delay={0.1} className="lg:col-span-3 space-y-6">
            <div className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-xs tracking-widest uppercase shadow-sm border border-primary/20">
              The Next-Generation Neighborhood
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] text-gray-900 dark:text-white">
              The OS for <br className="hidden md:block"/>
              <span className="bg-gradient-to-r from-primary via-violet-500 to-fuchsia-500 bg-clip-text text-transparent drop-shadow-sm">Local Living</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground dark:text-gray-300 leading-relaxed max-w-2xl">
              Welcome to a unified, hyper-local ecosystem. Discover seamless apartment commerce, peer-to-peer resource sharing, skill exchange, and vital emergency networks—all in one secure platform.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-4">
              <Link
                href={signupLink}
                className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] px-8 py-4 rounded-2xl font-bold text-lg text-white bg-primary hover:bg-blue-600 dark:hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_rgba(59,130,246,0.8)] hover:-translate-y-1 scale-100 hover:scale-105 active:scale-95 ring-[0.5px] ring-white/20"
              >
                Get Started
                <ChevronRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </ScrollReveal>

          {/* Hero SVG Illustration */}
          <ScrollReveal delay={0.3} direction="left" className="lg:col-span-2 flex justify-center lg:justify-end relative mt-12 lg:mt-0">
             <div className="relative w-full max-w-md aspect-square rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/40 dark:border-white/10 ring-8 ring-primary/5 transition-transform hover:scale-[1.02] duration-500 bg-gray-900">
               <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent z-10 mix-blend-overlay" />
               <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover">
                 <defs>
                   <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
                     <stop offset="0%" stopColor="#818cf8" />
                     <stop offset="50%" stopColor="#c084fc" />
                     <stop offset="100%" stopColor="#e879f9" />
                   </linearGradient>
                   <linearGradient id="g2" x1="100%" y1="0%" x2="0%" y2="100%">
                     <stop offset="0%" stopColor="#38bdf8" />
                     <stop offset="100%" stopColor="#818cf8" />
                   </linearGradient>
                   <filter id="glow">
                     <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                     <feMerge>
                       <feMergeNode in="coloredBlur"/>
                       <feMergeNode in="SourceGraphic"/>
                     </feMerge>
                   </filter>
                 </defs>
                 <rect width="400" height="400" fill="url(#g1)" opacity="0.1" />
                 
                 <g className="animate-[spin_20s_linear_infinite]" style={{ transformOrigin: '200px 200px' }}>
                   <circle cx="200" cy="200" r="140" fill="none" stroke="url(#g2)" strokeWidth="2" strokeDasharray="10 10" />
                 </g>

                 <g className="animate-[spin_30s_linear_infinite_reverse]" style={{ transformOrigin: '200px 200px' }}>
                   <circle cx="200" cy="200" r="100" fill="none" stroke="url(#g1)" strokeWidth="4" strokeDasharray="20 40" />
                 </g>
                 
                 <g className="animate-pulse">
                   <circle cx="200" cy="200" r="60" fill="url(#g2)" />
                   <circle cx="200" cy="200" r="40" fill="#ffffff" filter="url(#glow)" />
                 </g>

                 <path d="M 200 40 L 200 80 M 200 320 L 200 360 M 40 200 L 80 200 M 320 200 L 360 200" stroke="url(#g1)" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
                 
                 <circle cx="280" cy="120" r="12" fill="#fff" className="animate-bounce" style={{ animationDelay: '0ms' }} />
                 <circle cx="120" cy="120" r="8" fill="#fff" className="animate-bounce" style={{ animationDelay: '200ms' }} />
                 <circle cx="120" cy="280" r="16" fill="#fff" className="animate-bounce" style={{ animationDelay: '400ms' }} />
                 <circle cx="280" cy="280" r="10" fill="#fff" className="animate-bounce" style={{ animationDelay: '600ms' }} />
                 
                 <path d="M 280 120 Q 200 200 120 120" stroke="white" strokeOpacity="0.3" strokeWidth="2" fill="none" />
                 <path d="M 120 280 Q 200 200 280 280" stroke="white" strokeOpacity="0.3" strokeWidth="2" fill="none" />
               </svg>
             </div>
          </ScrollReveal>
        </div>
      </div>

      {/* TRUST & SAFETY BANNER */}
      <div className="bg-primary/5 border-y border-primary/10 py-6">
        <ScrollReveal className="container mx-auto px-4 max-w-7xl flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 text-center md:text-left text-sm font-semibold text-muted-foreground">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-500" />
            <span>100% ID Verified Neighbors</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="w-6 h-6 text-rose-500" />
            <span>Hyper-Local Geofencing</span>
          </div>
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-blue-500" />
            <span>Community Moderated</span>
          </div>
        </ScrollReveal>
      </div>

      {/* HOW IT WORKS */}
      <div className="py-24 container mx-auto px-4 max-w-7xl overflow-hidden">
        <ScrollReveal className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6">How Your Ecosystem Works</h2>
          <p className="text-lg text-muted-foreground">Three simple steps to unlock the full potential of your neighborhood network.</p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          <div className="hidden md:block absolute top-[45%] left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-primary/10 via-primary/40 to-primary/10 -z-10" />
          
          {[
            { step: '01', title: 'Verify Address', desc: 'Securely verify your residency to join your closed community loop.', icon: <MapPin className="w-8 h-8" /> },
            { step: '02', title: 'Discover Services', desc: 'Browse local commerce, request help, or list your own skills locally.', icon: <Users className="w-8 h-8" /> },
            { step: '03', title: 'Engage & Thrive', desc: 'Transact directly, lend items safely, and build a stronger community.', icon: <CheckCircle2 className="w-8 h-8" /> }
          ].map((s, i) => (
            <ScrollReveal key={i} delay={i * 0.2} className="relative flex flex-col items-center text-center group">
              <div className="w-20 h-20 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300 relative z-10 mb-6">
                <span className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shadow-md">
                  {s.step}
                </span>
                {s.icon}
              </div>
              <h3 className="text-xl font-extrabold mb-3">{s.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{s.desc}</p>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* ZIG ZAG / DEEP DIVES */}
      <div className="py-24 bg-gray-50/50 dark:bg-gray-900/20 border-y border-gray-200/50 dark:border-gray-800/50 overflow-hidden">
        <div className="container mx-auto px-4 max-w-7xl space-y-32">
          
          {/* Commerce Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal direction="right" className="order-2 lg:order-1 relative">
              <div className="aspect-video rounded-3xl overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-50 dark:from-blue-900/40 dark:to-indigo-900/20 border border-indigo-100 dark:border-indigo-900/30 flex shadow-2xl relative items-center justify-center">
                 <div className="p-8 text-center transition-transform hover:scale-105 duration-500">
                    <ShoppingBag className="w-24 h-24 mx-auto text-indigo-500 mb-6 drop-shadow-lg" />
                    <h3 className="text-2xl font-bold text-indigo-950 dark:text-indigo-100">Zero-Fee Local Delivery</h3>
                 </div>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="left" className="order-1 lg:order-2 space-y-6">
              <h2 className="text-4xl font-black tracking-tight">Apartment Commerce</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Empower your local economy. Order groceries and essentials directly from the stores right below your apartment complex. Say goodbye to arbitrary app fees and support your neighborhood businesses instantly.
              </p>
              <ul className="space-y-4 pt-4">
                {['Direct integration with nearby shops', 'Community-driven stock requests', 'Instant WhatsApp notifications'].map((tick, i) => (
                  <li key={i} className="flex items-center gap-3 font-medium">
                    <div className="p-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    {tick}
                  </li>
                ))}
              </ul>
            </ScrollReveal>
          </div>

          {/* Resources Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal direction="right" className="space-y-6">
              <h2 className="text-4xl font-black tracking-tight">Shared Resource Pool</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Why buy a power drill you'll only use once? Our peer-to-peer lending system allows you to securely borrow tools, electronics, and gear from verified neighbors who already own them.
              </p>
              <ul className="space-y-4 pt-4">
                {['Secure collateral tracking', 'ID verification required', 'Built-in chat functionality'].map((tick, i) => (
                  <li key={i} className="flex items-center gap-3 font-medium">
                    <div className="p-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    {tick}
                  </li>
                ))}
              </ul>
            </ScrollReveal>
            <ScrollReveal direction="left" delay={0.2} className="relative">
              <div className="aspect-video rounded-3xl overflow-hidden bg-gradient-to-tr from-amber-100 to-orange-50 dark:from-amber-900/40 dark:to-orange-900/20 border border-amber-100 dark:border-amber-900/30 flex shadow-2xl items-center justify-center">
                 <div className="p-8 text-center transition-transform hover:scale-105 duration-500">
                    <Wrench className="w-24 h-24 mx-auto text-amber-500 mb-6 drop-shadow-lg" />
                    <h3 className="text-2xl font-bold text-amber-950 dark:text-amber-100">Borrow, don't buy.</h3>
                 </div>
              </div>
            </ScrollReveal>
          </div>

        </div>
      </div>

      {/* DIRECTORY / MODULES */}
      <div className="py-24 container mx-auto px-4 max-w-7xl overflow-hidden">
        <ScrollReveal className="mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Complete Local OS Capabilities</h2>
          <p className="text-muted-foreground text-lg max-w-2xl">Access all specialized networks tailored exclusively for your complex.</p>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {modules.map((mod, idx) => (
            <ScrollReveal key={idx} delay={idx * 0.1}>
              <Link href={mod.href} className={`group p-6 rounded-2xl border bg-card transition-all duration-300 flex flex-col items-start ${mod.bgClass} h-full`}>
                <div className={`p-4 rounded-xl mb-6 group-hover:scale-110 transition-transform shadow-sm ${mod.iconBoxClass}`}>
                  {mod.icon}
                </div>
                <h3 className="text-lg font-bold mb-3 leading-tight">{mod.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-3">{mod.description}</p>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* STATS BANNER */}
      <div className="bg-primary text-primary-foreground py-16 overflow-hidden">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/20 text-center">
            {[
              { num: '50+', label: 'Connected Neighborhoods' },
              { num: '10k+', label: 'Verified Residents' },
              { num: '5k+', label: 'Items Shared' },
              { num: '100%', label: 'Local Focus' }
            ].map((stat, i) => (
              <ScrollReveal key={i} delay={i * 0.1} y={0} className="px-2">
                <div className="text-4xl md:text-5xl font-black mb-2">{stat.num}</div>
                <div className="text-sm md:text-base opacity-80 font-medium">{stat.label}</div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>

      {/* TESTIMONIALS */}
      <div className="py-24 container mx-auto px-4 max-w-7xl overflow-hidden">
        <ScrollReveal className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6">Loved by Neighbors</h2>
          <p className="text-lg text-muted-foreground">Don't just take our word for it. Here's what your community is saying.</p>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { quote: "Local-Link helped me find a verified electrician in 10 minutes. Absolute lifesaver!", author: "Sarah T.", role: "Resident" },
            { quote: "Our small grocery store's traffic doubled since integrating with the apartment commerce tool.", author: "Mike's Mart", role: "Local Business" },
            { quote: "I safely borrowed a projector for my daughter's birthday instead of buying a new one.", author: "David L.", role: "Resident" }
          ].map((t, idx) => (
            <ScrollReveal key={idx} delay={idx * 0.2} className="h-full">
              <div className="bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/50 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
                <div className="flex gap-1 mb-6 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="fill-current w-5 h-5" />
                  ))}
                </div>
                <p className="text-lg italic font-medium leading-relaxed mb-8 flex-grow">"{t.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-white font-bold text-xl shadow-inner">
                    {t.author.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold">{t.author}</h4>
                    <p className="text-sm text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* FINAL CTA */}
      <div className="py-24 container mx-auto px-4 max-w-5xl text-center">
        <ScrollReveal className="bg-gradient-to-br from-slate-900 to-indigo-900 dark:from-slate-800 dark:to-slate-900 rounded-[3rem] p-12 md:p-20 relative overflow-hidden shadow-2xl">
          <div className="absolute top-[-50%] left-[-20%] w-[100%] h-[200%] bg-white/5 rotate-12 pointer-events-none" />
          <div className="relative z-10 space-y-8">
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight">Ready to meet your neighbors?</h2>
            <p className="text-xl text-indigo-200 max-w-2xl mx-auto font-medium">
              Join thousands already elevating their local living. Free forever for residents.
            </p>
            <div className="pt-8">
              <Link
                href={signupLink}
                className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] px-10 py-5 rounded-2xl font-bold text-xl text-slate-900 bg-white hover:bg-slate-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:-translate-y-1 scale-100 hover:scale-105 active:scale-95"
              >
                Join Now for Free
                <ChevronRight className="ml-2 w-6 h-6" />
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>

    </div>
  );
}
