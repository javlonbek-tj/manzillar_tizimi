export type Region = {
  id: string;
  nameUz: string;
  nameRu: string | null;
  code: string;
};

export type District = {
  id: string;
  nameUz: string;
  nameRu: string | null;
  code: string;
  regionId: string;
  region: { nameUz: string };
};

export type Mahalla = {
  id: string;
  nameUz: string;
  nameRu: string | null;
  code: string;
  uzKadName: string | null;
  geoCode: string | null;
  oneId: string | null;
  hidden: boolean;
  mergedIntoId: string | null;
  mergedIntoName: string | null;
  districtId: string;
  district: {
    nameUz: string;
    regionId: string;
    region: { nameUz: string };
  };
};

export type Street = {
  id: string;
  nameUz: string;
  nameRu: string | null;
  code: string;
  type: string;
  oldName: string | null;
  districtId: string;
  mahallaId: string;
  district: {
    nameUz: string;
    regionId: string;
    region: { nameUz: string };
  };
  mahalla: {
    nameUz: string;
  };
};

export type DashboardData = {
  regions: Region[];
  districts: District[];
  mahallas: Mahalla[];
  streets: Street[];
};

export type TabType = 'regions' | 'districts' | 'mahallas' | 'streets';

export type DashboardItem = Region | District | Mahalla | Street;
