
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Map } from "lucide-react";

const sidebarItems = [
  {
    name: "Manzil tuzilmasi",
    href: "/dashboard",
    icon: Map,
  },
  {
    name: "Manzil tahlil",
    href: "/dashboard/svod",
    icon: LayoutDashboard,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex md:flex-shrink-0 ">
      <div className="flex flex-col w-[260px] md:w-80 border-r border-gray-200 dark:border-gray-700 h-full bg-white dark:bg-gray-800">
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto">
          <div className="flex-grow flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              {sidebarItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      isActive
                        ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white",
                      "group flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors duration-150"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "mr-3 flex-shrink-0 h-5 w-5",
                        isActive
                          ? "text-gray-600 dark:text-gray-300"
                          : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
