'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
} from 'lucide-react';
import Sidebar from './Sidebar';
import NewCaseForm from '../forms/NewCaseForm';
import NewClientForm from '../forms/NewClientForm';
import HearingScheduler from '../forms/HearingScheduler';
import DocumentUpload from '../forms/DocumentUpload';

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

  useEffect(() => {
    fetchSystemStatus();
    fetchStats();
    fetchBackups();
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
      <header className="bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">Legal Advocate</h1>
            <Badge variant="outline" className="text-xs">
              Dashboard
            </Badge>
          </div>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session.user?.image || ''} alt={session.user?.name || ''} />
                  <AvatarFallback>
                    {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session.user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* System Status */}
              <div className="px-2 py-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">MongoDB</span>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(systemStatus.mongodb)}
                    <span className={getStatusColor(systemStatus.mongodb)}>
                      {getStatusText(systemStatus.mongodb)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-muted-foreground">Google Drive</span>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(systemStatus.googleDrive)}
                    <span className={getStatusColor(systemStatus.googleDrive)}>
                      {getStatusText(systemStatus.googleDrive)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-muted-foreground">Email Service</span>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(systemStatus.emailService)}
                    <span className={getStatusColor(systemStatus.emailService)}>
                      {getStatusText(systemStatus.emailService)}
                    </span>
                  </div>
                </div>
              </div>
              
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

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