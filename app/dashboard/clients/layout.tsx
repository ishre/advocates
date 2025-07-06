'use client';

import React from 'react';
import { ClientSidebar } from "@/components/client-sidebar"
import { HeaderClock } from "@/components/ui/clock"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { usePathname } from 'next/navigation';
import RoleGuard from "@/components/providers/RoleGuard";

export default function ClientDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Extract segments for breadcrumb, excluding 'dashboard' and 'clients'
  const segments = pathname
    .split('/')
    .filter(segment => segment && segment !== 'dashboard' && segment !== 'clients');

  return (
    <RoleGuard allowedRoles={["client"]}>
      <SidebarProvider>
        <ClientSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/dashboard/clients">Client Dashboard</BreadcrumbLink>
                  </BreadcrumbItem>
                  {segments.map((segment, index) => (
                    <React.Fragment key={`breadcrumb-${index}`}>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage>{segment}</BreadcrumbPage>
                      </BreadcrumbItem>
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="ml-auto flex items-center gap-4 px-4">
              <div className="flex items-center gap-2">
                <HeaderClock />
              </div>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </RoleGuard>
  );
} 