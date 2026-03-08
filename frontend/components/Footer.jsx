import Link from 'next/link';
import { Store, HeartPulse, ShoppingBag, Leaf, Wrench, Briefcase } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
              <Store className="h-6 w-6" />
              <span>Local Links</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Your hyper-local digital neighborhood. Connect with verified shops, food donors, skill providers, and emergency networks from one secure platform.
            </p>
          </div>

          {/* Core Modules */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Core Services</h3>
            <ul className="space-y-3 font-medium text-sm text-muted-foreground">
              <li>
                <Link href="/commerce" className="flex items-center gap-2 hover:text-primary transition-colors group">
                  <ShoppingBag className="w-4 h-4 group-hover:scale-110 transition-transform" /> Apartment Commerce
                </Link>
              </li>
              <li>
                <Link href="/food" className="flex items-center gap-2 hover:text-emerald-500 transition-colors group">
                  <Leaf className="w-4 h-4 group-hover:scale-110 transition-transform" /> Food Waste Mgmt
                </Link>
              </li>
              <li>
                <Link href="/resources" className="flex items-center gap-2 hover:text-amber-500 transition-colors group">
                  <Wrench className="w-4 h-4 group-hover:scale-110 transition-transform" /> Shared Resources
                </Link>
              </li>
              <li>
                <Link href="/skills" className="flex items-center gap-2 hover:text-violet-500 transition-colors group">
                  <Briefcase className="w-4 h-4 group-hover:scale-110 transition-transform" /> Skill Exchange
                </Link>
              </li>
              <li>
                <Link href="/emergency" className="flex items-center gap-2 hover:text-rose-500 transition-colors group">
                  <HeartPulse className="w-4 h-4 group-hover:scale-110 transition-transform" /> Emergency Network
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Portals</h3>
            <ul className="space-y-3 font-medium text-sm text-muted-foreground">
              <li><Link href="/dashboard/shopkeeper" className="hover:text-primary transition-colors flex items-center gap-2">Shopkeeper Dashboard</Link></li>
              <li><Link href="/admin" className="hover:text-primary transition-colors flex items-center gap-2">Admin Governance</Link></li>
              <li><Link href="/profile" className="hover:text-primary transition-colors flex items-center gap-2">My Profile</Link></li>
            </ul>
          </div>
          
          {/* Legal / Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Legal & Privacy</h3>
            <ul className="space-y-3 font-medium text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Community Guidelines</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground px-2 gap-4">
          <p>© {new Date().getFullYear()} Local Links Platform. All rights reserved.</p>
          <div className="flex gap-4 font-medium">
            <Link href="#" className="hover:text-foreground transition-colors">Support</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Status Logs</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
