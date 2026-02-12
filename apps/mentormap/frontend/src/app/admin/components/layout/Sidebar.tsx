import { Tab } from '../../types';
import { TABS } from '../../constants';
import { TabButton } from '../ui/TabButton';

interface SidebarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  return (
    <aside className="w-64 bg-white min-h-screen shadow-sm">
      <nav className="p-4 space-y-2">
        {TABS.map((tab) => (
          <TabButton
            key={tab.id}
            icon={tab.icon}
            label={tab.label}
            active={activeTab === tab.id}
            onClick={() => onTabChange(tab.id as Tab)}
          />
        ))}
      </nav>
    </aside>
  );
};