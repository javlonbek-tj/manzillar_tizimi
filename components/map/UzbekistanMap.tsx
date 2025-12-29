'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Loader2Icon } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import type { Map } from 'leaflet';
import type { RegionData, DistrictData, MahallaData } from '@/types/map';
import type { BaseMapKey } from '@/services/baseMaps';

import { useLeafletMap } from '@/hooks/useLeafletMap';
import { useMapData } from '@/hooks/useMapData';
import { useMapLayers } from '@/hooks/useMapLayers';
import { useDynamicStats } from '@/hooks/useDynamicStats';

import { MapContainer } from './MapContainer';
import { BaseMapSwitcher } from './BaseMapSwitcher';
import { StatsPanel } from './StatsPanel';
import { Legend } from './Legend';
import { ResetViewButton } from './ResetViewButton';
import { Sidebar } from '@/components/sidebar/Sidebar';

type SidebarLevel = 'regions' | 'districts' | 'mahallas';

const UzbekistanMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const [sidebarLevel, setSidebarLevel] = useState<SidebarLevel>('regions');
  const [selectedRegion, setSelectedRegion] = useState<RegionData | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictData | null>(
    null
  );
  const [selectedMahalla, setSelectedMahalla] = useState<MahallaData | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [baseMap, setBaseMap] = useState<BaseMapKey>('dark');

  const {
    regions,
    districts,
    mahallas,
    loading,
    loadingDistricts,
    loadingMahallas,
    loadDistricts,
    loadMahallas,
    resetData,
  } = useMapData();

  const {
    loadRegionsLayer,
    loadDistrictsLayer,
    loadMahallasLayer,
    clearLayers,
    getLayer,
  } = useMapLayers();

  const { stats, loading: statsLoading } = useDynamicStats(
    selectedRegion,
    selectedDistrict,
    districts,
    mahallas
  );

  const [mapReady, setMapReady] = useState(false);
  const [regionsLayerLoaded, setRegionsLayerLoaded] = useState(false);

  const { changeBaseMap: changeBaseMapInternal } = useLeafletMap(
    mapRef,
    async (map) => {
      mapInstanceRef.current = map;
      setMapReady(true);
    }
  );

  const handleDistrictClick = useCallback(
    async (districtId: string) => {
      const L = (await import('leaflet')).default as unknown as Parameters<
        typeof loadMahallasLayer
      >[1];
      const map = mapInstanceRef.current;
      if (!map) return;

      let district = districts.find((d) => d.id === districtId);

      if (!district && getLayer('districts')) {
        const layers = getLayer('districts')?.getLayers() || [];
        const layer = layers.find((l) => {
          const layerWithFeature = l as {
            feature?: { properties?: { id?: string } };
          };
          return layerWithFeature.feature?.properties?.id === districtId;
        }) as
          | {
              feature?: {
                properties?: { id?: string; nameUz?: string; nameRu?: string };
              };
            }
          | undefined;

        if (layer?.feature?.properties) {
          district = {
            id: layer.feature.properties.id || '',
            nameUz: layer.feature.properties.nameUz || '',
            nameRu: layer.feature.properties.nameRu || '',
          } as DistrictData;
        }
      }

      if (!district) return;

      setSelectedDistrict(district);
      setSelectedMahalla(null);
      setSidebarLevel('mahallas');

      const mahallasData = await loadMahallas(districtId);
      await loadMahallasLayer(map, L, mahallasData);
    },
    [districts, getLayer, loadMahallas, loadMahallasLayer]
  );

  const handleRegionClick = useCallback(
    async (regionId: string) => {
      const L = (await import('leaflet')).default as unknown as Parameters<
        typeof loadDistrictsLayer
      >[1];
      const map = mapInstanceRef.current;
      if (!map) return;

      let region = regions.find((r) => r.id === regionId);

      if (!region && getLayer('regions')) {
        const layers = getLayer('regions')?.getLayers() || [];
        const layer = layers.find((l) => {
          const layerWithFeature = l as {
            feature?: { properties?: { id?: string } };
          };
          return layerWithFeature.feature?.properties?.id === regionId;
        }) as
          | {
              feature?: {
                properties?: { id?: string; nameUz?: string; nameRu?: string };
              };
            }
          | undefined;

        if (layer?.feature?.properties) {
          region = {
            id: layer.feature.properties.id || '',
            nameUz: layer.feature.properties.nameUz || '',
            nameRu: layer.feature.properties.nameRu || '',
          } as RegionData;
        }
      }

      if (!region) return;

      setSelectedRegion(region);
      setSelectedDistrict(null);
      setSelectedMahalla(null);
      setSidebarLevel('districts');

      const districtsData = await loadDistricts(regionId);
      await loadDistrictsLayer(map, L, districtsData, handleDistrictClick);
    },
    [regions, getLayer, loadDistricts, loadDistrictsLayer, handleDistrictClick]
  );

  // Load regions layer when both map and regions data are ready
  useEffect(() => {
    const loadRegions = async () => {
      if (mapReady && !loading && regions.length > 0 && !regionsLayerLoaded) {
        const map = mapInstanceRef.current;
        if (map) {
          const L = (await import('leaflet')).default as unknown as Parameters<
            typeof loadRegionsLayer
          >[1];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await loadRegionsLayer(map, L as any, regions, handleRegionClick);
          setRegionsLayerLoaded(true);
        }
      }
    };

    loadRegions();
  }, [
    mapReady,
    loading,
    regions,
    regionsLayerLoaded,
    loadRegionsLayer,
    handleRegionClick,
  ]);

  const handleMahallaClick = useCallback(
    (mahalla: MahallaData) => {
      setSelectedMahalla(mahalla);
      const map = mapInstanceRef.current;
      if (map && getLayer('mahallas')) {
        getLayer('mahallas')?.eachLayer((layer) => {
          const layerWithFeature = layer as {
            feature?: { properties?: { id?: string } };
            getBounds?: () => import('leaflet').LatLngBounds;
          };
          if (
            layerWithFeature.feature?.properties?.id === mahalla.id &&
            layerWithFeature.getBounds
          ) {
            const bounds = layerWithFeature.getBounds();
            if (bounds) {
              map.fitBounds(bounds, {
                padding: [50, 50],
                maxZoom: 14,
              });
            }
          }
        });
      }
    },
    [setSelectedMahalla, getLayer]
  );

  const resetView = useCallback(async () => {
    setSidebarLevel('regions');
    const map = mapInstanceRef.current;
    if (map) {
      const L = (await import('leaflet')).default as unknown as Parameters<
        typeof loadRegionsLayer
      >[1];

      clearLayers(map);

      setSelectedRegion(null);
      setSelectedDistrict(null);
      setSelectedMahalla(null);
      resetData();
      setRegionsLayerLoaded(false);

      map.setView([41.377491, 64.585262], 6);
      if (regions.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await loadRegionsLayer(map, L as any, regions, handleRegionClick);
        setRegionsLayerLoaded(true);
      }
    }
  }, [clearLayers, resetData, regions, loadRegionsLayer, handleRegionClick]);

  const changeBaseMap = useCallback(
    async (newBaseMap: BaseMapKey) => {
      await changeBaseMapInternal(newBaseMap);
      setBaseMap(newBaseMap);
    },
    [changeBaseMapInternal]
  );

  const handleRegionClickFromList = useCallback(
    async (region: RegionData) => {
      const map = mapInstanceRef.current;
      if (map) {
        await handleRegionClick(region.id);
      }
    },
    [handleRegionClick]
  );

  const handleDistrictClickFromList = useCallback(
    async (district: DistrictData) => {
      const map = mapInstanceRef.current;
      if (map) {
        await handleDistrictClick(district.id);
      }
    },
    [handleDistrictClick]
  );

  return (
    <div className="relative flex bg-gray-900 w-full h-full overflow-hidden">
      {loading && (
        <div className="z-50 absolute inset-0 flex justify-center items-center bg-gray-900">
          <div className="flex flex-col items-center gap-4 text-white text-xl">
            <Loader2Icon className="w-8 h-8 animate-spin" />
            <p>Xarita yuklanmoqda...</p>
          </div>
        </div>
      )}

      <Sidebar
        level={sidebarLevel}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        regions={regions}
        districts={districts}
        mahallas={mahallas}
        selectedRegion={selectedRegion}
        selectedDistrict={selectedDistrict}
        selectedMahalla={selectedMahalla}
        loading={loading}
        loadingDistricts={loadingDistricts}
        loadingMahallas={loadingMahallas}
        onRegionClick={handleRegionClickFromList}
        onDistrictClick={handleDistrictClickFromList}
        onMahallaClick={handleMahallaClick}
        onBack={resetView}
      />

      <MapContainer ref={mapRef} className="flex-1 w-full h-full" />

      <BaseMapSwitcher
        currentBaseMap={baseMap}
        onBaseMapChange={changeBaseMap}
      />

      <ResetViewButton onReset={resetView} />

      <StatsPanel
        stats={stats}
        selectedRegion={selectedRegion}
        selectedDistrict={selectedDistrict}
        mahallasCount={mahallas.length}
        loading={statsLoading}
      />

      <Legend />
    </div>
  );
};

export default UzbekistanMap;
