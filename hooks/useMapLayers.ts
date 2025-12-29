import { useRef } from 'react';
import type { Map, GeoJSON } from 'leaflet';
import type { RegionData, DistrictData, MahallaData } from '@/types/map';

type LayerRefs = {
  regions: GeoJSON | null;
  districts: GeoJSON | null;
  mahallas: GeoJSON | null;
};

export function useMapLayers() {
  const layersRef = useRef<LayerRefs>({
    regions: null,
    districts: null,
    mahallas: null,
  });

  const loadRegionsLayer = async (
    map: Map,
    L: Record<string, unknown> & {
      geoJSON: (data?: unknown, options?: Record<string, unknown>) => GeoJSON;
      marker: (
        latlng: [number, number],
        options?: Record<string, unknown>
      ) => unknown;
      divIcon: (options: Record<string, unknown>) => unknown;
    } & {
      [key: string]: unknown;
    },
    regionsData: RegionData[],
    onRegionClick: (regionId: string) => Promise<void>
  ) => {
    if (layersRef.current.regions) {
      layersRef.current.regions.eachLayer((layer: any) => {
        if (layer.label) map.removeLayer(layer.label);
      });
      map.removeLayer(layersRef.current.regions);
    }

    const regionsLayer = L.geoJSON(null, {
      style: {
        fillColor: '#3b82f6',
        weight: 2,
        opacity: 1,
        color: '#60a5fa',
        fillOpacity: 0,
      },
      onEachFeature: (feature: any, layer: any) => {
        const center =
          feature.properties.center || layer.getBounds().getCenter();
        const label = L.marker([center.coordinates[1], center.coordinates[0]], {
          icon: L.divIcon({
            className: 'region-label',
            html: `<div style="
              color: white;
              font-weight: bold;
              font-size: 14px;
              text-shadow: 2px 2px 4px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.8);
              white-space: nowrap;
              pointer-events: none;
              text-align: center;
            ">${feature.properties.nameUz}</div>`,
            iconSize: [100, 20],
          }),
        }).addTo(map);

        layer.label = label;

        layer.on({
          mouseover: (e: any) => {
            e.target.setStyle({ fillOpacity: 0.15, weight: 3 });
          },
          mouseout: (e: any) => {
            regionsLayer.resetStyle(e.target);
          },
          click: async (e: any) => {
            const regionId = feature.properties.id;
            await onRegionClick(regionId);
          },
        });
      },
    });

    regionsData.forEach((region) => {
      const feature = {
        type: 'Feature' as const,
        properties: {
          id: region.id,
          nameUz: region.nameUz,
          nameRu: region.nameRu,
          code: region.code,
          center: region.center,
        },
        geometry: region.geometry,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      regionsLayer.addData(feature as any);
    });

    regionsLayer.addTo(map);
    layersRef.current.regions = regionsLayer;
  };

  const loadDistrictsLayer = async (
    map: Map,
    L: Record<string, unknown> & {
      geoJSON: (data?: unknown, options?: Record<string, unknown>) => GeoJSON;
      marker: (
        latlng: [number, number],
        options?: Record<string, unknown>
      ) => unknown;
      divIcon: (options: Record<string, unknown>) => unknown;
    } & {
      [key: string]: unknown;
    },
    districtsData: DistrictData[],
    onDistrictClick: (districtId: string) => Promise<void>
  ) => {
    if (layersRef.current.regions) {
      layersRef.current.regions.eachLayer((layer: any) => {
        if (layer.label) map.removeLayer(layer.label);
      });
      map.removeLayer(layersRef.current.regions);
    }

    if (layersRef.current.districts) {
      layersRef.current.districts.eachLayer((layer: any) => {
        if (layer.label) map.removeLayer(layer.label);
      });
      map.removeLayer(layersRef.current.districts);
    }

    const districtsLayer = L.geoJSON(null, {
      style: {
        fillColor: '#10b981',
        weight: 2,
        opacity: 1,
        color: '#34d399',
        fillOpacity: 0,
      },
      onEachFeature: (feature: any, layer: any) => {
        const center =
          feature.properties.center || layer.getBounds().getCenter();
        const centerCoords = (center as { coordinates?: [number, number] })
          ?.coordinates || [0, 0];
        const label = L.marker([centerCoords[1], centerCoords[0]], {
          icon: L.divIcon({
            className: 'district-label',
            html: `<div style="
              color: white;
              font-weight: 600;
              font-size: 12px;
              text-shadow: 1px 1px 3px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.8);
              white-space: nowrap;
              pointer-events: none;
              text-align: center;
            ">${feature.properties.nameUz}</div>`,
            iconSize: [80, 20],
          }),
        }).addTo(map);

        layer.label = label;

        layer.on({
          mouseover: (e: any) => {
            e.target.setStyle({ fillOpacity: 0.15, weight: 3 });
          },
          mouseout: (e: any) => {
            districtsLayer.resetStyle(e.target);
          },
          click: async (e: any) => {
            const districtId = feature.properties.id;
            await onDistrictClick(districtId);
          },
        });
      },
    });

    districtsData.forEach((district) => {
      const feature = {
        type: 'Feature' as const,
        properties: {
          id: district.id,
          nameUz: district.nameUz,
          nameRu: district.nameRu,
          code: district.code,
          center: district.center,
        },
        geometry: district.geometry,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      districtsLayer.addData(feature as any);
    });

    districtsLayer.addTo(map);
    layersRef.current.districts = districtsLayer;
    map.fitBounds(districtsLayer.getBounds());
  };

  const loadMahallasLayer = async (
    map: Map,
    L: Record<string, unknown> & {
      geoJSON: (data?: unknown, options?: Record<string, unknown>) => GeoJSON;
      marker: (
        latlng: [number, number],
        options?: Record<string, unknown>
      ) => unknown;
      divIcon: (options: Record<string, unknown>) => unknown;
    } & {
      [key: string]: unknown;
    },
    mahallasData: MahallaData[]
  ) => {
    if (layersRef.current.districts) {
      layersRef.current.districts.eachLayer((layer: any) => {
        if (layer.label) map.removeLayer(layer.label);
      });
      map.removeLayer(layersRef.current.districts);
    }

    if (layersRef.current.mahallas) {
      layersRef.current.mahallas.eachLayer((layer: any) => {
        if (layer.label) map.removeLayer(layer.label);
      });
      map.removeLayer(layersRef.current.mahallas);
    }

    const mahallasLayer = L.geoJSON(null, {
      style: {
        fillColor: '#f59e0b',
        weight: 1.5,
        opacity: 1,
        color: '#fbbf24',
        fillOpacity: 0,
      },
      onEachFeature: (feature: any, layer: any) => {
        const center =
          feature.properties.center || layer.getBounds().getCenter();
        const centerCoords = (center as { coordinates?: [number, number] })
          ?.coordinates || [0, 0];
        const label = L.marker([centerCoords[1], centerCoords[0]], {
          icon: L.divIcon({
            className: 'mahalla-label',
            html: `<div style="
              color: white;
              font-weight: 500;
              font-size: 10px;
              text-shadow: 1px 1px 2px rgba(0,0,0,0.8), -1px -1px 1px rgba(0,0,0,0.8);
              white-space: nowrap;
              pointer-events: none;
              text-align: center;
            ">${feature.properties.nameUz}</div>`,
            iconSize: [60, 20],
          }),
        }).addTo(map);

        layer.label = label;

        layer.on({
          mouseover: (e: any) => {
            e.target.setStyle({ fillOpacity: 0.15, weight: 2.5 });
          },
          mouseout: (e: any) => {
            mahallasLayer.resetStyle(e.target);
          },
        });

        layer.bindPopup(`
          <div style="color: #fff; background: #1f2937; padding: 8px; border-radius: 4px;">
            <strong>${feature.properties.nameUz}</strong>
            ${
              feature.properties.nameRu
                ? `<br/>${feature.properties.nameRu}`
                : ''
            }
          </div>
        `);
      },
    });

    mahallasData.forEach((mahalla) => {
      const feature = {
        type: 'Feature' as const,
        properties: {
          id: mahalla.id,
          nameUz: mahalla.nameUz,
          nameRu: mahalla.nameRu,
          code: mahalla.code,
          center: mahalla.center,
        },
        geometry: mahalla.geometry,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mahallasLayer.addData(feature as any);
    });

    mahallasLayer.addTo(map);
    layersRef.current.mahallas = mahallasLayer;
    map.fitBounds(mahallasLayer.getBounds());
  };

  const clearLayers = (map: Map) => {
    if (layersRef.current.districts) {
      layersRef.current.districts.eachLayer((layer: any) => {
        if (layer.label) map.removeLayer(layer.label);
      });
      map.removeLayer(layersRef.current.districts);
      layersRef.current.districts = null;
    }
    if (layersRef.current.mahallas) {
      layersRef.current.mahallas.eachLayer((layer: any) => {
        if (layer.label) map.removeLayer(layer.label);
      });
      map.removeLayer(layersRef.current.mahallas);
      layersRef.current.mahallas = null;
    }
  };

  const getLayer = (type: 'regions' | 'districts' | 'mahallas') => {
    return layersRef.current[type];
  };

  return {
    layersRef,
    loadRegionsLayer,
    loadDistrictsLayer,
    loadMahallasLayer,
    clearLayers,
    getLayer,
  };
}
