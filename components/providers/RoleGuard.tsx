"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
  fallback?: React.ReactNode;
}

export default function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.replace("/auth/signin");
      return;
    }

    if (session?.user?.roles) {
      const userRoles = Array.isArray(session.user.roles) 
        ? session.user.roles 
        : [session.user.roles];
      
      const hasAccess = userRoles.some(role => allowedRoles.includes(role));
      
      // Debug logging
      console.log("RoleGuard Debug:", {
        userRoles,
        allowedRoles,
        hasAccess,
        pathname: window.location.pathname
      });
      
      if (!hasAccess) {
        // Redirect to appropriate page based on user role
        if (userRoles.includes("client")) {
          console.log("Redirecting client to /dashboard/clients");
          router.replace("/dashboard/clients");
        } else {
          console.log("Redirecting to /dashboard");
          router.replace("/dashboard");
        }
      }
    }
  }, [session, status, router, allowedRoles]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">Please sign in to continue.</p>
        </div>
      </div>
    );
  }

  if (session?.user?.roles) {
    const userRoles = Array.isArray(session.user.roles) 
      ? session.user.roles 
      : [session.user.roles];
    
    const hasAccess = userRoles.some(role => allowedRoles.includes(role));
    
    if (!hasAccess) {
      return fallback || (
        <div className="flex items-center justify-center min-h-screen">
                  <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don&apos;t have permission to access this page.</p>
        </div>
        </div>
      );
    }
  }

  return <>{children}</>;
} 