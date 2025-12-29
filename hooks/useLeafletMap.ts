import { useEffect, useRef } from 'react';
import type { Map, TileLayer } from 'leaflet';
import { baseMaps } from '@/services/baseMaps';

// Type for dynamically imported Leaflet module
type LeafletModule = {
  map: (element: HTMLElement, options?: Record<string, unknown>) => Map;
  tileLayer: (url: string, options?: Record<string, unknown>) => TileLayer;
  [key: string]: unknown;
};

export function useLeafletMap(
  mapRef: React.RefObject<HTMLDivElement | null>,
  onMapReady: (map: Map, L: LeafletModule) => Promise<void>
) {
  const mapInstance = useRef<Map | null>(null);
  const tileLayerRef = useRef<TileLayer | null>(null);
  const onMapReadyRef = useRef(onMapReady);

  // Keep callback ref updated
  useEffect(() => {
    onMapReadyRef.current = onMapReady;
  }, [onMapReady]);

  useEffect(() => {
    const loadLeaflet = async () => {
      if (typeof window === 'undefined') return;

      const L = (await import('leaflet')).default;

      if (!mapInstance.current && mapRef.current) {
        const map = L.map(mapRef.current, {
          center: [41.377491, 64.585262],
          zoom: 6,
          minZoom: 5,
          maxZoom: 18,
          zoomControl: true,
          doubleClickZoom: true,
          touchZoom: true,
          dragging: true,
        });

        // Initial tile layer
        tileLayerRef.current = L.tileLayer(baseMaps.dark.url, {
          attribution: baseMaps.dark.attribution,
          subdomains: 'abcd',
          maxZoom: 20,
        }).addTo(map);

        mapInstance.current = map;
        await onMapReadyRef.current(map, L);
      }
    };

    loadLeaflet();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [mapRef]);

  const changeBaseMap = async (newBaseMap: keyof typeof baseMaps) => {
    if (mapInstance.current && tileLayerRef.current) {
      const L = (await import('leaflet')).default;

      mapInstance.current.removeLayer(tileLayerRef.current);

      tileLayerRef.current = L.tileLayer(baseMaps[newBaseMap].url, {
        attribution: baseMaps[newBaseMap].attribution,
        subdomains: newBaseMap === 'satellite' ? '' : 'abcd',
        maxZoom: 20,
      }).addTo(mapInstance.current);
    }
  };

  return {
    mapInstance,
    changeBaseMap,
  };
}
