import { IoMdNotificationsOutline } from 'react-icons/io';
import { IoSettingsOutline } from 'react-icons/io5';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Bell, LogOut, Settings, User } from 'lucide-react';
import { auth } from '~/server/auth';

export default async function ProfileMenu() {
  const session = await auth();
  const user = session?.user ?? {
    name: 'Guest',
    role: 'Stduent',
    image: '/default-avatar.png', // Fallback avatar
  }

  return (
    <div className='flex gap-3 items-center'>
      <Tooltip>
        <TooltipTrigger className='bg-white p-2 rounded-full text-lg hidden md:block'>
          <IoMdNotificationsOutline />
        </TooltipTrigger>
        <TooltipContent className='hidden md:block'>
          <p>Notifications</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger className='bg-white p-2 rounded-full text-lg hidden md:block'>
          <IoSettingsOutline />
        </TooltipTrigger>
        <TooltipContent className='hidden md:block'>
          <p>Settings</p>
        </TooltipContent>
      </Tooltip>
      <DropdownMenu>
        <DropdownMenuTrigger className='flex items-center gap-2 ml-2 max-sm:hidden cursor-pointer'>
          <div className='*:text-[0.625rem]'>
            <p className='font-semibold'>{user?.name}</p>
            <p className='text-abu-3'>{user?.role}</p>
          </div>
          <Avatar>
            <AvatarImage
              src={user?.image ?? '/default-avatar.png'}
              alt='avatar'
            />
            <AvatarFallback className='bg-white'>
              {user?.name?.split(' ').map((t: string) => t[0])}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-48 border border-navy/30'>
          <DropdownMenuLabel>Menu</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href='/profile' className='flex'>
                <User className='mr-1 w-4 h-4' />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Bell className='mr-1 w-4 h-4' />
              <span>Notifications</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className='mr-1 w-4 h-4' />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href='/auth/sign-out' className='flex'>
                <LogOut className='mr-2 w-4 h-4' />
                <span>Sign Out</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger className='flex items-center gap-2 ml-2 md:hidden'>
          <div className='*:text-[0.625rem]'>
            <p className='font-semibold'>{user?.name}</p>
            <p className='text-abu-3'>{user?.role}</p>
          </div>
          <Avatar>
            <AvatarImage
              src={user?.image ?? '/default-avatar.png'}
              alt='avatar'
            />
            <AvatarFallback className='bg-white'>
              {user?.name?.split(' ').map((t: string) => t[0])}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-48 border border-navy/30'>
          <DropdownMenuLabel>Menu</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <Link href='/profile' className='flex'>
                <User className='mr-2 w-4 h-4' />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Bell className='mr-2 w-4 h-4' />
              <span>Notifications</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className='mr-2 w-4 h-4' />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href='/sign-out' className='flex'>
                <LogOut className='mr-2 w-4 h-4' />
                <span>Sign Out</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};