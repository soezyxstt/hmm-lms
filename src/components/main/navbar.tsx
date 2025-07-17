import { cookies } from "next/headers";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from '../ui/sidebar';
import { Separator } from '../ui/separator';
import HeaderTitle from './header-title';
import ProfileMenu from './profile-menu';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '../ui/badge';
import SearchCMDK from './cmdk-search';
import { Banknote, Calendar, Footprints, GraduationCap, Home, Megaphone, Settings, Tally5 } from 'lucide-react';
import { auth } from '~/server/auth';
import ThemeSwitch from '../theme-switch';

const sidebarTabs: {
  group: string,
  items: {
    label: string,
    href: string,
    icon: typeof Banknote,
    tooltip: string,
    dev?: boolean
  }[]
}[] = [
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
]

export default async function MainNavbar({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <main className='w-full overflow-y-auto h-screen'>
        <SiteHeader />
        <div className="p-4">
          {children}
        </div>
      </main>
    </SidebarProvider>
  )
}

async function AppSidebar() {
  const session = await auth();
  const user = session?.user ?? {
    name: "Guest",
    role: 'STUDENT',
    image: ''
  }

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-inherit"
            >
              <div className="flex aspect-square transition-all items-center justify-center rounded-lg h-full">
                <Image
                  src="/hmm-vstock/logo.png"
                  alt="Logo"
                  width={196}
                  height={196}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="flex-1 text-left text-sm leading-tight ml-2">
                <h1 className="text-xl font-semibold truncate">HMM ITB</h1>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {sidebarTabs.map((group) => (
          <SidebarGroup key={'sidebar-group-' + group.group}>
            <SidebarGroupLabel>
              {group.group}
            </SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => (
                <SidebarMenuItem key={'sidebar-item-' + item.label}>
                  <SidebarMenuButton tooltip={item.tooltip} asChild>
                    <Link href={item.href} className='transition-all rounded-l-full pl-4 py-1.5 flex items-center'>
                      <item.icon />
                      <span>{item.label}</span>
                      {item.dev && <Badge variant='secondary' className='ml-2'>dev</Badge>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <ProfileMenu user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}

function SiteHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 py-2 sticky top-0 z-50 border-b bg-background">
      <div className="flex items-center w-full gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className='-ml-1 cursor-pointer' />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <HeaderTitle />
        <div className="ml-auto flex gap-4 items-center">
          <SearchCMDK />
          <ThemeSwitch />
        </div>
      </div>
    </header>
  )
}