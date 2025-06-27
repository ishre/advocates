"use client";

import { useEffect, useState } from "react";
import { Activity, ChevronDown } from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";

const statusItems = [
  { key: "mongodb", label: "MongoDB" },
  { key: "googleDrive", label: "Google Drive" },
  { key: "emailService", label: "Email Service" },
];

export function SidebarSystemStatusMenu() {
  const { state } = useSidebar();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState({
    mongodb: false,
    googleDrive: false,
    emailService: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch("/api/system/status");
        if (res.ok) {
          const data = await res.json();
          setStatus({
            mongodb: !!data.mongodb,
            googleDrive: !!data.googleDrive,
            emailService: !!data.emailService,
          });
        }
      } finally {
        setLoading(false);
      }
    }
    fetchStatus();
  }, []);

  // Close dropdown if sidebar is collapsed
  useEffect(() => {
    if (state === "collapsed") setOpen(false);
  }, [state]);

  const getStatusLabel = (key: string) => {
    if (key === "mongodb") return status.mongodb ? "Connected" : "Disconnected";
    return status[key as keyof typeof status] ? "Configured" : "Not Configured";
  };

  return (
    <SidebarMenu className="mb-2">
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={() => state === "expanded" && setOpen((v) => !v)}
          aria-expanded={open && state === "expanded"}
          isActive={open && state === "expanded"}
        >
          <Activity className="size-4" />
          <span className="truncate">System Status</span>
          {state === "expanded" && (
            <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${open ? "rotate-180" : "rotate-0"}`} />
          )}
        </SidebarMenuButton>
        {open && state === "expanded" && (
          <div className="pl-6 pr-2 py-2 w-full">
            {statusItems.map((item) => (
              <div key={item.key} className="flex items-center justify-between py-1 select-none cursor-default">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm">{item.label}</span>
                </div>
                <span className="text-green-600 text-sm font-light">
                  {loading ? "..." : getStatusLabel(item.key)}
                </span>
              </div>
            ))}
          </div>
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  );
} 