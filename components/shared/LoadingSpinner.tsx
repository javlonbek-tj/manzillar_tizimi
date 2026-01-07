'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

interface LoadingSpinnerProps {
  fullPage?: boolean;
  message?: string;
  className?: string;
}

export function LoadingSpinner({ 
  fullPage = true, 
  message = "Ma'lumotlar yuklanmoqda...", 
  className 
}: LoadingSpinnerProps) {
  const { theme } = useTheme();
  
  const content = (
    <div className={cn(
      "flex flex-col items-center justify-center gap-4 animate-in fade-in duration-500",
      className
    )}>
      <div className="relative">
        {/* Outer glow/pulse */}
        <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl animate-pulse" />
        
        {/* The spinner itself */}
        <Loader2 className={cn(
          "w-12 h-12 animate-spin relative z-10",
          theme === 'dark' ? "text-blue-400" : "text-blue-600"
        )} />
      </div>
      
      {message && (
        <p className={cn(
          "text-sm font-medium tracking-wide animate-pulse",
          theme === 'dark' ? "text-gray-400" : "text-slate-500"
        )}>
          {message}
        </p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className={cn(
        "fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm transition-colors duration-300",
        theme === 'dark' ? "bg-gray-900/40" : "bg-white/40"
      )}>
        {content}
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center w-full h-full min-h-[400px]">
      {content}
    </div>
  );
}
