"use client";

import { usePathname } from 'next/navigation';

export default function HeaderTitle() {
  const pathname = usePathname();
  const firstPath = pathname.split('/')[1] ?? "";
  const titleMap: Record<string, string> = {
    dashboard: 'Dashboard',
    courses: 'Courses',
    profile: 'Profile',
    settings: 'Settings',
    announcements: 'Announcements',
    events: 'Events',
    scholarship: 'Scholarship',
    schedule: 'Schedule',
    "try-outs": 'Try Outs',
  };

  return (
    <h1 className="text-base font-medium">
      {titleMap[firstPath] ?? 'Home'}
    </h1>
  )
}