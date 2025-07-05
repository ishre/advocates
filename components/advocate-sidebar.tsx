"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import {
  Send,
  SquareTerminal,
  Briefcase,
  Users,
  FileText,
  Calendar,
  DollarSign,
  HelpCircle,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Separator } from "./ui/separator"

export function AdvocateSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()
  
  // Navigation data for advocates
  const navMain = [
    {
      title: "Dashboard",
      url: "/dashboard/advocates",
      icon: SquareTerminal,
      items: [
        {
          title: "Overview",
          url: "/dashboard/advocates",
        },
        {
          title: "Analytics",
          url: "/dashboard/advocates/analytics",
        },
        {
          title: "Reports",
          url: "/dashboard/advocates/reports",
        },
      ],
    },
    {
      title: "Cases",
      url: "/dashboard/advocates/cases",
      icon: Briefcase,
      items: [
        {
          title: "All Cases",
          url: "/dashboard/advocates/cases",
        },
        {
          title: "Active Cases",
          url: "/dashboard/advocates/cases/active",
        },
        {
          title: "Closed Cases",
          url: "/dashboard/advocates/cases/closed",
        },
        {
          title: "New Case",
          url: "/dashboard/advocates/cases/new",
        },
      ],
    },
    {
      title: "Documents",
      url: "/dashboard/advocates/documents",
      icon: FileText,
      items: [
        {
          title: "All Documents",
          url: "/dashboard/advocates/documents",
        },
        {
          title: "Upload Document",
          url: "/dashboard/advocates/documents/upload",
        },
        {
          title: "Templates",
          url: "/dashboard/advocates/documents/templates",
        },
      ],
    },
    {
      title: "Clients",
      url: "/dashboard/advocates/clients",
      icon: Users,
      items: [
        {
          title: "All Clients",
          url: "/dashboard/advocates/clients",
        },
        {
          title: "Active Clients",
          url: "/dashboard/advocates/clients/active",
        },
        {
          title: "Add Client",
          url: "/dashboard/advocates/clients/new",
        },
      ],
    },
    {
      title: "Calendar",
      url: "/dashboard/advocates/calendar",
      icon: Calendar,
      items: [
        {
          title: "Hearings",
          url: "/dashboard/advocates/calendar/hearings",
        },
        {
          title: "Deadlines",
          url: "/dashboard/advocates/calendar/deadlines",
        },
        {
          title: "Schedule",
          url: "/dashboard/advocates/calendar/schedule",
        },
      ],
    },
    {
      title: "Financial",
      url: "/dashboard/advocates/financial",
      icon: DollarSign,
      items: [
        {
          title: "Invoices",
          url: "/dashboard/advocates/financial/invoices",
        },
        {
          title: "Payments",
          url: "/dashboard/advocates/financial/payments",
        },
        {
          title: "Reports",
          url: "/dashboard/advocates/financial/reports",
        },
      ],
    },
  ]

  const navSecondary = [
    {
      title: "Support",
      url: "/dashboard/advocates/support",
      icon: HelpCircle,
    },
    {
      title: "Feedback",
      url: "/dashboard/advocates/feedback",
      icon: Send,
    },
  ]

  // Create user object from session data
  const user = session?.user ? {
    name: session.user.name || 'User',
    email: session.user.email || '',
    avatar: session.user.image || '',
  } : {
    name: 'Loading...',
    email: 'loading@example.com',
    avatar: '',
  }

  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center justify-between">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <a href="/dashboard/advocates">
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <SquareTerminal className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">Lexapro</span>
                    <span className="truncate text-xs">Case Manager</span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
        <Separator />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className="mt-auto " />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
} 