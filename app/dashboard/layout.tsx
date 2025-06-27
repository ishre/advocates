"use client";
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { AppSidebar } from "@/components/app-sidebar"
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
import { useEffect, useState } from "react";

export default function DashboardSectionLayout({ children }: { children: React.ReactNode }) {
  const [segments, setSegments] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const pathSegments = window.location.pathname
        .split('/')
        .filter(segment => segment && segment !== 'dashboard');
      setSegments(pathSegments);
    }
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar />
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
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                {segments.map((segment, index) => (
                  <BreadcrumbItem key={index}>
                    <BreadcrumbSeparator>/</BreadcrumbSeparator>
                    <BreadcrumbPage>{segment}</BreadcrumbPage>
                  </BreadcrumbItem>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <DashboardLayout>{children}</DashboardLayout>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 


