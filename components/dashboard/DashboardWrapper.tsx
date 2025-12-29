'use client';

import { DashboardContent } from './DashboardContent';
import { useTheme } from '@/contexts/ThemeContext';

export function DashboardWrapper({ initialData }: any) {
  const { theme } = useTheme();
  const darkMode = theme === 'dark';

  return <DashboardContent initialData={initialData} darkMode={darkMode} />;
}
