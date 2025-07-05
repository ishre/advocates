"use client";
import { AdvocateSidebar } from "@/components/advocate-sidebar"
import { HeaderClock } from "@/components/ui/clock"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation";
import React from "react";

export default function AdvocateDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const segments = pathname
    .split('/')
    .filter(segment => segment && segment !== 'dashboard' && segment !== 'advocates');

  return (
    <SidebarProvider>
      <AdvocateSidebar />
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
                  <BreadcrumbLink href="/dashboard/advocates">Dashboard</BreadcrumbLink>
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
  )
} 