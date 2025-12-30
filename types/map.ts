import L from 'leaflet';
export interface GeoJSONGeometry {
  type: 'Polygon' | 'MultiPolygon' | 'LineString' | 'Point';
  coordinates: number[][][] | number[][][][] | number[][] | number[];
}

export interface GeoJSONFeature {
  type: 'Feature';
  properties: {
    nameUz: string;
    nameRu?: string;
    code: string;
    [key: string]: any;
  };
  geometry: GeoJSONGeometry;
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

export interface Center {
  lat: number;
  lng: number;
}

export interface RegionData {
  id: string;
  nameUz: string;
  nameRu?: string | null;
  code: string;
  geometry: GeoJSONGeometry;
  center?: Center | null;
  _count?: {
    districts: number;
  };
}

export interface DistrictData {
  id: string;
  nameUz: string;
  nameRu?: string | null;
  code: string;
  geometry: GeoJSONGeometry;
  center?: Center | null;
  regionId: string;
  _count?: {
    mahallas: number;
  };
  bounds?: L.LatLngBounds;
}

export interface MahallaData {
  id: string;
  nameUz: string;
  nameRu?: string | null;
  code: string;
  geometry: GeoJSONGeometry;
  center?: Center | null;
  districtId: string;

  streets?: {
    id: string;
    nameUz: string;
    nameRu?: string | null;
    code: string;
  }[];

  _count?: {
    streets: number;
  };
}

export interface StreetData {
  id: string;
  nameUz: string;
  nameRu?: string | null;
  code: string;
  geometry: GeoJSONGeometry;
  center?: Center | null;

  // A street may belong to multiple mahallas
  mahallas?: {
    id: string;
    nameUz: string;
    nameRu?: string | null;
    code: string;
  }[];
}

export interface DashboardStats {
  totalRegions: number;
  totalDistricts: number;
  totalMahallas: number;
  totalStreets: number;
  regionStats: Array<{
    id: string;
    nameUz: string;
    code: string;
    districtCount: number;
    mahallaCount: number;
    streetCount: number;
  }>;
}

export interface RealEstateData {
  id: string;
  owner?: string | null;
  address?: string | null;
  type?: string | null;
  districtName?: string | null;
  streetName?: string | null;
  houseNumber?: string | null;
  cadastralNumber?: string | null;
  mahalla?: string | null;
  geometry: GeoJSONGeometry;
  center?: Center | null;
}

export type ZoomLevel = 'regions' | 'districts' | 'mahallas' | 'streets';
