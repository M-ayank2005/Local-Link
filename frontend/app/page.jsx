import Link from 'next/link';
import { 
  ShoppingBag, 
  Leaf, 
  Wrench, 
  Briefcase, 
  HeartPulse,
  LayoutDashboard,
  ShieldCheck
} from 'lucide-react';

export default function Home() {
  const modules = [
    {
      title: "Apartment Commerce",
      description: "Order groceries and essentials from nearby verified shops.",
      href: "/commerce",
      icon: <ShoppingBag className="w-8 h-8" />,
      color: "text-primary",
      bgClass: "bg-primary/10 hover:border-primary/50 hover:shadow-primary/5",
      iconBoxClass: "bg-primary/10 text-primary"
    },
    {
      title: "Food Waste Management",
      description: "Platform for restaurants and users to donate surplus food.",
      href: "#", // To be implemented by Aditya
      icon: <Leaf className="w-8 h-8" />,
      color: "text-emerald-500",
      bgClass: "bg-emerald-500/10 hover:border-emerald-500/50 hover:shadow-emerald-500/5",
      iconBoxClass: "bg-emerald-500/10 text-emerald-500"
    },
    {
      title: "Shared Resource Pool",
      description: "Peer-to-peer lending for tools, projectors, tents, etc.",
      href: "#", // To be implemented by Khushal
      icon: <Wrench className="w-8 h-8" />,
      color: "text-amber-500",
      bgClass: "bg-amber-500/10 hover:border-amber-500/50 hover:shadow-amber-500/5",
      iconBoxClass: "bg-amber-500/10 text-amber-500"
    },
    {
      title: "Skill Exchange",
      description: "Hyperlocal marketplace for electricians, tutors, helpers.",
      href: "#", // To be implemented by Lavish
      icon: <Briefcase className="w-8 h-8" />,
      color: "text-violet-500",
      bgClass: "bg-violet-500/10 hover:border-violet-500/50 hover:shadow-violet-500/5",
      iconBoxClass: "bg-violet-500/10 text-violet-500"
    },
    {
      title: "Emergency Network",
      description: "Verified network for blood donors, and oxygen supply.",
      href: "#", // To be implemented by Utkarsh
      icon: <HeartPulse className="w-8 h-8" />,
      color: "text-rose-500",
      bgClass: "bg-rose-500/10 hover:border-rose-500/50 hover:shadow-rose-500/5",
      iconBoxClass: "bg-rose-500/10 text-rose-500"
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center animate-in zoom-in-95 duration-700 fade-in py-16">
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

      <div className="space-y-6 max-w-4xl">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent pb-2">
          Local Links Platform
        </h1>
        <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          Connecting communities to solve real problems through structured, hyperlocal services.
        </p>

        <div className="pt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {modules.map((mod, idx) => (
            <Link key={idx} href={mod.href} className={`group p-6 rounded-2xl border bg-card transition-all duration-300 flex flex-col items-start ${mod.bgClass}`}>
              <div className={`p-3 rounded-xl mb-4 group-hover:scale-110 transition-transform ${mod.iconBoxClass}`}>
                {mod.icon}
              </div>
              <h2 className="text-xl font-bold mb-2">{mod.title}</h2>
              <p className="text-sm text-muted-foreground">{mod.description}</p>
            </Link>
          ))}
        </div>

        {/* Global Admin & Staff Portals Below Module Matrix */}
        <div className="mt-16 pt-8 border-t flex flex-col md:flex-row items-center justify-center gap-6">
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
    </div>
  );
}
