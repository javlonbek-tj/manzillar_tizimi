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
  onMapReady: (map: Map, L: LeafletModule) => Promise<void>,
  initialBaseMap: keyof typeof baseMaps = 'satellite'
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
        const TRANSPARENT_TILE =
          'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

        if (initialBaseMap === 'satellite') {
          tileLayerRef.current = L.tileLayer(baseMaps.satellite.url, {
            attribution: baseMaps.satellite.attribution,
            subdomains: '',
            maxNativeZoom: 17,
            maxZoom: 18,
            errorTileUrl: TRANSPARENT_TILE,
          }).addTo(map);
        } else {
          tileLayerRef.current = L.tileLayer(baseMaps[initialBaseMap].url, {
            attribution: baseMaps[initialBaseMap].attribution,
            subdomains: 'abcd',
            maxZoom: 20,
          }).addTo(map);
        }

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

      // Avoid requesting higher-zoom satellite tiles that may not exist;
      // use a transparent error tile to prevent 'Map data not yet available' placeholders.
      const TRANSPARENT_TILE =
        'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

      if (newBaseMap === 'satellite') {
        tileLayerRef.current = L.tileLayer(baseMaps[newBaseMap].url, {
          attribution: baseMaps[newBaseMap].attribution,
          subdomains: '',
          // Esri World_Imagery may not have tiles above zoom 17/18 for some areas.
          maxNativeZoom: 17,
          maxZoom: 18,
          errorTileUrl: TRANSPARENT_TILE,
        }).addTo(mapInstance.current);
      } else {
        tileLayerRef.current = L.tileLayer(baseMaps[newBaseMap].url, {
          attribution: baseMaps[newBaseMap].attribution,
          subdomains: 'abcd',
          maxZoom: 20,
        }).addTo(mapInstance.current);
      }
    }
  };

  return {
    mapInstance,
    changeBaseMap,
  };
}
