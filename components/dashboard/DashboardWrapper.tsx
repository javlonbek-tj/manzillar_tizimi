// components/dashboard/DashboardWrapper.tsx
"use client";

import { DashboardContent } from "./DashboardContent";
import { useTheme } from "@/contexts/ThemeContext";
import { Sidebar } from "./Sidebar";
import { cn } from "@/lib/utils";

export function DashboardWrapper({ initialData }: { initialData: any }) {
  const { theme } = useTheme();
  const darkMode = theme === "dark";

  return (
    <div className="flex flex-1 w-full h-full overflow-hidden">
      <Sidebar />
      <main
        className={cn(
          "flex-1 overflow-y-auto p-4 sm:p-6 transition-colors",
          darkMode ? "bg-gray-900" : "bg-blue-50"
        )}
      >
        <DashboardContent initialData={initialData} darkMode={darkMode} />
      </main>
    </div>
  );
}
