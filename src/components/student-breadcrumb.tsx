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
import { Fragment } from 'react';

export default function StudentBreadcrumb({ isMobile = false }: { isMobile?: boolean }) {
  const pathNames = usePathname()?.split("/").filter(Boolean) || [];

  if (pathNames.length === 0) return null;

  // If 3 or fewer items, show all breadcrumbs normally
  if (pathNames.length <= 3) {
    return (
      <Breadcrumb className={isMobile ? "sm:hidden" : "max-sm:hidden"}>
        <BreadcrumbList>
          {pathNames.map((path, index) => {
            const href = `/${pathNames.slice(0, index + 1).join("/")}`;
            const isLast = index === pathNames.length - 1;
            const label = path.replace(/-/g, " ");

            return (
              <Fragment key={href}>
                {index !== 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem className='capitalize'>
                  {isLast ? (
                    <BreadcrumbPage>{label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={href} className="hover:text-foreground">
                      {label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  // If more than 3 items, show: first > ... > last
  const firstPath = pathNames[0];
  const lastPath = pathNames[pathNames.length - 1];
  const middlePaths = pathNames.slice(1, -1);

  return (
    <Breadcrumb className={isMobile ? "sm:hidden" : "max-sm:hidden"}>
      <BreadcrumbList>
        {/* First item */}
        <BreadcrumbItem className='capitalize'>
          <BreadcrumbLink href={`/${firstPath}`} className="hover:text-foreground">
            {firstPath?.replace(/-/g, " ")}
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbSeparator />

        {/* Collapsed middle items with dropdown */}
        <BreadcrumbItem>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 hover:text-foreground">
              <BreadcrumbEllipsis className="h-4 w-4" />
              <span className="sr-only">Toggle menu</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {middlePaths.map((path, index) => {
                const href = `/${pathNames.slice(0, index + 2).join("/")}`;
                const label = path.replace(/-/g, " ");

                return (
                  <DropdownMenuItem key={href} asChild>
                    <a href={href} className="capitalize">
                      {label}
                    </a>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </BreadcrumbItem>

        <BreadcrumbSeparator />

        {/* Last item (current page) */}
        <BreadcrumbItem className='capitalize'>
          <BreadcrumbPage>{lastPath?.replace(/-/g, " ")}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
