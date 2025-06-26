'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  FileText,
  Users,
  Calendar,
  Upload,
  Database,
  Cloud,
  RefreshCw,
  Plus,
  Settings,
  Activity,
  Briefcase,
  Gavel,
  FolderOpen,
  Download,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  DollarSign,
  TrendingUp,
  BarChart3,
  PieChart,
  LineChart,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  stats: {
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
  };
  systemStatus: {
    mongodb: boolean;
    googleDrive: boolean;
    emailService: boolean;
    lastBackup?: Date;
  };
  onNewCase: () => void;
  onNewClient: () => void;
  onScheduleHearing: () => void;
  onUploadDocument: () => void;
  onCreateSampleData: () => void;
  onBackup: () => void;
  onDownloadBackup: () => void;
  onRestore: (filename: string) => void;
  onRefresh: () => void;
  availableBackups: Array<{
    filename: string;
    size: number;
    createdAt: Date;
    modifiedAt: Date;
  }>;
  backupStatus: 'idle' | 'backing_up' | 'restoring' | 'success' | 'error';
  sampleDataStatus: 'idle' | 'creating' | 'success' | 'error';
}

export default function Sidebar({
  stats,
  systemStatus,
  onNewCase,
  onNewClient,
  onScheduleHearing,
  onUploadDocument,
  onCreateSampleData,
  onBackup,
  onDownloadBackup,
  onRestore,
  onRefresh,
  availableBackups,
  backupStatus,
  sampleDataStatus,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-80'}`}>
      {/* Toggle Button */}
      <div className="flex justify-end p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 p-0"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <div className="p-4 space-y-6">
        {/* System Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className={`text-sm font-medium ${isCollapsed ? 'sr-only' : ''}`}>
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${systemStatus.mongodb ? 'bg-green-500' : 'bg-red-500'}`}></div>
                {!isCollapsed && <span className="text-xs">MongoDB</span>}
              </div>
              {!isCollapsed && (
                <span className={`text-xs ${systemStatus.mongodb ? 'text-green-600' : 'text-red-600'}`}>
                  {systemStatus.mongodb ? 'Connected' : 'Disconnected'}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${systemStatus.googleDrive ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                {!isCollapsed && <span className="text-xs">Google Drive</span>}
              </div>
              {!isCollapsed && (
                <span className={`text-xs ${systemStatus.googleDrive ? 'text-green-600' : 'text-yellow-600'}`}>
                  {systemStatus.googleDrive ? 'Configured' : 'Not Configured'}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${systemStatus.emailService ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                {!isCollapsed && <span className="text-xs">Email Service</span>}
              </div>
              {!isCollapsed && (
                <span className={`text-xs ${systemStatus.emailService ? 'text-green-600' : 'text-yellow-600'}`}>
                  {systemStatus.emailService ? 'Configured' : 'Not Configured'}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        {!isCollapsed && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Cases</span>
                <Badge variant="secondary" className="text-xs">{stats.totalCases}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Clients</span>
                <Badge variant="secondary" className="text-xs">{stats.totalClients}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Revenue</span>
                <span className="text-xs font-medium">{formatCurrency(stats.totalRevenue)}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className={`text-sm font-medium ${isCollapsed ? 'sr-only' : ''}`}>
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onNewCase}
              className={`w-full justify-start ${isCollapsed ? 'px-2' : ''}`}
            >
              <Plus className="h-4 w-4 mr-2" />
              {!isCollapsed && <span>New Case</span>}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onNewClient}
              className={`w-full justify-start ${isCollapsed ? 'px-2' : ''}`}
            >
              <Users className="h-4 w-4 mr-2" />
              {!isCollapsed && <span>New Client</span>}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onScheduleHearing}
              className={`w-full justify-start ${isCollapsed ? 'px-2' : ''}`}
            >
              <Calendar className="h-4 w-4 mr-2" />
              {!isCollapsed && <span>Schedule Hearing</span>}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onUploadDocument}
              className={`w-full justify-start ${isCollapsed ? 'px-2' : ''}`}
            >
              <Upload className="h-4 w-4 mr-2" />
              {!isCollapsed && <span>Upload Document</span>}
            </Button>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className={`text-sm font-medium ${isCollapsed ? 'sr-only' : ''}`}>
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onCreateSampleData}
              disabled={sampleDataStatus === 'creating'}
              className={`w-full justify-start ${isCollapsed ? 'px-2' : ''}`}
            >
              <Database className="h-4 w-4 mr-2" />
              {!isCollapsed && <span>{sampleDataStatus === 'creating' ? 'Creating...' : 'Sample Data'}</span>}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onBackup}
              disabled={backupStatus === 'backing_up'}
              className={`w-full justify-start ${isCollapsed ? 'px-2' : ''}`}
            >
              <Cloud className="h-4 w-4 mr-2" />
              {!isCollapsed && <span>{backupStatus === 'backing_up' ? 'Backing up...' : 'Create Backup'}</span>}
            </Button>
            {availableBackups.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDownloadBackup}
                className={`w-full justify-start ${isCollapsed ? 'px-2' : ''}`}
              >
                <Download className="h-4 w-4 mr-2" />
                {!isCollapsed && <span>Download Backup</span>}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className={`w-full justify-start ${isCollapsed ? 'px-2' : ''}`}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {!isCollapsed && <span>Refresh Data</span>}
            </Button>
          </CardContent>
        </Card>

        {/* Backup History */}
        {!isCollapsed && availableBackups.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Recent Backups</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {availableBackups.slice(0, 3).map((backup) => (
                <div
                  key={backup.filename}
                  className="flex items-center justify-between p-2 rounded border cursor-pointer hover:bg-gray-50"
                  onClick={() => onRestore(backup.filename)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{backup.filename}</p>
                    <p className="text-xs text-gray-500">{formatDateTime(backup.createdAt)}</p>
                  </div>
                  <span className="text-xs text-gray-500">{(backup.size / 1024).toFixed(1)}KB</span>
                </div>
              ))}
              {availableBackups.length > 3 && (
                <p className="text-xs text-gray-500 text-center">
                  ... and {availableBackups.length - 3} more
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 