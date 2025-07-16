import React, { Fragment } from 'react';
import { Popover, Transition } from '@headlessui/react';
import { LogOut, UserCog, Settings, CreditCard, Globe, ChevronDown } from 'lucide-react';
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

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
];

export const UserProfileTray: React.FC<UserProfileTrayProps> = ({ user, onLogout }) => {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [lang, setLang] = React.useState('en');
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
                    <div className="flex items-center space-x-2 px-2 py-1">
                      <Globe className="w-4 h-4 text-blue-500" />
                      <select
                        className="ml-2 text-sm bg-transparent focus:outline-none text-gray-700"
                        value={lang}
                        onChange={e => setLang(e.target.value)}
                      >
                        {LANGUAGES.map(l => (
                          <option key={l.code} value={l.code}>{l.label}</option>
                        ))}
                      </select>
                    </div>
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
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerContent className="right-0 left-auto fixed top-0 h-full w-full max-w-xs rounded-none border-l p-0">
            <DrawerHeader>
              <DrawerTitle>User Profile</DrawerTitle>
            </DrawerHeader>
            <div className="p-4 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-2xl mb-2">
                {user.photoUrl ? (
                  <img src={user.photoUrl} alt="avatar" className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  getInitials(user.name, user.email)
                )}
              </div>
              <div className="text-gray-800 font-semibold text-lg">{user.name || 'User'}</div>
              <div className="text-gray-500 text-xs">{user.role || 'Admin'}</div>
              <div className="text-gray-500 text-xs mb-4">{user.email || '-'}</div>
              <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-blue-50 mb-1" size="sm" onClick={() => handleDrawerNav('/admin/profile')}>
                <UserCog className="w-4 h-4 mr-2 text-blue-500" /> View Profile
              </Button>
              <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-blue-50 mb-1" size="sm" onClick={() => handleDrawerNav('/admin/settings')}>
                <Settings className="w-4 h-4 mr-2 text-blue-500" /> Settings
              </Button>
              <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-blue-50 mb-1" size="sm" onClick={() => handleDrawerNav('/admin/billing')}>
                <CreditCard className="w-4 h-4 mr-2 text-blue-500" /> Subscription / Billing
              </Button>
              <div className="flex items-center space-x-2 px-2 py-1 w-full">
                <Globe className="w-4 h-4 text-blue-500" />
                <select
                  className="ml-2 text-sm bg-transparent focus:outline-none text-gray-700 flex-1"
                  value={lang}
                  onChange={e => setLang(e.target.value)}
                >
                  {LANGUAGES.map(l => (
                    <option key={l.code} value={l.code}>{l.label}</option>
                  ))}
                </select>
              </div>
              <Button
                variant="destructive"
                className="w-full justify-center font-semibold mt-4"
                onClick={onLogout}
              >
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </Button>
              <div className="text-xs text-gray-400 text-center mt-4">Visitify v1.0</div>
              <DrawerClose asChild>
                <Button variant="outline" className="w-full mt-2">Close</Button>
              </DrawerClose>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
};

export default UserProfileTray; 