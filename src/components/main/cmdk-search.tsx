'use client';

import { useEffect, useState, type Dispatch, type JSX, type SetStateAction } from 'react';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
// import Link from 'next/link';
import { Banknote, Bell, Calendar, CornerDownLeft, FileSpreadsheet, Footprints, GraduationCap, Home, Megaphone, Settings, SquarePlay, Tally5, User } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { Kbd } from '../ui/key-bind';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

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
      { label: 'Notifications', href: '/notifications', icon: Bell }
    ]
  }
]

export type TabsType = {
  courses: {
    id: string,
    title: string,
    totalLessons: number,
    totalVideos: number
  }[],
  announcements: {
    id: string,
    title: string,
    date: Date
  }[],
  events: {
    id: string,
    title: string,
    date: Date
  }[],
  scholarships: {
    id: string,
    title: string,
    date: Date
  }[],
  "try-outs": {
    id: string,
    title: string,
    classCode: string
  }[],
}

// Helper type for the router prop
// Helper type for the common router and setOpen props
type SearchItemBaseProps = {
  router: AppRouterInstance
  setOpen: Dispatch<SetStateAction<boolean>>
}

function CourseSearchItem({
  props,
  router,
  setOpen,
}: { props: TabsType['courses'][number] } & SearchItemBaseProps) {
  const handleSelect = () => {
    router.push(`/courses/${props.id}`)
    setOpen(false) // Close the command menu on selection
  }

  return (
    <CommandItem onSelect={handleSelect} className='cursor-pointer'>
      <GraduationCap className='mr-2' />
      <span>{props.title}</span>
      <div className='flex justify-end gap-2 items-center md:text-sm self-end text-xs ml-auto'>
        <FileSpreadsheet size={10} />
        <span>{props.totalLessons}</span>
        <SquarePlay size={10} />
        <span>{props.totalVideos}</span>
      </div>
    </CommandItem>
  )
}

function AnnouncementSearchItem({
  props,
  router,
  setOpen,
}: { props: TabsType['announcements'][number] } & SearchItemBaseProps) {
  const handleSelect = () => {
    router.push(`/announcements?id=${props.id}`)
    setOpen(false)
  }

  return (
    <CommandItem onSelect={handleSelect} className='cursor-pointer'>
      <Megaphone className='mr-2' />
      <span>{props.title}</span>
    </CommandItem>
  )
}

function EventSearchItem({
  props,
  router,
  setOpen,
}: { props: TabsType['events'][number] } & SearchItemBaseProps) {
  const handleSelect = () => {
    router.push(`/events?id=${props.id}`)
    setOpen(false)
  }

  return (
    <CommandItem onSelect={handleSelect} className='cursor-pointer'>
      <Footprints className='mr-2' />
      <span>{props.title}</span>
    </CommandItem>
  )
}

function ScholarshipSearchItem({
  props,
  router,
  setOpen,
}: { props: TabsType['scholarships'][number] } & SearchItemBaseProps) {
  const handleSelect = () => {
    router.push(`/scholarships?id=${props.id}`)
    setOpen(false)
  }

  return (
    <CommandItem onSelect={handleSelect} className='cursor-pointer'>
      <Banknote className='mr-2' />
      <span>{props.title}</span>
    </CommandItem>
  )
}

function TryOutSearchItem({
  props,
  router,
  setOpen,
}: { props: TabsType['try-outs'][number] } & SearchItemBaseProps) {
  const handleSelect = () => {
    router.push(`/try-outs/${props.id}`)
    setOpen(false)
  }

  return (
    <CommandItem onSelect={handleSelect} className='cursor-pointer'>
      <Tally5 className='mr-2' />
      <span>{props.title}</span>
      <p className='text-muted-foreground ml-auto'>{props.classCode}</p>
    </CommandItem>
  )
}

const tabsItems: {
  [K in keyof TabsType]: (props: Record<"props", TabsType[K][number]> & SearchItemBaseProps) => JSX.Element
} = {
  courses: CourseSearchItem,
  announcements: AnnouncementSearchItem,
  events: EventSearchItem,
  scholarships: ScholarshipSearchItem,
  "try-outs": TryOutSearchItem
}

export default function SearchCMDK({ data }: { data: TabsType }) {
  const [open, setOpen] = useState(false)
  const pathName = usePathname();
  const firstPath = pathName.split("/")[1] as keyof TabsType;
  const primaryData = data[firstPath]
  const SearchItem = tabsItems[firstPath]
  const router = useRouter()

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
        <Kbd>Ctrl K</Kbd>
      </div>
      <CommandDialog open={open} onOpenChange={setOpen} showCloseButton={false} className='border-4 border-b-0'>
        <CommandInput placeholder='Search anything...' />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {primaryData && (
            <CommandGroup heading={firstPath} className='capitalize'>
              {primaryData.map(item => (
                // @ts-expect-error this is perfectly fine but typescript isnt smart enough to handle
                <SearchItem key={item.id + '-cmd-item-' + firstPath} props={item} router={router} setOpen={setOpen} />
              ))}
            </CommandGroup>
          )}
          {tabs.map(group => (
            <CommandGroup heading={group.group} key={group.group + group.items[0]?.label}>
              {group.items.map(item => (
                <CommandItem
                  key={item.label + '-cmd-item-' + group.group}
                  // asChild
                  onSelect={() => {
                    // Close the dialog when user selects
                    router.push(item.href)
                    setOpen(false)
                  }}
                >
                  <item.icon />
                  {item.label}
                  <span className="text-muted-foreground ml-auto">Tab</span>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
          {Object.entries(data).map(([label, items]) => {
            if (label === firstPath) return null
            const ListItem = tabsItems[label as keyof TabsType];
            return (
              <CommandGroup key={label + '-cmd-group'} heading={label} className='capitalize'>
                {items.map((item) => (
                  // @ts-expect-error this is perfectly fine but typescript isnt smart enough to handle
                  <ListItem key={item.id + '-cmd-item-' + label} props={item} router={router} setOpen={setOpen} />
                ))}
              </CommandGroup>
            )
          })}
        </CommandList>
        <div className="bg-border px-3 py-3 flex gap-2 items-center text-xs text-muted-foreground">
          <Kbd className='bg-card'><CornerDownLeft className='w-3 h-3' /></Kbd>
          <span className="">Go to page</span>
          <Kbd className='bg-card ml-4'>Esc</Kbd>
          <span className="">Close</span>
        </div>
      </CommandDialog>
    </>
  )
}