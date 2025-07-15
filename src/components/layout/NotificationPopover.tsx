import React, { Fragment, useState, useEffect, useRef } from 'react';
import { Popover, Transition } from '@headlessui/react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer';
import { Bell, CheckCircle, AlertTriangle, User, X, Trash2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const mockNotifications = [
  // Uncomment to test with notifications:
  // {
  //   id: 1,
  //   type: 'info',
  //   message: 'New visitor checked in: John Doe',
  //   time: '2m ago',
  //   read: false,
  // },
];

function getIcon(type: string) {
  switch (type) {
    case 'info':
      return <Bell className="w-5 h-5 text-blue-500" />;
    case 'warning':
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    case 'success':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'user':
      return <User className="w-5 h-5 text-purple-500" />;
    default:
      return <Bell className="w-5 h-5 text-gray-400" />;
  }
}

const NotificationPopover: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const unreadCount = notifications.filter(n => !n.read).length;
  const lastPopoverOpen = useRef(false);
  const navigate = useNavigate();

  // Mark all as read when drawer opens
  useEffect(() => {
    if (drawerOpen) {
      setNotifications(n => n.map(notif => ({ ...notif, read: true })));
    }
  }, [drawerOpen]);

  const handleClearAll = () => setNotifications([]);

  const EmptyState = (
    <div className="flex flex-col items-center justify-center min-h-[180px] py-8 bg-blue-50/60 rounded-xl">
      <Bell className="w-10 h-10 text-blue-200 mb-2" />
      <div className="text-gray-500 font-medium">No notifications</div>
      <div className="text-xs text-gray-400 mt-1">You're all caught up!</div>
    </div>
  );

  const ViewAllButton = (
    <Button
      variant="ghost"
      className="w-full flex items-center justify-center gap-2 mt-3 text-blue-600 font-medium disabled:text-gray-400"
      onClick={() => notifications.length > 0 && navigate('/admin/notifications')}
      disabled={notifications.length === 0}
    >
      View All <ArrowRight className="w-4 h-4" />
    </Button>
  );

  return (
    <>
      {/* Desktop Popover */}
      <div className="hidden md:block">
        <Popover className="relative">
          {({ open }) => {
            // Only mark as read on open transition (not every render)
            useEffect(() => {
              if (open && !lastPopoverOpen.current) {
                setNotifications(n => n.map(notif => ({ ...notif, read: true })));
              }
              lastPopoverOpen.current = open;
            }, [open]);
            return (
              <>
                <Popover.Button className="relative focus:outline-none">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && !open && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full border-2 border-white"></span>
                  )}
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
                  <Popover.Panel
                    style={{
                      width: 320,
                      minHeight: 220,
                      borderRadius: 16,
                      border: '2px solid #3B82F6',
                      background: '#fff',
                      zIndex: 9999,
                      boxShadow: '0 10px 32px 0 rgba(0,0,0,0.12)',
                    }}
                    className="absolute right-0 mt-2 flex flex-col"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-lg text-gray-800">Notifications</span>
                      <div className="flex gap-1">
                        {notifications.length > 0 && (
                          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-500" onClick={handleClearAll} title="Clear All">
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600" onClick={() => setNotifications(n => n.map(notif => ({ ...notif, read: true })))} title="Mark all as read">
                          <CheckCircle className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                    <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto flex-1">
                      {notifications.length === 0
                        ? EmptyState
                        : notifications.map(n => (
                            <div key={n.id} className={`flex items-start gap-3 py-3 ${!n.read ? 'bg-blue-50' : ''}`}>
                              <div className="mt-1">{getIcon(n.type)}</div>
                              <div className="flex-1">
                                <div className="text-gray-800 text-sm">{n.message}</div>
                                <div className="text-xs text-gray-400 mt-1">{n.time}</div>
                              </div>
                              {!n.read && <span className="w-2 h-2 bg-blue-500 rounded-full mt-2"></span>}
                            </div>
                          ))}
                    </div>
                    {ViewAllButton}
                  </Popover.Panel>
                </Transition>
              </>
            );
          }}
        </Popover>
      </div>
      {/* Mobile Drawer */}
      <div className="md:hidden">
        <button className="relative focus:outline-none" onClick={() => setDrawerOpen(true)}>
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && !drawerOpen && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full border-2 border-white"></span>
          )}
        </button>
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerContent className="right-0 left-auto fixed top-0 h-full w-full max-w-xs rounded-none border-l p-0">
            <DrawerHeader className="flex flex-row items-center justify-between">
              <DrawerTitle>Notifications</DrawerTitle>
              <div className="flex gap-1">
                {notifications.length > 0 && (
                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-500" onClick={handleClearAll} title="Clear All">
                    <Trash2 className="w-5 h-5" />
                  </Button>
                )}
                <DrawerClose asChild>
                  <Button variant="ghost" size="icon"><X className="w-5 h-5" /></Button>
                </DrawerClose>
              </div>
            </DrawerHeader>
            <div className="p-4 divide-y divide-gray-100 max-h-[70vh] overflow-y-auto min-h-[200px] flex flex-col">
              {notifications.length === 0
                ? EmptyState
                : notifications.map(n => (
                    <div key={n.id} className={`flex items-start gap-3 py-3 ${!n.read ? 'bg-blue-50' : ''}`}>
                      <div className="mt-1">{getIcon(n.type)}</div>
                      <div className="flex-1">
                        <div className="text-gray-800 text-sm">{n.message}</div>
                        <div className="text-xs text-gray-400 mt-1">{n.time}</div>
                      </div>
                      {!n.read && <span className="w-2 h-2 bg-blue-500 rounded-full mt-2"></span>}
                    </div>
                  ))}
              {ViewAllButton}
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
};

export default NotificationPopover; 