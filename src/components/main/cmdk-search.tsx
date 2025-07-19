'use client';

import { useEffect, useState } from 'react';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import Link from 'next/link';
import { Banknote, Bell, Calendar, Footprints, GraduationCap, Home, Megaphone, Settings, Tally5, User } from 'lucide-react';
import { usePathname } from 'next/navigation';

const tabs = [
  {
    group: 'Academics',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: Home, tooltip: 'Dashboard' },
      { label: 'Courses', href: '/courses', icon: GraduationCap, tooltip: 'Courses' },
      { label: 'Schedule', href: '/schedule', icon: Calendar, tooltip: 'Schedule' },
      { label: 'Try Outs', href: '/try-outs', icon: Tally5, tooltip: 'Try Outs' },
      { label: 'Scholarships', href: '/scholarships', icon: Banknote, tooltip: 'Scholarships' },
    ],
  },
  {
    group: 'Himpunan',
    items: [
      { label: 'Events', href: '/events', icon: Footprints, tooltip: 'Events' },
      { label: 'Announcements', href: '/announcements', icon: Megaphone, tooltip: 'Announcements' },
    ],
  },
  {
    group: 'Preferences',
    items: [
      { label: 'Settings', href: '/settings', icon: Settings, tooltip: 'Settings', dev: true },
    ],
  },
  {
    group: 'Others',
    items: [
      { label: 'Profile', href: '/profile', icon: User },
      {label: 'Notifications', href: '/notifications', icon: Bell}
    ]
  }
]

const specificTabs = {
  courses: {
    icon: GraduationCap,
    items: [
      {
        id: '1',
        title: 'Introduction to Mechanical Engineering',
        totalLessons: 12,
        totalVideos: 8,
      },
      {
        id: '2',
        title: 'Measurement Techniques',
        totalLessons: 10,
        totalVideos: 7,
      },
      {
        id: '3',
        title: 'Pipe System Fundamentals',
        totalLessons: 15,
        totalVideos: 10,
      },
      {
        id: '4',
        title: 'Printer Maintenance',
        totalLessons: 8,
        totalVideos: 5,
      },
      {
        id: '5',
        title: 'Advanced CAD Design',
        totalLessons: 14,
        totalVideos: 9,
      },
    ]
  }
}

export default function SearchCMDK() {
  const [open, setOpen] = useState(false)
  const pathName = usePathname();
  const firstPath = pathName.split("/")[1] as keyof typeof specificTabs
  const primaryData = specificTabs[firstPath]

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <>
      <div className='flex bg-card px-3 py-1.5 rounded-md text-sm items-center text-muted-foreground cursor-pointer' onClick={() => setOpen(true)}>
        <span className="mr-8">Seacrh...</span>
        <kbd className="bg-muted pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none max-sm:hidden">
          <span className="text-xs">Ctrl K</span>
        </kbd>
      </div>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder={specificTabs[firstPath] ? `Search tabs or ${firstPath}...` : 'Search...'} />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {primaryData && (
            <CommandGroup heading={firstPath} className='capitalize'>
              {primaryData.items.map(item => (
                <CommandItem key={firstPath + '-' + item.title} asChild>
                  <Link href={`${firstPath}/${item.id}`}>
                    <primaryData.icon />
                    {item.title}
                  </Link>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {tabs.map(group => (
            <CommandGroup heading={group.group} key={group.group + group.items[0]?.label}>
              {group.items.map(item => (
                <CommandItem key={item.label + '-cmd-item-' + group.group} asChild>
                  <Link href={item.href}>
                    <item.icon />
                    {item.label}
                    <span className="text-muted-foreground ml-auto">Tab</span>
                  </Link>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  )
}