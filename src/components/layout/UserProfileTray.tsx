import React, { Fragment } from 'react';
import { Popover, Transition } from '@headlessui/react';
import { LogOut, UserCog, Settings, CreditCard, ChevronDown, User, X } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

function getInitials(name?: string, email?: string) {
  if (name) {
    const parts = name.split(' ');
    return parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0][0];
  }
  if (email) return email[0].toUpperCase();
  return '?';
}

interface UserProfileTrayProps {
  user: {
    name?: string;
    email?: string;
    role?: string;
    photoUrl?: string;
  };
  onLogout: () => void;
}

export const UserProfileTray: React.FC<UserProfileTrayProps> = ({ user, onLogout }) => {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const navigate = useNavigate();

  // Helper to close drawer after navigation
  const handleDrawerNav = (path: string) => {
    setDrawerOpen(false);
    setTimeout(() => navigate(path), 200); // allow drawer to close smoothly
  };

  return (
    <>
      {/* Desktop Popover */}
      <div className="hidden md:block">
        <Popover className="relative">
          {({ open, close }) => (
            <>
              <Popover.Button className="flex items-center space-x-2 focus:outline-none group">
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                  {user.photoUrl ? (
                    <img src={user.photoUrl} alt="avatar" className="w-9 h-9 rounded-full object-cover" />
                  ) : (
                    getInitials(user.name, user.email)
                  )}
                </div>
                <span className="text-gray-800 font-medium text-sm group-hover:text-blue-600 transition-colors">
                  {user.name?.split(' ')[0] || user.email || 'User'}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </Popover.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
              >
                <Popover.Panel className="absolute right-0 z-30 mt-2 w-80 rounded-xl shadow-lg bg-white ring-1 ring-black/5 p-4">
                  {/* Top Section */}
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                      {user.photoUrl ? (
                        <img src={user.photoUrl} alt="avatar" className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        getInitials(user.name, user.email)
                      )}
                    </div>
                    <div>
                      <div className="text-gray-800 font-semibold text-lg">{user.name || 'User'}</div>
                      <div className="text-gray-500 text-xs">{user.role || 'Admin'}</div>
                      <div className="text-gray-500 text-xs">{user.email || '-'}</div>
                    </div>
                  </div>
                  {/* Middle Section */}
                  <div className="space-y-1 mb-4">
                    <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-blue-50" size="sm" onClick={() => { navigate('/admin/profile'); close(); }}>
                      <UserCog className="w-4 h-4 mr-2 text-blue-500" /> View Profile
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-blue-50" size="sm" onClick={() => { navigate('/admin/company-settings'); close(); }}>
                      <Settings className="w-4 h-4 mr-2 text-blue-500" /> Settings
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-blue-50" size="sm" onClick={() => { navigate('/admin/billing'); close(); }}>
                      <CreditCard className="w-4 h-4 mr-2 text-blue-500" /> Subscription / Billing
                    </Button>
                  </div>
                  {/* Bottom Section */}
                  <div className="border-t pt-3 flex flex-col gap-2">
                    <Button
                      variant="destructive"
                      className="w-full justify-center font-semibold"
                      onClick={onLogout}
                    >
                      <LogOut className="w-4 h-4 mr-2" /> Logout
                    </Button>
                    <div className="text-xs text-gray-400 text-center mt-1">Visitify v1.0</div>
                  </div>
                </Popover.Panel>
              </Transition>
            </>
          )}
        </Popover>
      </div>
      {/* Mobile Drawer */}
      <div className="md:hidden">
        <button
          className="flex items-center space-x-2 focus:outline-none"
          onClick={() => setDrawerOpen(true)}
        >
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
            {user.photoUrl ? (
              <img src={user.photoUrl} alt="avatar" className="w-9 h-9 rounded-full object-cover" />
            ) : (
              getInitials(user.name, user.email)
            )}
          </div>
          <span className="text-gray-800 font-medium text-sm">{user.name?.split(' ')[0] || user.email || 'User'}</span>
        </button>
        
        {/* Overlay */}
        <div
          className={`fixed inset-0 z-40 bg-black/40 transition-opacity ${drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setDrawerOpen(false)}
          aria-hidden={!drawerOpen}
        />
        
        {/* Sidebar */}
        <div
          className={`fixed z-50 top-0 right-0 h-screen w-64 bg-card border-l border-border flex flex-col transition-transform duration-300 ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
          style={{ minHeight: '100vh' }}
        >
          {/* Header */}
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xl font-bold">Profile</span>
            </div>
            <button
              className="p-2 rounded hover:bg-muted"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* User Info */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                {user.photoUrl ? (
                  <img src={user.photoUrl} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <span className="text-primary font-bold text-lg">
                    {getInitials(user.name, user.email)}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{user.name || 'User'}</p>
                <p className="text-xs text-muted-foreground">{user.role || 'Admin'}</p>
                <p className="text-xs text-muted-foreground">{user.email || '-'}</p>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted" 
              size="sm" 
              onClick={() => handleDrawerNav('/admin/profile')}
            >
              <UserCog className="w-4 h-4 mr-2" /> 
              View Profile
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted" 
              size="sm" 
              onClick={() => handleDrawerNav('/admin/company-settings')}
            >
              <Settings className="w-4 h-4 mr-2" /> 
              Settings
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted" 
              size="sm" 
              onClick={() => handleDrawerNav('/admin/billing')}
            >
              <CreditCard className="w-4 h-4 mr-2" /> 
              Billing
            </Button>
          </nav>
          
          {/* Footer */}
          <div className="p-4 border-t border-border">
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground"
              onClick={onLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
            <div className="text-xs text-muted-foreground text-center mt-2">Visitify v1.0</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserProfileTray; 