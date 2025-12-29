import type { TabType } from '@/types/dashboard';
import { AddButton } from './AddButton';

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  darkMode: boolean;
  children: React.ReactNode;
}

function TabButton({ active, onClick, darkMode, children }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
        active
          ? 'border-blue-500 text-blue-600'
          : darkMode
          ? 'border-transparent text-gray-400 hover:text-gray-300'
          : 'border-transparent text-gray-500 hover:text-gray-700'
      }`}
    >
      {children}
    </button>
  );
}

interface TabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onAddClick: () => void;
  darkMode: boolean;
}

export function Tabs({
  activeTab,
  onTabChange,
  onAddClick,
  darkMode,
}: TabsProps) {
  return (
    <div
      className={`border-b ${
        darkMode ? 'border-gray-700' : 'border-gray-200'
      } px-6`}
    >
      <nav className='flex items-center space-x-8'>
        <TabButton
          active={activeTab === 'regions'}
          onClick={() => onTabChange('regions')}
          darkMode={darkMode}
        >
          Hududlar
        </TabButton>
        <TabButton
          active={activeTab === 'districts'}
          onClick={() => onTabChange('districts')}
          darkMode={darkMode}
        >
          Tumanlar (shaharlar)
        </TabButton>
        <TabButton
          active={activeTab === 'mahallas'}
          onClick={() => onTabChange('mahallas')}
          darkMode={darkMode}
        >
          Mahallalar
        </TabButton>
        <TabButton
          active={activeTab === 'streets'}
          onClick={() => onTabChange('streets')}
          darkMode={darkMode}
        >
          Ko'chalar
        </TabButton>
        <AddButton
          activeTab={activeTab}
          onClick={onAddClick}
          darkMode={darkMode}
        />
      </nav>
    </div>
  );
}
