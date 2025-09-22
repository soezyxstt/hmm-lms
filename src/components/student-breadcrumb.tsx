"use client";

import { usePathname } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import type { TabsType } from './main/cmdk-search';
import { Fragment } from 'react';

const definedDBItems = ['courses', 'tryouts', 'scholarships', 'events', 'announcements', 'loker']

export default function StudentBreadcrumb({ items, isMobile = false }: { items: TabsType, isMobile?: boolean }) {
  const pathNames = usePathname()?.split("/") || []
  pathNames.shift()
  const firstPath = pathNames[0]; 

  if (pathNames.length === 0) return null

  if (pathNames.length <= 3) {
    return (
      <Breadcrumb className={isMobile ? "sm:hidden" : "max-sm:hidden"}>
        <BreadcrumbList>
          {pathNames.map((path, index) => {
            const href = `/${pathNames.slice(0, index + 1).join("/")}`
            const isLast = index === pathNames.length - 1
            return (
              <Fragment key={href + index}>
                {index !== 0 && <BreadcrumbSeparator key={href + index + "separator"} />}
                <BreadcrumbItem key={href + index} className='capitalize'>
                  {isLast ? (
                    <BreadcrumbPage>{path.replace(/-/g, " ")}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={href}
                      className="hover:text-foreground"
                    >
                      {path.replace(/-/g, " ")}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </Fragment>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>
    )
  }

  return (
    <Breadcrumb className={isMobile ? "sm:hidden" : "max-sm:hidden"}>
      <BreadcrumbList>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <DropdownMenu>
            <DropdownMenuTrigger className="hover:text-foreground">
              <BreadcrumbEllipsis />
              <span className="sr-only">Toggle menu</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem asChild>
                <a href="#">Documentation</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="#">Themes</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="#">GitHub</a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Components</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}