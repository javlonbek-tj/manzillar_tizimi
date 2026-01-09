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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  onSuccess: () => void;
}

export function EditDialog({
  open,
  onOpenChange,
  activeTab,
  item,
  regions = [],
  districts = [],
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
        regionId = (item as any).regionId || '';
      } else if (
        'district' in item &&
        item.district &&
        'regionId' in item.district
      ) {
        // For mahalla and street items, extract regionId from district
        regionId = (item.district as any).regionId || '';
      }

      setFormData({
        nameUz: 'nameUz' in item ? (item as any).nameUz || '' : '',
        nameRu: 'nameRu' in item ? (item as any).nameRu || '' : '',
        code: 'code' in item ? (item as any).code || '' : '',
        regionId: regionId || '',
        districtId: 'districtId' in item ? (item as any).districtId || '' : '',
        uzKadName: 'uzKadName' in item ? (item as any).uzKadName || '' : '',
        geoCode: 'geoCode' in item ? (item as any).geoCode || '' : '',
        oneId: 'oneId' in item ? (item as any).oneId || '' : '',
        hidden: 'hidden' in item ? (item as any).hidden : false,
        mergedIntoId: 'mergedIntoId' in item ? (item as any).mergedIntoId || '' : '',
        mergedIntoName:
          'mergedIntoName' in item ? (item as any).mergedIntoName || '' : '',
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
      <DialogContent className="max-w-3xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
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
                className="dark:bg-gray-700 dark:text-white"
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
                className="dark:bg-gray-700 dark:text-white"
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
                className="dark:bg-gray-700 dark:text-white"
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
                  className="dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='edit-regionId'>Viloyat *</Label>
                <Select
                  value={formData.regionId}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      regionId: value,
                      districtId: '',
                    })
                  }
                  disabled={activeTab !== 'districts'}
                >
                  <SelectTrigger id="edit-regionId">
                    <SelectValue placeholder="Viloyat tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((region) => (
                      <SelectItem key={region.id} value={region.id}>
                        {region.nameUz}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Tuman field for streets */}
          {activeTab === 'streets' && (
            <div className='space-y-2'>
              <Label htmlFor='edit-districtId'>Tuman *</Label>
              <Select
                value={formData.districtId}
                onValueChange={(value) =>
                  setFormData({ ...formData, districtId: value })
                }
                disabled={!formData.regionId}
              >
                <SelectTrigger id="edit-districtId">
                  <SelectValue placeholder="Tuman tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {districts
                    .filter((d) => d.regionId === formData.regionId)
                    .map((district) => (
                      <SelectItem key={district.id} value={district.id}>
                        {district.nameUz}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Mahalla-specific fields in two columns */}
          {activeTab === 'mahallas' && (
            <>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='edit-districtId'>Tuman *</Label>
                <Select
                  value={formData.districtId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, districtId: value })
                  }
                  disabled={!formData.regionId}
                >
                  <SelectTrigger id="edit-districtId">
                    <SelectValue placeholder="Tuman tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    {districts
                      .filter((d) => d.regionId === formData.regionId)
                      .map((district) => (
                        <SelectItem key={district.id} value={district.id}>
                          {district.nameUz}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='edit-uzKadName'>UzKad nomi</Label>
                  <Input
                    id='edit-uzKadName'
                    value={formData.uzKadName}
                    onChange={(e) =>
                      setFormData({ ...formData, uzKadName: e.target.value })
                    }
                    className="dark:bg-gray-700 dark:text-white"
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
                    className="dark:bg-gray-700 dark:text-white"
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
                    className="dark:bg-gray-700 dark:text-white"
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
                      className="dark:bg-gray-700 dark:text-white"
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
                      className="dark:bg-gray-700 dark:text-white"
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
