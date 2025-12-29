'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { TabType, Region, District } from '@/types/dashboard';

interface AddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeTab: TabType;
  regions?: Region[];
  districts?: District[];
  selectedRegion?: string;
  darkMode: boolean;
  onSuccess: () => void;
}

export function AddDialog({
  open,
  onOpenChange,
  activeTab,
  regions = [],
  districts = [],
  selectedRegion,
  darkMode,
  onSuccess,
}: AddDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nameUz: '',
    nameRu: '',
    code: '',
    regionId: selectedRegion || '',
    districtId: '',
    uzKadName: '',
    geoCode: '',
    oneId: '',
    hidden: false,
    mergedIntoId: '',
    mergedIntoName: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let url = '';
      let body: any = {};

      switch (activeTab) {
        case 'regions':
          url = '/api/regions';
          body = {
            nameUz: formData.nameUz,
            nameRu: formData.nameRu || null,
            code: formData.code,
          };
          break;
        case 'districts':
          url = '/api/districts';
          body = {
            nameUz: formData.nameUz,
            nameRu: formData.nameRu || null,
            code: formData.code,
            regionId: formData.regionId,
          };
          break;
        case 'mahallas':
          url = '/api/mahallas';
          body = {
            nameUz: formData.nameUz,
            nameRu: formData.nameRu || null,
            code: formData.code,
            districtId: formData.districtId,
            uzKadName: formData.uzKadName || null,
            geoCode: formData.geoCode || null,
            oneId: formData.oneId || null,
            hidden: formData.hidden,
            mergedIntoId: formData.mergedIntoId || null,
            mergedIntoName: formData.mergedIntoName || null,
          };
          break;
        case 'streets':
          url = '/api/streets';
          body = {
            nameUz: formData.nameUz,
            nameRu: formData.nameRu || null,
            code: formData.code,
            districtId: formData.districtId,
          };
          break;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Failed to create');
      }

      onSuccess();
      onOpenChange(false);
      setFormData({
        nameUz: '',
        nameRu: '',
        code: '',
        regionId: selectedRegion || '',
        districtId: '',
        uzKadName: '',
        geoCode: '',
        oneId: '',
      });
    } catch (error) {
      console.error('Error creating:', error);
      alert('Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (activeTab) {
      case 'regions':
        return "Hudud qo'shish";
      case 'districts':
        return "Tuman qo'shish";
      case 'mahallas':
        return "Mahalla qo'shish";
      case 'streets':
        return "Ko'cha qo'shish";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={
          darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
        }
      >
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>
            Yangi ma'lumot qo'shish uchun formani to'ldiring
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='nameUz'>Nomi (O'zbekcha) *</Label>
              <Input
                id='nameUz'
                value={formData.nameUz}
                onChange={(e) =>
                  setFormData({ ...formData, nameUz: e.target.value })
                }
                required
                className={darkMode ? 'bg-gray-700 text-white' : ''}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='nameRu'>Nomi (Ruscha)</Label>
              <Input
                id='nameRu'
                value={formData.nameRu}
                onChange={(e) =>
                  setFormData({ ...formData, nameRu: e.target.value })
                }
                className={darkMode ? 'bg-gray-700 text-white' : ''}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='code'>Soato kodi *</Label>
              <Input
                id='code'
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                required
                className={darkMode ? 'bg-gray-700 text-white' : ''}
              />
            </div>

            {(activeTab === 'districts' ||
              activeTab === 'mahallas' ||
              activeTab === 'streets') && (
              <div className='space-y-2'>
                <Label htmlFor='regionId'>Viloyat *</Label>
                <select
                  id='regionId'
                  value={formData.regionId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      regionId: e.target.value,
                      districtId: '',
                    })
                  }
                  required
                  className={`w-full px-3 py-2 rounded-md border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value=''>Viloyat tanlang</option>
                  {regions.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.nameUz}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(activeTab === 'mahallas' || activeTab === 'streets') && (
              <div className='space-y-2'>
                <Label htmlFor='districtId'>Tuman *</Label>
                <select
                  id='districtId'
                  value={formData.districtId}
                  onChange={(e) =>
                    setFormData({ ...formData, districtId: e.target.value })
                  }
                  required
                  disabled={!formData.regionId}
                  className={`w-full px-3 py-2 rounded-md border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } ${
                    !formData.regionId ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <option value=''>Tuman tanlang</option>
                  {districts
                    .filter((d) => d.regionId === formData.regionId)
                    .map((district) => (
                      <option key={district.id} value={district.id}>
                        {district.nameUz}
                      </option>
                    ))}
                </select>
              </div>
            )}

            {activeTab === 'mahallas' && (
              <>
                <div className='space-y-2'>
                  <Label htmlFor='uzKadName'>UzKad nomi</Label>
                  <Input
                    id='uzKadName'
                    value={formData.uzKadName}
                    onChange={(e) =>
                      setFormData({ ...formData, uzKadName: e.target.value })
                    }
                    className={darkMode ? 'bg-gray-700 text-white' : ''}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='geoCode'>APU kodi</Label>
                  <Input
                    id='geoCode'
                    value={formData.geoCode}
                    onChange={(e) =>
                      setFormData({ ...formData, geoCode: e.target.value })
                    }
                    className={darkMode ? 'bg-gray-700 text-white' : ''}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='oneId'>1C kodi</Label>
                  <Input
                    id='oneId'
                    value={formData.oneId}
                    onChange={(e) =>
                      setFormData({ ...formData, oneId: e.target.value })
                    }
                    className={darkMode ? 'bg-gray-700 text-white' : ''}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='hidden' className='flex items-center gap-2'>
                    <input
                      id='hidden'
                      type='checkbox'
                      checked={formData.hidden}
                      onChange={(e) =>
                        setFormData({ ...formData, hidden: e.target.checked })
                      }
                      className='w-4 h-4'
                    />
                    Yashirilgan (birlashtiruvchi mahalla)
                  </Label>
                </div>

                {formData.hidden && (
                  <>
                    <div className='space-y-2'>
                      <Label htmlFor='mergedIntoId'>
                        Birlashtiruvchi mahalla ID
                      </Label>
                      <Input
                        id='mergedIntoId'
                        value={formData.mergedIntoId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            mergedIntoId: e.target.value,
                          })
                        }
                        placeholder='Birlashtiruvchi mahallaning ID sini kiriting'
                        className={darkMode ? 'bg-gray-700 text-white' : ''}
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='mergedIntoName'>
                        Birlashtiruvchi mahalla nomi
                      </Label>
                      <Input
                        id='mergedIntoName'
                        value={formData.mergedIntoName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            mergedIntoName: e.target.value,
                          })
                        }
                        placeholder='Birlashtiruvchi mahallaning nomini kiriting'
                        className={darkMode ? 'bg-gray-700 text-white' : ''}
                      />
                    </div>
                  </>
                )}
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Bekor qilish
            </Button>
            <Button type='submit' disabled={loading}>
              {loading ? 'Saqlanmoqda...' : "Qo'shish"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
