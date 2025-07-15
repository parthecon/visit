import React from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';

interface ProfileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    _id?: string;
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
    company?: {
      name?: string;
      email?: string;
      phone?: string;
      address?: string;
    };
  };
}

const ProfileDrawer: React.FC<ProfileDrawerProps> = ({ open, onOpenChange, user }) => {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="right-0 left-auto fixed top-0 h-full w-full max-w-md rounded-none border-l">
        <DrawerHeader>
          <DrawerTitle>Your Profile</DrawerTitle>
          <DrawerDescription>All your account details</DrawerDescription>
        </DrawerHeader>
        <div className="p-4 grid grid-cols-1 gap-3">
          <div><span className="font-semibold">Name:</span> {user.name || '-'}</div>
          <div><span className="font-semibold">Email:</span> {user.email || '-'}</div>
          <div><span className="font-semibold">Phone:</span> {user.phone || '-'}</div>
          <div><span className="font-semibold">Role:</span> {user.role || '-'}</div>
          <div><span className="font-semibold">User ID:</span> {user._id || '-'}</div>
          {user.company && (
            <>
              <div className="col-span-1"><span className="font-semibold">Company Name:</span> {user.company.name || '-'}</div>
              <div><span className="font-semibold">Company Email:</span> {user.company.email || '-'}</div>
              <div><span className="font-semibold">Company Phone:</span> {user.company.phone || '-'}</div>
              <div className="col-span-1"><span className="font-semibold">Company Address:</span> {user.company.address || '-'}</div>
            </>
          )}
        </div>
        <div className="p-4 flex justify-end">
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ProfileDrawer; 