import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TabType } from '@/types/dashboard';

interface AddButtonProps {
  activeTab: TabType;
  onClick: () => void;
  darkMode: boolean;
}

const tabLabels: Record<TabType, string> = {
  regions: "Hudud qo'shish",
  districts: "Tuman qo'shish",
  mahallas: "Mahalla qo'shish",
  streets: "Ko'cha qo'shish",
  addresses: "Manzil qo'shish",
};

export function AddButton({ activeTab, onClick, darkMode }: AddButtonProps) {
  // Addresses can only be added from the map page
  if (activeTab === 'addresses') {
    return null;
  }

  return (
    <Button
      onClick={onClick}
      className={`ml-auto cursor-pointer ${
        darkMode
          ? 'bg-blue-600 hover:bg-blue-700 text-white'
          : 'bg-blue-500 hover:bg-blue-600 text-white'
      }`}
    >
      <Plus className='w-4 h-4' />
      {tabLabels[activeTab]}
    </Button>
  );
}
