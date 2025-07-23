import React from 'react';
import { Sidebar, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarSeparator, SidebarContent } from '@/components/ui/sidebar';
import { ShieldCheck, Users, Settings, UserCircle, CalendarIcon } from 'lucide-react';

interface ReceptionistSidebarProps {
  selectedSidebar: 'visitors' | 'settings' | 'pre_register';
  onSidebarSelect: (v: 'visitors' | 'settings' | 'pre_register') => void;
  user?: any;
}

const sidebarLinks = [
  { label: 'Visitors', icon: <Users className="w-5 h-5 mr-2" />, key: 'visitors' },
  { label: 'Pre-Register', icon: <CalendarIcon className="w-5 h-5 mr-2" />, key: 'pre_register' },
  { label: 'Settings', icon: <Settings className="w-5 h-5 mr-2" />, key: 'settings' },
];

const ReceptionistSidebar: React.FC<ReceptionistSidebarProps> = ({ selectedSidebar, onSidebarSelect, user }) => (
  <Sidebar className="w-64 min-w-[16rem] max-w-[16rem] flex-shrink-0 h-full bg-gradient-to-b from-white via-blue-50 to-white z-30 border-r border-gray-100">
    <SidebarHeader>
      <div className="flex items-center gap-2 px-6 py-8">
        <ShieldCheck className="w-8 h-8 text-blue-600" />
        <span className="text-2xl font-bold tracking-tight text-gray-900">Visitify</span>
      </div>
      <div className="border-b border-gray-200 mx-4 mb-2" />
    </SidebarHeader>
    <SidebarMenu>
      {sidebarLinks.map(link => (
        <SidebarMenuItem key={link.label}>
          <SidebarMenuButton
            isActive={selectedSidebar === link.key}
            onClick={() => onSidebarSelect(link.key as any)}
            aria-current={selectedSidebar === link.key ? 'page' : undefined}
            className={`transition-all px-4 py-3 my-1 rounded-full flex items-center gap-3 text-base font-medium ${selectedSidebar === link.key ? 'bg-blue-100 text-blue-700 shadow-sm' : 'hover:bg-blue-50 text-gray-700'}`}
          >
            <span className={`w-6 h-6 flex items-center justify-center ${selectedSidebar === link.key ? 'text-blue-600' : 'text-gray-400'}`}>{link.icon}</span>
            {link.label}
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
    <SidebarSeparator />
  </Sidebar>
);

export default ReceptionistSidebar; 