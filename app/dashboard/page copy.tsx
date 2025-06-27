'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { 
  Calendar, 
  FileText, 
  Users, 
  Briefcase, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Upload,
  Download,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  User,
  Building,
  Scale,
  Gavel,
  FolderOpen,
  Database,
  Cloud,
  Settings,
  Bell,
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  Wifi,
  WifiOff,
  CheckCircle2,
  XCircle,
  Info,
  ChevronDown,
  LogOut,
  User as UserIcon,
  Shield,
  Activity
} from 'lucide-react';

interface DashboardStats {
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

interface RecentCase {
  id: string;
  caseNumber: string;
  title: string;
  clientName: string;
  status: string;
  priority: string;
  nextHearingDate?: Date;
  lastUpdated: Date;
}

interface RecentClient {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalCases: number;
  activeCases: number;
  lastContact: Date;
}

interface UpcomingHearing {
  id: string;
  caseNumber: string;
  caseTitle: string;
  hearingDate: Date;
  courtName: string;
  courtLocation: string;
  hearingType: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  dueDate: Date;
  status: string;
  priority: string;
  caseNumber?: string;
}

interface BackupFile {
  filename: string;
  size: number;
  createdAt: Date;
  modifiedAt: Date;
}

interface SystemStatus {
  mongodb: boolean;
  googleDrive: boolean;
  emailService: boolean;
  lastBackup?: Date;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<DashboardStats>({
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
  const [recentCases, setRecentCases] = useState<RecentCase[]>([]);
  const [recentClients, setRecentClients] = useState<RecentClient[]>([]);
  const [upcomingHearings, setUpcomingHearings] = useState<UpcomingHearing[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [backupStatus, setBackupStatus] = useState<'idle' | 'backing_up' | 'restoring' | 'success' | 'error'>('idle');
  const [backupMessage, setBackupMessage] = useState('');
  const [availableBackups, setAvailableBackups] = useState<BackupFile[]>([]);
  const [selectedBackup, setSelectedBackup] = useState<string>('');
  const [sampleDataStatus, setSampleDataStatus] = useState<'idle' | 'creating' | 'success' | 'error'>('idle');
  const [sampleDataMessage, setSampleDataMessage] = useState('');
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    mongodb: false,
    googleDrive: false,
    emailService: false,
  });

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDashboardData();
      fetchAvailableBackups();
      checkSystemStatus();
    }
  }, [status]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard statistics
      const statsResponse = await fetch('/api/dashboard/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch recent cases
      const casesResponse = await fetch('/api/dashboard/recent-cases');
      if (casesResponse.ok) {
        const casesData = await casesResponse.json();
        setRecentCases(casesData);
      }

      // Fetch recent clients
      const clientsResponse = await fetch('/api/dashboard/recent-clients');
      if (clientsResponse.ok) {
        const clientsData = await clientsResponse.json();
        setRecentClients(clientsData);
      }

      // Fetch upcoming hearings
      const hearingsResponse = await fetch('/api/dashboard/upcoming-hearings');
      if (hearingsResponse.ok) {
        const hearingsData = await hearingsResponse.json();
        setUpcomingHearings(hearingsData);
      }

      // Fetch tasks
      const tasksResponse = await fetch('/api/dashboard/tasks');
      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json();
        setTasks(tasksData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableBackups = async () => {
    try {
      const response = await fetch('/api/backup/list');
      if (response.ok) {
        const data = await response.json();
        setAvailableBackups(data.backups || []);
        if (data.backups && data.backups.length > 0) {
          setSelectedBackup(data.backups[0].filename);
        }
      }
    } catch (error) {
      console.error('Error fetching available backups:', error);
    }
  };

  const checkSystemStatus = async () => {
    try {
      const response = await fetch('/api/system/status');
      if (response.ok) {
        const statusData = await response.json();
        setSystemStatus({
          mongodb: statusData.mongodb,
          googleDrive: statusData.googleDrive,
          emailService: statusData.emailService,
          lastBackup: statusData.lastBackup ? new Date(statusData.lastBackup) : undefined,
        });
      }
    } catch (error) {
      console.error('Error checking system status:', error);
    }
  };

  const handleBackup = async () => {
    try {
      setBackupStatus('backing_up');
      setBackupMessage('Creating backup...');
      
      const response = await fetch('/api/backup/create', {
        method: 'POST',
      });
      
      if (response.ok) {
        const result = await response.json();
        setBackupStatus('success');
        setBackupMessage(`Backup created successfully! ${result.items.cases} cases, ${result.items.clients} clients`);
        fetchAvailableBackups();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Backup failed');
      }
    } catch (error) {
      setBackupStatus('error');
      setBackupMessage(error instanceof Error ? error.message : 'Backup failed. Please try again.');
    }
  };

  const handleDownloadBackup = async () => {
    if (availableBackups.length === 0) return;
    
    try {
      const latestBackup = availableBackups[0];
      const response = await fetch(`/api/backup/download/${latestBackup.filename}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = latestBackup.filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading backup:', error);
    }
  };

  const handleRestore = async () => {
    if (!selectedBackup) {
      setBackupStatus('error');
      setBackupMessage('Please select a backup file to restore from.');
      return;
    }

    try {
      setBackupStatus('restoring');
      setBackupMessage('Restoring from backup...');
      
      const response = await fetch('/api/backup/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ backupFile: selectedBackup }),
      });
      
      if (response.ok) {
        const result = await response.json();
        setBackupStatus('success');
        setBackupMessage(`Data restored successfully! ${result.restoredItems.cases} cases, ${result.restoredItems.clients} clients`);
        fetchDashboardData();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Restore failed');
      }
    } catch (error) {
      setBackupStatus('error');
      setBackupMessage(error instanceof Error ? error.message : 'Restore failed. Please try again.');
    }
  };

  const handleCreateSampleData = async () => {
    try {
      setSampleDataStatus('creating');
      setSampleDataMessage('Creating sample data...');
      
      const response = await fetch('/api/sample-data', {
        method: 'POST',
      });
      
      if (response.ok) {
        const result = await response.json();
        setSampleDataStatus('success');
        setSampleDataMessage(`Sample data created! ${result.clients} clients, ${result.cases} cases`);
        fetchDashboardData();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create sample data');
      }
    } catch (error) {
      setSampleDataStatus('error');
      setSampleDataMessage(error instanceof Error ? error.message : 'Failed to create sample data');
    }
  };

  const handleNewCase = () => {
    // TODO: Implement new case creation
    alert('New Case functionality coming soon!');
  };

  const handleNewClient = () => {
    // TODO: Implement new client creation
    alert('New Client functionality coming soon!');
  };

  const handleScheduleHearing = () => {
    // TODO: Implement hearing scheduling
    alert('Schedule Hearing functionality coming soon!');
  };

  const handleUploadDocument = () => {
    // TODO: Implement document upload
    alert('Upload Document functionality coming soon!');
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'on_hold':
        return 'bg-orange-100 text-orange-800';
      case 'settled':
        return 'bg-blue-100 text-blue-800';
      case 'dismissed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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

  // Chart data
  const caseStatusData = [
    { name: 'Active', value: stats.activeCases, color: '#10b981' },
    { name: 'Closed', value: stats.closedCases, color: '#6b7280' },
    { name: 'Pending', value: stats.totalCases - stats.activeCases - stats.closedCases, color: '#f59e0b' },
  ];

  const monthlyRevenueData = [
    { month: 'Jan', revenue: 15000 },
    { month: 'Feb', revenue: 22000 },
    { month: 'Mar', revenue: 18000 },
    { month: 'Apr', revenue: 25000 },
    { month: 'May', revenue: 30000 },
    { month: 'Jun', revenue: 28000 },
  ];

  const caseTypeData = [
    { type: 'Civil', cases: 25 },
    { type: 'Criminal', cases: 15 },
    { type: 'Family', cases: 20 },
    { type: 'Corporate', cases: 10 },
    { type: 'Property', cases: 8 },
  ];

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Please sign in to access the dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href="/auth/signin">Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      {/* Status Alerts */}
      {backupStatus !== 'idle' && (
        <Alert className={backupStatus === 'success' ? 'border-green-200 bg-green-50' : backupStatus === 'error' ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'}>
          <AlertDescription className={backupStatus === 'success' ? 'text-green-800' : backupStatus === 'error' ? 'text-red-800' : 'text-blue-800'}>
            {backupMessage}
          </AlertDescription>
        </Alert>
      )}

      {sampleDataStatus !== 'idle' && (
        <Alert className={sampleDataStatus === 'success' ? 'border-green-200 bg-green-50' : sampleDataStatus === 'error' ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'}>
          <AlertDescription className={sampleDataStatus === 'success' ? 'text-green-800' : sampleDataStatus === 'error' ? 'text-red-800' : 'text-blue-800'}>
            {sampleDataMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCases}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeCases} active, {stats.closedCases} closed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeClients} active clients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(stats.pendingFees)} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Hearings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingHearings}</div>
            <p className="text-xs text-muted-foreground">
              Next 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Case Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Case Status Distribution</CardTitle>
            <CardDescription>Breakdown of cases by status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={caseStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {caseStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue Trend</CardTitle>
            <CardDescription>Revenue over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Case Types Chart */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Cases by Type</CardTitle>
            <CardDescription>Distribution of cases across different legal categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={caseTypeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="cases" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cases">Cases</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="hearings">Hearings</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Welcome to Legal Case Manager</CardTitle>
              <CardDescription>Your comprehensive legal practice management solution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex-col" onClick={handleNewCase}>
                  <FileText className="h-6 w-6 mb-2" />
                  <span className="text-sm">New Case</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col" onClick={handleNewClient}>
                  <Users className="h-6 w-6 mb-2" />
                  <span className="text-sm">Add Client</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col" onClick={handleScheduleHearing}>
                  <Calendar className="h-6 w-6 mb-2" />
                  <span className="text-sm">Schedule Hearing</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col" onClick={handleUploadDocument}>
                  <Upload className="h-6 w-6 mb-2" />
                  <span className="text-sm">Upload Document</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cases Tab */}
        <TabsContent value="cases" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                All Cases
                <Button variant="outline" size="sm" onClick={handleNewCase}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Case
                </Button>
              </CardTitle>
              <CardDescription>Manage and track all legal cases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No cases found. Create your first case to get started.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={handleCreateSampleData}
                  disabled={sampleDataStatus === 'creating'}
                >
                  <Database className="h-4 w-4 mr-2" />
                  Create Sample Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Clients Tab */}
        <TabsContent value="clients" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                All Clients
                <Button variant="outline" size="sm" onClick={handleNewClient}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Client
                </Button>
              </CardTitle>
              <CardDescription>Manage client information and relationships</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No clients found. Add your first client to get started.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={handleCreateSampleData}
                  disabled={sampleDataStatus === 'creating'}
                >
                  <Database className="h-4 w-4 mr-2" />
                  Create Sample Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hearings Tab */}
        <TabsContent value="hearings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Upcoming Hearings
                <Button variant="outline" size="sm" onClick={handleScheduleHearing}>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Hearing
                </Button>
              </CardTitle>
              <CardDescription>Track court hearings and important dates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No upcoming hearings found. Schedule your first hearing to get started.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={handleCreateSampleData}
                  disabled={sampleDataStatus === 'creating'}
                >
                  <Database className="h-4 w-4 mr-2" />
                  Create Sample Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tasks & Deadlines</CardTitle>
              <CardDescription>Manage case-related tasks and important deadlines</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No tasks found. Create your first task to get started.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={handleCreateSampleData}
                  disabled={sampleDataStatus === 'creating'}
                >
                  <Database className="h-4 w-4 mr-2" />
                  Create Sample Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
} 