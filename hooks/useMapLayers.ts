import { useRef } from 'react';
import type {
  Map as LeafletMap,
  GeoJSON,
  Layer,
  LatLngExpression,
  DivIcon,
} from 'leaflet';
import type { RegionData, DistrictData, MahallaData, RealEstateData } from '@/types/map';

type LayerRefs = {
  regions: GeoJSON | null;
  districts: GeoJSON | null;
  mahallas: GeoJSON | null;
  streets: GeoJSON | null;
  realEstate: GeoJSON | null;
};

interface LeafletType {
  geoJSON: (data?: any, options?: any) => GeoJSON;
  marker: (latlng: LatLngExpression, options?: any) => any;
  divIcon: (options: any) => DivIcon;
  [key: string]: any;
}

interface LayerWithLabel extends Layer {
  label?: any;
  getBounds?: () => any;
  setStyle?: (style: any) => void;
}

export function useMapLayers() {
  const layersRef = useRef<LayerRefs>({
    regions: null,
    districts: null,
    mahallas: null,
    streets: null,
    realEstate: null,
  });
  const selectedStreetRef = useRef<any>(null);
  const selectedMahallaRef = useRef<{ id: string | null; streets: any[] }>({
    id: null,
    streets: [],
  });

  const loadRegionsLayer = async (
    map: LeafletMap,
    L: LeafletType,
    regionsData: RegionData[],
    onRegionClick: (regionId: string) => Promise<void>
  ) => {
    if (layersRef.current.regions) {
      layersRef.current.regions.eachLayer((layer: LayerWithLabel) => {
        if (layer.label) map.removeLayer(layer.label);
      });
      map.removeLayer(layersRef.current.regions);
    }

    const regionsLayer = L.geoJSON(undefined, {
      style: {
        fillColor: '#3b82f6',
        weight: 4,
        opacity: 1,
        color: '#60a5fa',
        fillOpacity: 0,
        lineCap: 'round' as const,
        lineJoin: 'round' as const,
      },
      onEachFeature: (feature: any, layer: LayerWithLabel) => {
        const center =
          feature.properties.center || layer.getBounds?.().getCenter();
        const isDark = document.documentElement.classList.contains('dark');

        const centerCoords = center?.coordinates
          ? [center.coordinates[1], center.coordinates[0]]
          : [center.lat, center.lng];

        const label = L.marker(centerCoords as LatLngExpression, {
          icon: L.divIcon({
            className: 'region-label',
            html: `<div style="
              color: ${isDark ? 'white' : '#1f2937'};
              background: ${
                isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.93)'
              };
              padding: 4px 10px;
              border-radius: 6px;
              font-weight: bold;
              font-size: 14px;
              text-shadow: ${isDark ? '2px 2px 4px rgba(0,0,0,0.8)' : 'none'};
              box-shadow: 0 2px 6px ${
                isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)'
              };
              white-space: nowrap;
              pointer-events: none;
              text-align: center;
              display: inline-block;
            ">${feature.properties.nameUz}</div>`,
            iconSize: [120, 30],
          }),
        }).addTo(map);

        layer.label = label;

        layer.on({
          mouseover: (e: any) => {
            e.target.setStyle({ fillOpacity: 0.15, weight: 6 });
          },
          mouseout: (e: any) => {
            regionsLayer.resetStyle(e.target);
          },
          click: async () => {
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
      regionsLayer.addData(feature as any);
    });

    regionsLayer.addTo(map);
    layersRef.current.regions = regionsLayer;
  };

  const loadDistrictsLayer = async (
    map: LeafletMap,
    L: LeafletType,
    districtsData: DistrictData[],
    onDistrictClick: (districtId: string) => Promise<void>
  ) => {
    if (layersRef.current.regions) {
      layersRef.current.regions.eachLayer((layer: LayerWithLabel) => {
        if (layer.label) map.removeLayer(layer.label);
      });
      map.removeLayer(layersRef.current.regions);
    }

    if (layersRef.current.districts) {
      layersRef.current.districts.eachLayer((layer: LayerWithLabel) => {
        if (layer.label) map.removeLayer(layer.label);
      });
      map.removeLayer(layersRef.current.districts);
    }

    const districtsLayer = L.geoJSON(undefined, {
      style: {
        fillColor: '#10b981',
        weight: 4,
        opacity: 1,
        color: '#60a5fa',
        fillOpacity: 0,
      },
      onEachFeature: (feature: any, layer: LayerWithLabel) => {
        const center =
          feature.properties.center || layer.getBounds?.().getCenter();
        const centerCoords = center?.coordinates
          ? [center.coordinates[1], center.coordinates[0]]
          : [center.lat, center.lng];

        const isDark = document.documentElement.classList.contains('dark');
        const label = L.marker(centerCoords as LatLngExpression, {
          icon: L.divIcon({
            className: 'district-label',
            html: `<div style="
              color: ${isDark ? 'white' : '#1f2937'};
              background: ${
                isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.93)'
              };
              padding: 3px 8px;
              border-radius: 5px;
              font-weight: 600;
              font-size: 12px;
              text-shadow: ${isDark ? '1px 1px 3px rgba(0,0,0,0.8)' : 'none'};
              box-shadow: 0 2px 6px ${
                isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)'
              };
              white-space: nowrap;
              pointer-events: none;
              text-align: center;
              display: inline-block;
            ">${feature.properties.nameUz}</div>`,
            iconSize: [100, 28],
          }),
        }).addTo(map);

        layer.label = label;

        layer.on({
          mouseover: (e: any) => {
            e.target.setStyle({ fillOpacity: 0.15, weight: 5 });
          },
          mouseout: (e: any) => {
            districtsLayer.resetStyle(e.target);
          },
          click: async () => {
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
      districtsLayer.addData(feature as any);
    });

    districtsLayer.addTo(map);
    layersRef.current.districts = districtsLayer;
    map.fitBounds(districtsLayer.getBounds());
  };

  const loadMahallasLayer = async (
    map: LeafletMap,
    L: LeafletType,
    mahallasData: MahallaData[],
    onMahallaClick?: (mahalla: MahallaData) => Promise<void>
  ) => {
    if (layersRef.current.districts) {
      layersRef.current.districts.eachLayer((layer: LayerWithLabel) => {
        if (layer.label) map.removeLayer(layer.label);
      });
      map.removeLayer(layersRef.current.districts);
    }

    if (layersRef.current.mahallas) {
      layersRef.current.mahallas.eachLayer((layer: LayerWithLabel) => {
        if (layer.label) map.removeLayer(layer.label);
      });
      map.removeLayer(layersRef.current.mahallas);
    }

    const mahallasLayer = L.geoJSON(undefined, {
      style: {
        fillColor: '#f59e0b',
        weight: 3,
        opacity: 1,
        color: '#60a5fa',
        fillOpacity: 0,
      },
      onEachFeature: (feature: any, layer: LayerWithLabel) => {
        const center =
          feature.properties.center || layer.getBounds?.().getCenter();
        const centerCoords = center?.coordinates
          ? [center.coordinates[1], center.coordinates[0]]
          : [center.lat, center.lng];

        const label = L.marker(centerCoords as LatLngExpression, {
          icon: L.divIcon({
            className: 'mahalla-label',
            html: `<div style="
              background: rgba(255, 255, 255, 0.9);
              color: #1f2937;
              padding: 4px 8px;
              border-radius: 6px;
              font-weight: 500;
              font-size: 10px;
              text-shadow: none;
              box-shadow: 0 1px 4px rgba(0,0,0,0.1);
              white-space: normal;
              word-break: break-word;
              pointer-events: none;
              text-align: center;
              max-width: 80px;
            ">${feature.properties.nameUz}</div>`,
            iconSize: [100, 40],
          }),
        }).addTo(map);

        layer.label = label;

        layer.label = label;
 
        // No hover style changes for mahallas to avoid obscuring streets

        // Click a mahalla to show street names inside it (without opening mahalla popup)
        layer.on('click', async (e: any) => {
          try {
            // Trigger external click handler if provided (e.g. for loading RealEstate)
            if (onMahallaClick) {
               // Construct mahalla data object from feature properties
               const mData = {
                  id: feature.properties.id,
                  nameUz: feature.properties.nameUz,
                  nameRu: feature.properties.nameRu,
                  code: feature.properties.code,
                  geometry: feature.geometry,
                  districtId: feature.properties.districtId, // ensure districtId is passed if available
               } as MahallaData;
               await onMahallaClick(mData);
            }

            // prevent any bound popup from opening
            layer.closePopup?.();

            const streetsLayer = layersRef.current.streets as any;
            if (!streetsLayer) return;

            // Clear previous mahalla street labels (markers)
            if (
              selectedMahallaRef.current &&
              selectedMahallaRef.current.streets.length
            ) {
              selectedMahallaRef.current.streets.forEach((item: any) => {
                try {
                  if (item.marker) map.removeLayer(item.marker);
                  const sLayer = item.layer || item;
                  if (
                    selectedStreetRef.current &&
                    selectedStreetRef.current === sLayer
                  )
                    return;
                  if (sLayer.getTooltip?.()) sLayer.unbindTooltip();
                  (streetsLayer as any).resetStyle(sLayer);
                } catch (err) {
                  // eslint-disable-next-line no-console
                  console.warn('clear mahalla labels error', err);
                }
              });
              selectedMahallaRef.current = { id: null, streets: [] };
            }

            const mahallaBounds = (layer as any).getBounds?.();
            const matched: any[] = [];

            streetsLayer.eachLayer((s: any) => {
              try {
                const sb = s.getBounds?.();
                if (!sb) return;
                if (mahallaBounds && mahallaBounds.intersects(sb)) {
                  const name = s.feature?.properties?.nameUz;
                  if (name) {
                    // compute a midpoint along the polyline to place a label marker
                    let latlngs: any = s.getLatLngs ? s.getLatLngs() : null;
                    let mid: any = null;
                    if (latlngs) {
                      if (Array.isArray(latlngs[0])) {
                        const part = latlngs[Math.floor(latlngs.length / 2)];
                        mid = part[Math.floor(part.length / 2)];
                      } else {
                        mid = latlngs[Math.floor(latlngs.length / 2)];
                      }
                    }
                    if (mid) {
                      const marker = L.marker([mid.lat, mid.lng], {
                        icon: L.divIcon({
                          className: 'street-mahalla-label',
                          html: `<div style="padding:2px 6px; border-radius:6px; background: rgba(255,255,255,0.9); color:#1f2937; font-weight:500; font-size:11px; pointer-events:none;">${name}</div>`,
                          iconSize: [120, 20],
                        }),
                        interactive: false,
                      }).addTo(map);
                      matched.push({ layer: s, marker });
                    } else {
                      matched.push({ layer: s });
                    }
                  } else {
                    matched.push({ layer: s });
                  }
                  // slightly emphasize streets inside mahalla
                  s.setStyle?.({ weight: 4 });
                }
              } catch (err) {
                // eslint-disable-next-line no-console
                console.warn('mahalla->streets match error', err);
              }
            });

            selectedMahallaRef.current = {
              id: feature.properties?.id,
              streets: matched,
            };
          } catch (err) {
            // eslint-disable-next-line no-console
            console.warn('mahalla click handler error', err);
          }
        });
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
      mahallasLayer.addData(feature as any);
    });

    mahallasLayer.addTo(map);
    layersRef.current.mahallas = mahallasLayer;
    map.fitBounds(mahallasLayer.getBounds());
  };

  const loadStreetsLayer = async (
    map: LeafletMap,
    L: LeafletType,
    streetsData: any[]
  ) => {
    if (layersRef.current.streets) {
      // If a street was selected, reset its style and unbind tooltip
      try {
        if (selectedStreetRef.current) {
          try {
            (layersRef.current.streets as any).resetStyle(
              selectedStreetRef.current
            );
          } catch (err) {
            // eslint-disable-next-line no-console
            console.warn(
              'clearLayers: failed to reset selected street style',
              err
            );
          }
          try {
            if (selectedStreetRef.current.getTooltip?.())
              selectedStreetRef.current.unbindTooltip();
          } catch (err) {
            // eslint-disable-next-line no-console
            console.warn(
              'clearLayers: failed to unbind tooltip from selected street',
              err
            );
          }
          selectedStreetRef.current = null;
        }

        // Clear any mahalla-bound street labels (may contain marker + layer)
        if (
          selectedMahallaRef.current &&
          selectedMahallaRef.current.streets.length
        ) {
          selectedMahallaRef.current.streets.forEach((item: any) => {
            try {
              const sLayer = item.layer || item;
              if (item.marker) map.removeLayer(item.marker);
              if (sLayer && selectedStreetRef.current !== sLayer) {
                if (sLayer.getTooltip?.()) sLayer.unbindTooltip();
                (layersRef.current.streets as any).resetStyle(sLayer);
              }
            } catch (err) {
              // eslint-disable-next-line no-console
              console.warn(
                'clearLayers: failed to clear mahalla street label',
                err
              );
            }
          });
          selectedMahallaRef.current = { id: null, streets: [] };
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn(
          'clearLayers: error handling selected street/mahalla',
          err
        );
      }

      map.removeLayer(layersRef.current.streets);
      layersRef.current.streets = null;
    }

    // Debug: log incoming streets count
    // eslint-disable-next-line no-console
    console.debug(
      'loadStreetsLayer: received',
      Array.isArray(streetsData) ? streetsData.length : 0,
      'streets'
    );

    const streetsLayer = L.geoJSON(undefined, {
      style: (feature: any) => ({
        // Force street color to yellow for better visibility across basemaps
        color: '#fbbf24',
        weight: 3,
        opacity: 1,
        lineCap: 'round' as const,
        lineJoin: 'round' as const,
      }),
      onEachFeature: (feature: any, layer: LayerWithLabel) => {
        if (feature.properties && feature.properties.nameUz) {
          (layer as any).bindPopup(`
            <div style="padding:8px; font-size: 12px;">
              <strong>${feature.properties.nameUz}</strong>
              ${
                feature.properties.nameRu
                  ? `<br/>${feature.properties.nameRu}`
                  : ''
              }
            </div>
          `);
        }
        // Ensure streets are interactive
        layer.on('mouseover', () => {
          layer.setStyle({ weight: 5, opacity: 1 });
        });
        layer.on('mouseout', () => {
          layer.setStyle({ weight: 3, opacity: 1 });
        });
        // Click to select a street: show permanent label and change style
        layer.on('click', () => {
          try {
            const name = feature.properties?.nameUz;
            // clear previous selection
            if (
              selectedStreetRef.current &&
              selectedStreetRef.current !== layer
            ) {
              try {
                // reset style of previously selected feature
                (streetsLayer as any).resetStyle(selectedStreetRef.current);
              } catch (err) {
                // eslint-disable-next-line no-console
                console.warn('resetStyle failed for previous selection', err);
              }
              try {
                // close and unbind any popup on previous selection
                (selectedStreetRef.current as any).closePopup?.();
                (selectedStreetRef.current as any).unbindPopup?.();
              } catch (err) {
                // eslint-disable-next-line no-console
                console.warn(
                  'failed to close/unbind popup from previous selection',
                  err
                );
              }
              try {
                if (selectedStreetRef.current.getTooltip?.()) {
                  selectedStreetRef.current.unbindTooltip();
                }
              } catch (err) {
                // eslint-disable-next-line no-console
                console.warn(
                  'failed to unbind tooltip from previous selection',
                  err
                );
              }
              selectedStreetRef.current = null;
            }

            // set new selection
            selectedStreetRef.current = layer;
            layer.setStyle({ color: '#06b6d4', weight: 6 });

            // bind a permanent tooltip label for the selected street
            if (name) {
              try {
                // close/unbind any popup that would also show
                (layer as any).closePopup?.();
                (layer as any).unbindPopup?.();
                if (layer.getTooltip?.()) layer.unbindTooltip();
                layer.bindTooltip(name, {
                  permanent: true,
                  direction: 'center',
                  className: 'street-selected-tooltip',
                });
                // ensure it's visible
                layer.openTooltip();
              } catch (err) {
                // eslint-disable-next-line no-console
                console.warn('failed to bind/open tooltip on selection', err);
              }
            }
          } catch (err) {
            // eslint-disable-next-line no-console
            console.warn('street click handler error', err);
          }
        });
      },
    });

    // Normalize input: allow geometry as string or object
    streetsData.forEach((s, idx) => {
      let geom = s.geometry;
      if (!geom && s.geojson) geom = s.geojson;
      if (typeof geom === 'string') {
        try {
          geom = JSON.parse(geom);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.warn(
            'loadStreetsLayer: failed to parse geometry for street',
            s.id,
            err
          );
          return;
        }
      }

      // Validate geometry
      if (!geom || !geom.type) {
        // eslint-disable-next-line no-console
        console.warn(
          'loadStreetsLayer: Invalid geometry for street',
          s.id,
          geom
        );
        return;
      }

      // Log first 2 streets geometry for inspection
      if (idx < 2) {
        // eslint-disable-next-line no-console
        console.log(
          'loadStreetsLayer: Sample geometry for',
          s.nameUz,
          'Type:',
          geom.type,
          'Coordinates sample:',
          geom.coordinates ? geom.coordinates.slice(0, 2) : 'N/A'
        );
      }

      const feature = {
        type: 'Feature' as const,
        properties: {
          id: s.id,
          nameUz: s.nameUz,
          nameRu: s.nameRu,
          code: s.code,
        },
        geometry: geom,
      };

      // Debug a bit of the geometry
      // eslint-disable-next-line no-console
      if (feature.geometry && feature.geometry.type) {
        console.debug(
          'loadStreetsLayer: adding feature',
          s.id,
          feature.geometry.type
        );
      }

      streetsLayer.addData(feature as any);
    });

    streetsLayer.addTo(map);
    layersRef.current.streets = streetsLayer;

    // Ensure streets layer is on top by bringing it to front
    streetsLayer.bringToFront();
  };

  const loadRealEstateLayer = async (
    map: LeafletMap,
    L: LeafletType,
    realEstateData: RealEstateData[]
  ) => {
    if (layersRef.current.realEstate) {
      map.removeLayer(layersRef.current.realEstate);
      layersRef.current.realEstate = null;
    }

    const realEstateLayer = L.geoJSON(undefined, {
      style: {
        fillColor: '#8b5cf6', // Violet
        weight: 1,
        opacity: 1,
        color: '#7c3aed',
        fillOpacity: 0.4,
      },
      onEachFeature: (feature: any, layer: LayerWithLabel) => {
        const props = feature.properties;
        
        // Improved popup styling
        const popupContent = `
          <div style="font-family: inherit; min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #4b5563; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px;">
              Ko'chmas mulk ma'lumotlari
            </h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <tbody>
                ${props.owner ? `
                  <tr>
                    <td style="padding: 4px 0; color: #6b7280; font-weight: 500;">Egalik qiluvchi:</td>
                    <td style="padding: 4px 0 4px 8px; color: #111827; text-align: right;">${props.owner}</td>
                  </tr>` : ''}
                ${props.address ? `
                  <tr style="border-top: 1px solid #f3f4f6;">
                    <td style="padding: 4px 0; color: #6b7280; font-weight: 500;">Manzil:</td>
                    <td style="padding: 4px 0 4px 8px; color: #111827; text-align: right;">${props.address}</td>
                  </tr>` : ''}
                ${props.type ? `
                  <tr style="border-top: 1px solid #f3f4f6;">
                    <td style="padding: 4px 0; color: #6b7280; font-weight: 500;">Turi:</td>
                    <td style="padding: 4px 0 4px 8px; color: #111827; text-align: right;">${props.type}</td>
                  </tr>` : ''}
                ${props.cadastralNumber ? `
                  <tr style="border-top: 1px solid #f3f4f6;">
                    <td style="padding: 4px 0; color: #6b7280; font-weight: 500;">Kadastr raqami:</td>
                    <td style="padding: 4px 0 4px 8px; color: #111827; text-align: right; font-family: monospace;">${props.cadastralNumber}</td>
                  </tr>` : ''}
              </tbody>
            </table>
          </div>
        `;

        layer.bindPopup(popupContent, {
          maxWidth: 300,
          className: 'real-estate-popup'
        });
        
        layer.on({
          mouseover: (e: any) => {
            e.target.setStyle({ weight: 3, fillOpacity: 0.6 });
            e.target.bringToFront();
          },
          mouseout: (e: any) => {
            realEstateLayer.resetStyle(e.target);
          },
          click: (e: any) => {
             // Ensure popup opens on click
             e.target.openPopup();
          }
        });
      },
    });

    realEstateData.forEach((item) => {
      const feature = {
        type: 'Feature' as const,
        properties: {
          id: item.id,
          owner: item.owner,
          address: item.address,
          type: item.type,
          cadastralNumber: item.cadastralNumber,
        },
        geometry: item.geometry,
      };
      realEstateLayer.addData(feature as any);
    });

    realEstateLayer.addTo(map);
    layersRef.current.realEstate = realEstateLayer;
    
    // Fit bounds if we have data
    if (realEstateData.length > 0) {
      try {
         map.fitBounds(realEstateLayer.getBounds());
      } catch (e) {
        console.warn('Could not fit bounds to real estate layer', e);
      }
    }
  };

  const clearLayers = (map: LeafletMap) => {
    if (layersRef.current.districts) {
      layersRef.current.districts.eachLayer((layer: LayerWithLabel) => {
        if (layer.label) map.removeLayer(layer.label);
      });
      map.removeLayer(layersRef.current.districts);
      layersRef.current.districts = null;
    }
    if (layersRef.current.mahallas) {
      layersRef.current.mahallas.eachLayer((layer: LayerWithLabel) => {
        if (layer.label) map.removeLayer(layer.label);
      });
      map.removeLayer(layersRef.current.mahallas);
      layersRef.current.mahallas = null;
    }
    if (layersRef.current.streets) {
      map.removeLayer(layersRef.current.streets);
      layersRef.current.streets = null;
    }
    if (layersRef.current.realEstate) {
      map.removeLayer(layersRef.current.realEstate);
      layersRef.current.realEstate = null;
    }
  };

  const getLayer = (type: 'regions' | 'districts' | 'mahallas' | 'streets' | 'realEstate') => {
    return layersRef.current[type];
  };

  const refreshLabels = (map: LeafletMap) => {
    const isDark = document.documentElement.classList.contains('dark');

    // Helper to update label styles
    const updateLabelColor = (label: any, type: string) => {
      if (!label) return;
      const element = label.getElement();
      if (!element) return;

      const div = element.querySelector('div');
      if (!div) return;

      div.style.color = isDark ? 'white' : '#1f2937';
      div.style.background = isDark
        ? 'rgba(0,0,0,0.6)'
        : 'rgba(255,255,255,0.93)';
      div.style.textShadow = isDark ? '2px 2px 4px rgba(0,0,0,0.8)' : 'none';
      div.style.boxShadow = `0 2px 6px ${
        isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)'
      }`;
    };

    // Update regions labels
    if (layersRef.current.regions) {
      layersRef.current.regions.eachLayer((layer: LayerWithLabel) => {
        updateLabelColor(layer.label, 'region');
      });
    }

    // Update districts labels
    if (layersRef.current.districts) {
      layersRef.current.districts.eachLayer((layer: LayerWithLabel) => {
        updateLabelColor(layer.label, 'district');
      });
    }

    // Update mahallas labels
    if (layersRef.current.mahallas) {
      layersRef.current.mahallas.eachLayer((layer: LayerWithLabel) => {
        updateLabelColor(layer.label, 'mahalla');
      });
    }

    // Update selected street tooltip style (if any)
    if (layersRef.current.streets) {
      try {
        layersRef.current.streets.eachLayer((layer: any) => {
          const tt = layer.getTooltip?.();
          if (!tt) return;
          const el = tt.getElement?.();
          if (!el) return;
          if (el.classList.contains('street-selected-tooltip')) {
            el.style.color = isDark ? 'white' : '#1f2937';
            el.style.background = isDark
              ? 'rgba(0,0,0,0.6)'
              : 'rgba(255,255,255,0.93)';
            el.style.padding = '4px 8px';
            el.style.borderRadius = '6px';
            el.style.boxShadow = `0 2px 6px ${
              isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)'
            }`;
            el.style.fontWeight = '600';
            el.style.whiteSpace = 'nowrap';
          }
          if (el.classList.contains('street-mahalla-label')) {
            // the label content is usually a child div inside the divIcon
            const inner = el.querySelector('div');
            if (inner) {
              inner.style.color = isDark ? 'white' : '#1f2937';
              inner.style.background = isDark
                ? 'rgba(0,0,0,0.6)'
                : 'rgba(255,255,255,0.93)';
              inner.style.padding = '2px 6px';
              inner.style.borderRadius = '6px';
              inner.style.boxShadow = isDark
                ? '0 1px 4px rgba(0,0,0,0.4)'
                : '0 1px 4px rgba(0,0,0,0.08)';
              inner.style.fontWeight = '500';
              inner.style.whiteSpace = 'nowrap';
            }
          }
        });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn(
          'refreshLabels: error updating selected street tooltip style',
          err
        );
      }
    }
  };

  return {
    layersRef,
    loadRegionsLayer,
    loadDistrictsLayer,
    loadMahallasLayer,
    loadStreetsLayer,
    loadRealEstateLayer,
    clearLayers,
    getLayer,
    refreshLabels,
  };
}
