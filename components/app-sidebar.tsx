"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import {
  Send,
  Settings2,
  SquareTerminal,
  Briefcase,
  Users,
  FileText,
  Calendar,
  DollarSign,
  Database,
  Cloud,
  Shield,
  HelpCircle,
  User,
} from "lucide-react"
import Link from "next/link"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useState } from "react"
import { Separator } from "./ui/separator"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session, status } = useSession()
  const [systemStatusOpen, setSystemStatusOpen] = useState(false)
  // Navigation data for legal case management
  const navMain = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: SquareTerminal,
      items: [
        {
          title: "Overview",
          url: "/dashboard",
        },
        {
          title: "Analytics",
          url: "/dashboard/analytics",
        },
        {
          title: "Reports",
          url: "/dashboard/reports",
        },
      ],
    },
    {
      title: "Cases",
      url: "/dashboard/cases",
      icon: Briefcase,
      items: [
        {
          title: "All Cases",
          url: "/dashboard/cases",
        },
        {
          title: "Active Cases",
          url: "/dashboard/cases/active",
        },
        {
          title: "Closed Cases",
          url: "/dashboard/cases/closed",
        },
        {
          title: "New Case",
          url: "/dashboard/cases/new",
        },
      ],
    },
    {
      title: "Clients",
      url: "/dashboard/clients",
      icon: Users,
      items: [
        {
          title: "All Clients",
          url: "/dashboard/clients",
        },
        {
          title: "Active Clients",
          url: "/dashboard/clients/active",
        },
        {
          title: "Add Client",
          url: "/dashboard/clients/new",
        },
      ],
    },
    {
      title: "Documents",
      url: "/dashboard/documents",
      icon: FileText,
      items: [
        {
          title: "All Documents",
          url: "/dashboard/documents",
        },
        {
          title: "Upload Document",
          url: "/dashboard/documents/upload",
        },
        {
          title: "Templates",
          url: "/dashboard/documents/templates",
        },
      ],
    },
    {
      title: "Calendar",
      url: "/dashboard/calendar",
      icon: Calendar,
      items: [
        {
          title: "Hearings",
          url: "/dashboard/calendar/hearings",
        },
        {
          title: "Deadlines",
          url: "/dashboard/calendar/deadlines",
        },
        {
          title: "Schedule",
          url: "/dashboard/calendar/schedule",
        },
      ],
    },
    {
      title: "Financial",
      url: "/dashboard/financial",
      icon: DollarSign,
      items: [
        {
          title: "Invoices",
          url: "/dashboard/financial/invoices",
        },
        {
          title: "Payments",
          url: "/dashboard/financial/payments",
        },
        {
          title: "Reports",
          url: "/dashboard/financial/reports",
        },
      ],
    },
  ]

  const navSecondary = [
    {
      title: "Support",
      url: "/dashboard/support",
      icon: HelpCircle,
    },
    {
      title: "Feedback",
      url: "/dashboard/feedback",
      icon: Send,
    },
  ]

  const projects = [
    {
      name: "Backup & Restore",
      url: "/dashboard/system/backup",
      icon: Database,
    },
    {
      name: "Google Drive",
      url: "/dashboard/system/google-drive",
      icon: Cloud,
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
                <a href="/dashboard">
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <Shield className="size-4" />
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
        <NavProjects projects={projects} />
        <NavSecondary items={navSecondary} className="mt-auto " />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
