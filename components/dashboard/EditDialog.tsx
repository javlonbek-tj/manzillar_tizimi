'use client';

import { useState, useEffect } from 'react';
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
import type {
  TabType,
  Region,
  District,
  DashboardItem,
} from '@/types/dashboard';

interface EditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeTab: TabType;
  item: DashboardItem | null;
  regions?: Region[];
  districts?: District[];
  darkMode: boolean;
  onSuccess: () => void;
}

export function EditDialog({
  open,
  onOpenChange,
  activeTab,
  item,
  regions = [],
  districts = [],
  darkMode,
  onSuccess,
}: EditDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nameUz: '',
    nameRu: '',
    code: '',
    regionId: '',
    districtId: '',
    uzKadName: '',
    geoCode: '',
    oneId: '',
    hidden: false,
    mergedIntoId: '',
    mergedIntoName: '',
  });

  useEffect(() => {
    if (item) {
      let regionId = '';

      // Extract regionId from item
      if ('regionId' in item) {
        regionId = item.regionId;
      } else if (
        'district' in item &&
        item.district &&
        'regionId' in item.district
      ) {
        // For mahalla and street items, extract regionId from district
        regionId = item.district.regionId;
      }

      setFormData({
        nameUz: item.nameUz || '',
        nameRu: item.nameRu || '',
        code: item.code || '',
        regionId: regionId,
        districtId: 'districtId' in item ? item.districtId : '',
        uzKadName: 'uzKadName' in item ? item.uzKadName || '' : '',
        geoCode: 'geoCode' in item ? item.geoCode || '' : '',
        oneId: 'oneId' in item ? item.oneId || '' : '',
        hidden: 'hidden' in item ? item.hidden : false,
        mergedIntoId: 'mergedIntoId' in item ? item.mergedIntoId || '' : '',
        mergedIntoName:
          'mergedIntoName' in item ? item.mergedIntoName || '' : '',
      });
    }
  }, [item]);

  const handleSubmit = async () => {
    if (!item) return;

    setLoading(true);

    try {
      let url = '';
      let body: any = {};

      switch (activeTab) {
        case 'regions':
          url = `/api/regions/${item.id}`;
          body = {
            nameUz: formData.nameUz,
            nameRu: formData.nameRu || null,
            code: formData.code,
          };
          break;
        case 'districts':
          url = `/api/districts/${item.id}`;
          body = {
            nameUz: formData.nameUz,
            nameRu: formData.nameRu || null,
            code: formData.code,
            regionId: formData.regionId,
          };
          break;
        case 'mahallas':
          url = `/api/mahallas/${item.id}`;
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
          url = `/api/streets/${item.id}`;
          body = {
            nameUz: formData.nameUz,
            nameRu: formData.nameRu || null,
            code: formData.code,
            districtId: formData.districtId,
          };
          break;
      }

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Failed to update');
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating:', error);
      alert('Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (activeTab) {
      case 'regions':
        return 'Hududni tahrirlash';
      case 'districts':
        return 'Tumanni tahrirlash';
      case 'mahallas':
        return 'Mahallani tahrirlash';
      case 'streets':
        return "Ko'chani tahrirlash";
    }
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`max-w-3xl ${
          darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
        }`}
      >
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription className='sr-only'>
            Ma'lumotlarni o'zgartiring
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4 py-4'>
          {/* First row: Nomi (O'zbekcha) and Nomi (Ruscha) */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='edit-nameUz'>Nomi (O'zbekcha) *</Label>
              <Input
                id='edit-nameUz'
                value={formData.nameUz}
                onChange={(e) =>
                  setFormData({ ...formData, nameUz: e.target.value })
                }
                required
                className={darkMode ? 'bg-gray-700 text-white' : ''}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='edit-nameRu'>Nomi (Ruscha)</Label>
              <Input
                id='edit-nameRu'
                value={formData.nameRu}
                onChange={(e) =>
                  setFormData({ ...formData, nameRu: e.target.value })
                }
                className={darkMode ? 'bg-gray-700 text-white' : ''}
              />
            </div>
          </div>

          {/* Second row: Soato kodi and Viloyat (if needed) */}
          {activeTab === 'regions' ? (
            <div className='space-y-2'>
              <Label htmlFor='edit-code'>Soato kodi *</Label>
              <Input
                id='edit-code'
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                required
                className={darkMode ? 'bg-gray-700 text-white' : ''}
              />
            </div>
          ) : (
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='edit-code'>Soato kodi *</Label>
                <Input
                  id='edit-code'
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  required
                  className={darkMode ? 'bg-gray-700 text-white' : ''}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='edit-regionId'>Viloyat *</Label>
                <select
                  id='edit-regionId'
                  value={formData.regionId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      regionId: e.target.value,
                      districtId: '',
                    })
                  }
                  required
                  disabled={activeTab !== 'districts'}
                  className={`w-full px-3 py-2 rounded-md border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } ${
                    activeTab !== 'districts'
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
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
            </div>
          )}

          {/* Tuman field for streets */}
          {activeTab === 'streets' && (
            <div className='space-y-2'>
              <Label htmlFor='edit-districtId'>Tuman *</Label>
              <select
                id='edit-districtId'
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
                } ${!formData.regionId ? 'opacity-50 cursor-not-allowed' : ''}`}
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

          {/* Mahalla-specific fields in two columns */}
          {activeTab === 'mahallas' && (
            <>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='edit-districtId'>Tuman *</Label>
                  <select
                    id='edit-districtId'
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

                <div className='space-y-2'>
                  <Label htmlFor='edit-uzKadName'>UzKad nomi</Label>
                  <Input
                    id='edit-uzKadName'
                    value={formData.uzKadName}
                    onChange={(e) =>
                      setFormData({ ...formData, uzKadName: e.target.value })
                    }
                    className={darkMode ? 'bg-gray-700 text-white' : ''}
                  />
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='edit-geoCode'>APU kodi</Label>
                  <Input
                    id='edit-geoCode'
                    value={formData.geoCode}
                    onChange={(e) =>
                      setFormData({ ...formData, geoCode: e.target.value })
                    }
                    className={darkMode ? 'bg-gray-700 text-white' : ''}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='edit-oneId'>1C kodi</Label>
                  <Input
                    id='edit-oneId'
                    value={formData.oneId}
                    onChange={(e) =>
                      setFormData({ ...formData, oneId: e.target.value })
                    }
                    className={darkMode ? 'bg-gray-700 text-white' : ''}
                  />
                </div>
              </div>

              <div className='space-y-2 flex items-end'>
                <Label
                  htmlFor='edit-hidden'
                  className='flex items-center gap-2'
                >
                  <input
                    id='edit-hidden'
                    type='checkbox'
                    checked={formData.hidden}
                    onChange={(e) =>
                      setFormData({ ...formData, hidden: e.target.checked })
                    }
                    className='w-4 h-4'
                  />
                  Yashirilgan
                </Label>
              </div>

              {formData.hidden && (
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='edit-mergedIntoId'>
                      Birlashtiruvchi mahalla ID
                    </Label>
                    <Input
                      id='edit-mergedIntoId'
                      value={formData.mergedIntoId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          mergedIntoId: e.target.value,
                        })
                      }
                      placeholder='ID'
                      className={darkMode ? 'bg-gray-700 text-white' : ''}
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='edit-mergedIntoName'>
                      Birlashtiruvchi mahalla nomi
                    </Label>
                    <Input
                      id='edit-mergedIntoName'
                      value={formData.mergedIntoName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          mergedIntoName: e.target.value,
                        })
                      }
                      placeholder='Nomi'
                      className={darkMode ? 'bg-gray-700 text-white' : ''}
                    />
                  </div>
                </div>
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
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saqlanmoqda...' : 'Saqlash'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
