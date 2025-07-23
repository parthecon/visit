import React from 'react';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarSeparator, SidebarContent } from '@/components/ui/sidebar';
import { ShieldCheck, Users, History, Settings, UserCircle, CalendarIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useState } from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  user?: any;
  onLogout?: () => void;
  rightPanel?: React.ReactNode;
  search?: string;
  setSearch?: (v: string) => void;
  selectedSidebar?: 'visitors' | 'settings' | 'pre_register';
  onSidebarSelect?: (v: 'visitors' | 'settings' | 'pre_register') => void;
}

const sidebarLinks = [
  { label: 'Visitors', icon: <Users className="w-5 h-5 mr-2" />, key: 'visitors' },
  { label: 'Pre-Register', icon: <CalendarIcon className="w-5 h-5 mr-2" />, key: 'pre_register' },
  { label: 'Settings', icon: <Settings className="w-5 h-5 mr-2" />, key: 'settings' },
];

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title = 'Receptionist Dashboard', user, onLogout, rightPanel, search, setSearch, selectedSidebar, onSidebarSelect }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen bg-[#f6f8fa] overflow-hidden">
        {/* Sidebar Overlay for mobile */}
        <div
          className={`fixed inset-0 z-40 bg-black/40 transition-opacity ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} md:hidden`}
          onClick={() => setSidebarOpen(false)}
          aria-hidden={!sidebarOpen}
        />
        {/* Sidebar */}
        <div
          className={`fixed z-50 top-0 left-0 h-screen w-64 bg-gradient-to-b from-white via-blue-50 to-white border-r border-gray-100 flex-shrink-0 transition-transform duration-300 md:static md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:min-w-[16rem] md:max-w-[16rem]`}
          style={{ minHeight: '100vh' }}
        >
          <Sidebar className="w-full h-full">
            <SidebarHeader>
              <div className="flex items-center gap-2 px-6 py-8">
                <ShieldCheck className="w-8 h-8 text-blue-600" />
                <span className="text-2xl font-bold tracking-tight text-gray-900">Visitify</span>
              </div>
              <div className="border-b border-gray-200 mx-4 mb-2" />
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                {sidebarLinks.map(link => (
                  link.key === 'visitors' ? (
                    <SidebarMenuItem key={link.label}>
                      <SidebarMenuButton
                        isActive={selectedSidebar === 'visitors'}
                        onClick={() => onSidebarSelect && onSidebarSelect('visitors')}
                        aria-current={selectedSidebar === 'visitors' ? 'page' : undefined}
                        className={`transition-all px-4 py-3 my-1 rounded-full flex items-center gap-3 text-base font-medium ${selectedSidebar === 'visitors' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'hover:bg-blue-50 text-gray-700'}`}
                      >
                        <span className={`w-6 h-6 flex items-center justify-center ${selectedSidebar === 'visitors' ? 'text-blue-600' : 'text-gray-400'}`}>{link.icon}</span>
                        {link.label}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ) : link.key === 'pre_register' ? (
                    <SidebarMenuItem key={link.label}>
                      <SidebarMenuButton
                        isActive={selectedSidebar === 'pre_register'}
                        onClick={() => onSidebarSelect && onSidebarSelect('pre_register')}
                        aria-current={selectedSidebar === 'pre_register' ? 'page' : undefined}
                        className={`transition-all px-4 py-3 my-1 rounded-full flex items-center gap-3 text-base font-medium ${selectedSidebar === 'pre_register' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'hover:bg-blue-50 text-gray-700'}`}
                      >
                        <span className={`w-6 h-6 flex items-center justify-center ${selectedSidebar === 'pre_register' ? 'text-blue-600' : 'text-gray-400'}`}>{link.icon}</span>
                        {link.label}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ) : link.key === 'settings' ? (
                    <SidebarMenuItem key={link.label}>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <SidebarMenuButton
                              isActive={selectedSidebar === 'settings'}
                              onClick={() => onSidebarSelect && onSidebarSelect('settings')}
                              aria-current={selectedSidebar === 'settings' ? 'page' : undefined}
                              className={`transition-all px-4 py-3 my-1 rounded-full flex items-center gap-3 text-base font-medium ${selectedSidebar === 'settings' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'hover:bg-blue-50 text-gray-700'}`}
                            >
                              <span className={`w-6 h-6 flex items-center justify-center ${selectedSidebar === 'settings' ? 'text-blue-600' : 'text-gray-400'}`}>{link.icon}</span>
                              {link.label}
                            </SidebarMenuButton>
                          </TooltipTrigger>
                          <TooltipContent>View and edit your receptionist details</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </SidebarMenuItem>
                  ) : null
                ))}
              </SidebarMenu>
            </SidebarContent>
            <SidebarSeparator />
          </Sidebar>
        </div>
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full min-h-0">
          {/* Top Bar */}
          <div className="sticky top-0 z-20 bg-white border-b flex items-center justify-between px-4 sm:px-8 py-4 shadow-sm h-[56px] sm:h-[72px] min-h-[56px] sm:min-h-[72px] max-h-[72px]">
            {/* Hamburger for mobile */}
            <button
              className="p-2 rounded hover:bg-blue-50 mr-2 md:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <div className="text-lg sm:text-2xl font-bold tracking-tight text-gray-900">{title}</div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <UserCircle className="w-8 h-8 sm:w-9 sm:h-9 text-gray-400" />
                <span className="font-medium text-sm sm:text-base text-gray-700">{user?.name || 'Receptionist'}</span>
              </div>
              {onLogout && <Button variant="outline" size="sm" onClick={onLogout}>Logout</Button>}
            </div>
          </div>
          <div className={`flex-1 flex flex-col md:flex-row h-[calc(100vh-56px)] sm:h-[calc(100vh-72px)] min-h-0 w-full`}>
            <div className="flex-1 h-full min-h-0 flex flex-col px-2 sm:px-8 py-4 sm:py-6 w-full">{children}</div>
            {rightPanel && selectedSidebar !== 'settings' && (
              <div className="hidden xl:flex flex-col min-h-[340px] bg-white rounded-2xl shadow-sm border border-gray-100 p-2 sm:p-6 w-full max-w-xs xl:max-w-[20rem]">
                {rightPanel}
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout; 