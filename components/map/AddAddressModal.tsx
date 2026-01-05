'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { Loader2, Check, ChevronsUpDown } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

interface LocationData {
  region?: { id: string; nameUz: string };
  district?: { id: string; nameUz: string };
  mahalla?: { id: string; nameUz: string; code: string };
  street?: { id: string; nameUz: string };
}

interface AddAddressModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  latitude: number | null;
  longitude: number | null;
  mahallaId?: string | null;
  mahallaName?: string | null;
  districtId?: string | null;
  districtName?: string | null;
  regionId?: string | null;
  regionName?: string | null;
  onSuccess?: () => void;
}

export function AddAddressModal({
  open,
  onOpenChange,
  latitude,
  longitude,
  mahallaId: propMahallaId,
  mahallaName: propMahallaName,
  districtId: propDistrictId,
  districtName: propDistrictName,
  regionId: propRegionId,
  regionName: propRegionName,
  onSuccess,
}: AddAddressModalProps) {
  const { theme } = useTheme();
  const darkMode = theme === 'dark';

  const [regionId, setRegionId] = useState('');
  const [regionName, setRegionName] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [districtName, setDistrictName] = useState('');
  const [mahallaId, setMahallaId] = useState('');
  const [mahallaName, setMahallaName] = useState('');
  const [streetId, setStreetId] = useState('');
  const [streetName, setStreetName] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [description, setDescription] = useState('');
  const [streets, setStreets] = useState<{ id: string; nameUz: string; code: string }[]>([]);
  const [addressSearchOpen, setAddressSearchOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill data from props if available, otherwise fetch from coordinates
  useEffect(() => {
    if (open) {
      // Reset form when modal opens
      setRegionId('');
      setRegionName('');
      setDistrictId('');
      setDistrictName('');
      setMahallaId('');
      setMahallaName('');
      setStreetId('');
      setStreetName('');
      setHouseNumber('');
      setDescription('');
      setError('');

      // If mahalla data is provided, use it
      if (propMahallaId && propMahallaName) {
        setMahallaId(propMahallaId);
        setMahallaName(propMahallaName);
        if (propDistrictId && propDistrictName) {
          setDistrictId(propDistrictId);
          setDistrictName(propDistrictName);
        }
        if (propRegionId && propRegionName) {
          setRegionId(propRegionId);
          setRegionName(propRegionName);
        }
        // Still fetch location data to get street info if available
        if (latitude !== null && longitude !== null) {
          fetchLocationData();
        }
      } else if (latitude !== null && longitude !== null) {
        // Fetch location data from coordinates
        fetchLocationData();
      }
    }
  }, [
    open,
    latitude,
    longitude,
    propMahallaId,
    propMahallaName,
    propDistrictId,
    propDistrictName,
    propRegionId,
    propRegionName,
  ]);

  const fetchLocationData = async () => {
    if (latitude === null || longitude === null) return;

    setLoadingLocation(true);
    setError('');

    try {
      const response = await fetch(
        `/api/addresses/location?lat=${latitude}&lng=${longitude}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch location data');
      }

      const data: LocationData = await response.json();

      if (data.region) {
        setRegionId(data.region.id);
        setRegionName(data.region.nameUz);
      }
      if (data.district) {
        setDistrictId(data.district.id);
        setDistrictName(data.district.nameUz);
      }
      if (data.mahalla) {
        setMahallaId(data.mahalla.code);
        setMahallaName(data.mahalla.nameUz);
      }
      if (data.street) {
        setStreetId(data.street.id);
        setStreetName(data.street.nameUz);
      }
    } catch (err) {
      console.error('Error fetching location data:', err);
      setError("Manzil ma'lumotlarini aniqlashda xatolik yuz berdi");
    } finally {
      setLoadingLocation(false);
    }
  };

  useEffect(() => {
    const fetchStreets = async () => {
      if (!mahallaId) {
        setStreets([]);
        return;
      }

      try {
        const response = await fetch(`/api/streets?mahallaId=${mahallaId}`);
        if (response.ok) {
          const data = await response.json();
          // Sort streets alphabetically by nameUz
          const sortedStreets = [...data].sort((a, b) =>
            a.nameUz.localeCompare(b.nameUz, 'uz')
          );
          setStreets(sortedStreets);
        }
      } catch (err) {
        console.error('Error fetching streets:', err);
      }
    };

    if (open && mahallaId) {
      fetchStreets();
    } else if (!mahallaId) {
      setStreets([]);
    }
  }, [open, mahallaId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (latitude === null || longitude === null) {
      setError('Koordinatalar talab qilinadi');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          regionId: regionId || null,
          regionName: regionName || null,
          districtId: districtId || null,
          districtName: districtName || null,
          mahallaId: mahallaId || null,
          mahallaName: mahallaName || null,
          streetId: streetId || null,
          streetName: streetName || null,
          houseNumber: houseNumber || null,
          description: description || null,
          latitude,
          longitude,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create address');
      }

      // Reset form
      setRegionId('');
      setRegionName('');
      setDistrictId('');
      setDistrictName('');
      setMahallaId('');
      setMahallaName('');
      setStreetId('');
      setStreetName('');
      setHouseNumber('');
      setDescription('');

      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || "Manzil qo'shishda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onOpenChange(false);
      setError('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className={cn(
          'max-w-2xl max-h-[90vh] overflow-y-auto',
          darkMode ? 'bg-gray-800 text-white' : 'bg-white'
        )}
      >
        <DialogHeader>
          <DialogTitle className={darkMode ? 'text-white' : ''}>
            Manzil qo'shish
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {loadingLocation && (
            <div className='flex items-center gap-2 text-sm text-blue-600'>
              <Loader2 className='w-4 h-4 animate-spin' />
              <span>Manzil ma'lumotlari aniqlanmoqda...</span>
            </div>
          )}

          {error && (
            <div
              className={cn(
                'p-3 rounded-md text-sm',
                darkMode
                  ? 'bg-red-900/30 text-red-300'
                  : 'bg-red-50 text-red-600'
              )}
            >
              {error}
            </div>
          )}

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label
                htmlFor='region'
                className={darkMode ? 'text-gray-300' : ''}
              >
                Hudud
              </Label>
              <Input
                id='region'
                value={regionName}
                onChange={(e) => setRegionName(e.target.value)}
                placeholder='Hudud nomi'
                className={darkMode ? 'bg-gray-700 border-gray-600' : ''}
                disabled={true}
              />
            </div>

            <div className='space-y-2'>
              <Label
                htmlFor='district'
                className={darkMode ? 'text-gray-300' : ''}
              >
                Tuman (shahar)
              </Label>
              <Input
                id='district'
                value={districtName}
                onChange={(e) => setDistrictName(e.target.value)}
                placeholder='Tuman nomi'
                className={darkMode ? 'bg-gray-700 border-gray-600' : ''}
                disabled={true}
              />
            </div>

            <div className='space-y-2'>
              <Label
                htmlFor='mahalla'
                className={darkMode ? 'text-gray-300' : ''}
              >
                Mahalla
              </Label>
              <Input
                id='mahalla'
                value={mahallaName}
                onChange={(e) => setMahallaName(e.target.value)}
                placeholder='Mahalla nomi'
                className={darkMode ? 'bg-gray-700 border-gray-600' : ''}
                disabled={true}
              />
            </div>

            <div className='space-y-2'>
              <Label
                htmlFor='street'
                className={darkMode ? 'text-gray-300' : ''}
              >
                Ko'cha
              </Label>
              <Popover open={addressSearchOpen} onOpenChange={setAddressSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    role='combobox'
                    aria-expanded={addressSearchOpen}
                    className={cn(
                      'w-full justify-between',
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''
                    )}
                    disabled={loading || loadingLocation}
                  >
                    {streetId
                      ? streets.find((s) => s.id === streetId)?.nameUz
                      : "Ko'chani tanlang..."}
                    <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-full p-0 z-[10000]'>
                  <Command>
                    <CommandInput placeholder="Ko'cha qidirish..." />
                    <CommandList>
                      <CommandEmpty>Ko'cha topilmadi.</CommandEmpty>
                      <CommandGroup>
                        {streets.map((s) => (
                          <CommandItem
                            key={s.id}
                            value={s.nameUz}
                            onSelect={() => {
                              setStreetId(s.id);
                              setStreetName(s.nameUz);
                              setAddressSearchOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                streetId === s.id ? 'opacity-100' : 'opacity-0'
                              )}
                            />
                            {s.nameUz}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className='space-y-2'>
              <Label
                htmlFor='houseNumber'
                className={darkMode ? 'text-gray-300' : ''}
              >
                Uy raqami
              </Label>
              <Input
                id='houseNumber'
                value={houseNumber}
                onChange={(e) => setHouseNumber(e.target.value)}
                placeholder='Uy raqami'
                className={darkMode ? 'bg-gray-700 border-gray-600' : ''}
                disabled={loading || loadingLocation}
              />
            </div>

            <div className='space-y-2'>
              <Label
                htmlFor='coordinates'
                className={darkMode ? 'text-gray-300' : ''}
              >
                Koordinatalar
              </Label>
              <Input
                id='coordinates'
                value={
                  latitude !== null && longitude !== null
                    ? `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
                    : ''
                }
                disabled
                className={darkMode ? 'bg-gray-700 border-gray-600' : ''}
              />
            </div>
          </div>

          <div className='space-y-2'>
            <Label
              htmlFor='description'
              className={darkMode ? 'text-gray-300' : ''}
            >
              Qo'shimcha ma'lumot
            </Label>
            <textarea
              id='description'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Qo'shimcha ma'lumot"
              rows={3}
              className={cn(
                'w-full rounded-md border px-3 py-2 text-sm',
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                  : 'bg-transparent border-gray-300'
              )}
              disabled={loading || loadingLocation}
            />
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={handleClose}
              disabled={loading || loadingLocation}
              className={darkMode ? 'border-gray-600' : ''}
            >
              Bekor qilish
            </Button>
            <Button
              type='submit'
              disabled={
                loading ||
                loadingLocation ||
                latitude === null ||
                longitude === null
              }
            >
              {loading ? (
                <>
                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  Saqlanmoqda...
                </>
              ) : (
                'Saqlash'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
