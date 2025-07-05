"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import {
  Send,
  SquareTerminal,
  Briefcase,
  Users,
  FileText,
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

export function ClientSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()
  
  // Navigation data for clients
  const navMain = [
    {
      title: "Dashboard",
      url: "/dashboard/clients",
      icon: SquareTerminal,
      items: [
        {
          title: "Overview",
          url: "/dashboard/clients",
        },
      ],
    },
    {
      title: "My Cases",
      url: "/dashboard/clients/cases",
      icon: Briefcase,
      items: [
        {
          title: "All Cases",
          url: "/dashboard/clients/cases",
        },
        {
          title: "Active Cases",
          url: "/dashboard/clients/cases/active",
        },
        {
          title: "Closed Cases",
          url: "/dashboard/clients/cases/closed",
        },
      ],
    },
    {
      title: "Documents",
      url: "/dashboard/clients/documents",
      icon: FileText,
      items: [
        {
          title: "All Documents",
          url: "/dashboard/clients/documents",
        },
      ],
    },
    {
      title: "Messages",
      url: "/dashboard/clients/messages",
      icon: Users,
      items: [
        {
          title: "Inbox",
          url: "/dashboard/clients/messages",
        },
        {
          title: "Contact Advocate",
          url: "/dashboard/clients/messages/contact",
        },
      ],
    },
  ]

  const navSecondary = [
    {
      title: "Support",
      url: "/dashboard/clients/support",
      icon: HelpCircle,
    },
    {
      title: "Contact Advocate",
      url: "/dashboard/clients/contact",
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
                <a href="/dashboard/clients">
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <SquareTerminal className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">Lexapro</span>
                    <span className="truncate text-xs">Client Portal</span>
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