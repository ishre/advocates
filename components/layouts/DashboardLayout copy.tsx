'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AppSidebar } from '@/components/app-sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Settings, 
  LogOut, 
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Scale,
} from 'lucide-react';
import Sidebar from './Sidebar';
import NewCaseForm from '../forms/NewCaseForm';
import NewClientForm from '../forms/NewClientForm';
import HearingScheduler from '../forms/HearingScheduler';
import DocumentUpload from '../forms/DocumentUpload';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { SidebarProvider } from '../ui/sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface SystemStatus {
  mongodb: boolean;
  googleDrive: boolean;
  emailService: boolean;
  lastBackup?: Date;
}

interface Stats {
  totalCases: number;
  activeCases: number;
  closedCases: number;
  totalClients: number;
  activeClients: number;
  totalRevenue: number;
  pendingFees: number;
  upcomingHearings: number;
  overdueTasks: number;
  completedTasks: number;
}

interface Backup {
  filename: string;
  size: number;
  createdAt: Date;
  modifiedAt: Date;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session } = useSession();
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    mongodb: false,
    googleDrive: false,
    emailService: false,
  });
  const [stats, setStats] = useState<Stats>({
    totalCases: 0,
    activeCases: 0,
    closedCases: 0,
    totalClients: 0,
    activeClients: 0,
    totalRevenue: 0,
    pendingFees: 0,
    upcomingHearings: 0,
    overdueTasks: 0,
    completedTasks: 0,
  });
  const [availableBackups, setAvailableBackups] = useState<Backup[]>([]);
  const [backupStatus, setBackupStatus] = useState<'idle' | 'backing_up' | 'restoring' | 'success' | 'error'>('idle');
  const [sampleDataStatus, setSampleDataStatus] = useState<'idle' | 'creating' | 'success' | 'error'>('idle');

  // Form states
  const [showNewCaseForm, setShowNewCaseForm] = useState(false);
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [showHearingScheduler, setShowHearingScheduler] = useState(false);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [time, setTime] = useState('');

  useEffect(() => {
    fetchSystemStatus();
    fetchStats();
    fetchBackups();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit', 
        second: '2-digit'
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchSystemStatus = async () => {
    try {
      const response = await fetch('/api/system/status');
      if (response.ok) {
        const data = await response.json();
        setSystemStatus(data);
      }
    } catch (error) {
      console.error('Error fetching system status:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchBackups = async () => {
    try {
      const response = await fetch('/api/backup/list');
      if (response.ok) {
        const data = await response.json();
        setAvailableBackups(data.backups || []);
      }
    } catch (error) {
      console.error('Error fetching backups:', error);
    }
  };

  const handleCreateSampleData = async () => {
    setSampleDataStatus('creating');
    try {
      const response = await fetch('/api/sample-data', {
        method: 'POST',
      });
      if (response.ok) {
        setSampleDataStatus('success');
        fetchStats();
        setTimeout(() => setSampleDataStatus('idle'), 3000);
      } else {
        setSampleDataStatus('error');
        setTimeout(() => setSampleDataStatus('idle'), 3000);
      }
    } catch (error) {
      setSampleDataStatus('error');
      setTimeout(() => setSampleDataStatus('idle'), 3000);
    }
  };

  const handleBackup = async () => {
    setBackupStatus('backing_up');
    try {
      const response = await fetch('/api/backup/create', {
        method: 'POST',
      });
      if (response.ok) {
        setBackupStatus('success');
        fetchBackups();
        setTimeout(() => setBackupStatus('idle'), 3000);
      } else {
        setBackupStatus('error');
        setTimeout(() => setBackupStatus('idle'), 3000);
      }
    } catch (error) {
      setBackupStatus('error');
      setTimeout(() => setBackupStatus('idle'), 3000);
    }
  };

  const handleDownloadBackup = async () => {
    if (availableBackups.length > 0) {
      const latestBackup = availableBackups[0];
      window.open(`/api/backup/download/${latestBackup.filename}`, '_blank');
    }
  };

  const handleRestore = async (filename: string) => {
    if (confirm(`Are you sure you want to restore from ${filename}? This will overwrite current data.`)) {
      setBackupStatus('restoring');
      try {
        const response = await fetch('/api/backup/restore', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ filename }),
        });
        if (response.ok) {
          setBackupStatus('success');
          fetchStats();
          setTimeout(() => setBackupStatus('idle'), 3000);
        } else {
          setBackupStatus('error');
          setTimeout(() => setBackupStatus('idle'), 3000);
        }
      } catch (error) {
        setBackupStatus('error');
        setTimeout(() => setBackupStatus('idle'), 3000);
      }
    }
  };

  const handleRefresh = () => {
    fetchSystemStatus();
    fetchStats();
    fetchBackups();
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle2 className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusText = (status: boolean) => {
    return status ? 'Connected' : 'Disconnected';
  };

  const getStatusColor = (status: boolean) => {
    return status ? 'text-green-600' : 'text-red-600';
  };

  if (!session) {
    return <div>Loading...</div>;
  }

  return (

    <div className="min-h-screen bg-gray-50">
      
      {/* Header */}
      
      <SidebarProvider>
        <AppSidebar />
      </SidebarProvider>

      {/* Main Content with Sidebar */}
      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          stats={stats}
          systemStatus={systemStatus}
          onNewCase={() => setShowNewCaseForm(true)}
          onNewClient={() => setShowNewClientForm(true)}
          onScheduleHearing={() => setShowHearingScheduler(true)}
          onUploadDocument={() => setShowDocumentUpload(true)}
          onCreateSampleData={handleCreateSampleData}
          onBackup={handleBackup}
          onDownloadBackup={handleDownloadBackup}
          onRestore={handleRestore}
          onRefresh={handleRefresh}
          availableBackups={availableBackups}
          backupStatus={backupStatus}
          sampleDataStatus={sampleDataStatus}
          session={session}
          onSignOut={signOut}
        />

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>

      {/* Modals */}
      {showNewCaseForm && (
        <NewCaseForm
          onClose={() => setShowNewCaseForm(false)}
          onSuccess={() => {
            fetchStats();
            setShowNewCaseForm(false);
          }}
        />
      )}

      {showNewClientForm && (
        <NewClientForm
          onClose={() => setShowNewClientForm(false)}
          onSuccess={() => {
            fetchStats();
            setShowNewClientForm(false);
          }}
        />
      )}

      {showHearingScheduler && (
        <HearingScheduler
          onClose={() => setShowHearingScheduler(false)}
          onSuccess={() => {
            fetchStats();
            setShowHearingScheduler(false);
          }}
        />
      )}

      {showDocumentUpload && (
        <DocumentUpload
          onClose={() => setShowDocumentUpload(false)}
          onSuccess={() => {
            fetchStats();
            setShowDocumentUpload(false);
          }}
        />
      )}
    </div>
  );
} 