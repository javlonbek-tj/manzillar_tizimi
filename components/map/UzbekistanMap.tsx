'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Loader2Icon, EyeIcon, EyeOffIcon } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import type { Map } from 'leaflet';
import type { RegionData, DistrictData, MahallaData } from '@/types/map';
import type { BaseMapKey } from '@/services/baseMaps';
import { useTheme } from '@/contexts/ThemeContext';

import { useLeafletMap } from '@/hooks/useLeafletMap';
import { useMapData } from '@/hooks/useMapData';
import {
  fetchStreetsByDistrict,
  fetchStreetsByRegion,
  fetchRealEstateByRegion,
  fetchRealEstateByDistrict,
  fetchRealEstateByMahalla,
} from '@/services/api';
import { useMapLayers } from '@/hooks/useMapLayers';
import { useDynamicStats } from '@/hooks/useDynamicStats';

import { MapContainer } from './MapContainer';
import { BaseMapSwitcher } from './BaseMapSwitcher';
import { StatsPanel } from './StatsPanel';
import { Legend } from './Legend';
import { ResetViewButton } from './ResetViewButton';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { AddAddressModal } from './AddAddressModal';
import { cn } from '@/lib/utils';

type SidebarLevel = 'regions' | 'districts' | 'mahallas';

const UzbekistanMap = () => {
  const { theme } = useTheme();
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
  const [baseMap, setBaseMap] = useState<BaseMapKey>('satellite');
  const [showRealEstate, setShowRealEstate] = useState(true);
  const [showStreetLabels, setShowStreetLabels] = useState(true);
  const showStreetLabelsRef = useRef(showStreetLabels);

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
    loadStreetsLayer,
    loadRealEstateLayer,
    handleRealEstateLabels,
    clearLayers,
    getLayer,
    refreshLabels,
    handleStreetLabels,
    toggleRealEstateLayer,
  } = useMapLayers();

  const { stats, loading: statsLoading } = useDynamicStats(
    selectedRegion,
    selectedDistrict,
    districts,
    mahallas
  );

  const [mapReady, setMapReady] = useState(false);
  const [regionsLayerLoaded, setRegionsLayerLoaded] = useState(false);
  const [addAddressModalOpen, setAddAddressModalOpen] = useState(false);
  const [clickedLat, setClickedLat] = useState<number | null>(null);
  const [clickedLng, setClickedLng] = useState<number | null>(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  const { changeBaseMap: changeBaseMapInternal } = useLeafletMap(
    mapRef,
    async (map) => {
      mapInstanceRef.current = map;
      setMapReady(true);

      // Add event listeners for zoom and move to update real estate labels
      const L = (await import('leaflet')).default;
      map.on('zoomend moveend', () => {
        handleRealEstateLabels(map, L as any);
        handleStreetLabels(map, L as any, showStreetLabelsRef.current);
      });
    }
  );


  // Sync map basemap with global theme toggle (dark <-> satellite).
  useEffect(() => {
    if (!mapReady || !changeBaseMapInternal) return;

    // If user selected a different basemap explicitly, don't override it on theme change.
    // Sync logic removed to keep basemap independent of theme.


    // Refresh label colors when theme changes
    const map = mapInstanceRef.current;
    if (map) {
      refreshLabels(map);
    }
  }, [theme, mapReady, baseMap, changeBaseMapInternal, refreshLabels]);

  // Handle map click for adding address
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const onMapClick = (e: any) => {
      if (isAddingAddress) {
        console.log('Map clicked at:', e.latlng, 'Opening modal...');
        setClickedLat(e.latlng.lat);
        setClickedLng(e.latlng.lng);
        setAddAddressModalOpen(true);
        setIsAddingAddress(false);
      }
    };

    map.on('click', onMapClick);
    return () => {
      map.off('click', onMapClick);
    };
  }, [isAddingAddress]);

  // Handle map cursor style
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    
    const container = map.getContainer();
    if (isAddingAddress) {
      container.style.cursor = 'crosshair';
    } else {
      container.style.cursor = '';
    }
  }, [isAddingAddress]);

  // Sync ref and trigger updates
  useEffect(() => {
    showStreetLabelsRef.current = showStreetLabels;
    const map = mapInstanceRef.current;
    if (map) {
      // Force update of street labels
      import('leaflet').then((L) => {
        handleStreetLabels(map, L.default as any, showStreetLabels);
      });
    }
  }, [showStreetLabels, handleStreetLabels]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (map) {
      toggleRealEstateLayer(map, showRealEstate);
    }
  }, [showRealEstate, toggleRealEstateLayer, mapReady]);

  const handleDistrictClick = useCallback(
    async (districtId: string, skipFitBounds: boolean = false) => {
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
      await loadMahallasLayer(map, L, mahallasData, handleMahallaClick, skipFitBounds);

      // Load Real Estate for the district (Background)
      try {
        const realEstates = await fetchRealEstateByDistrict(districtId);
        // eslint-disable-next-line no-console
        console.log(
          'RealEstate fetched for district:',
          districtId,
          realEstates?.length
        );
        if (realEstates && Array.isArray(realEstates)) {
          await loadRealEstateLayer(map, L as any, realEstates);
        }
      } catch (err) {
        console.error('Failed to load real estate for district', err);
      }

      // load streets for this district and show together
      try {
        const streets = await fetchStreetsByDistrict(districtId);
        // eslint-disable-next-line no-console
        console.log('Streets API response for district:', districtId, streets);
        if (streets && Array.isArray(streets)) {
          // eslint-disable-next-line no-console
          console.log('Loading', streets.length, 'streets to map');
          await loadStreetsLayer(map, L as any, streets);
        } else {
          // eslint-disable-next-line no-console
          console.warn('Streets API returned non-array:', streets);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to load streets for district', err);
      }
    },
    [
      districts,
      getLayer,
      loadMahallas,
      loadMahallasLayer,
      loadStreetsLayer,
      loadRealEstateLayer,
    ]
  );

  const handleRegionClick = useCallback(
    async (regionId: string, skipFitBounds: boolean = false) => {
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
      await loadDistrictsLayer(map, L, districtsData, handleDistrictClick, skipFitBounds);

      // also load streets for the whole region (streets of districts in this region)
      try {
        const streets = await fetchStreetsByRegion(regionId);
        // eslint-disable-next-line no-console
        console.log('Streets API response for region:', regionId, streets);
        if (streets && Array.isArray(streets)) {
          // eslint-disable-next-line no-console
          console.log('Loading', streets.length, 'streets to map');
          await loadStreetsLayer(map, L as any, streets);
        } else {
          // eslint-disable-next-line no-console
          console.warn('Streets API returned non-array:', streets);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to load streets for region', err);
      }
    },
    [
      regions,
      getLayer,
      loadDistricts,
      loadDistrictsLayer,
      handleDistrictClick,
      loadStreetsLayer,
      loadRealEstateLayer,
    ]
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
    async (mahalla: MahallaData, latlng?: { lat: number; lng: number }) => {
      if (isAddingAddress && latlng) {
        setClickedLat(latlng.lat);
        setClickedLng(latlng.lng);
        setAddAddressModalOpen(true);
        setIsAddingAddress(false);
        return;
      }

      setSelectedMahalla(mahalla);
      const map = mapInstanceRef.current;
      const L = (await import('leaflet')).default as unknown as Parameters<
        typeof loadRealEstateLayer
      >[1];

      // Set coordinates for address modal based on mahalla center or clicked location
      if (mahalla.center) {
        setClickedLat(mahalla.center.lat);
        setClickedLng(mahalla.center.lng);
      } else {
        // If no center, try to get it from the layer bounds
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
              const center = bounds.getCenter();
              setClickedLat(center.lat);
              setClickedLng(center.lng);
            }
          });
        }
      }

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
            /*
             * fitBounds is applied only when latlng is NOT provided,
             * implying a sidebar selection rather than a direct map click.
             * This ensures the map zooms to the mahalla when selected from the list.
             */
            if (!latlng) {
              const bounds = layerWithFeature.getBounds();
              if (bounds) {
                map.fitBounds(bounds, {
                  padding: [50, 50],
                  maxZoom: 17, // Adjusted maxZoom to avoid being too close
                });
              }
            }
          }
        });

        // Dynamic labels now handle themselves via zoomend/moveend listeners
      }
    },
    [setSelectedMahalla, getLayer]
  );

  // Smart back navigation - goes one level up
  const handleBack = useCallback(async () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const L = (await import('leaflet')).default as unknown as Parameters<
      typeof loadRegionsLayer
    >[1];

    // If we're at mahallas level, go back to districts
    if (sidebarLevel === 'mahallas' && selectedRegion) {
      // Clear mahallas and streets layers
      if (getLayer('mahallas')) {
        getLayer('mahallas')?.eachLayer((layer: any) => {
          if (layer.label) map.removeLayer(layer.label);
        });
        map.removeLayer(getLayer('mahallas')!);
      }
      if (getLayer('streets')) {
        map.removeLayer(getLayer('streets')!);
      }
      if (getLayer('realEstate')) {
        const reLayer = getLayer('realEstate') as any;
        reLayer.eachLayer((layer: any) => {
          if (layer.label) map.removeLayer(layer.label);
        });
        map.removeLayer(reLayer);
      }

      setSelectedMahalla(null);
      setSelectedDistrict(null);
      setSidebarLevel('districts');

      // Reload districts layer for the selected region
      const districtsData = await loadDistricts(selectedRegion.id);
      await loadDistrictsLayer(map, L, districtsData, handleDistrictClick);

      // Reload streets for the region
      try {
        const streets = await fetchStreetsByRegion(selectedRegion.id);
        if (streets && Array.isArray(streets)) {
          await loadStreetsLayer(map, L as any, streets);
        }
      } catch (err) {
        console.error('Failed to load streets for region', err);
      }

      return;
    }

    // If we're at districts level, go back to regions
    if (sidebarLevel === 'districts') {
      clearLayers(map);
      setSelectedRegion(null);
      setSelectedDistrict(null);
      setSelectedMahalla(null);
      setSidebarLevel('regions');

      map.setView([41.377491, 64.585262], 6);
      if (regions.length > 0) {
        await loadRegionsLayer(map, L as any, regions, handleRegionClick);
      }
      return;
    }
  }, [
    sidebarLevel,
    selectedRegion,
    loadDistricts,
    loadDistrictsLayer,
    handleDistrictClick,
    loadStreetsLayer,
    fetchStreetsByRegion,
    clearLayers,
    regions,
    loadRegionsLayer,
    loadRegionsLayer,
    handleRegionClick,
    loadRealEstateLayer,
  ]);

  // Automatic Drill-down and Back-navigation
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady) return;

    const DRILL_IN_DISTRICT = 10;
    const DRILL_OUT_DISTRICT = 9;
    const DRILL_IN_MAHALLA = 13;
    const DRILL_OUT_MAHALLA = 12;

    let timeoutId: NodeJS.Timeout;

    const handleAutoDrill = async () => {
      const zoom = map.getZoom();
      const center = map.getCenter();
      
      // Automatic Drill-down
      if (zoom >= DRILL_IN_MAHALLA && sidebarLevel === 'districts' && !loadingMahallas) {
        const districtLayer = getLayer('districts') as any;
        if (districtLayer) {
          let foundDistrictId: string | null = null;
          districtLayer.eachLayer((layer: any) => {
            if (foundDistrictId) return;
            if (layer.getBounds && layer.getBounds().contains(center)) {
              foundDistrictId = layer.feature?.properties?.id;
            }
          });
          if (foundDistrictId) {
            await handleDistrictClick(foundDistrictId, true);
          }
        }
      }

      // Automatic Back-navigation (Hysteresis)
      if (zoom < DRILL_OUT_MAHALLA && sidebarLevel === 'mahallas') {
        handleBack();
      }
    };

    const debouncedAutoDrill = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleAutoDrill, 300);
    };

    map.on('zoomend moveend', debouncedAutoDrill);
    return () => {
      map.off('zoomend moveend', debouncedAutoDrill);
      clearTimeout(timeoutId);
    };
  }, [
    mapReady,
    sidebarLevel,
    loadingDistricts,
    loadingMahallas,
    getLayer,
    handleRegionClick,
    handleDistrictClick,
    handleBack
  ]);

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
    <div
      className={`relative flex w-full h-full overflow-hidden transition-colors ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'
      }`}
    >
      {loading && (
        <div
          className={`z-50 absolute inset-0 flex justify-center items-center ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'
          }`}
        >
          <div
            className={`flex flex-col items-center gap-4 text-xl ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            <Loader2Icon className='w-8 h-8 animate-spin' />
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
        onBack={handleBack}
      />

      <div className="relative flex-1 w-full h-full">
        <MapContainer ref={mapRef} className='w-full h-full' />

      <BaseMapSwitcher
        currentBaseMap={baseMap}
        onBaseMapChange={changeBaseMap}
      />

      <ResetViewButton onReset={resetView} />

      {/* Layer Toggles */}
      <div className='bottom-24 right-4 z-[1000] absolute flex flex-col gap-2'>
        <button
          onClick={() => setShowRealEstate(!showRealEstate)}
          className={`p-2 rounded-lg shadow-lg transition-colors ${
            theme === 'dark' ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-gray-800 hover:bg-gray-50'
          }`}
          title={showRealEstate ? "Ko'chmas mulkni yashirish" : "Ko'chmas mulkni ko'rsatish"}
        >
          {showRealEstate ? <EyeIcon className="w-5 h-5" /> : <EyeOffIcon className="w-5 h-5 text-gray-400" />}
          <span className="sr-only">Ko'chmas mulk</span>
        </button>
        <button
          onClick={() => setShowStreetLabels(!showStreetLabels)}
          className={`p-2 rounded-lg shadow-lg transition-colors ${
            theme === 'dark' ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-gray-800 hover:bg-gray-50'
          }`}
          title={showStreetLabels ? "Ko'cha nomlarini yashirish" : "Ko'cha nomlarini ko'rsatish"}
        >
          {showStreetLabels ? <span className="font-bold text-xs px-0.5">Aa</span> : <span className="font-bold text-xs px-0.5 text-gray-400 line-through">Aa</span>}
          <span className="sr-only">Ko'cha nomlari</span>
        </button>
      </div>

      {/* Add Address Button - Only show when mahalla is selected */}
      {selectedMahalla && (
        <div className='absolute top-[20px] left-[50px] z-[1000]'>
          <button
            onClick={() => {
              setIsAddingAddress(!isAddingAddress);
            }}
            className={cn(
              'flex items-center gap-2 shadow-lg px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200',
              isAddingAddress
                ? 'bg-green-600 hover:bg-green-700 text-white scale-105 ring-4 ring-green-600/20'
                : 'bg-primary hover:bg-primary/90 text-primary-foreground'
            )}
          >
            {isAddingAddress ? (
              <svg
                className='w-4 h-4 animate-pulse'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
              >
                <circle cx='12' cy='12' r='10' />
                <path d='M12 8v8M8 12h8' />
              </svg>
            ) : (
              <svg
                className='w-4 h-4'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
              >
                <path d='M12 5v14M5 12h14' />
              </svg>
            )}
            {isAddingAddress ? "Xaritani tanlang..." : "Manzil qo'shish"}
          </button>
        </div>
      )}

      <StatsPanel
        stats={stats}
        selectedRegion={selectedRegion}
        selectedDistrict={selectedDistrict}
        mahallasCount={mahallas.length}
        loading={statsLoading}
      />


        <AddAddressModal
          open={addAddressModalOpen}
          onOpenChange={setAddAddressModalOpen}
          latitude={clickedLat}
          longitude={clickedLng}
          mahallaId={selectedMahalla?.code}
          mahallaName={selectedMahalla?.nameUz}
          districtId={selectedDistrict?.id}
          districtName={selectedDistrict?.nameUz}
          regionId={selectedRegion?.id}
          regionName={selectedRegion?.nameUz}
          onSuccess={() => {
            // Optionally refresh data or show success message
          }}
        />
      </div>
    </div>
  );
};

export default UzbekistanMap;
