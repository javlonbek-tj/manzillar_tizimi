'use client';

import { useState, Fragment } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SvodRegion } from '@/types/map';

interface SvodTableProps {
  data: SvodRegion[];
  darkMode: boolean;
}

export function SvodTable({ data, darkMode }: SvodTableProps) {
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(
    new Set()
  );

  const toggleRegion = (regionId: string) => {
    setExpandedRegions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(regionId)) {
        newSet.delete(regionId);
      } else {
        newSet.add(regionId);
      }
      return newSet;
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className={cn(
          darkMode ? "bg-gray-600" : "bg-gray-200"
        )}>
          <tr>
  <th
    scope="col"
    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
      darkMode ? 'text-white' : 'text-gray-900'
    }`}
  >
    Viloyatlar
  </th>

  <th
    scope="col"
    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
      darkMode ? 'text-white' : 'text-gray-900'
    }`}
  >
    Mahallalar
  </th>

  <th
    scope="col"
    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
      darkMode ? 'text-white' : 'text-gray-900'
    }`}
  >
    Ko&apos;chalar
  </th>

  <th
    scope="col"
    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
      darkMode ? 'text-white' : 'text-gray-900'
    }`}
  >
    Ko&apos;chmas mulklar
  </th>
</tr>

        </thead>
        <tbody className={cn(
          "divide-y",
          darkMode ? "bg-gray-800 divide-gray-700" : "bg-white divide-gray-200"
        )}>
          {data.map((region, regionIndex) => {
            const isExpanded = expandedRegions.has(region.id);
            const isEven = regionIndex % 2 === 0;

            return (
              <Fragment key={region.id}>
                {/* Region Row */}
                <tr
                  className={cn(
                    "cursor-pointer transition-colors",
                    darkMode
                      ? isEven
                        ? "bg-gray-800 hover:bg-gray-700"
                        : "bg-gray-750 hover:bg-gray-700"
                      : isEven
                      ? "bg-white hover:bg-blue-50"
                      : "bg-gray-50 hover:bg-blue-50"
                  )}
                  onClick={() => toggleRegion(region.id)}
                >
                  <td className={cn(
                    "px-6 py-4 whitespace-nowrap text-sm font-medium",
                    darkMode ? "text-gray-100" : "text-gray-900"
                  )}>
                    <div className="flex items-center">
                      {isExpanded ? (
                        <ChevronDown className={cn(
                          "h-4 w-4 mr-2",
                          darkMode ? "text-gray-400" : "text-gray-500"
                        )} />
                      ) : (
                        <ChevronRight className={cn(
                          "h-4 w-4 mr-2",
                          darkMode ? "text-gray-400" : "text-gray-500"
                        )} />
                      )}
                      {region.nameUz}
                    </div>
                  </td>
                  <td className={cn(
                    "px-6 py-4 whitespace-nowrap text-sm",
                    darkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    {region.stats.mahallaCount.toLocaleString()}
                  </td>
                  <td className={cn(
                    "px-6 py-4 whitespace-nowrap text-sm",
                    darkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    {region.stats.streetCount.toLocaleString()}
                  </td>
                  <td className={cn(
                    "px-6 py-4 whitespace-nowrap text-sm",
                    darkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    {region.stats.realEstateCount.toLocaleString()}
                  </td>
                </tr>

                {/* District Rows */}
                {isExpanded &&
                  region.districts.map((district) => (
                    <tr
                      key={district.id}
                      className={cn(
                        "transition-colors",
                        darkMode
                          ? "bg-gray-700 hover:bg-gray-650"
                          : "bg-blue-50 hover:bg-blue-100"
                      )}
                    >
                      <td className={cn(
                        "px-6 py-3 whitespace-nowrap text-sm pl-16",
                        darkMode ? "text-gray-200" : "text-gray-900"
                      )}>
                        {district.nameUz}
                      </td>
                      <td className={cn(
                        "px-6 py-3 whitespace-nowrap text-sm",
                        darkMode ? "text-gray-300" : "text-gray-700"
                      )}>
                        {district.stats.mahallaCount.toLocaleString()}
                      </td>
                      <td className={cn(
                        "px-6 py-3 whitespace-nowrap text-sm",
                        darkMode ? "text-gray-300" : "text-gray-700"
                      )}>
                        {district.stats.streetCount.toLocaleString()}
                      </td>
                      <td className={cn(
                        "px-6 py-3 whitespace-nowrap text-sm",
                        darkMode ? "text-gray-300" : "text-gray-700"
                      )}>
                        {district.stats.realEstateCount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
