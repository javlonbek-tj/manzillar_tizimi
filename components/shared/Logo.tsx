"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  const { theme } = useTheme();

  return (
    <svg
      width="180"
      height="40"
      viewBox="0 0 600 120"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("transition-colors duration-200", className)}
    >
      <style>
        {`
        .logo-text {
          font-family: "Comic Sans MS", "Brush Script MT", "Segoe Script", cursive;
          font-size: 72px;
          font-weight: 500;
          letter-spacing: 2px;
          fill: ${theme === "dark" ? "#FFFFFF" : "#000000"};
        }
        `}
      </style>

      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        className="logo-text"
      >
        Manzillar tizimi
      </text>
    </svg>
  );
}
