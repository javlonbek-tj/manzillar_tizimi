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
              color: ${isDark ? '#ffffff' : '#000000'};
              font-weight: bold;
              font-size: 14px;
              text-shadow: 
                -1px -1px 0 ${isDark ? '#000000' : '#ffffff'},
                 1px -1px 0 ${isDark ? '#000000' : '#ffffff'},
                -1px  1px 0 ${isDark ? '#000000' : '#ffffff'},
                 1px  1px 0 ${isDark ? '#000000' : '#ffffff'},
                -2px -2px 4px ${isDark ? '#000000' : '#ffffff'},
                 2px -2px 4px ${isDark ? '#000000' : '#ffffff'},
                -2px  2px 4px ${isDark ? '#000000' : '#ffffff'},
                 2px  2px 4px ${isDark ? '#000000' : '#ffffff'};
              background: transparent;
              padding: 0;
              box-shadow: none;
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
    onDistrictClick: (districtId: string) => Promise<void>,
    skipFitBounds?: boolean
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
              color: ${isDark ? '#ffffff' : '#000000'};
              font-weight: 600;
              font-size: 12px;
              text-shadow: 
                -1px -1px 0 ${isDark ? '#000000' : '#ffffff'},
                 1px -1px 0 ${isDark ? '#000000' : '#ffffff'},
                -1px  1px 0 ${isDark ? '#000000' : '#ffffff'},
                 1px  1px 0 ${isDark ? '#000000' : '#ffffff'},
                -2px -2px 3px ${isDark ? '#000000' : '#ffffff'},
                 2px -2px 3px ${isDark ? '#000000' : '#ffffff'},
                -2px  2px 3px ${isDark ? '#000000' : '#ffffff'},
                 2px  2px 3px ${isDark ? '#000000' : '#ffffff'};
              background: transparent;
              padding: 0;
              box-shadow: none;
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
    if (!skipFitBounds) {
      map.fitBounds(districtsLayer.getBounds());
    }
  };

  const loadMahallasLayer = async (
    map: LeafletMap,
    L: LeafletType,
    mahallasData: MahallaData[],
    onMahallaClick?: (mahalla: MahallaData, latlng?: { lat: number; lng: number }) => Promise<void>,
    skipFitBounds?: boolean
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

        const isDark = document.documentElement.classList.contains('dark');
        const label = L.marker(centerCoords as LatLngExpression, {
          icon: L.divIcon({
            className: 'mahalla-label',
            html: `<div style="
              background: transparent;
              color: ${isDark ? '#ffffff' : '#000000'};
              padding: 0;
              border-radius: 0;
              font-weight: 500;
              font-size: 10px;
              text-shadow: 
                -1px -1px 0 ${isDark ? '#000000' : '#ffffff'},
                 1px -1px 0 ${isDark ? '#000000' : '#ffffff'},
                -1px  1px 0 ${isDark ? '#000000' : '#ffffff'},
                 1px  1px 0 ${isDark ? '#000000' : '#ffffff'},
                -2px -2px 2px ${isDark ? '#000000' : '#ffffff'},
                 2px -2px 2px ${isDark ? '#000000' : '#ffffff'},
                -2px  2px 2px ${isDark ? '#000000' : '#ffffff'},
                 2px  2px 2px ${isDark ? '#000000' : '#ffffff'};
              box-shadow: none;
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
               await onMahallaClick(mData, e.latlng);
            }

            // prevent any bound popup from opening
            layer.closePopup?.();

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
    if (!skipFitBounds) {
      map.fitBounds(mahallasLayer.getBounds());
    }
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
          if (layer.setStyle) {
            layer.setStyle({ weight: 5, opacity: 1 });
          }
        });
        layer.on('mouseout', () => {
          if (layer.setStyle) {
            layer.setStyle({ weight: 3, opacity: 1 });
          }
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
            if (layer.setStyle) {
              layer.setStyle({ color: '#06b6d4', weight: 6 });
            }

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
      // Remove existing labels
      layersRef.current.realEstate.eachLayer((layer: LayerWithLabel) => {
        if (layer.label) map.removeLayer(layer.label);
      });
      map.removeLayer(layersRef.current.realEstate);
      layersRef.current.realEstate = null;
    }

    const realEstateLayer = L.geoJSON(undefined, {
      style: {
        fillColor: '#fbbf24', // Amber-400
        weight: 1.5,
        opacity: 0.8,
        color: '#d97706', // Amber-600
        fillOpacity: 0.2, // Transparent to see map below
      },
      onEachFeature: (feature: any, layer: LayerWithLabel) => {
        const props = feature.properties;
        
        // Removed: automatic house number label creation here to prevent performance issues/crashes.
        // Labels are now created on-demand for the selected mahalla only.
        
        // Improved popup styling
        const popupContent = `
          <div style="font-family: inherit; min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #4b5563; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px;">
              Ko'chmas mulk ma'lumotlari
            </h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <tbody>
                ${props.houseNumber ? `
                  <tr>
                    <td style="padding: 4px 0; color: #6b7280; font-weight: 500;">Uy raqami:</td>
                    <td style="padding: 4px 0 4px 8px; color: #111827; text-align: right; font-weight: 600;">${props.houseNumber}</td>
                  </tr>` : ''}
                ${props.owner ? `
                  <tr style="border-top: 1px solid #f3f4f6;">
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
          houseNumber: item.houseNumber,
          center: item.center,
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
      layersRef.current.realEstate.eachLayer((layer: LayerWithLabel) => {
        if (layer.label) map.removeLayer(layer.label);
      });
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

      div.style.color = isDark ? '#ffffff' : '#000000';
      div.style.background = 'transparent';
      div.style.padding = '0';
      div.style.borderRadius = '0';
      const haloColor = isDark ? '#000000' : '#ffffff';
      div.style.textShadow = `
        -1px -1px 0 ${haloColor},
         1px -1px 0 ${haloColor},
        -1px  1px 0 ${haloColor},
         1px  1px 0 ${haloColor},
        -2px -2px 4px ${haloColor},
         2px -2px 4px ${haloColor},
        -2px  2px 4px ${haloColor},
         2px  2px 4px ${haloColor}`;
      div.style.boxShadow = 'none';
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
            el.style.color = '#1f2937';
            el.style.background = 'rgba(255, 255, 255, 0.9)';
            el.style.padding = '4px 8px';
            el.style.borderRadius = '6px';
            el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
            el.style.fontWeight = '600';
            el.style.whiteSpace = 'nowrap';
          }
          if (el.classList.contains('street-dynamic-label')) {
            const inner = el.querySelector('div');
            if (inner) {
              inner.style.color = '#1f2937';
              inner.style.background = 'rgba(255, 255, 255, 0.9)';
              inner.style.padding = '2px 6px';
              inner.style.borderRadius = '6px';
              inner.style.boxShadow = '0 1px 4px rgba(0,0,0,0.1)';
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

    // Update real estate labels
    if (layersRef.current.realEstate) {
      layersRef.current.realEstate.eachLayer((layer: LayerWithLabel) => {
        if (!layer.label) return;
        const element = layer.label.getElement();
        if (!element) return;
        const div = element.querySelector('div');
        if (!div) return;

        div.style.color = isDark ? '#ffffff' : '#000000';
        div.style.background = 'transparent';
        div.style.padding = '0';
        div.style.borderRadius = '0';
        const haloColor = isDark ? '#000000' : '#ffffff';
        div.style.textShadow = `
          -1px -1px 0 ${haloColor},
           1px -1px 0 ${haloColor},
          -1px  1px 0 ${haloColor},
           1px  1px 0 ${haloColor},
          -1px -1px 1px ${haloColor},
           1px -1px 1px ${haloColor},
          -1px  1px 1px ${haloColor},
           1px  1px 1px ${haloColor}`;
        div.style.boxShadow = 'none';
        div.style.border = 'none';
      });
    }
  };

  const handleRealEstateLabels = (
    map: LeafletMap,
    L: LeafletType
  ) => {
    if (!layersRef.current.realEstate) return;
    if (!map.hasLayer(layersRef.current.realEstate)) return;

    const zoom = map.getZoom();
    const threshold = 17; // Only show house numbers when zoomed in close enough
    const bounds = map.getBounds();
    const isDark = document.documentElement.classList.contains('dark');

    layersRef.current.realEstate.eachLayer((layer: LayerWithLabel) => {
      const feature = (layer as any).feature;
      if (!feature) return;

      const props = feature.properties;
      
      // If zoomed out or no house number, remove existing label and return
      if (zoom < threshold || !props.houseNumber) {
        if (layer.label) {
          map.removeLayer(layer.label);
          layer.label = null;
        }
        return;
      }

      // Check if feature is within current map viewport to avoid over-rendering
      const center = props.center || layer.getBounds?.().getCenter();
      if (!center) return;

      const centerCoords = center.coordinates
        ? [center.coordinates[1], center.coordinates[0]]
        : [center.lat, center.lng];
      
      const latlng = { lat: centerCoords[0], lng: centerCoords[1] };

      if (bounds.contains(latlng as any)) {
        // Feature is in view, create label if not exists
        if (!layer.label) {
          const label = L.marker(centerCoords as LatLngExpression, {
            icon: L.divIcon({
              className: 'real-estate-label',
              html: `<div style="
                color: ${isDark ? '#ffffff' : '#000000'};
                font-weight: 600;
                font-size: 11px;
                text-shadow: 
                  -1px -1px 0 ${isDark ? '#000000' : '#ffffff'},
                   1px -1px 0 ${isDark ? '#000000' : '#ffffff'},
                  -1px  1px 0 ${isDark ? '#000000' : '#ffffff'},
                   1px  1px 0 ${isDark ? '#000000' : '#ffffff'},
                  -1px -1px 1px ${isDark ? '#000000' : '#ffffff'},
                   1px -1px 1px ${isDark ? '#000000' : '#ffffff'},
                  -1px  1px 1px ${isDark ? '#000000' : '#ffffff'},
                   1px  1px 1px ${isDark ? '#000000' : '#ffffff'};
                background: transparent;
                padding: 0;
                box-shadow: none;
                white-space: nowrap;
                pointer-events: none;
                text-align: center;
                display: inline-block;
                border: none;
              ">${props.houseNumber}</div>`,
              iconSize: [40, 20],
            }),
            interactive: false,
          }).addTo(map);

          layer.label = label;
        }
      } else {
        // Feature is out of view, remove label to save performance
        if (layer.label) {
          map.removeLayer(layer.label);
          layer.label = null;
        }
      }
    });
  };

  const handleStreetLabels = (
    map: LeafletMap,
    L: LeafletType,
    showLabels: boolean = true
  ) => {
    if (!layersRef.current.streets) return;

    // If toggled off, remove all existing labels and return
    if (!showLabels) {
      layersRef.current.streets.eachLayer((layer: any) => {
        if (layer.label) {
          map.removeLayer(layer.label);
          layer.label = null;
        }
      });
      return;
    }

    const zoom = map.getZoom();
    const threshold = 15; // Show street names when zoomed in enough
    const bounds = map.getBounds();
    const isDark = document.documentElement.classList.contains('dark');

    layersRef.current.streets.eachLayer((layer: any) => {
      const feature = layer.feature;
      if (!feature) return;

      const props = feature.properties;
      const name = props.nameUz;

      // If zoomed out or no name, remove existing label and return
      if (zoom < threshold || !name) {
        if (layer.label) {
          map.removeLayer(layer.label);
          layer.label = null;
        }
        return;
      }

      // Skip if this street is already selected (it has its own tooltip)
      if (selectedStreetRef.current === layer) {
        if (layer.label) {
          map.removeLayer(layer.label);
          layer.label = null;
        }
        return;
      }

      // Check if feature's bounds intersect current map viewport
      if (layer.getBounds && bounds.intersects(layer.getBounds())) {
        if (!layer.label) {
          // Compute midpoint for the polyline
          let latlngs = layer.getLatLngs ? layer.getLatLngs() : null;
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
            const label = L.marker([mid.lat, mid.lng], {
              icon: L.divIcon({
                className: 'street-dynamic-label',
                html: `<div style="
                  color: #1f2937;
                  background: rgba(255, 255, 255, 0.9);
                  padding: 2px 6px;
                  border-radius: 6px;
                  font-weight: 500;
                  font-size: 11px;
                  text-shadow: none;
                  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
                  white-space: nowrap;
                  pointer-events: none;
                  text-align: center;
                  display: inline-block;
                ">${name}</div>`,
                iconSize: [120, 20],
              }),
              interactive: false,
            }).addTo(map);

            layer.label = label;
          }
        }
      } else {
        // Feature is out of view, remove label
        if (layer.label) {
          map.removeLayer(layer.label);
          layer.label = null;
        }
      }
    });
  };

  const toggleRealEstateLayer = (map: LeafletMap, show: boolean) => {
    const layer = layersRef.current.realEstate;
    if (!layer) return;

    if (show) {
      if (!map.hasLayer(layer)) {
        layer.addTo(map);
        // Ensure popups are re-binded/active if needed, though they are attached to features
      }
    } else {
      if (map.hasLayer(layer)) {
        map.removeLayer(layer);
      }
      // Also remove all labels associated with it
      layer.eachLayer((l: LayerWithLabel) => {
        if (l.label) {
          map.removeLayer(l.label);
          l.label = null;
        }
      });
    }
  };

  return {
    layersRef,
    loadRegionsLayer,
    loadDistrictsLayer,
    loadMahallasLayer,
    loadStreetsLayer,
    loadRealEstateLayer,
    handleRealEstateLabels,
    handleStreetLabels,
    clearLayers,
    getLayer,
    toggleRealEstateLayer,
    refreshLabels,
  };
}
