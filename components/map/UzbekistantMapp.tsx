import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronRight,
  X,
  Search,
  Moon,
  Sun,
  Satellite as MapIcon,
  Loader2Icon,
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

const UzbekistanMapp = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const tileLayerRef = useRef(null);
  const layersRef = useRef({
    regions: null,
    districts: null,
    mahallas: null,
  });

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    regions: 0,
    districts: 0,
    mahallas: 0,
    streets: 0,
  });

  const [regions, setRegions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [mahallas, setMahallas] = useState([]);
  const [sidebarLevel, setSidebarLevel] = useState('regions');

  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedMahalla, setSelectedMahalla] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { theme } = useTheme();
  const [baseMap, setBaseMap] = useState('dark');

  // Base map configurations
  const baseMaps = {
    dark: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; OpenStreetMap',
      label: "Qorong'i",
    },
    light: {
      url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; OpenStreetMap',
      label: "Yorug'",
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri',
      label: "Sun'iy yo'ldosh",
    },
  };

  const listItemClass = cn(
    'px-3 py-2 rounded w-full text-sm text-left transition-colors',
    theme === 'dark'
      ? 'text-white hover:bg-gray-700'
      : 'text-gray-900 hover:bg-gray-100'
  );

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
        await loadInitialData(map, L);
        setLoading(false);
      }
    };

    loadLeaflet();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Change base map
  const changeBaseMap = async (newBaseMap) => {
    if (mapInstance.current && tileLayerRef.current) {
      const L = (await import('leaflet')).default;

      mapInstance.current.removeLayer(tileLayerRef.current);

      tileLayerRef.current = L.tileLayer(baseMaps[newBaseMap].url, {
        attribution: baseMaps[newBaseMap].attribution,
        subdomains: newBaseMap === 'satellite' ? '' : 'abcd',
        maxZoom: 20,
      }).addTo(mapInstance.current);

      setBaseMap(newBaseMap);
    }
  };

  const loadInitialData = async (map, L) => {
    try {
      const regionsResponse = await fetch('/api/regions');
      const regionsData = await regionsResponse.json();
      setRegions(regionsData);

      const statsResponse = await fetch('/api/stats');
      const statsData = await statsResponse.json();
      setStats(statsData);

      await loadRegionsLayer(map, L, regionsData);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const updateDynamicStats = async () => {
    try {
      if (selectedDistrict) {
        // Get mahallas count for this district
        const mahallasCount = mahallas.length;

        // Get streets count for this district
        const streetsResponse = await fetch(
          `/api/streets?districtId=${selectedDistrict.id}`
        );
        const streetsData = await streetsResponse.json();

        setStats({
          regions: 1,
          districts: 1,
          mahallas: mahallasCount,
          streets: streetsData.length,
        });
      } else if (selectedRegion) {
        // Get districts count for this region
        const districtsCount = districts.length;

        // Get total mahallas for this region
        const mahallasResponse = await fetch(
          `/api/mahallas?regionId=${selectedRegion.id}`
        );
        const mahallasData = await mahallasResponse.json();

        // Get total streets for this region
        const streetsResponse = await fetch(
          `/api/streets?regionId=${selectedRegion.id}`
        );
        const streetsData = await streetsResponse.json();

        setStats({
          regions: 1,
          districts: districtsCount,
          mahallas: mahallasData.length,
          streets: streetsData.length,
        });
      } else {
        // Load global stats
        const statsResponse = await fetch('/api/stats');
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  };

  useEffect(() => {
    updateDynamicStats();
  }, [selectedRegion, selectedDistrict, mahallas, districts]);

  const loadRegionsLayer = async (map, L, regionsData) => {
    if (layersRef.current.regions) {
      layersRef.current.regions.eachLayer((layer) => {
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
        fillOpacity: 0.3,
      },
      onEachFeature: (feature, layer) => {
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
          mouseover: (e) => {
            e.target.setStyle({ fillOpacity: 0.6, weight: 3 });
          },
          mouseout: (e) => {
            regionsLayer.resetStyle(e.target);
          },
          click: async (e) => {
            const regionId = feature.properties.id;
            await handleRegionClick(map, L, regionId);
          },
        });
      },
    });

    regionsData.forEach((region) => {
      const feature = {
        type: 'Feature',
        properties: {
          id: region.id,
          nameUz: region.nameUz,
          nameRu: region.nameRu,
          code: region.code,
          center: region.center,
        },
        geometry: region.geometry,
      };
      regionsLayer.addData(feature);
    });

    regionsLayer.addTo(map);
    layersRef.current.regions = regionsLayer;
  };

  const handleRegionClick = async (map, L, regionId) => {
    // Find region from current state OR from the clicked feature
    let region = regions.find((r) => r.id === regionId);

    // If not found in state (rare race condition), create minimal object from feature
    if (!region && mapInstance.current) {
      const layer = layersRef.current.regions
        ?.getLayers()
        .find((l) => l.feature?.properties?.id === regionId);
      if (layer?.feature) {
        region = {
          id: layer.feature.properties.id,
          nameUz: layer.feature.properties.nameUz,
          nameRu: layer.feature.properties.nameRu || '',
        };
      }
    }

    if (!region) return;

    setSelectedRegion(region);
    setSelectedDistrict(null);
    setSelectedMahalla(null);
    setSidebarLevel('districts');

    // Load districts
    fetch(`/api/districts?regionId=${regionId}`)
      .then((r) => r.json())
      .then((districtsData) => {
        setDistricts(districtsData);
        setMahallas([]);
        loadDistrictsLayer(map, L, districtsData);
      });
  };

  const loadDistrictsLayer = async (map, L, districtsData) => {
    if (layersRef.current.regions) {
      layersRef.current.regions.eachLayer((layer) => {
        if (layer.label) map.removeLayer(layer.label);
      });
      map.removeLayer(layersRef.current.regions);
    }

    if (layersRef.current.districts) {
      layersRef.current.districts.eachLayer((layer) => {
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
        fillOpacity: 0.4,
      },
      onEachFeature: (feature, layer) => {
        const center =
          feature.properties.center || layer.getBounds().getCenter();
        const label = L.marker([center.coordinates[1], center.coordinates[0]], {
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
          mouseover: (e) => {
            e.target.setStyle({ fillOpacity: 0.7, weight: 3 });
          },
          mouseout: (e) => {
            districtsLayer.resetStyle(e.target);
          },
          click: async (e) => {
            const districtId = feature.properties.id;
            await handleDistrictClick(map, L, districtId);
          },
        });
      },
    });

    districtsData.forEach((district) => {
      const feature = {
        type: 'Feature',
        properties: {
          id: district.id,
          nameUz: district.nameUz,
          nameRu: district.nameRu,
          code: district.code,
          center: district.center,
        },
        geometry: district.geometry,
      };
      districtsLayer.addData(feature);
    });

    districtsLayer.addTo(map);
    layersRef.current.districts = districtsLayer;
    map.fitBounds(districtsLayer.getBounds());
  };

  const handleDistrictClick = (map, L, districtId) => {
    let district = districts.find((d) => d.id === districtId);

    // Fallback: get from current layer if not in state yet
    if (!district && layersRef.current.districts) {
      const layer = layersRef.current.districts
        .getLayers()
        .find((l) => l.feature?.properties?.id === districtId);
      if (layer?.feature) {
        district = {
          id: layer.feature.properties.id,
          nameUz: layer.feature.properties.nameUz,
          nameRu: layer.feature.properties.nameRu || '',
        };
      }
    }

    if (!district) return;

    setSelectedDistrict(district);
    setSelectedMahalla(null);
    setSidebarLevel('mahallas');

    fetch(`/api/mahallas?districtId=${districtId}`)
      .then((r) => r.json())
      .then((mahallasData) => {
        setMahallas(mahallasData);
        loadMahallasLayer(map, L, mahallasData);
      });
  };

  const loadMahallasLayer = async (map, L, mahallasData) => {
    if (layersRef.current.districts) {
      layersRef.current.districts.eachLayer((layer) => {
        if (layer.label) map.removeLayer(layer.label);
      });
      map.removeLayer(layersRef.current.districts);
    }

    if (layersRef.current.mahallas) {
      layersRef.current.mahallas.eachLayer((layer) => {
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
        fillOpacity: 0.5,
      },
      onEachFeature: (feature, layer) => {
        const center =
          feature.properties.center || layer.getBounds().getCenter();
        const label = L.marker([center.coordinates[1], center.coordinates[0]], {
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
          mouseover: (e) => {
            e.target.setStyle({ fillOpacity: 0.8, weight: 2.5 });
          },
          mouseout: (e) => {
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
        type: 'Feature',
        properties: {
          id: mahalla.id,
          nameUz: mahalla.nameUz,
          nameRu: mahalla.nameRu,
          code: mahalla.code,
          center: mahalla.center,
        },
        geometry: mahalla.geometry,
      };
      mahallasLayer.addData(feature);
    });

    mahallasLayer.addTo(map);
    layersRef.current.mahallas = mahallasLayer;
    map.fitBounds(mahallasLayer.getBounds());
  };

  const resetView = async () => {
    setSidebarLevel('regions');
    if (mapInstance.current) {
      const L = (await import('leaflet')).default;

      if (layersRef.current.districts) {
        layersRef.current.districts.eachLayer((layer) => {
          if (layer.label) mapInstance.current.removeLayer(layer.label);
        });
        mapInstance.current.removeLayer(layersRef.current.districts);
        layersRef.current.districts = null;
      }
      if (layersRef.current.mahallas) {
        layersRef.current.mahallas.eachLayer((layer) => {
          if (layer.label) mapInstance.current.removeLayer(layer.label);
        });
        mapInstance.current.removeLayer(layersRef.current.mahallas);
        layersRef.current.mahallas = null;
      }

      setSelectedRegion(null);
      setSelectedDistrict(null);
      setSelectedMahalla(null);
      setDistricts([]);
      setMahallas([]);

      mapInstance.current.setView([41.377491, 64.585262], 6);
      await loadRegionsLayer(mapInstance.current, L, regions);
    }
  };

  const filteredRegions = regions.filter((r) =>
    r.nameUz.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDistricts = districts.filter((d) =>
    d.nameUz.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMahallas = mahallas.filter((m) =>
    m.nameUz.toLowerCase().includes(searchTerm.toLowerCase())
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

      {/* Sidebar */}
      <div
        className={cn(
          `${
            sidebarOpen ? 'w-80' : 'w-0'
          } transition-all duration-300 overflow-hidden z-[1000] flex flex-col h-full border-r`,
          theme === 'dark'
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-gray-200'
        )}
      >
        <div
          className={cn(
            'flex justify-between items-center p-4 border-b',
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          )}
        >
          <h3
            className={cn(
              'font-bold text-lg',
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            )}
          >
            Filtr
          </h3>

          <button
            onClick={() => setSidebarOpen(false)}
            className={cn(
              'transition-colors',
              theme === 'dark'
                ? 'text-gray-400 hover:text-white'
                : 'text-gray-500 hover:text-gray-900'
            )}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div
          className={cn(
            'p-4 border-b',
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          )}
        >
          <div className="relative">
            <Search
              className={cn(
                'top-1/2 left-3 absolute w-4 h-4 -translate-y-1/2',
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              )}
            />

            <input
              type="text"
              placeholder="Qidirish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(
                'py-2 pr-4 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full',
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              )}
            />
          </div>
        </div>

        {/* Current Selection */}
        {(selectedRegion || selectedDistrict || selectedMahalla) && (
          <div
            className={cn(
              'p-4 border-b',
              theme === 'dark'
                ? 'bg-gray-750 border-gray-700'
                : 'bg-gray-50 border-gray-200'
            )}
          >
            <div
              className={cn(
                'mb-2 text-xs',
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              )}
            >
              Tanlangan:
            </div>

            {selectedRegion && (
              <div
                className={cn(
                  'mb-1 text-sm',
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                )}
              >
                📍 {selectedRegion.nameUz}
              </div>
            )}

            {selectedDistrict && (
              <div
                className={cn(
                  'mb-1 text-sm',
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                )}
              >
                📍 {selectedDistrict.nameUz}
              </div>
            )}

            {selectedMahalla && (
              <div
                className={cn(
                  'text-sm',
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                )}
              >
                📍 {selectedMahalla.nameUz}
              </div>
            )}

            <button className="mt-2 text-blue-500 hover:text-blue-600 text-xs">
              ← Orqaga qaytish
            </button>
          </div>
        )}

        {/* Lists */}
        <div className="flex-1 overflow-y-auto">
          {/* Regions List */}
          {sidebarLevel === 'regions' && (
            <div className="p-4">
              <h4 className="mb-2 font-semibold text-gray-400 text-sm">
                Viloyatlar
              </h4>
              <div className="space-y-1">
                {filteredRegions.map((region) => (
                  <button
                    key={region.id}
                    onClick={async () => {
                      const L = (await import('leaflet')).default;
                      await handleRegionClick(
                        mapInstance.current,
                        L,
                        region.id
                      );
                    }}
                    className={listItemClass}
                  >
                    {region.nameUz}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Districts List */}
          {sidebarLevel === 'districts' && (
            <div className="p-4">
              <h4 className="mb-2 font-semibold text-gray-400 text-sm">
                Tumanlar
              </h4>
              <div className="space-y-1">
                {filteredDistricts.map((district) => (
                  <button
                    key={district.id}
                    onClick={async () => {
                      const L = (await import('leaflet')).default;
                      await handleDistrictClick(
                        mapInstance.current,
                        L,
                        district.id
                      );
                    }}
                    className={listItemClass}
                  >
                    {district.nameUz}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Mahallas List */}
          {sidebarLevel === 'mahallas' && (
            <div className="p-4">
              <h4 className="mb-2 font-semibold text-gray-400 text-sm">
                Mahallalar
              </h4>
              <div className="space-y-1">
                {filteredMahallas.map((mahalla) => (
                  <button
                    key={mahalla.id}
                    onClick={async () => {
                      setSelectedMahalla(mahalla);
                      if (mapInstance.current && layersRef.current.mahallas) {
                        layersRef.current.mahallas.eachLayer((layer) => {
                          if (layer.feature.properties.id === mahalla.id) {
                            mapInstance.current.fitBounds(layer.getBounds(), {
                              padding: [50, 50],
                              maxZoom: 14,
                            });
                          }
                        });
                      }
                    }}
                    className={cn(
                      'px-3 py-2 rounded w-full text-sm text-left transition-colors',
                      selectedMahalla?.id === mahalla.id
                        ? 'bg-blue-600 text-white'
                        : theme === 'dark'
                        ? 'text-white hover:bg-gray-700'
                        : 'text-gray-900 hover:bg-gray-100'
                    )}
                  >
                    {mahalla.nameUz}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toggle Sidebar Button */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="top-20 left-4 z-[1000] absolute bg-gray-800 hover:bg-gray-700 shadow-lg p-3 rounded-lg text-white transition-colors"
          title="Filtrni ochish"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}

      {/* Map */}
      <div ref={mapRef} className="flex-1 w-full h-full" />

      {/* ================== TOP-CENTER BASEMAP SWITCHER ================== */}
      <div className="top-4 left-1/2 z-[1000] absolute flex bg-gray-800 shadow-lg rounded-lg overflow-hidden -translate-x-1/2">
        {/* Dark */}
        <button
          onClick={() => changeBaseMap('dark')}
          className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
            baseMap === 'dark'
              ? 'bg-blue-600 text-white'
              : 'text-gray-300 hover:bg-gray-700'
          }`}
          title="Qorong'i xarita"
        >
          <Moon className="w-4 h-4" />
          Qorong'i
        </button>

        {/* Light */}
        <button
          onClick={() => changeBaseMap('light')}
          className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 border-x border-gray-700 ${
            baseMap === 'light'
              ? 'bg-blue-600 text-white'
              : 'text-gray-300 hover:bg-gray-700'
          }`}
          title="Yorug' xarita"
        >
          <Sun className="w-4 h-4" />
          Yorug'
        </button>

        {/* Satellite */}
        <button
          onClick={() => changeBaseMap('satellite')}
          className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
            baseMap === 'satellite'
              ? 'bg-blue-600 text-white'
              : 'text-gray-300 hover:bg-gray-700'
          }`}
          title="Sun'iy yo'ldosh"
        >
          <MapIcon className="w-4 h-4" />
          Sun'iy yo'ldosh
        </button>
      </div>

      {/* BOTTOM-RIGHT BUTTONS */}
      <div className="bottom-4 left-84 z-[1000] absolute flex flex-col gap-3">
        {/* HOME / RESET VIEW */}
        <button
          onClick={resetView}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 shadow-lg px-4 py-2 rounded-lg font-medium text-white text-sm transition-colors"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Standard xarita
        </button>
      </div>

      <div
        className={cn(
          'top-4 right-4 z-1000 absolute shadow-lg p-4 rounded-lg',
          theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
        )}
      >
        <h3 className="mb-3 font-bold text-lg">Statistika</h3>

        {/* Stats layout: when region/district selected show contextual labels */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-gray-400">
              {selectedRegion ? 'Viloyat:' : 'Viloyatlar:'}
            </span>
            <span className="font-semibold">
              {selectedRegion ? selectedRegion.nameUz : stats.regions}
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-gray-400">
              {selectedDistrict ? 'Tuman:' : 'Tumanlar:'}
            </span>
            <span className="font-semibold">
              {selectedDistrict ? selectedDistrict.nameUz : stats.districts}
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-gray-400">Mahallalar:</span>
            <span className="font-semibold">
              {/* If district selected, show mahallas count from mahallas state; otherwise stats */}
              {selectedDistrict ? mahallas.length : stats.mahallas}
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-gray-400">Ko'chalar:</span>
            <span className="font-semibold">{stats.streets}</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div
        className={cn(
          'right-4 bottom-4 z-1000 absolute shadow-lg p-4 rounded-lg',
          theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
        )}
      >
        <h4 className="mb-2 font-bold text-sm">Belgilar</h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="bg-blue-500 opacity-50 border border-blue-400 rounded w-4 h-4"></div>
            <span>Viloyatlar</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-green-500 opacity-60 border border-green-400 rounded w-4 h-4"></div>
            <span>Tumanlar</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-orange-500 opacity-70 border border-orange-400 rounded w-4 h-4"></div>
            <span>Mahallalar</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UzbekistanMapp;
