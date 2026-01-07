'use client';

import { useEffect, useState } from 'react';
import { SvodTable } from '@/components/dashboard/SvodTable';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { fetchSvodData } from '@/services/api';
import type { SvodData } from '@/types/map';
import { LoadingSpinner } from '@/components/shared';

export default function SvodPage() {
  const [data, setData] = useState<SvodData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();
  const darkMode = theme === 'dark';

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const result = await fetchSvodData();
        setData(result);
      } catch (err) {
        console.error('Error loading SVOD data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex-1 flex items-center justify-center h-screen">
          <LoadingSpinner fullPage={false} />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-lg text-red-600">{error}</div>
        </div>
      );
    }

    if (!data || !data.regions || data.regions.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className={cn(
            "text-lg",
            darkMode ? "text-gray-300" : "text-gray-600"
          )}>No data available</div>
        </div>
      );
    }

    return (
      <div className={cn(
        "min-h-[calc(100vh-4rem)] transition-colors duration-200"
      )}>
        <div className="mx-auto">
          <div className={cn(
            "rounded-lg shadow-sm",
            darkMode ? "bg-gray-800" : "bg-white"
          )}>
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <h1 className={cn(
                "text-2xl font-bold",
                darkMode ? "text-white" : "text-gray-900"
              )}>
                MANZIL MA&apos;LUMOTLARI
              </h1>
              <p className={cn(
                "text-sm mt-1",
                darkMode ? "text-gray-400" : "text-gray-600"
              )}>
                {new Date().toLocaleDateString('uz-UZ', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}{' '}
                yil holatiga
              </p>
            </div>

            <div className="p-4">
              <SvodTable data={data.regions} darkMode={darkMode} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-1 w-full h-full overflow-hidden">
      <Sidebar />
      <main className={cn(
        "flex-1 overflow-y-auto p-4 sm:p-6 transition-colors",
        darkMode ? "bg-gray-900" : "bg-blue-50"
      )}>
        {renderContent()}
      </main>
    </div>
  );
}
