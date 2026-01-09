"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, BarChart3, User, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";
import { Logo } from "./Logo";

export function Navigation() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { href: "/", label: "Ochiq xarita", icon: Map },
    { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/profile", label: "Admin", icon: User },
  ];

  return (
    <nav
      className={cn(
        "top-0 z-50 sticky backdrop-blur border-b transition-colors",
        theme === "dark"
          ? "bg-gray-800/95 border-gray-700"
          : "bg-white/80 border-slate-200"
      )}
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Logo className="w-auto h-10 sm:h-12 mt-1.5" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                      : theme === "dark"
                      ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <Icon className="mr-2 w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}

            {/* Dark Mode Toggle (Desktop) */}
            <button
              onClick={toggleTheme}
              className={cn(
                "ml-2 p-2.5 rounded-lg transition-all",
                theme === "dark"
                  ? "bg-gray-700 text-yellow-400 hover:bg-gray-600"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 shadow-inner"
              )}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={cn(
          "sm:hidden border-t",
          theme === "dark" ? "border-gray-700" : "border-gray-200"
        )}
      >
        <div className="space-y-1 px-2 pt-2 pb-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 rounded-lg font-medium text-base transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : theme === "dark"
                    ? "text-gray-300 hover:bg-gray-700"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <Icon className="mr-3 w-5 h-5" />
                {item.label}
              </Link>
            );
          })}

          {/* Mobile version */}
          <button
            onClick={toggleTheme}
            className={cn(
              "flex items-center px-3 py-2 rounded-lg w-full font-medium text-base transition-all",
              theme === "dark"
                ? "text-gray-300 hover:bg-gray-700"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            {theme === "dark" ? (
              <>
                <Sun className="mr-3 w-5 h-5" />
                Yorug&#39;i rejim
              </>
            ) : (
              <>
                <Moon className="mr-3 w-5 h-5" />
                Qorong&#39;i rejim
              </>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
