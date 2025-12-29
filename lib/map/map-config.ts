// lib/map.ts
import L from 'leaflet';

export const MAP_CONFIG = {
  defaultCenter: { lat: 41.3111, lng: 64.5852 },
  defaultZoom: 6,
  zoomThresholds: {
    regions: 0,
    districts: 8,
    mahallas: 10,
    streets: 13,
  },
  styles: {
    regions: {
      color: '#3b82f6',
      fillColor: '#3b82f6',
      fillOpacity: 0.08,
      weight: 2,
      opacity: 0.9,
    },
    regionsHover: { fillOpacity: 0.25, weight: 3 },
    districts: {
      color: '#10b981',
      fillColor: '#10b981',
      fillOpacity: 0.06,
      weight: 3,
      opacity: 0.85,
    },
    districtsHover: { fillOpacity: 0.25, weight: 3.5 },
    mahallas: {
      color: '#f59e0b',
      fillColor: '#f59e0b',
      fillOpacity: 0.06,
      weight: 1,
      opacity: 0.7,
    },
    mahallasHover: { fillOpacity: 0.22, weight: 2.5 },
    streets: { color: '#ef4444', weight: 1.5, opacity: 0.8 },
    streetsHover: { weight: 2.5, opacity: 1 },
  },
  maxBounds: [
    [37.0, 56.0],
    [46.0, 73.0],
  ],
  minZoom: 5,
  maxZoom: 18,
} as const;

export type LayerType = 'regions' | 'districts' | 'mahallas' | 'streets';

export function shouldShowLayer(layerType: LayerType, currentZoom: number) {
  return currentZoom >= MAP_CONFIG.zoomThresholds[layerType];
}

/** Tooltip class names */
export const TOOLTIP_CLASSES = {
  region:
    'region-label text-sm font-semibold text-blue-800 bg-white bg-opacity-85 rounded px-1 py-0.5 pointer-events-none',
  district:
    'district-label text-xs font-medium text-green-800 bg-white bg-opacity-85 rounded px-1 py-0.5 pointer-events-none',
  mahalla:
    'mahalla-label text-xs font-medium text-purple-800 bg-white bg-opacity-85 rounded px-1 py-0.5 pointer-events-none',
  street:
    'street-label text-xs font-medium text-red-800 bg-white bg-opacity-85 rounded px-1 py-0.5 pointer-events-none',
} as const;

/** Render popup HTML */
export function renderPopup(title: string, details: Record<string, any>) {
  return `
    <div class="p-2 space-y-1">
      <h3 class="font-bold text-lg text-blue-700">${title}</h3>
      ${Object.entries(details)
        .map(
          ([k, v]) =>
            `<div class="text-sm text-gray-700"><span class="font-medium">${k}:</span> ${v}</div>`
        )
        .join('')}
    </div>
  `;
}

/** Add tooltip to a layer */
export function addTooltip(layer: L.Layer, text: string, className: string) {
  layer
    .bindTooltip(String(text), {
      permanent: true,
      direction: 'center',
      className,
      offset: [0, 0],
    })
    .openTooltip();
}
