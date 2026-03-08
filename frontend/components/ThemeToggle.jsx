"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, User, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userName, setUserName] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      if (pathname === "/login" || pathname === "/auth") {
        setUserName("");
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          setUserName("");
          return;
        }

        const data = await response.json();
        const fullName = data?.user?.fullName || "";
        setUserName(fullName.trim());
      } catch (_error) {
        setUserName("");
      }
    };

    loadUser();
  }, [API_BASE_URL, pathname]);

  if (!mounted) return <div className="w-9 h-9" />;

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (_error) {
      // Ignore logout API failures and still navigate to landing.
    } finally {
      setIsLoggingOut(false);
      setUserName("");
      router.replace("/landing");
      router.refresh();
    }
  };

  const showSignupButton = pathname === "/landing" && !userName;
  const showAccountButtons = pathname !== "/landing" && pathname !== "/login" && !!userName;

  return (
    <div className="flex items-center gap-2">
      {showSignupButton ? (
        <Link
          href="/login?mode=signup"
          className="px-3 py-1.5 rounded-md border text-sm hover:bg-muted transition-colors"
        >
          Signup
        </Link>
      ) : null}
      {showAccountButtons ? (
        <div className="flex items-center gap-2 mr-2 border-r border-gray-200 dark:border-gray-800 pr-4">
          <Link
            href="/profile"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-all shadow-sm"
            title={userName ? `Profile (${userName})` : "Profile"}
          >
            <User className="w-5 h-5" />
          </Link>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors disabled:opacity-50"
            title="Logout"
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      ) : null}
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="p-2 rounded-md hover:bg-muted transition-colors"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </button>
    </div>
  );
}
